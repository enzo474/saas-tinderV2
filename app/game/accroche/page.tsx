import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { CrushTalkPage } from '@/components/crushtalk/CrushTalkPage'

export default async function GameAccrochePage() {
  const supabase = await createClient()
  const supabaseAdmin = createServiceRoleClient()

  const { data: { user } } = await supabase.auth.getUser()
  // Le layout garantit que user est défini ici

  let { data: credits } = await supabaseAdmin
    .from('crushtalk_credits')
    .select('balance, subscription_type, subscription_status')
    .eq('user_id', user!.id)
    .single()

  if (!credits) {
    await supabaseAdmin.from('crushtalk_credits').insert({
      user_id: user!.id,
      balance: 5,
      used_total: 0,
    })
    const { data: fresh } = await supabaseAdmin
      .from('crushtalk_credits')
      .select('balance, subscription_type, subscription_status')
      .eq('user_id', user!.id)
      .single()
    credits = fresh
  }

  const subscriptionType =
    credits?.subscription_type && credits?.subscription_status === 'active'
      ? credits.subscription_type
      : null

  return (
    <CrushTalkPage
      messageType="accroche"
      initialCredits={credits?.balance ?? 0}
      initialSubscriptionType={subscriptionType}
      userId={user!.id}
    />
  )
}
