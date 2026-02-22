import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { CrushTalkPage } from '@/components/crushtalk/CrushTalkPage'

export default async function DiscussionPage() {
  const supabase = await createClient()
  const supabaseAdmin = createServiceRoleClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null // le layout redirige déjà

  const { data: credits } = await supabaseAdmin
    .from('crushtalk_credits')
    .select('balance, subscription_type, subscription_status')
    .eq('user_id', user.id)
    .single()

  const subscriptionType = credits?.subscription_type && credits?.subscription_status === 'active'
    ? credits.subscription_type
    : null

  return (
    <CrushTalkPage
      messageType="reponse"
      hasOnboarding={true}
      initialCredits={credits?.balance ?? 0}
      initialSubscriptionType={subscriptionType}
      userId={user.id}
    />
  )
}
