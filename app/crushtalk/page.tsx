import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingFlow } from '@/components/crushtalk/OnboardingFlow'

export default async function CrushTalkPage() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: onboarding } = await supabase
        .from('crushtalk_onboarding')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (onboarding) redirect('/ct/accroche')
    }
  } catch {
    // Not authenticated or error — show onboarding
  }

  return <OnboardingFlow />
}
