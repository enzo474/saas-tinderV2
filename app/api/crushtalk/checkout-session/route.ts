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

    // ── Vérifier si l'user a déjà un abonnement CrushTalk actif ──
    const { data: existingCredits } = await supabase
      .from('crushtalk_credits')
      .select('subscription_type, subscription_status, stripe_subscription_id')
      .eq('user_id', user.id)
      .single()

    const hasActiveSub =
      existingCredits?.subscription_status === 'active' &&
      existingCredits?.stripe_subscription_id

    // ── Upgrade Chill → Charo : différence fixe de 6€ (14,90 - 8,90) ──
    if (hasActiveSub && existingCredits.subscription_type === 'chill' && plan === 'charo') {
      const subscription = await stripe.subscriptions.retrieve(
        existingCredits.stripe_subscription_id!
      )
      const currentItemId = subscription.items.data[0]?.id
      const customerId = subscription.customer as string

      if (!currentItemId || !customerId) {
        return NextResponse.json({ error: 'Abonnement introuvable sur Stripe.' }, { status: 400 })
      }

      // 1. Créer un invoice item pour la différence fixe : 6,00€ = 600 centimes
      await stripe.invoiceItems.create({
        customer: customerId,
        amount: 600,
        currency: 'eur',
        description: 'Mise à niveau Pack Chill → Pack Charo (différence)',
      })

      // 2. Créer la facture et la payer immédiatement sur la carte déjà enregistrée
      const invoice = await stripe.invoices.create({
        customer: customerId,
        auto_advance: false,
      })
      await stripe.invoices.finalizeInvoice(invoice.id)

      let paidInvoice: Stripe.Invoice
      try {
        paidInvoice = await stripe.invoices.pay(invoice.id)
      } catch {
        return NextResponse.json(
          { error: 'Paiement refusé. Vérifie ta carte bancaire.' },
          { status: 402 }
        )
      }

      if (paidInvoice.status !== 'paid') {
        return NextResponse.json({ error: 'Paiement échoué.' }, { status: 402 })
      }

      // 3. Paiement OK → mise à jour de l'abonnement sans proration
      await stripe.subscriptions.update(existingCredits.stripe_subscription_id!, {
        items: [{ id: currentItemId, price: planConfig.priceId }],
        proration_behavior: 'none',
        metadata: {
          user_id: user.id,
          plan: 'charo',
          product_type: 'crushtalk_charo',
        },
      })

      return NextResponse.json({ upgraded: true })
    }

    // ── Nouveau checkout Stripe (pas d'abonnement existant) ──
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://crushmaxxing.com'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: `${appUrl}/game/accroche?subscription=success&plan=${plan}`,
      cancel_url: `${appUrl}/game/pricing`,
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
