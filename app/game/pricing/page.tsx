import { redirect } from 'next/navigation'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { PricingClient } from './PricingClient'

export default async function GamePricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  const supabaseAdmin = createServiceRoleClient()
  const { data: credits } = await supabaseAdmin
    .from('crushtalk_credits')
    .select('subscription_type, subscription_status')
    .eq('user_id', user.id)
    .single()

  const hasActivePlan =
    !!credits?.subscription_status &&
    credits.subscription_status === 'active' &&
    !!credits.subscription_type

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <p
          className="text-xs font-bold uppercase tracking-widest mb-3"
          style={{ color: '#E63946' }}
        >
          PASSE AU NIVEAU SUPÉRIEUR
        </p>
        <h1 className="font-montserrat font-black text-white text-3xl md:text-4xl mb-3 leading-tight">
          Accès{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #E63946, #FF4757)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            illimité
          </span>
        </h1>
        <p className="text-base" style={{ color: '#9da3af' }}>
          Des messages qui font répondre. Des dates qui se concrétisent.
        </p>
      </div>

      <PricingClient isGuest={false} hasActivePlan={hasActivePlan} />

      <div className="text-center space-y-1.5">
        <p className="text-xs" style={{ color: '#6b7280' }}>
          🔒 Paiement sécurisé · Annule à tout moment · Sans engagement
        </p>
        <p className="text-xs font-medium" style={{ color: '#9da3af' }}>
          Pas satisfait ? Remboursé sous 14 jours.
        </p>
      </div>
    </div>
  )
}
