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

// ────────────────────────────────────────────────────────────
// Helpers CrushTalk
// ────────────────────────────────────────────────────────────
async function handleCrushTalkSubscriptionStart(
  supabase: ReturnType<typeof getSupabaseClient>,
  userId: string,
  plan: 'chill' | 'charo',
  subscriptionId: string,
  customerId: string,
  periodEnd: number
) {
  const isUnlimited = plan === 'charo'
  const creditsToAdd = isUnlimited ? 0 : 500

  // S'assurer que la ligne existe
  const { data: existing } = await supabase
    .from('crushtalk_credits')
    .select('balance')
    .eq('user_id', userId)
    .single()

  if (!existing) {
    await supabase.from('crushtalk_credits').insert({
      user_id: userId,
      balance: creditsToAdd,
      used_total: 0,
      subscription_type: plan,
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: customerId,
      subscription_status: 'active',
      subscription_current_period_end: new Date(periodEnd * 1000).toISOString(),
    })
  } else {
    await supabase.from('crushtalk_credits').update({
      balance: isUnlimited ? (existing.balance ?? 0) : (existing.balance ?? 0) + creditsToAdd,
      subscription_type: plan,
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: customerId,
      subscription_status: 'active',
      subscription_current_period_end: new Date(periodEnd * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('user_id', userId)
  }
  console.log(`[CrushTalk] Subscription ${plan} activated for user ${userId} - ${isUnlimited ? 'unlimited' : `+${creditsToAdd} credits`}`)
}

async function handleCrushTalkRenewal(
  supabase: ReturnType<typeof getSupabaseClient>,
  subscriptionId: string,
  periodEnd: number
) {
  const { data: credits } = await supabase
    .from('crushtalk_credits')
    .select('user_id, subscription_type, balance')
    .eq('stripe_subscription_id', subscriptionId)
    .single()

  if (!credits) {
    console.warn(`[CrushTalk] Renewal: no credits row found for subscription ${subscriptionId}`)
    return
  }

  if (credits.subscription_type === 'chill') {
    // Renouvellement Chill : ajouter 500 crédits
    await supabase.from('crushtalk_credits').update({
      balance: (credits.balance ?? 0) + 500,
      subscription_status: 'active',
      subscription_current_period_end: new Date(periodEnd * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('stripe_subscription_id', subscriptionId)
    console.log(`[CrushTalk] Renewal Chill: +500 credits for user ${credits.user_id}`)
  } else if (credits.subscription_type === 'charo') {
    // Renouvellement Charo : juste mettre à jour la date de fin
    await supabase.from('crushtalk_credits').update({
      subscription_status: 'active',
      subscription_current_period_end: new Date(periodEnd * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('stripe_subscription_id', subscriptionId)
    console.log(`[CrushTalk] Renewal Charo: extended for user ${credits.user_id}`)
  }
}

async function handleCrushTalkCancellation(
  supabase: ReturnType<typeof getSupabaseClient>,
  subscriptionId: string
) {
  await supabase.from('crushtalk_credits').update({
    subscription_type: null,
    subscription_status: 'canceled',
    stripe_subscription_id: null,
    updated_at: new Date().toISOString(),
  }).eq('stripe_subscription_id', subscriptionId)
  console.log(`[CrushTalk] Subscription cancelled: ${subscriptionId}`)
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
      // ── CrushTalk Chill ──
      else if (productType === 'crushtalk_chill') {
        const sub = session.subscription as string
        const customer = session.customer as string
        try {
          const subscription = await stripe.subscriptions.retrieve(sub)
          await handleCrushTalkSubscriptionStart(
            supabase, userId, 'chill', sub, customer,
            subscription.current_period_end
          )
        } catch (e: any) {
          console.error('[CrushTalk] Error activating chill:', e)
          return NextResponse.json({ error: e.message }, { status: 500 })
        }
      }

      // ── CrushTalk Charo ──
      else if (productType === 'crushtalk_charo') {
        const sub = session.subscription as string
        const customer = session.customer as string
        try {
          const subscription = await stripe.subscriptions.retrieve(sub)
          await handleCrushTalkSubscriptionStart(
            supabase, userId, 'charo', sub, customer,
            subscription.current_period_end
          )
        } catch (e: any) {
          console.error('[CrushTalk] Error activating charo:', e)
          return NextResponse.json({ error: e.message }, { status: 500 })
        }
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

    // ── Renouvellement abonnement CrushTalk (mensuel) ──
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice
      const subscriptionId = typeof invoice.subscription === 'string'
        ? invoice.subscription
        : invoice.subscription?.id

      if (subscriptionId && invoice.billing_reason === 'subscription_cycle') {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const plan = subscription.metadata?.plan
        if (plan === 'chill' || plan === 'charo') {
          await handleCrushTalkRenewal(supabase, subscriptionId, subscription.current_period_end)
        }
      }
    }

    // ── Annulation abonnement CrushTalk ──
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription
      const plan = subscription.metadata?.plan
      if (plan === 'chill' || plan === 'charo') {
        await handleCrushTalkCancellation(supabase, subscription.id)
      }
    }

    // ── Mise à jour statut + upgrade de plan (Chill → Charo) ──
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription
      const plan = subscription.metadata?.plan as 'chill' | 'charo' | undefined
      if (plan === 'chill' || plan === 'charo') {
        const newStatus = subscription.status === 'active' ? 'active'
          : subscription.status === 'past_due' ? 'past_due'
          : 'canceled'

        // Récupérer l'abonnement actuel pour détecter un changement de plan
        const { data: currentCredits } = await supabase
          .from('crushtalk_credits')
          .select('subscription_type, user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        const planChanged = currentCredits && currentCredits.subscription_type !== plan

        await supabase.from('crushtalk_credits').update({
          subscription_type: plan,
          subscription_status: newStatus,
          subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', subscription.id)

        if (planChanged) {
          console.log(`[CrushTalk] Plan upgraded: ${currentCredits.subscription_type} → ${plan} for user ${currentCredits.user_id}`)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
