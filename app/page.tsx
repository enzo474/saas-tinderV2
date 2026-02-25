import { createClient } from '@/lib/supabase/server'
import { WelcomeOnboarding } from '@/components/onboarding/WelcomeOnboarding'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Toujours afficher l'onboarding à la racine.
  // Si déjà connecté → fin d'onboarding ira directement à /game
  // Si non connecté  → fin d'onboarding ira vers /auth
  return <WelcomeOnboarding redirectTo={user ? '/game' : '/auth'} />
}
