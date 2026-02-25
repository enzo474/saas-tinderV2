import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { GameShell } from '@/components/game/GameShell'

export default async function GameLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  return (
    <GameShell userEmail={user.email ?? ''}>
      {children}
    </GameShell>
  )
}
