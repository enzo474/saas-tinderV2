import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { analyzeProfileWithVision, generateMessages } from '@/lib/claude/generate-accroche'

const CREDITS_PER_GENERATION = 5
const INITIAL_CREDITS = 5

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const supabaseAdmin = createServiceRoleClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié', type: 'unauthorized' }, { status: 401 })
    }

    const { imageBase64, mediaType, messageType, selectedTones, contextMessage } = await req.json()

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json({ error: 'Image requise' }, { status: 400 })
    }

    const cleanedBase64 = imageBase64.replace(/[^A-Za-z0-9+/=]/g, '')
    if (cleanedBase64.length < 100) {
      return NextResponse.json({ error: 'Image invalide ou trop petite' }, { status: 400 })
    }
    if (!messageType || !['accroche', 'reponse'].includes(messageType)) {
      return NextResponse.json({ error: 'Type de message invalide' }, { status: 400 })
    }

    // Vérifier/créer les crédits CrushTalk
    let { data: creditsRow } = await supabaseAdmin
      .from('crushtalk_credits')
      .select('balance, used_total, subscription_type, subscription_status')
      .eq('user_id', user.id)
      .single()

    if (!creditsRow) {
      const { data: newRow } = await supabaseAdmin
        .from('crushtalk_credits')
        .insert({ user_id: user.id, balance: INITIAL_CREDITS, used_total: 0 })
        .select('balance, used_total, subscription_type, subscription_status')
        .single()
      creditsRow = newRow
    }

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

      const { data: deducted } = await supabaseAdmin.rpc('deduct_crushtalk_credits', {
        user_id_param: user.id,
        cost: CREDITS_PER_GENERATION,
      })

      if (!deducted) {
        return NextResponse.json({ error: 'Crédits insuffisants', type: 'insufficient_credits' }, { status: 402 })
      }
    } else {
      await supabaseAdmin.from('crushtalk_credits')
        .update({ used_total: (creditsRow?.used_total ?? 0) + CREDITS_PER_GENERATION, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
    }

    const validMediaType = (['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mediaType)
      ? mediaType
      : 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'

    let profileAnalysis
    try {
      profileAnalysis = await analyzeProfileWithVision(cleanedBase64, validMediaType)
    } catch (visionError: unknown) {
      if (!isUnlimited) {
        await supabaseAdmin.from('crushtalk_credits')
          .update({ balance: creditsRow!.balance, used_total: creditsRow!.used_total, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
      }
      const message = visionError instanceof Error ? visionError.message : 'Erreur inconnue'
      return NextResponse.json({ error: 'Erreur analyse du profil: ' + message }, { status: 500 })
    }

    let messages
    try {
      messages = await generateMessages(
        profileAnalysis!,
        messageType,
        selectedTones || [],
        contextMessage
      )
    } catch (genError: unknown) {
      if (!isUnlimited) {
        await supabaseAdmin.from('crushtalk_credits')
          .update({ balance: creditsRow!.balance, used_total: creditsRow!.used_total, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
      }
      const message = genError instanceof Error ? genError.message : 'Erreur inconnue'
      return NextResponse.json({ error: 'Erreur génération messages: ' + message }, { status: 500 })
    }

    await supabaseAdmin.from('crushtalk_generations').insert({
      user_id: user.id,
      message_type: messageType,
      selected_tones: selectedTones || [],
      context_message: contextMessage || null,
      profile_analysis: profileAnalysis,
      generated_messages: messages,
    })

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
