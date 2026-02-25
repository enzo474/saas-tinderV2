import { redirect } from 'next/navigation'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { getClientIP } from '@/lib/utils/get-client-ip'
import { WelcomeOnboarding } from '@/components/onboarding/WelcomeOnboarding'

export default async function Home() {
  // 1. Utilisateur authentifié → dashboard direct
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/game/accroche')

  // 2. IP déjà connue (a déjà visité le dashboard) → dashboard direct
  try {
    const clientIP = await getClientIP()
    if (clientIP) {
      const supabaseAdmin = createServiceRoleClient()
      const { data: ipData } = await supabaseAdmin
        .from('ip_tracking')
        .select('id')
        .eq('ip_address', clientIP)
        .maybeSingle()

      if (ipData) redirect('/game/accroche')
    }
  } catch {
    // Table ip_tracking pas encore créée ou erreur réseau → afficher onboarding normalement
  }

  // 3. Nouvelle IP → onboarding
  return <WelcomeOnboarding redirectTo="/game/accroche" />
}
