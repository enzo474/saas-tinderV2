import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const supabaseAdmin = createServiceRoleClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { data } = await supabaseAdmin
      .from('crushtalk_credits')
      .select('balance, used_total')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      balance: data?.balance ?? 0,
      used_total: data?.used_total ?? 0,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
