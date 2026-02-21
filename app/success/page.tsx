import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Page success conservée pour les anciens liens.
 * Redirige vers le dashboard home (nouveau flux post-paywall).
 */
export default async function SuccessPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

  const { data: analysis } = await supabase
    .from('analyses')
    .select('paid_at, product_type')
    .eq('user_id', user.id)
    .single()

  if (!analysis || !analysis.paid_at) {
    redirect('/pricing')
  }

  if (!analysis.product_type || !['plan', 'plan_photos'].includes(analysis.product_type)) {
    redirect('/pricing')
  }

  redirect('/dashboard/home')
}
