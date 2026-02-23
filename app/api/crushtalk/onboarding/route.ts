import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

const INITIAL_CREDITS = 5

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}

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
    const {
      struggle_point,
      matching_behaviors,
      response_rate,
      goals,
      preferred_style,
      usage_preference,
    } = body

    await supabaseAdmin.from('crushtalk_onboarding').upsert(
      {
        user_id: user.id,
        struggle_point,
        matching_behaviors,
        response_rate,
        goals,
        preferred_style,
        usage_preference,
      },
      { onConflict: 'user_id' }
    )

    // Vérifier si les crédits existent déjà (compte déjà existant)
    const { data: existing } = await supabaseAdmin
      .from('crushtalk_credits')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existing) {
      return NextResponse.json({ success: true, creditsGranted: 0 })
    }

    // Nouveau compte : vérifier l'IP pour éviter les multi-comptes
    const ip = getClientIp(req)
    let creditsToGrant = INITIAL_CREDITS

    if (ip !== 'unknown') {
      const { data: usedIp } = await supabaseAdmin
        .from('crushtalk_used_ips')
        .select('ip_address')
        .eq('ip_address', ip)
        .single()

      if (usedIp) {
        // IP déjà utilisée → 0 crédit gratuit
        creditsToGrant = 0
      } else {
        // Première fois depuis cette IP → marquer l'IP comme utilisée
        await supabaseAdmin
          .from('crushtalk_used_ips')
          .insert({ ip_address: ip })
      }
    }

    await supabaseAdmin.from('crushtalk_credits').insert({
      user_id: user.id,
      balance: creditsToGrant,
      used_total: 0,
    })

    return NextResponse.json({ success: true, creditsGranted: creditsToGrant })
  } catch (error: any) {
    console.error('[CrushTalk onboarding] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
