import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateFullPlan } from '@/lib/claude/generate-plan'
import { isUserAdmin } from '@/lib/credits-server'

export async function POST(req: NextRequest) {
  try {
    const { analysisId } = await req.json()

    // #region agent log
    console.log('[GENERATE API] Request received', { analysisId })
    // #endregion

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      // #region agent log
      console.log('[GENERATE API] No user authenticated')
      // #endregion
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // #region agent log
    console.log('[GENERATE API] User authenticated', { userId: user.id, userEmail: user.email })
    // #endregion

    // Get analysis
    const { data: analysis, error: fetchError } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', analysisId)
      .eq('user_id', user.id)
      .single()

    // #region agent log
    console.log('[GENERATE API] Analysis fetched', { 
      hasAnalysis: !!analysis, 
      hasPaidAt: !!analysis?.paid_at,
      hasFullPlan: !!analysis?.full_plan,
      fetchError: fetchError?.message 
    })
    // #endregion

    if (!analysis) {
      return NextResponse.json({ error: 'Analyse non trouvée' }, { status: 404 })
    }

    // Admin : autoriser même sans paid_at (marquer payé automatiquement)
    const isAdmin = await isUserAdmin(user.id)
    if (!analysis.paid_at && isAdmin) {
      const { error: updatePaidError } = await supabase
        .from('analyses')
        .update({ paid_at: new Date().toISOString(), status: 'paid', product_type: 'plan' })
        .eq('id', analysisId)
        .eq('user_id', user.id)
      if (!updatePaidError) {
        analysis.paid_at = new Date().toISOString()
      }
    }

    if (!analysis.paid_at) {
      return NextResponse.json({ error: 'Analyse non payée' }, { status: 404 })
    }

    // Check if plan already generated
    if (analysis.full_plan) {
      // #region agent log
      console.log('[GENERATE API] Plan already exists, returning it')
      // #endregion
      return NextResponse.json({ full_plan: analysis.full_plan })
    }

    // #region agent log
    console.log('[GENERATE API] Starting plan generation with Claude')
    // #endregion

    // Prepare data for Claude (remove photo URLs for privacy)
    const analysisData = {
      current_matches: analysis.current_matches,
      tinder_seniority: analysis.tinder_seniority,
      target_matches: analysis.target_matches,
      current_bio: analysis.current_bio,
      relationship_goal: analysis.relationship_goal,
      target_women: analysis.target_women,
      height: analysis.height,
      job: analysis.job,
      sport: analysis.sport,
      lifestyle: analysis.lifestyle,
      vibe: analysis.vibe,
      anecdotes: (analysis.anecdotes || []).filter(Boolean),
      passions: (analysis.passions || []).filter(Boolean),
      personality: analysis.personality,
      photo_count: analysis.photos_urls?.length || 0,
    }

    // Generate plan with Claude
    const plan = await generateFullPlan(analysisData)

    // #region agent log
    console.log('[GENERATE API] Plan generated successfully', { hasPlan: !!plan })
    // #endregion

    // Save plan
    const { error: updateError } = await supabase
      .from('analyses')
      .update({ full_plan: plan })
      .eq('id', analysisId)
      .eq('user_id', user.id)

    // #region agent log
    console.log('[GENERATE API] Plan saved to database', { updateError: updateError?.message })
    // #endregion

    return NextResponse.json({ full_plan: plan })
  } catch (error: any) {
    console.error('Error generating plan:', error)
    // #region agent log
    console.log('[GENERATE API] Exception caught', { errorMessage: error.message, errorStack: error.stack })
    // #endregion
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la génération du plan' },
      { status: 500 }
    )
  }
}
