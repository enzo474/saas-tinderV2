import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CrushTalkPage } from '@/components/crushtalk/CrushTalkPage'

export default async function HooksPage() {
  const supabase = await createClient()
  const supabaseAdmin = createServiceRoleClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const [{ data: onboarding }, { data: credits }] = await Promise.all([
    supabase.from('crushtalk_onboarding').select('id').eq('user_id', user.id).single(),
    supabaseAdmin.from('crushtalk_credits').select('balance').eq('user_id', user.id).single(),
  ])

  return (
    <CrushTalkPage
      messageType="accroche"
      hasOnboarding={!!onboarding}
      initialCredits={credits?.balance ?? 0}
      userId={user.id}
    />
  )
}
