import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getClientIP, generateFingerprint } from '@/lib/utils/get-client-ip'

export async function GET() {
  try {
    const clientIP = await getClientIP()

    if (!clientIP) {
      return NextResponse.json(
        { error: 'Unable to determine IP address', canUseFreeAnalysis: false },
        { status: 400 }
      )
    }

    const fingerprint = await generateFingerprint(clientIP)
    const supabase = createServiceRoleClient()

    const { data: ipData, error } = await supabase
      .from('ip_tracking')
      .select('id, has_used_free_analysis, free_analysis_used_at, total_analyses_attempted')
      .eq('ip_address', clientIP)
      .single()

    // Première visite : créer l'entrée
    if (error && error.code === 'PGRST116') {
      const { data: newIP } = await supabase
        .from('ip_tracking')
        .insert({ ip_address: clientIP, fingerprint, has_used_free_analysis: false })
        .select('id')
        .single()

      return NextResponse.json({
        canUseFreeAnalysis: true,
        isFirstVisit: true,
        ipId: newIP?.id,
      })
    }

    if (ipData) {
      await supabase
        .from('ip_tracking')
        .update({
          last_visit: new Date().toISOString(),
          total_analyses_attempted: (ipData.total_analyses_attempted || 0) + 1,
        })
        .eq('id', ipData.id)

      return NextResponse.json({
        canUseFreeAnalysis: !ipData.has_used_free_analysis,
        isFirstVisit: false,
        hasUsedFreeAnalysis: ipData.has_used_free_analysis,
        freeAnalysisUsedAt: ipData.free_analysis_used_at,
      })
    }

    return NextResponse.json({ canUseFreeAnalysis: false, error: 'Unknown error' })
  } catch (error) {
    console.error('[check-free-analysis] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', canUseFreeAnalysis: false },
      { status: 500 }
    )
  }
}
