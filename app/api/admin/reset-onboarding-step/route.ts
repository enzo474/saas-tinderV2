import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isUserAdmin } from '@/lib/credits-server'

/**
 * POST /api/admin/reset-onboarding-step
 * Body: { step: 1 | 2 }
 * - step 1 : supprime toutes les analyses → retour au tout début
 * - step 2 : efface le selfie_url + les données step 1 → retour à l'upload photo
 * (Admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const admin = await isUserAdmin(user.id)
    if (!admin) {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }

    const body = await req.json()
    const step = body?.step

    if (step === 1) {
      // Supprime toutes les analyses → l'utilisateur doit tout recommencer depuis step 1
      const { error } = await supabase
        .from('analyses')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      console.log(`[ADMIN] Onboarding step 1 reset for user: ${user.email}`)
      return NextResponse.json({ success: true, message: 'Réinitialisé → step 1' })
    }

    if (step === 2) {
      // Efface uniquement le selfie_url → l'utilisateur repart de step 2 (upload photo)
      const { data: analysis } = await supabase
        .from('analyses')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!analysis) {
        return NextResponse.json({ error: 'Aucune analyse trouvée. Lance d\'abord le step 1.' }, { status: 404 })
      }

      const { error } = await supabase
        .from('analyses')
        .update({ selfie_url: null })
        .eq('id', analysis.id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      console.log(`[ADMIN] Onboarding step 2 reset for user: ${user.email}`)
      return NextResponse.json({ success: true, message: 'Réinitialisé → step 2' })
    }

    return NextResponse.json({ error: 'Step invalide. Utilise 1 ou 2.' }, { status: 400 })
  } catch (error: any) {
    console.error('Reset onboarding step error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
