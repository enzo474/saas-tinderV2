import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

// GET — liste tous les users qui ont payé l'offre 9,90€
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const supabaseAdmin = createServiceRoleClient()

  // Récupère les users ayant payé (paid_at non null)
  const { data: analyses, error } = await supabaseAdmin
    .from('analyses')
    .select('user_id, paid_at, created_at')
    .not('paid_at', 'is', null)
    .order('paid_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Récupère les profils correspondants
  const userIds = analyses?.map(a => a.user_id) ?? []
  if (userIds.length === 0) return NextResponse.json({ users: [] })

  const { data: profiles } = await supabaseAdmin
    .from('user_profiles')
    .select('id, email, credits')
    .in('id', userIds)

  const users = analyses?.map(a => {
    const p = profiles?.find(p => p.id === a.user_id)
    return {
      id: a.user_id,
      email: p?.email ?? 'Inconnu',
      credits: p?.credits ?? 0,
      paid_at: a.paid_at,
    }
  }) ?? []

  return NextResponse.json({ users })
}

// POST — ajoute des crédits à un user spécifique
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

  // Incrémente les crédits du user cible
  const { data: current } = await supabaseAdmin
    .from('user_profiles')
    .select('credits')
    .eq('id', userId)
    .single()

  const newCredits = (current?.credits ?? 0) + credits

  const { error } = await supabaseAdmin
    .from('user_profiles')
    .update({ credits: newCredits })
    .eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, newCredits })
}
