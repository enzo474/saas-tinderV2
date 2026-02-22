import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { CRUSHTALK_PLANS, type CrushTalkPlan } from '@/app/api/stripe/crushtalk-checkout/actions'

export async function POST(req: NextRequest) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/228ef050-cfb7-4157-ae07-e20cb469c801',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'checkout-session/route.ts:POST',message:'API route reached',data:{hasStripeKey:!!process.env.STRIPE_SECRET_KEY,chillPriceId:process.env.STRIPE_CRUSHTALK_CHILL_PRICE_ID||'MISSING',charoPriceId:process.env.STRIPE_CRUSHTALK_CHARO_PRICE_ID||'MISSING'},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{})
  // #endregion
  try {
    const { plan } = await req.json() as { plan: CrushTalkPlan }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/228ef050-cfb7-4157-ae07-e20cb469c801',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'checkout-session/route.ts:POST',message:'user not authenticated',data:{},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{})
      // #endregion
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const planConfig = CRUSHTALK_PLANS[plan]
    if (!planConfig) {
      return NextResponse.json({ error: `Plan inconnu : ${plan}` }, { status: 400 })
    }

    if (!planConfig.priceId) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/228ef050-cfb7-4157-ae07-e20cb469c801',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'checkout-session/route.ts:POST',message:'priceId missing',data:{plan,priceId:planConfig.priceId},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{})
      // #endregion
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

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/228ef050-cfb7-4157-ae07-e20cb469c801',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'checkout-session/route.ts:POST',message:'session created successfully',data:{hasUrl:!!session.url},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{})
    // #endregion
    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/228ef050-cfb7-4157-ae07-e20cb469c801',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'checkout-session/route.ts:POST',message:'caught error',data:{error:String(error),message:error?.message},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{})
    // #endregion
    console.error('[checkout-session] Error:', error)
    return NextResponse.json({ error: error?.message ?? 'Erreur Stripe' }, { status: 500 })
  }
}
