import { redirect } from 'next/navigation'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { GameShell } from '@/components/game/GameShell'
import PseudoSync from '@/components/game/PseudoSync'

export default async function GameLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  let isAdmin = false
  const supabaseAdmin = createServiceRoleClient()
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  isAdmin = profile?.role === 'admin'

  return (
    <GameShell userEmail={user.email ?? ''} isAdmin={isAdmin}>
      <PseudoSync />
      {children}
    </GameShell>
  )
}
