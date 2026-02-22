import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

const INITIAL_CREDITS = 20

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { data } = await supabase
      .from('crushtalk_onboarding')
      .select('id')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({ completed: !!data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const supabaseAdmin = createServiceRoleClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const body = await req.json()
    const { gender, ageRange, lookingFor, datingApps, matchesPerDay, matchQuality, satisfaction } = body

    // Upsert onboarding (une seule entrée par user)
    await supabaseAdmin.from('crushtalk_onboarding').upsert({
      user_id: user.id,
      gender,
      age_range: ageRange,
      looking_for: lookingFor,
      dating_apps: datingApps,
      matches_per_day: matchesPerDay,
      match_quality: matchQuality,
      satisfaction,
    }, { onConflict: 'user_id' })

    // Créer les crédits si n'existent pas encore
    const { data: existing } = await supabaseAdmin
      .from('crushtalk_credits')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      await supabaseAdmin.from('crushtalk_credits').insert({
        user_id: user.id,
        balance: INITIAL_CREDITS,
        used_total: 0,
      })
    }

    return NextResponse.json({ success: true, creditsGranted: !existing ? INITIAL_CREDITS : 0 })
  } catch (error: any) {
    console.error('[CrushTalk onboarding] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
