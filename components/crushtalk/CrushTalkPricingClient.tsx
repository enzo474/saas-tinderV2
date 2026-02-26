'use client'

import { useState, useEffect } from 'react'
import { Check, Zap, Infinity } from 'lucide-react'

async function trackEvent(event: string, data: Record<string, unknown> = {}) {
  try {
    await fetch('/api/tracking/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, data }),
    })
  } catch { /* ignore */ }
}

type CrushTalkPlan = 'chill' | 'charo'

const plans = [
  {
    id: 'chill' as CrushTalkPlan,
    label: 'Pack Chill',
    price: '8,90',
    period: '/mois',
    description: '100 générations/mois',
    icon: Zap,
    features: [
      '100 messages générés par mois',
      'Accroches + Relances',
      '500 crédits mensuels',
    ],
    badge: null,
  },
  {
    id: 'charo' as CrushTalkPlan,
    label: 'Pack Charo',
    price: '14,90',
    period: '/mois',
    description: 'Générations illimitées',
    icon: Infinity,
    features: [
      'Messages illimités',
      'Tous les tons disponibles',
      'Jamais de limite',
      'Support prioritaire',
    ],
    badge: 'MEILLEUR CHOIX',
  },
]

export function CrushTalkPricingClient({ currentPlan }: { currentPlan?: 'chill' | 'charo' | null }) {
  const [loading, setLoading] = useState<CrushTalkPlan | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    trackEvent('pricing_visited')
  }, [])

  const handleSubscribe = async (plan: CrushTalkPlan) => {
    setLoading(plan)
    setError(null)
    trackEvent('checkout_started', { plan })
    try {
      const res = await fetch('/api/crushtalk/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error || 'Erreur lors de la création de la session.')
        setLoading(null)
        return
      }
      if (data.upgraded) {
        window.location.href = '/game/accroche?subscription=upgraded'
        return
      }
      if (data.url) window.location.href = data.url
    } catch {
      setError('Erreur réseau. Réessaie.')
      setLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      {plans.map((plan) => {
        const Icon = plan.icon
        const isLoading = loading === plan.id
        const isCurrentPlan = currentPlan === plan.id
        const isBest = plan.badge && !currentPlan

        return (
          <div
            key={plan.id}
            className="relative rounded-2xl p-6 border"
            style={{
              background: isCurrentPlan ? 'rgba(230,57,70,0.06)' : '#1A1A1A',
              borderColor: isCurrentPlan ? '#E63946' : plan.id === 'charo' && !currentPlan ? 'rgba(230,57,70,0.4)' : '#2A2A2A',
              borderWidth: isCurrentPlan || (plan.id === 'charo' && !currentPlan) ? '2px' : '1px',
            }}
          >
            {/* Badge */}
            {isCurrentPlan && (
              <div
                className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-black tracking-wider text-white flex items-center gap-1"
                style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
              >
                <Check className="w-3 h-3" /> TON PLAN ACTUEL
              </div>
            )}
            {isBest && (
              <div
                className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-black tracking-wider text-white flex items-center gap-1"
                style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
              >
                ★ {plan.badge}
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(230,57,70,0.12)', border: '1px solid rgba(230,57,70,0.3)' }}
              >
                <Icon className="w-5 h-5" style={{ color: '#E63946' }} />
              </div>
              <div>
                <h2 className="font-montserrat font-bold text-white text-lg">{plan.label}</h2>
                <p className="text-xs" style={{ color: '#6b7280' }}>{plan.description}</p>
              </div>
            </div>

            <div className="mb-5">
              <span className="font-montserrat font-black text-4xl text-white">{plan.price}€</span>
              <span className="text-sm ml-1" style={{ color: '#6b7280' }}>{plan.period}</span>
              {plan.id === 'charo' && (
                <p className="text-xs mt-0.5" style={{ color: 'rgba(230,57,70,0.7)' }}>Soit 0,49€ par jour</p>
              )}
            </div>

            <ul className="space-y-2.5 mb-6">
              {plan.features.map((f) => (
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

            {isCurrentPlan ? (
              <div
                className="w-full py-3.5 rounded-xl font-bold text-sm text-center"
                style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.3)', color: '#E63946' }}
              >
                ✓ Plan actuel
              </div>
            ) : (
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={!!loading}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-200 disabled:opacity-60 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Redirection...
                  </span>
                ) : (
                  plan.id === 'charo' && currentPlan === 'chill'
                    ? 'Passer au Pack Charo (+6€)'
                    : `Choisir ${plan.label}`
                )}
              </button>
            )}
          </div>
        )
      })}

      {error && (
        <p className="text-sm text-center" style={{ color: '#f87171' }}>{error}</p>
      )}
    </div>
  )
}
