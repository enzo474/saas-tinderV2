import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { GameShell } from '@/components/game/GameShell'

export default async function GameLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false

  if (user) {
    const supabaseAdmin = createServiceRoleClient()
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    isAdmin = profile?.role === 'admin'
  }

  return (
    <GameShell userEmail={user?.email ?? ''} isAdmin={isAdmin} isGuest={!user}>
      {children}
    </GameShell>
  )
}
