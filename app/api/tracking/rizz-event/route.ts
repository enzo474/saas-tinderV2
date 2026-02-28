import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

type RizzEvent =
  | 'page_view'
  | 'image_uploaded'
  | 'girl_selected'
  | 'tone_selected'
  | 'answer_clicked'
  | 'saw_result'
  | 'clicked_unlock'
  | 'saw_reveal'
  | 'copied_result'

const EVENT_TIMESTAMP: Record<RizzEvent, string | null> = {
  page_view:      'arrived_at',
  image_uploaded: 'image_uploaded_at',
  girl_selected:  'girl_selected_at',
  tone_selected:  'tone_selected_at',
  answer_clicked: 'submitted_at',
  saw_result:     'saw_result_at',
  clicked_unlock: 'clicked_unlock_at',
  saw_reveal:     'auth_completed_at',
  copied_result:  'copied_at',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { session_id, event, data = {} } = body as {
      session_id?: string
      event: RizzEvent
      data?: Record<string, unknown>
    }

    const supabase = createServiceRoleClient()
    const headersList = await headers()
    const ip =
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headersList.get('x-real-ip') ||
      'unknown'
    const now = new Date().toISOString()

    // ── Création de session sur page_view ──────────────────────────────
    if (event === 'page_view' && !session_id) {
      const flowType   = (data.flow_type  as string) || 'unknown'
      const deviceType = (data.device_type as string) || null
      const abVariant  = req.cookies.get('ab_test')?.value || flowType

      const { data: session } = await supabase
        .from('rizz_sessions')
        .insert({
          ip_address:   ip,
          flow_type:    flowType,
          ab_variant:   abVariant,
          device_type:  deviceType,
          arrived_at:   now,
        })
        .select('id')
        .single()

      return NextResponse.json({ session_id: session?.id ?? null })
    }

    if (!session_id) {
      return NextResponse.json({ error: 'session_id requis' }, { status: 400 })
    }

    // ── Mise à jour de la session ──────────────────────────────────────
    const tsField = EVENT_TIMESTAMP[event]
    const updateData: Record<string, unknown> = {}

    if (tsField) updateData[tsField] = now

    switch (event) {
      case 'image_uploaded':
        updateData.has_uploaded_image = true
        break

      case 'girl_selected':
        updateData.selected_girl = data.girl_id
        break

      case 'tone_selected':
        updateData.selected_tone = data.tone
        break

      case 'answer_clicked':
        updateData.user_answer    = data.answer
        updateData.user_message   = data.message
        updateData.message_length = typeof data.message === 'string' ? data.message.length : null
        if (data.tone) updateData.selected_tone = data.tone
        break

      case 'saw_result':
        updateData.saw_blurred_result = true
        updateData.verdict            = data.verdict || 'ne_marche_pas'
        updateData.saw_result_at      = now
        break

      case 'clicked_unlock':
        updateData.clicked_unlock     = true
        updateData.clicked_unlock_at  = now
        break

      case 'saw_reveal':
        updateData.saw_unblurred_result = true
        updateData.completed_auth       = true
        updateData.saw_reveal_at        = now
        if (data.user_id) updateData.user_id = data.user_id
        updateData.completed_at         = now
        break

      case 'copied_result':
        updateData.copied_result = true
        updateData.copied_at     = now
        break
    }

    await supabase
      .from('rizz_sessions')
      .update(updateData)
      .eq('id', session_id)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
