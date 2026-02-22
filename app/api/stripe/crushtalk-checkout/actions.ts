'use server'

import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export type CrushTalkPlan = 'chill' | 'charo'

export const CRUSHTALK_PLANS = {
  chill: {
    label: 'Pack Chill',
    credits: 500,
    price: '8,90€',
    priceMonthly: 8.9,
    priceId: process.env.STRIPE_CRUSHTALK_CHILL_PRICE_ID,
    productType: 'crushtalk_chill',
    description: '500 crédits · 100 générations',
    features: ['100 messages générés / mois', 'Accroche + Réponse', 'Renouvellement auto'],
  },
  charo: {
    label: 'Pack Charo',
    credits: -1,
    price: '14,90€',
    priceMonthly: 14.9,
    priceId: process.env.STRIPE_CRUSHTALK_CHARO_PRICE_ID,
    productType: 'crushtalk_charo',
    description: 'Générations illimitées',
    features: ['Générations illimitées', 'Accroche + Réponse', 'Renouvellement auto', 'Priorité support'],
  },
} as const

export async function createCrushTalkCheckoutSession(plan: CrushTalkPlan) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Tu dois être connecté pour souscrire.' }
    }

    const planConfig = CRUSHTALK_PLANS[plan]

    if (!planConfig.priceId) {
      return { error: `Price ID manquant pour le plan "${plan}". Vérifie les variables d'environnement Stripe.` }
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (!stripeKey) {
      return { error: 'Configuration Stripe manquante. Contacte le support.' }
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://crushmaxxing.com'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: `${appUrl}/ct/accroche?subscription=success&plan=${plan}`,
      cancel_url: `${appUrl}/ct/pricing`,
      customer_email: user.email ?? undefined,
      metadata: {
        product_type: planConfig.productType,
        user_id: user.id,
        plan,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan,
          product_type: planConfig.productType,
        },
      },
    })

    return { url: session.url }
  } catch (error: any) {
    console.error('[CrushTalk checkout] Error:', error)
    return { error: error?.message ?? 'Erreur lors de la création de la session Stripe.' }
  }
}
