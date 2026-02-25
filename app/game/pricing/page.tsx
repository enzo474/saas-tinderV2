import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CrushTalkPricingClient } from '@/components/crushtalk/CrushTalkPricingClient'

export default async function GamePricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const supabaseAdmin = createServiceRoleClient()
  const { data: credits } = await supabaseAdmin
    .from('crushtalk_credits')
    .select('subscription_type, subscription_status, balance')
    .eq('user_id', user.id)
    .single()

  const currentPlan =
    credits?.subscription_status === 'active' && (credits.subscription_type === 'chill' || credits.subscription_type === 'charo')
      ? (credits.subscription_type as 'chill' | 'charo')
      : null

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
          Choisis ton{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #E63946, #FF4757)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            plan
          </span>
        </h1>
        <p className="text-base" style={{ color: '#9da3af' }}>
          Des messages qui font répondre. Des dates qui se concrétisent.
        </p>

        {credits && !currentPlan && (
          <div
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full border text-sm"
            style={{
              background: 'rgba(230,57,70,0.08)',
              borderColor: 'rgba(230,57,70,0.3)',
              color: '#FF4757',
            }}
          >
            <span>⚡</span>
            <span>
              Solde actuel : <strong>{credits.balance ?? 0} crédits</strong>
            </span>
          </div>
        )}
      </div>

      <CrushTalkPricingClient currentPlan={currentPlan} />

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
