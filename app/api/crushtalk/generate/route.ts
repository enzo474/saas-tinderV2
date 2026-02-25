import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { analyzeProfileWithVision, generateMessages } from '@/lib/claude/generate-accroche'
import { getClientIP, generateFingerprint } from '@/lib/utils/get-client-ip'

const CREDITS_PER_GENERATION = 5
const INITIAL_CREDITS = 5

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const supabaseAdmin = createServiceRoleClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { imageBase64, mediaType, messageType, selectedTones, contextMessage } = await req.json()

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json({ error: 'Image requise' }, { status: 400 })
    }

    // Nettoyer le base64 : supprimer tout caractère non-base64 (espaces, retours ligne…)
    const cleanedBase64 = imageBase64.replace(/[^A-Za-z0-9+/=]/g, '')
    if (cleanedBase64.length < 100) {
      return NextResponse.json({ error: 'Image invalide ou trop petite' }, { status: 400 })
    }
    if (!messageType || !['accroche', 'reponse'].includes(messageType)) {
      return NextResponse.json({ error: 'Type de message invalide' }, { status: 400 })
    }

    // ── Mode guest (pas d'auth) : vérification par IP ─────────────────────────
    if (!user) {
      const clientIP = await getClientIP()

      if (!clientIP) {
        return NextResponse.json(
          { error: 'Impossible de déterminer votre IP', type: 'ip_error' },
          { status: 400 }
        )
      }

      const fingerprint = await generateFingerprint(clientIP)

      // Récupérer ou créer l'entrée IP
      let { data: ipData, error: ipError } = await supabaseAdmin
        .from('ip_tracking')
        .select('id, has_used_free_analysis')
        .eq('ip_address', clientIP)
        .single()

      if (ipError && ipError.code === 'PGRST116') {
        // Première visite : créer l'entrée
        const { data: newIP } = await supabaseAdmin
          .from('ip_tracking')
          .insert({ ip_address: clientIP, fingerprint, has_used_free_analysis: false })
          .select('id, has_used_free_analysis')
          .single()
        ipData = newIP
      }

      if (!ipData || ipData.has_used_free_analysis) {
        return NextResponse.json(
          {
            error: 'Analyse gratuite déjà utilisée pour cette adresse IP',
            type: 'ip_limit',
          },
          { status: 402 }
        )
      }

      // Générer les messages pour le guest
      const validMediaType = (['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mediaType)
        ? mediaType
        : 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'

      let profileAnalysis, messages
      try {
        profileAnalysis = await analyzeProfileWithVision(cleanedBase64, validMediaType)
        messages = await generateMessages(profileAnalysis, messageType, selectedTones || [], contextMessage)
      } catch (guestGenError: unknown) {
        const msg = guestGenError instanceof Error ? guestGenError.message : 'Erreur lors de la génération'
        return NextResponse.json({ error: 'Erreur génération: ' + msg }, { status: 500 })
      }

      // Marquer l'IP comme ayant utilisé son analyse gratuite
      await supabaseAdmin
        .from('ip_tracking')
        .update({
          has_used_free_analysis: true,
          free_analysis_used_at: new Date().toISOString(),
        })
        .eq('id', ipData.id)

      return NextResponse.json({
        messages,
        profileAnalysis,
        newBalance: 0,
        isUnlimited: false,
        isGuest: true,
      })
    }

    // ── Mode utilisateur authentifié : vérification par crédits ───────────────

    // Vérifier/créer les crédits CrushTalk
    let { data: creditsRow } = await supabaseAdmin
      .from('crushtalk_credits')
      .select('balance, used_total, subscription_type, subscription_status')
      .eq('user_id', user.id)
      .single()

    if (!creditsRow) {
      // Première utilisation : créer avec crédits initiaux
      const { data: newRow } = await supabaseAdmin
        .from('crushtalk_credits')
        .insert({ user_id: user.id, balance: INITIAL_CREDITS, used_total: 0 })
        .select('balance, used_total, subscription_type, subscription_status')
        .single()
      creditsRow = newRow
    }

    // Plan actif (chill ou charo) = illimité : on ne déduit pas de crédits
    const isUnlimited =
      creditsRow?.subscription_status === 'active' &&
      (creditsRow?.subscription_type === 'charo' || creditsRow?.subscription_type === 'chill')

    if (!isUnlimited) {
      if (!creditsRow || creditsRow.balance < CREDITS_PER_GENERATION) {
        return NextResponse.json({
          error: 'Crédits insuffisants',
          balance: creditsRow?.balance ?? 0,
          required: CREDITS_PER_GENERATION,
          type: 'insufficient_credits',
        }, { status: 402 })
      }

      // Déduire les crédits de manière atomique
      const { data: deducted } = await supabaseAdmin.rpc('deduct_crushtalk_credits', {
        user_id_param: user.id,
        cost: CREDITS_PER_GENERATION,
      })

      if (!deducted) {
        return NextResponse.json({ error: 'Crédits insuffisants', type: 'insufficient_credits' }, { status: 402 })
      }
    } else {
      // Charo : juste incrémenter used_total pour les stats
      await supabaseAdmin.from('crushtalk_credits')
        .update({ used_total: (creditsRow?.used_total ?? 0) + CREDITS_PER_GENERATION, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
    }

    // Analyser le profil avec Claude Vision
    const validMediaType = (['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mediaType)
      ? mediaType
      : 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'

    let profileAnalysis
    try {
      profileAnalysis = await analyzeProfileWithVision(cleanedBase64, validMediaType)
    } catch (visionError: unknown) {
      // Rembourser les crédits si Claude échoue (sauf pour Charo)
      if (!isUnlimited) {
        await supabaseAdmin.from('crushtalk_credits')
          .update({ balance: creditsRow!.balance, used_total: creditsRow!.used_total, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
      }
      const message = visionError instanceof Error ? visionError.message : 'Erreur inconnue'
      return NextResponse.json({ error: 'Erreur analyse du profil: ' + message }, { status: 500 })
    }

    // Générer les messages
    let messages
    try {
      messages = await generateMessages(
        profileAnalysis!,
        messageType,
        selectedTones || [],
        contextMessage
      )
    } catch (genError: unknown) {
      // Rembourser les crédits si génération échoue (sauf pour Charo)
      if (!isUnlimited) {
        await supabaseAdmin.from('crushtalk_credits')
          .update({ balance: creditsRow!.balance, used_total: creditsRow!.used_total, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
      }
      const message = genError instanceof Error ? genError.message : 'Erreur inconnue'
      return NextResponse.json({ error: 'Erreur génération messages: ' + message }, { status: 500 })
    }

    // Sauvegarder la génération
    await supabaseAdmin.from('crushtalk_generations').insert({
      user_id: user.id,
      message_type: messageType,
      selected_tones: selectedTones || [],
      context_message: contextMessage || null,
      profile_analysis: profileAnalysis,
      generated_messages: messages,
    })

    // Récupérer le nouveau solde
    const { data: updatedCredits } = await supabaseAdmin
      .from('crushtalk_credits')
      .select('balance')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      messages,
      profileAnalysis,
      newBalance: isUnlimited ? -1 : (updatedCredits?.balance ?? 0),
      isUnlimited,
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur interne'
    console.error('[CrushTalk generate] Error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
