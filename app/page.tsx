import { createClient } from '@/lib/supabase/server'
import { WelcomeOnboarding } from '@/components/onboarding/WelcomeOnboarding'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Toujours afficher l'onboarding puis envoyer vers /auth
  // La page /auth redirige vers /game si déjà connecté
  return <WelcomeOnboarding redirectTo="/auth" />
}
