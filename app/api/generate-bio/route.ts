import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { requireAndDeductCredits } from '@/lib/credits-server'
import { CREDIT_COSTS } from '@/lib/credits'
import { generateSingleBio, AnalysisBioData } from '@/lib/claude/generate-bio'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const supabaseAdmin = createServiceRoleClient()

    // 1. Vérifier authentification
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // 2. Récupérer les données du formulaire (tone requis)
    const body = await req.json()
    const { tone, job, hobbies, anecdotes, personality } = body

    const validTone = ['direct', 'intrigant', 'humoristique', 'aventurier'].includes(tone)
    if (!validTone) {
      return NextResponse.json({ error: 'Ton invalide. Choisis parmi : direct, intrigant, humoristique, aventurier.' }, { status: 400 })
    }

    // 3. Récupérer l'analyse utilisateur (même données que le plan d'optimisation)
    const { data: analysis } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .single()

    // Construire analysisData comme pour generate-plan (form overrides analysis si fournis)
    const analysisData: AnalysisBioData = {
      job: job?.trim() || analysis?.job || null,
      sport: analysis?.sport || null,
      lifestyle: (analysis?.lifestyle || []).filter(Boolean),
      vibe: (analysis?.vibe || []).filter(Boolean),
      anecdotes: Array.isArray(anecdotes) ? anecdotes.filter((a: string) => a?.trim()) : (analysis?.anecdotes || []).filter(Boolean),
      passions: Array.isArray(hobbies) ? hobbies.filter((h: string) => h?.trim()) : (analysis?.passions || []).filter(Boolean),
      current_bio: analysis?.current_bio || null,
      target_matches: analysis?.target_matches || null,
      target_women: (analysis?.target_women || []).filter(Boolean),
      relationship_goal: analysis?.relationship_goal || null,
      personality: personality?.trim() || (analysis as any)?.personality || null,
    }

    if (!analysisData.job && (!analysisData.passions?.length || !analysisData.personality)) {
      return NextResponse.json({ 
        error: 'Données insuffisantes. Complète ton profil d\'optimisation ou remplis le formulaire (métier, passions, personnalité).' 
      }, { status: 400 })
    }

    // 4. Vérifier et décompter les crédits
    try {
      await requireAndDeductCredits(user.id, CREDIT_COSTS.BIO_GENERATION)
    } catch (creditError: any) {
      return NextResponse.json({ 
        error: creditError.message,
        type: 'insufficient_credits'
      }, { status: 402 })
    }

    // 5. Générer la bio avec les MÊMES règles que le plan d'optimisation
    let generatedBio: string

    try {
      generatedBio = await generateSingleBio(analysisData, tone)
    } catch (claudeError: any) {
      console.error('[generate-bio] Claude API error:', claudeError?.message)
      
      try {
        const { addCredits } = await import('@/lib/credits-server')
        await addCredits(user.id, CREDIT_COSTS.BIO_GENERATION)
      } catch (refundError) {
        console.error('Failed to refund credits:', refundError)
      }

      return NextResponse.json({ 
        error: 'Erreur lors de la génération de la bio',
        details: claudeError?.message || String(claudeError)
      }, { status: 500 })
    }

    // 6. Stocker la bio en DB
    const { data: bioRecord, error: insertError } = await supabaseAdmin
      .from('generated_bios')
      .insert({
        user_id: user.id,
        analysis_id: analysis?.id || null,
        bio_text: generatedBio,
        tone: tone,
        generation_type: 'custom',
        input_data: analysisData,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Failed to store bio:', insertError)
      return NextResponse.json({ 
        error: 'Échec de sauvegarde de la bio',
        bio: generatedBio // Retourner quand même la bio générée
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      bio: generatedBio,
      bioId: bioRecord.id,
      creditsUsed: CREDIT_COSTS.BIO_GENERATION,
    })

  } catch (error: any) {
    console.error('Generate bio error:', error)
    return NextResponse.json({ 
      error: error.message,
      type: error.type || 'generation_error'
    }, { status: 500 })
  }
}
