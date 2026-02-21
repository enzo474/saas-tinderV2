import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserCredits, isUserAdmin } from '@/lib/credits-server'
import { SettingsContent } from './SettingsContent'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

  const [credits, isAdmin] = await Promise.all([
    getUserCredits(user.id),
    isUserAdmin(user.id),
  ])

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('presale_purchased_at')
    .eq('id', user.id)
    .single()

  const { data: analysis } = await supabase
    .from('analyses')
    .select('paid_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-sora font-bold text-white text-2xl md:text-3xl mb-2">
          Paramètres
        </h1>
        <p className="font-inter text-[#9da3af]">
          Gérez votre abonnement, vos crédits et vos préférences.
        </p>
      </div>

      <SettingsContent
        credits={credits}
        isAdmin={isAdmin}
        presalePurchasedAt={profile?.presale_purchased_at ?? null}
        paidAt={analysis?.paid_at ?? null}
      />
    </div>
  )
}
