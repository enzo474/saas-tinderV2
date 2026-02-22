'use server'

import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' })

export async function cancelCrushTalkSubscription() {
  const supabase = await createClient()
  const supabaseAdmin = createServiceRoleClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { data: credits } = await supabaseAdmin
    .from('crushtalk_credits')
    .select('stripe_subscription_id, subscription_status')
    .eq('user_id', user.id)
    .single()

  if (!credits?.stripe_subscription_id) {
    return { error: 'Aucun abonnement actif trouvé' }
  }

  if (credits.subscription_status === 'cancelled') {
    return { error: 'Abonnement déjà résilié' }
  }

  try {
    // Annuler à la fin de la période en cours (pas immédiatement)
    await stripe.subscriptions.update(credits.stripe_subscription_id, {
      cancel_at_period_end: true,
    })

    await supabaseAdmin
      .from('crushtalk_credits')
      .update({ subscription_status: 'cancelled' })
      .eq('user_id', user.id)

    return { success: true }
  } catch (error: any) {
    console.error('[cancelCrushTalk]', error)
    return { error: error.message }
  }
}
