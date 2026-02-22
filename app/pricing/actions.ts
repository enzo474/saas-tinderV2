'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

// Pour le bouton "Recharge" dans la sidebar (pas besoin d'analysisId explicite)
export async function createRechargeSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: analysis } = await supabase
    .from('analyses')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .single()

  if (!analysis) return { error: 'Aucune analyse trouvée' }
  return createCheckoutSession(analysis.id)
}

export async function createCheckoutSession(analysisId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

  // Check if user is admin (bypass Stripe payment)
  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail && user.email === adminEmail) {
    // Admin: bypass payment, mark as paid, add 130 credits, and redirect to success
    const { data: updateData, error: updateError } = await supabase
      .from('analyses')
      .update({
        product_type: 'plan',
        paid_at: new Date().toISOString(),
        status: 'paid',
      })
      .eq('id', analysisId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('[ADMIN] Failed to update analysis:', updateError)
      return { error: updateError.message }
    }

    // Ajouter les crédits pour l'admin
    try {
      const { CREDIT_COSTS } = await import('@/lib/credits')
      const { addCredits } = await import('@/lib/credits-server')
      await addCredits(user.id, CREDIT_COSTS.INITIAL_PURCHASE)
      console.log(`[ADMIN] Added ${CREDIT_COSTS.INITIAL_PURCHASE} credits`)
    } catch (creditError) {
      console.error('[ADMIN] Failed to add credits:', creditError)
    }

    return { url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/home`, isAdmin: true }
  }

  const priceId = process.env.STRIPE_PRICE_INITIAL_PLAN || process.env.STRIPE_PRICE_PLAN

  if (!priceId) {
    return { error: 'Configuration Stripe manquante' }
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
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/home`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        analysis_id: analysisId,
        product_type: 'initial_plan', // Important pour le webhook
        user_id: user.id,
      },
    })

    // Save session ID
    await supabase
      .from('analyses')
      .update({
        stripe_session_id: session.id,
        product_type: 'plan',
      })
      .eq('id', analysisId)
      .eq('user_id', user.id)

    return { url: session.url }
  } catch (error: any) {
    console.error('Stripe error:', error)
    return { error: error.message }
  }
}
