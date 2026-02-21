import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileNav } from '@/components/dashboard/MobileNav'
import { isUserAdmin, addCredits } from '@/lib/credits-server'
import Stripe from 'stripe'
import { CREDIT_COSTS } from '@/lib/credits'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

  // Récupérer les crédits et le rôle de l'utilisateur
  const isAdmin = await isUserAdmin(user.id)

  // Les admins bypass la vérification de paiement
  if (!isAdmin) {
    // Vérifier que l'utilisateur a payé
    const { data: analysis } = await supabase
      .from('analyses')
      .select('paid_at, stripe_session_id, id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .single()

    if (!analysis?.paid_at) {
      // Webhook peut ne pas encore être arrivé — vérifier directement avec Stripe
      if (analysis?.stripe_session_id && process.env.STRIPE_SECRET_KEY) {
        try {
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' })
          const session = await stripe.checkout.sessions.retrieve(analysis.stripe_session_id)

          if (session.payment_status === 'paid') {
            // Paiement confirmé par Stripe — mettre à jour la base avant le webhook
            const supabaseAdmin = createSupabaseAdmin(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.SUPABASE_SERVICE_ROLE_KEY!
            )
            await supabaseAdmin
              .from('analyses')
              .update({ paid_at: new Date().toISOString(), status: 'paid', product_type: 'plan' })
              .eq('id', analysis.id)
              .eq('user_id', user.id)

            // Ajouter les crédits si pas encore fait
            try {
              await addCredits(user.id, CREDIT_COSTS.INITIAL_PURCHASE)
            } catch {
              // Crédits déjà ajoutés par le webhook, ignorer
            }
            // Laisser passer — paiement validé
          } else {
            redirect('/pricing')
          }
        } catch {
          redirect('/pricing')
        }
      } else {
        redirect('/pricing')
      }
    }
  }

  return (
    <div className="h-screen bg-bg-primary flex overflow-hidden">
      {/* Mobile top nav */}
      <MobileNav userEmail={user.email || ''} isAdmin={isAdmin} />

      {/* Sidebar (desktop only) */}
      <Sidebar userEmail={user.email || ''} isAdmin={isAdmin} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        <main className="flex-1 min-h-0 overflow-auto p-6 md:p-8 pt-20 md:pt-8 bg-bg-primary">
          {children}
        </main>
      </div>
    </div>
  )
}
