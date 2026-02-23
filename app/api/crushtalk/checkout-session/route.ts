import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

type CrushTalkPlan = 'chill' | 'charo'

const CRUSHTALK_PLANS = {
  chill: {
    priceId: process.env.STRIPE_CRUSHTALK_CHILL_PRICE_ID?.trim(),
    productType: 'crushtalk_chill',
  },
  charo: {
    priceId: process.env.STRIPE_CRUSHTALK_CHARO_PRICE_ID?.trim(),
    productType: 'crushtalk_charo',
  },
} as const

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json() as { plan: CrushTalkPlan }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const planConfig = CRUSHTALK_PLANS[plan]
    if (!planConfig) {
      return NextResponse.json({ error: `Plan inconnu : ${plan}` }, { status: 400 })
    }

    if (!planConfig.priceId) {
      return NextResponse.json(
        { error: `Price ID manquant pour le plan "${plan}". Vérifie les variables Stripe.` },
        { status: 400 }
      )
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (!stripeKey) {
      return NextResponse.json({ error: 'Configuration Stripe manquante.' }, { status: 500 })
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

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('[checkout-session] Error:', error)
    return NextResponse.json({ error: error?.message ?? 'Erreur Stripe' }, { status: 500 })
  }
}
