import { redirect } from 'next/navigation'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { CrushTalkSidebar } from '@/components/crushtalk/CrushTalkSidebar'
import { CrushTalkMobileNav } from '@/components/crushtalk/CrushTalkMobileNav'

export default async function CrushTalkAppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/crushtalk/login')

  const supabaseAdmin = createServiceRoleClient()

  const [{ data: onboarding }, { data: credits }, { data: analysis }] = await Promise.all([
    supabase.from('crushtalk_onboarding').select('id').eq('user_id', user.id).single(),
    supabaseAdmin.from('crushtalk_credits')
      .select('balance, subscription_type, subscription_status')
      .eq('user_id', user.id)
      .single(),
    supabase.from('analyses').select('paid_at').eq('user_id', user.id).single(),
  ])

  // Onboarding pas encore fait → page dédiée
  if (!onboarding) redirect('/crushtalk')

  // Auto-créer les crédits si manquants (ex : users créés avant la feature)
  if (!credits) {
    await supabaseAdmin.from('crushtalk_credits').insert({
      user_id: user.id,
      balance: 5,
      used_total: 0,
    }).select().single()
    // On rafraîchit la valeur pour la passer aux composants
    const { data: freshCredits } = await supabaseAdmin
      .from('crushtalk_credits')
      .select('balance, subscription_type, subscription_status')
      .eq('user_id', user.id)
      .single()
    const isUnlimitedFresh = freshCredits?.subscription_type === 'charo' && freshCredits?.subscription_status === 'active'
    const hasPhotosPro = !!analysis?.paid_at
    return (
      <div className="h-screen flex overflow-hidden" style={{ background: '#0A0A0A' }}>
        <CrushTalkMobileNav userEmail={user.email || ''} credits={freshCredits?.balance ?? 5} isUnlimited={isUnlimitedFresh} hasPhotosPro={hasPhotosPro} />
        <CrushTalkSidebar userEmail={user.email || ''} credits={freshCredits?.balance ?? 5} isUnlimited={isUnlimitedFresh} hasPhotosPro={hasPhotosPro} />
        <div className="flex-1 flex flex-col min-h-0">
          <main className="flex-1 min-h-0 overflow-auto p-6 md:p-8 pt-20 md:pt-8" style={{ background: '#0A0A0A' }}>{children}</main>
        </div>
      </div>
    )
  }

  const isUnlimited = credits?.subscription_type === 'charo' && credits?.subscription_status === 'active'
  const hasPhotosPro = !!analysis?.paid_at

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: '#0A0A0A' }}>
      <CrushTalkMobileNav
        userEmail={user.email || ''}
        credits={credits?.balance ?? 0}
        isUnlimited={isUnlimited}
        hasPhotosPro={hasPhotosPro}
      />
      <CrushTalkSidebar
        userEmail={user.email || ''}
        credits={credits?.balance ?? 0}
        isUnlimited={isUnlimited}
        hasPhotosPro={hasPhotosPro}
      />
      <div className="flex-1 flex flex-col min-h-0">
        <main className="flex-1 min-h-0 overflow-auto p-6 md:p-8 pt-20 md:pt-8" style={{ background: '#0A0A0A' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
