import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getClientIP, generateFingerprint } from '@/lib/utils/get-client-ip'

export async function POST(req: NextRequest) {
  try {
    const { event, data = {} } = await req.json()
    if (!event) return NextResponse.json({ ok: false }, { status: 400 })

    const clientIP = await getClientIP()
    if (!clientIP) return NextResponse.json({ ok: false }, { status: 400 })

    const supabase = createServiceRoleClient()
    const now = new Date().toISOString()

    // S'assurer que la ligne existe pour cette IP
    const { data: existing } = await supabase
      .from('ip_tracking')
      .select('id, dashboard_total_visits, dashboard_first_visit_at')
      .eq('ip_address', clientIP)
      .maybeSingle()

    if (!existing) {
      const fingerprint = await generateFingerprint(clientIP)
      await supabase
        .from('ip_tracking')
        .insert({ ip_address: clientIP, fingerprint, has_used_free_analysis: false })
    }

    // Construire le patch selon l'event
    const patch: Record<string, unknown> = {}

    switch (event) {
      case 'onboarding_started':
        patch.onboarding_started_at = now
        break

      case 'onboarding_video_viewed':
        patch.onboarding_video_viewed = true
        if (typeof data.duration === 'number') {
          patch.onboarding_video_duration = data.duration
        }
        break

      case 'onboarding_question_1_viewed':
        patch.onboarding_question_1_at = now
        patch.onboarding_drop_step = 'q1'
        break

      case 'onboarding_question_2_viewed':
        patch.onboarding_question_2_at = now
        patch.onboarding_drop_step = 'q2'
        break

      case 'onboarding_question_3_viewed':
        patch.onboarding_question_3_at = now
        patch.onboarding_drop_step = 'q3'
        break

      case 'onboarding_question_4_viewed':
        patch.onboarding_question_4_at = now
        patch.onboarding_drop_step = 'q4'
        break

      case 'onboarding_question_5_viewed':
        patch.onboarding_question_5_at = now
        patch.onboarding_drop_step = 'q5'
        break

      case 'onboarding_completed':
        patch.onboarding_completed_at = now
        patch.onboarding_drop_step = null
        break

      case 'dashboard_visited': {
        patch.dashboard_last_visit_at = now
        patch.dashboard_total_visits = ((existing?.dashboard_total_visits as number) || 0) + 1
        if (!existing?.dashboard_first_visit_at) {
          patch.dashboard_first_visit_at = now
        }
        break
      }

      case 'subscription_created':
        patch.has_subscribed = true
        patch.subscribed_at = now
        if (data.plan) patch.subscription_plan = data.plan
        break

      default:
        return NextResponse.json({ ok: false, error: 'Unknown event' }, { status: 400 })
    }

    if (Object.keys(patch).length > 0) {
      await supabase
        .from('ip_tracking')
        .update(patch)
        .eq('ip_address', clientIP)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[tracking/event] Error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
