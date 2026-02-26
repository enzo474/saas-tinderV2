import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WelcomeOnboarding } from '@/components/onboarding/WelcomeOnboarding'

export default async function Home() {
  // Utilisateur authentifié → dashboard direct
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/game/accroche')

  // Nouvelle IP → onboarding, puis auth
  return <WelcomeOnboarding redirectTo="/auth" />
}
