'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

const PRESALE_PACKS = {
  pack_1: {
    priceId: process.env.STRIPE_PRICE_PRESALE_PACK_1,
    productType: 'presale_pack_1' as const,
    mode: 'payment' as const,
  },
  pack_2: {
    priceId: process.env.STRIPE_PRICE_PRESALE_PACK_2,
    productType: 'presale_pack_2' as const,
    mode: 'payment' as const,
  },
  text_game: {
    priceId: process.env.STRIPE_PRICE_PRESALE_TEXT_GAME,
    productType: 'presale_text_game' as const,
    mode: 'subscription' as const,
  },
}

export async function createPresaleCheckoutSession(packType: 'pack_1' | 'pack_2' | 'text_game') {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

  const pack = PRESALE_PACKS[packType]
  if (!pack.priceId) {
    return { error: `Configuration Stripe manquante pour le pack prévente ${packType}` }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: pack.priceId,
          quantity: 1,
        },
      ],
      mode: pack.mode,
      allow_promotion_codes: true,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/hooks?purchase=presale_success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/hooks?purchase=cancelled`,
      metadata: {
        product_type: pack.productType,
        user_id: user.id,
      },
    })

    return { url: session.url }
  } catch (error: unknown) {
    const err = error as { message?: string }
    console.error('Stripe presale checkout error:', error)
    return { error: err.message || 'Erreur lors de la création du paiement' }
  }
}
