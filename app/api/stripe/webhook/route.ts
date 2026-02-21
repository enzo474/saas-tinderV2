import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { addCredits } from '@/lib/credits-server'
import { CREDIT_COSTS, CREDIT_PACKS } from '@/lib/credits'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

// Initialize Supabase only if env vars are set
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !key) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(url, key)
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`)
      return NextResponse.json({ error: err.message }, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      const analysisId = session.metadata?.analysis_id
      const productType = session.metadata?.product_type
      const userId = session.metadata?.user_id

      if (!userId) {
        console.error('Missing user_id in session metadata')
        return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
      }

      // Gérer les différents types de produits
      if (productType === 'initial_plan' && analysisId) {
        // Premier achat: Plan d'optimisation à 9,90€ avec 130 crédits inclus
        const { error: analysisError } = await supabase
          .from('analyses')
          .update({
            paid_at: new Date().toISOString(),
            status: 'paid',
            product_type: 'plan',
          })
          .eq('id', analysisId)
          .eq('user_id', userId)

        if (analysisError) {
          console.error('Supabase analysis error:', analysisError)
          return NextResponse.json({ error: analysisError.message }, { status: 500 })
        }

        // Ajouter 130 crédits au compte utilisateur
        try {
          await addCredits(userId, CREDIT_COSTS.INITIAL_PURCHASE)
          console.log(`Added ${CREDIT_COSTS.INITIAL_PURCHASE} credits to user ${userId}`)
        } catch (creditError: any) {
          console.error('Error adding initial credits:', creditError)
          // Ne pas bloquer le webhook si l'ajout de crédits échoue
        }
      } 
      else if (productType === 'credit_pack_50') {
        // Recharge 50 crédits
        try {
          await addCredits(userId, CREDIT_PACKS.PACK_50.credits)
          console.log(`Added ${CREDIT_PACKS.PACK_50.credits} credits to user ${userId} (pack 50)`)
        } catch (creditError: any) {
          console.error('Error adding credits (pack 50):', creditError)
          return NextResponse.json({ error: creditError.message }, { status: 500 })
        }
      }
      else if (productType === 'credit_pack_100') {
        // Recharge 100 crédits
        try {
          await addCredits(userId, CREDIT_PACKS.PACK_100.credits)
          console.log(`Added ${CREDIT_PACKS.PACK_100.credits} credits to user ${userId} (pack 100)`)
        } catch (creditError: any) {
          console.error('Error adding credits (pack 100):', creditError)
          return NextResponse.json({ error: creditError.message }, { status: 500 })
        }
      }
      else if (productType === 'presale_pack_1' || productType === 'presale_pack_2') {
        // Prévente Accroche/Discussion : marquer l'utilisateur
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({ presale_purchased_at: new Date().toISOString() })
          .eq('id', userId)

        if (profileError) {
          console.error('Supabase presale update error:', profileError)
          return NextResponse.json({ error: profileError.message }, { status: 500 })
        }
        console.log(`Presale purchased by user ${userId} (${productType})`)
      }
      else {
        // Ancien format de compatibilité (si pas de product_type spécifié)
        if (analysisId) {
          const { error } = await supabase
            .from('analyses')
            .update({
              paid_at: new Date().toISOString(),
              status: 'paid',
              product_type: 'plan',
            })
            .eq('id', analysisId)
            .eq('user_id', userId)

          if (error) {
            console.error('Supabase error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
          }

          // Ajouter les crédits par défaut pour compatibilité
          try {
            await addCredits(userId, CREDIT_COSTS.INITIAL_PURCHASE)
          } catch {
            // Ignore error for backward compatibility
          }
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
