import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

// GET — liste tous les users CrushTalk avec leur solde
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const supabaseAdmin = createServiceRoleClient()

  // Tous les users ayant fait l'onboarding CrushTalk
  const { data: onboardings, error } = await supabaseAdmin
    .from('crushtalk_onboarding')
    .select('user_id, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const userIds = onboardings?.map(o => o.user_id) ?? []
  if (userIds.length === 0) return NextResponse.json({ users: [] })

  // Crédits CrushTalk
  const { data: credits } = await supabaseAdmin
    .from('crushtalk_credits')
    .select('user_id, balance, used_total')
    .in('user_id', userIds)

  // Emails depuis auth.users
  const authResults = await Promise.all(userIds.map(id => supabaseAdmin.auth.admin.getUserById(id)))

  const users = onboardings?.map((o, i) => {
    const c = credits?.find(c => c.user_id === o.user_id)
    const authUser = authResults[i]?.data?.user
    const email =
      authUser?.email ??
      authUser?.user_metadata?.email ??
      authUser?.user_metadata?.full_name ??
      o.user_id.slice(0, 8) + '...'
    return {
      id: o.user_id,
      email,
      balance: c?.balance ?? 0,
      used_total: c?.used_total ?? 0,
      joined_at: o.created_at,
    }
  }) ?? []

  return NextResponse.json({ users })
}

// POST — ajoute des crédits CrushTalk à un user
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { userId, credits } = await req.json()
  if (!userId || typeof credits !== 'number' || credits < 1) {
    return NextResponse.json({ error: 'userId et credits (>= 1) requis' }, { status: 400 })
  }

  const supabaseAdmin = createServiceRoleClient()

  // Récupère le solde actuel
  const { data: current } = await supabaseAdmin
    .from('crushtalk_credits')
    .select('balance')
    .eq('user_id', userId)
    .single()

  const newBalance = (current?.balance ?? 0) + credits

  // Upsert (crée la ligne si elle n'existe pas encore)
  const { error } = await supabaseAdmin
    .from('crushtalk_credits')
    .upsert({ user_id: userId, balance: newBalance }, { onConflict: 'user_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, newBalance })
}
