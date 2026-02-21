import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { CheckoutButton } from './CheckoutButton'
import { AccountMenu } from '@/app/onboarding/AccountMenu'

export default async function PricingPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

  const { data: analysis } = await supabase
    .from('analyses')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!analysis || analysis.status !== 'complete') {
    redirect('/onboarding/intro')
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-bg-primary/80 backdrop-blur-sm border-b border-border-primary/50">
        <Link href="/" className="font-montserrat font-extrabold text-sm" style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Crushmaxxing
        </Link>
        <AccountMenu userEmail={user.email ?? null} />
      </header>

      <div className="flex flex-col items-center justify-center px-4 py-12 pt-20">
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(230,57,70,0.07), transparent 60%)' }}
      />

      <div className="relative z-10 w-full max-w-xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-montserrat font-black text-white text-4xl md:text-5xl mb-4 leading-tight">
            Arrête d&apos;être <span style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ignoré</span>
          </h1>
          <p className="text-text-secondary text-lg">
            Arrête de gâcher ton potentiel
          </p>
        </div>

        <div className="relative bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-red-primary/40 rounded-2xl p-8 overflow-hidden">
          {/* Pulse glow */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none animate-pulse-glow"
            style={{ background: 'radial-gradient(ellipse at center, rgba(230,57,70,0.06), transparent 70%)' }}
          />

          <div className="relative z-10">
            {/* Price */}
            <div className="text-center mb-8">
              <p className="font-montserrat font-black text-4xl md:text-6xl text-white mb-1">9,90 €</p>
              <p className="text-text-secondary text-sm">Paiement unique • Accès immédiat</p>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              {[
                '130 crédits inclus',
                'Prévisualisation de ton profil',
                '4 bios optimisées offertes',
                'Génération de 5 à 130 photos IA avec ton visage',
                'Photos lifestyle adaptées à ta cible',
                '+1200 combinaisons de style possibles',
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-white">
                  <span className="text-red-primary font-bold flex-shrink-0 mt-0.5">✓</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            <CheckoutButton analysisId={analysis.id}>
              Optimiser mon profil maintenant
            </CheckoutButton>

            <p className="text-text-tertiary text-xs text-center mt-4">
              Paiement sécurisé · Satisfait ou remboursé
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
