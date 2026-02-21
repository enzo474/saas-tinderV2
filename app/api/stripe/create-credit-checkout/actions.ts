'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Stripe from 'stripe'
import { CREDIT_PACKS } from '@/lib/credits'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

/**
 * Crée une session Stripe pour recharger des crédits
 * @param packType - 'pack_50' ou 'pack_100'
 */
export async function createCreditCheckoutSession(packType: 'pack_50' | 'pack_100') {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

  // Vérifier que l'utilisateur a bien payé le plan initial
  const { data: analysis } = await supabase
    .from('analyses')
    .select('paid_at')
    .eq('user_id', user.id)
    .single()

  if (!analysis?.paid_at) {
    return { error: 'Vous devez d\'abord acheter le plan initial' }
  }

  let priceId: string | undefined
  let creditAmount: number
  let productType: string

  if (packType === 'pack_50') {
    priceId = CREDIT_PACKS.PACK_50.priceId
    creditAmount = CREDIT_PACKS.PACK_50.credits
    productType = 'credit_pack_50'
  } else {
    priceId = CREDIT_PACKS.PACK_100.priceId
    creditAmount = CREDIT_PACKS.PACK_100.credits
    productType = 'credit_pack_100'
  }

  if (!priceId) {
    return { error: `Configuration Stripe manquante pour ${packType}` }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      allow_promotion_codes: true,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/home?purchase=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/home?purchase=cancelled`,
      metadata: {
        product_type: productType,
        user_id: user.id,
        credit_amount: creditAmount.toString(),
      },
    })

    return { url: session.url }
  } catch (error: any) {
    console.error('Stripe credit checkout error:', error)
    return { error: error.message }
  }
}
