'use client'

import { useState } from 'react'
import { Check, Infinity } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PricingClientProps {
  isGuest: boolean
  hasActivePlan: boolean
}

export function PricingClient({ isGuest, hasActivePlan }: PricingClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async () => {
    if (isGuest) {
      router.push('/auth?redirect=/game/pricing')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/crushtalk/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'chill' }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error || 'Erreur lors de la création de la session.')
        setLoading(false)
        return
      }
      if (data.upgraded) {
        window.location.href = '/game/accroche?subscription=upgraded'
        return
      }
      if (data.url) window.location.href = data.url
    } catch {
      setError('Erreur réseau. Réessaie.')
      setLoading(false)
    }
  }

  const features = [
    'Messages illimités',
    'Accroches + Relances',
    'Tous les tons disponibles',
    'Jamais de limite',
  ]

  return (
    <div className="space-y-6">
      <div
        className="relative rounded-2xl p-6 border-2"
        style={{
          background: hasActivePlan ? 'rgba(230,57,70,0.06)' : '#1A1A1A',
          borderColor: '#E63946',
        }}
      >
        {hasActivePlan && (
          <div
            className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-black tracking-wider text-white flex items-center gap-1"
            style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
          >
            <Check className="w-3 h-3" /> TON PLAN ACTUEL
          </div>
        )}

        {!hasActivePlan && (
          <div
            className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-black tracking-wider text-white"
            style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
          >
            ★ MEILLEUR CHOIX
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(230,57,70,0.12)', border: '1px solid rgba(230,57,70,0.3)' }}
          >
            <Infinity className="w-5 h-5" style={{ color: '#E63946' }} />
          </div>
          <div>
            <h2 className="font-montserrat font-bold text-white text-lg">Pack Pro</h2>
            <p className="text-xs" style={{ color: '#6b7280' }}>Générations illimitées</p>
          </div>
        </div>

        <div className="mb-5">
          <span className="font-montserrat font-black text-4xl text-white">8,90€</span>
          <span className="text-sm ml-1" style={{ color: '#6b7280' }}>/mois</span>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(230,57,70,0.7)' }}>Soit 0,30€ par jour</p>
        </div>

        <ul className="space-y-2.5 mb-6">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: '#d1d5db' }}>
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(230,57,70,0.15)' }}
              >
                <Check className="w-2.5 h-2.5" style={{ color: '#E63946' }} />
              </div>
              {f}
            </li>
          ))}
        </ul>

        {hasActivePlan ? (
          <div
            className="w-full py-3.5 rounded-xl font-bold text-sm text-center"
            style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.3)', color: '#E63946' }}
          >
            ✓ Plan actuel
          </div>
        ) : (
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-200 disabled:opacity-60 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Redirection...
              </span>
            ) : isGuest ? (
              'Créer un compte et s\'abonner →'
            ) : (
              'S\'abonner maintenant →'
            )}
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-center" style={{ color: '#f87171' }}>{error}</p>
      )}
    </div>
  )
}
