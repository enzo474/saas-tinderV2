import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WelcomeOnboarding } from '@/components/onboarding/WelcomeOnboarding'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Déjà connecté → dashboard
  if (user) redirect('/game')

  // Pas connecté → onboarding public
  return <WelcomeOnboarding />
}
