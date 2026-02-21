import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getOnboardingRoute } from '@/lib/utils/ab-test'

export const dynamic = 'force-dynamic'

export default async function StartPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

  // Check if user already has an analysis with a variant
  const { data: analysis } = await supabase
    .from('analyses')
    .select('ab_variant')
    .eq('user_id', user.id)
    .single()

  // If analysis exists and has a variant, use it
  if (analysis?.ab_variant) {
    const route = analysis.ab_variant === 'B' ? '/ob2/intro' : '/onboarding/intro'
    redirect(route)
  }

  // Otherwise, determine route based on userId
  const route = getOnboardingRoute(user.id)
  redirect(route)
}
