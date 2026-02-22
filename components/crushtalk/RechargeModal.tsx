'use client'

import { useState } from 'react'
import { X, Zap, Infinity, CheckCircle, Crown } from 'lucide-react'
import { createCrushTalkCheckoutSession } from '@/app/api/stripe/crushtalk-checkout/actions'

interface RechargeModalProps {
  onClose: () => void
  currentBalance: number
}

export function RechargeModal({ onClose, currentBalance }: RechargeModalProps) {
  const [loading, setLoading] = useState<'chill' | 'charo' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async (plan: 'chill' | 'charo') => {
    setLoading(plan)
    setError(null)
    try {
      const result = await createCrushTalkCheckoutSession(plan)
      if (result.error) {
        setError(result.error)
        setLoading(null)
        return
      }
      if (result.url) {
        window.location.href = result.url
      }
    } catch (e: any) {
      setError(e.message || 'Erreur lors du paiement')
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#111111] border border-[#2A2A2A] rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="font-montserrat font-bold text-white text-xl">
              Plus de crédits
            </h2>
            <p className="text-[#9da3af] text-sm mt-0.5">
              {currentBalance === 0
                ? 'Tu as utilisé tous tes crédits.'
                : `Il te reste ${currentBalance} crédit${currentBalance > 1 ? 's' : ''}.`}
              {' '}Choisis ton plan.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#2A2A2A] hover:bg-[#3A3A3A] flex items-center justify-center text-[#9da3af] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Plans */}
        <div className="px-6 pb-6 space-y-3">

          {/* Pack Chill */}
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5 hover:border-[#F77F00]/40 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F77F00]/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#F77F00]" />
                </div>
                <div>
                  <h3 className="font-montserrat font-bold text-white text-base">Pack Chill</h3>
                  <p className="text-[#9da3af] text-xs">500 crédits · 100 générations/mois</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-montserrat font-bold text-white text-xl">8,90€</p>
                <p className="text-[#6b7280] text-xs">/mois</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {['100 messages générés par mois', 'Accroche + Réponse', 'Renouvellement automatique'].map(f => (
                <div key={f} className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#F77F00] flex-shrink-0" />
                  <span className="text-[#9da3af] text-xs">{f}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleSubscribe('chill')}
              disabled={loading !== null}
              className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-60"
              style={{ background: loading === 'chill' ? '#3a3d46' : 'linear-gradient(135deg, #F77F00, #FFAA33)' }}
            >
              {loading === 'chill' ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Redirection...
                </span>
              ) : (
                'Choisir Pack Chill'
              )}
            </button>
          </div>

          {/* Pack Charo */}
          <div className="bg-[#1A1A1A] border-2 border-[#F77F00]/50 rounded-2xl p-5 relative">
            {/* Badge populaire */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #F77F00, #FFAA33)' }}>
              MEILLEURE VALEUR
            </div>

            <div className="flex items-start justify-between mb-4 mt-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F77F00]/15 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-[#F77F00]" />
                </div>
                <div>
                  <h3 className="font-montserrat font-bold text-white text-base">Pack Charo</h3>
                  <p className="text-[#9da3af] text-xs">Générations illimitées</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-montserrat font-bold text-white text-xl">14,90€</p>
                <p className="text-[#6b7280] text-xs">/mois</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {['Générations illimitées ∞', 'Accroche + Réponse', 'Renouvellement automatique', 'Support prioritaire'].map(f => (
                <div key={f} className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#F77F00] flex-shrink-0" />
                  <span className="text-[#9da3af] text-xs">{f}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleSubscribe('charo')}
              disabled={loading !== null}
              className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: loading === 'charo' ? '#3a3d46' : 'linear-gradient(135deg, #F77F00, #FFAA33)', boxShadow: '0 4px 20px rgba(247,127,0,0.3)' }}
            >
              {loading === 'charo' ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Redirection...
                </>
              ) : (
                <>
                  <Infinity className="w-4 h-4" />
                  Choisir Pack Charo
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <p className="text-[#6b7280] text-xs text-center">
            Paiement sécurisé par Stripe · Résiliation à tout moment
          </p>
        </div>
      </div>
    </div>
  )
}
