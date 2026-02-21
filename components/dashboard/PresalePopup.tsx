'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { createPresaleCheckoutSession } from '@/app/api/stripe/create-presale-checkout/actions'
import { useRouter } from 'next/navigation'

const DISPLAY_SLOTS = 50
const REAL_SLOTS = 200
const RATIO = REAL_SLOTS / DISPLAY_SLOTS

interface PresalePopupProps {
  isOpen: boolean
  onClose: () => void
  feature: 'accroche' | 'discussion'
  presaleCount: number
}

export function PresalePopup({ isOpen, onClose, feature, presaleCount }: PresalePopupProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const displayCount = Math.min(Math.floor(presaleCount / RATIO), DISPLAY_SLOTS)
  const remaining = DISPLAY_SLOTS - displayCount

  if (!isOpen) return null

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const result = await createPresaleCheckoutSession('text_game')
      if (result.error) {
        alert(result.error)
        setLoading(false)
      } else if (result.url) {
        window.location.href = result.url
      }
    } catch {
      alert('Une erreur est survenue')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
      <div
        className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-gold-primary/30 rounded-3xl max-w-lg w-full p-5 md:p-6 relative animate-slideUp shadow-2xl my-auto"
        style={{ boxShadow: '0 24px 60px rgba(247,127,0,0.15)' }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-bg-tertiary border border-border-primary hover:border-gold-primary hover:text-gold-primary flex items-center justify-center transition-all duration-200 text-text-secondary"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Badge urgence */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-semibold text-sm mb-5"
          style={{ backgroundColor: '#F77F00', color: '#000000' }}
        >
          <span>⚡</span>
          <span>50 places • Prix unique</span>
        </div>

        {/* Titre */}
        <h2
          className="font-montserrat font-black text-xl md:text-2xl mb-2"
          style={{ background: 'linear-gradient(135deg, #F77F00, #FFAA33)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
        >
          Text Game : Illimité à vie
        </h2>

        {/* Description */}
        <p className="text-text-secondary text-sm mb-5 leading-relaxed">
          Sois parmi les <strong style={{ color: '#F77F00' }}>50 premiers</strong> à réserver
          l'accès illimité pour{' '}
          <strong style={{ color: '#F77F00' }}>19,90€/mois</strong>.
          Sortie dans <strong style={{ color: '#F77F00' }}>2 semaines</strong>.
        </p>

        {/* Card pricing unique */}
        <div
          className="rounded-2xl p-6 mb-5"
          style={{ backgroundColor: '#0F0F0F', border: '2px solid #F77F00', boxShadow: '0 0 24px rgba(247,127,0,0.15)' }}
        >
          {/* Badge + prix */}
          <div className="flex items-center justify-between mb-3">
            <div className="inline-flex px-3 py-1 rounded-full font-semibold text-xs" style={{ backgroundColor: '#F77F00', color: '#000' }}>
              🔥 Offre de lancement
            </div>
            <div className="text-right">
              <span className="font-montserrat font-extrabold text-2xl md:text-4xl text-white">19,90€</span>
              <span className="text-text-secondary text-sm ml-1">/mois</span>
            </div>
          </div>

          <p className="text-text-tertiary text-sm mb-4">Illimité à vie • Tant que tu restes abonné</p>

          {/* Features */}
          <div className="space-y-2 mb-5">
            {[
              'Messages Accroche illimités',
              'Messages Discussion illimités',
              'Accès illimité à vie',
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm font-semibold text-white">
                <span style={{ color: '#F77F00' }}>✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full font-bold text-base py-3.5 rounded-xl hover:scale-[1.02] transition-all duration-300 mb-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#F77F00', color: '#000000' }}
          >
            {loading ? 'Chargement...' : 'Réserver ma place (19,90€/mois)'}
          </button>

          <p className="text-center text-text-tertiary text-xs">
            ✓ Sans engagement • Annule quand tu veux
          </p>
        </div>

        {/* CTA secondaire */}
        <button
          onClick={() => { onClose(); router.push('/presale/text-game') }}
          className="w-full py-3 rounded-xl font-semibold text-sm border-2 border-border-primary text-text-secondary hover:border-gold-primary hover:text-gold-primary transition-all duration-200"
        >
          En savoir plus sur Text Game →
        </button>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-border-primary flex items-center justify-center gap-8 text-center">
          <div>
            <p className="text-text-tertiary text-xs mb-0.5">Places restantes</p>
            <p className="font-montserrat font-bold text-lg" style={{ color: '#F77F00' }}>{remaining} / 50</p>
          </div>
          <div className="w-px h-8 bg-border-primary" />
          <div>
            <p className="text-text-tertiary text-xs mb-0.5">Sortie dans</p>
            <p className="font-montserrat font-bold text-lg" style={{ color: '#F77F00' }}>13 jours</p>
          </div>
        </div>
      </div>
    </div>
  )
}
