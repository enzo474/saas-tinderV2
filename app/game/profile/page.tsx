import { redirect } from 'next/navigation'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { ProfilePageClient } from './ProfilePageClient'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const supabaseAdmin = createServiceRoleClient()

  const [{ data: profile }, { data: credits }] = await Promise.all([
    supabaseAdmin.from('user_profiles').select('role').eq('id', user.id).single(),
    supabaseAdmin.from('crushtalk_credits')
      .select('balance, subscription_type, subscription_status')
      .eq('user_id', user.id)
      .single(),
  ])

  const isAdmin = profile?.role === 'admin'
  // hasActiveSub : vrai si subscription_type est défini (actif ou récemment souscrit)
  const hasActiveSub = !!credits?.subscription_type && credits?.subscription_type !== null

  const planLabel = credits?.subscription_type === 'charo'
    ? 'Pack Charo — Illimité'
    : credits?.subscription_type === 'chill'
    ? 'Pack Chill — 100 générations/mois'
    : null

  return (
    <ProfilePageClient
      email={user.email ?? ''}
      balance={credits?.balance ?? 0}
      planLabel={planLabel}
      hasActiveSub={hasActiveSub}
      isAdmin={isAdmin}
    />
  )
}
