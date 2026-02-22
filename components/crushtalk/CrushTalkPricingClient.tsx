'use client'

import { useState } from 'react'
import { Check, Zap, Infinity, Star } from 'lucide-react'
import { createCrushTalkCheckoutSession, type CrushTalkPlan } from '@/app/api/stripe/crushtalk-checkout/actions'

const plans = [
  {
    id: 'chill' as CrushTalkPlan,
    label: 'Pack Chill',
    price: '8,90',
    period: '/mois',
    description: '500 crédits · 100 générations',
    icon: Zap,
    accent: '#F77F00',
    accentBg: 'rgba(247,127,0,0.08)',
    accentBorder: 'rgba(247,127,0,0.25)',
    badge: null,
    features: [
      '100 messages générés / mois',
      'Accroche + Réponse',
      '500 crédits mensuels',
      'Renouvellement automatique',
    ],
  },
  {
    id: 'charo' as CrushTalkPlan,
    label: 'Pack Charo',
    price: '14,90',
    period: '/mois',
    description: 'Générations illimitées',
    icon: Infinity,
    accent: '#FFAA33',
    accentBg: 'rgba(255,170,51,0.08)',
    accentBorder: 'rgba(255,170,51,0.35)',
    badge: 'MEILLEURE VALEUR',
    features: [
      'Générations illimitées',
      'Accroche + Réponse',
      'Crédits infinis',
      'Support prioritaire',
      'Renouvellement automatique',
    ],
  },
]

export function CrushTalkPricingClient() {
  const [loading, setLoading] = useState<CrushTalkPlan | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async (plan: CrushTalkPlan) => {
    setLoading(plan)
    setError(null)
    try {
      const result = await createCrushTalkCheckoutSession(plan)
      if (result?.error) {
        setError(result.error)
        setLoading(null)
        return
      }
      if (result?.url) {
        window.location.href = result.url
      }
    } catch {
      setError('Une erreur est survenue. Réessaie.')
      setLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {plans.map((plan) => {
        const Icon = plan.icon
        const isLoading = loading === plan.id
        return (
          <div
            key={plan.id}
            className="relative rounded-2xl p-6 border transition-all duration-300"
            style={{ background: plan.accentBg, borderColor: plan.accentBorder }}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black tracking-wider text-black" style={{ background: 'linear-gradient(135deg, #F77F00, #FFAA33)' }}>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-black" />
                  {plan.badge}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${plan.accent}20`, border: `1px solid ${plan.accent}40` }}>
                <Icon className="w-5 h-5" style={{ color: plan.accent }} />
              </div>
              <div>
                <h2 className="font-montserrat font-bold text-white text-lg">{plan.label}</h2>
                <p className="text-xs" style={{ color: '#6b7280' }}>{plan.description}</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="font-montserrat font-black text-4xl text-white">{plan.price}€</span>
                <span className="text-sm" style={{ color: '#6b7280' }}>{plan.period}</span>
              </div>
            </div>

            <ul className="space-y-2.5 mb-7">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm" style={{ color: '#d1d5db' }}>
                  <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${plan.accent}20` }}>
                    <Check className="w-2.5 h-2.5" style={{ color: plan.accent }} />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={!!loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-200 disabled:opacity-60"
              style={{ background: `linear-gradient(135deg, ${plan.accent}, ${plan.id === 'chill' ? '#FFAA33' : '#FFD700'})`, boxShadow: `0 4px 20px ${plan.accent}30` }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Redirection...
                </span>
              ) : (
                `Choisir ${plan.label}`
              )}
            </button>
          </div>
        )
      })}

      {error && (
        <div className="col-span-2 p-3 rounded-xl text-sm text-red-300 text-center" style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.2)' }}>
          {error}
        </div>
      )}
    </div>
  )
}
