import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getClientIP } from '@/lib/utils/get-client-ip'

export async function POST(req: NextRequest) {
  try {
    const { pseudo } = await req.json()
    if (!pseudo || typeof pseudo !== 'string') {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    const clientIP = await getClientIP()
    if (!clientIP) return NextResponse.json({ ok: false }, { status: 400 })

    const supabase = createServiceRoleClient()
    await supabase
      .from('ip_tracking')
      .update({ pseudo: pseudo.trim().slice(0, 50) })
      .eq('ip_address', clientIP)
      .is('pseudo', null) // ne pas écraser si déjà renseigné

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
