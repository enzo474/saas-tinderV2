'use server'

import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Stripe from 'stripe'

export async function unsubscribeAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const supabaseAdmin = createServiceRoleClient()
  const { data: credits } = await supabaseAdmin
    .from('crushtalk_credits')
    .select('stripe_subscription_id')
    .eq('user_id', user.id)
    .single()

  if (!credits?.stripe_subscription_id) return { error: 'Aucun abonnement actif trouvé' }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' })
    await stripe.subscriptions.cancel(credits.stripe_subscription_id)

    await supabaseAdmin
      .from('crushtalk_credits')
      .update({ subscription_status: 'cancelled', subscription_type: null })
      .eq('user_id', user.id)

    return { success: true }
  } catch (e: any) {
    return { error: e.message || 'Erreur lors de la résiliation' }
  }
}

export async function deleteAccountAction() {
  const supabase = await createClient()
  const supabaseAdmin = createServiceRoleClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  await supabaseAdmin.from('crushtalk_credits').delete().eq('user_id', user.id)
  await supabaseAdmin.from('crushtalk_generations').delete().eq('user_id', user.id)
  await supabaseAdmin.from('training_conversations').delete().eq('user_id', user.id)

  await supabaseAdmin.auth.admin.deleteUser(user.id)
  await supabase.auth.signOut()

  redirect('/auth')
}
