import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getClientIP } from '@/lib/utils/get-client-ip'

export async function POST() {
  try {
    const clientIP = await getClientIP()

    if (!clientIP) {
      return NextResponse.json(
        { error: 'Unable to determine IP address' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    const { data: ipData } = await supabase
      .from('ip_tracking')
      .select('id, has_used_free_analysis, free_analysis_used_at')
      .eq('ip_address', clientIP)
      .single()

    if (!ipData) {
      return NextResponse.json(
        { error: 'IP not found. Call /api/check-free-analysis first.' },
        { status: 404 }
      )
    }

    if (ipData.has_used_free_analysis) {
      return NextResponse.json(
        { error: 'Free analysis already used for this IP', usedAt: ipData.free_analysis_used_at },
        { status: 403 }
      )
    }

    await supabase
      .from('ip_tracking')
      .update({
        has_used_free_analysis: true,
        free_analysis_used_at: new Date().toISOString(),
      })
      .eq('id', ipData.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[use-free-analysis] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
