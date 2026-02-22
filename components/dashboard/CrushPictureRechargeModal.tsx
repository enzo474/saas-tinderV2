'use client'

import { useState } from 'react'
import { X, Zap, Check } from 'lucide-react'
import { createRechargeSession } from '@/app/pricing/actions'

interface CrushPictureRechargeModalProps {
  onClose: () => void
}

export function CrushPictureRechargeModal({ onClose }: CrushPictureRechargeModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRecharge = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await createRechargeSession()
      if (result?.error) {
        setError(result.error)
        setLoading(false)
        return
      }
      if (result?.url) {
        window.location.href = result.url
      }
    } catch {
      setError('Une erreur est survenue. Réessaie.')
      setLoading(false)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="relative w-full max-w-sm rounded-2xl p-6 border" style={{ background: '#111111', borderColor: 'rgba(230,57,70,0.25)' }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: '#6b7280', background: '#1A1A1A' }}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.3)' }}>
              <Zap className="w-5 h-5" style={{ color: '#E63946' }} />
            </div>
            <div>
              <h2 className="font-montserrat font-bold text-white text-lg">Recharge CrushPicture</h2>
              <p className="text-xs" style={{ color: '#6b7280' }}>Génère plus de photos IA</p>
            </div>
          </div>

          <div className="rounded-xl p-4 border mb-5" style={{ background: 'rgba(230,57,70,0.06)', borderColor: 'rgba(230,57,70,0.2)' }}>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="font-montserrat font-black text-3xl text-white">9,90€</span>
              <span className="text-sm" style={{ color: '#6b7280' }}>· paiement unique</span>
            </div>
            <ul className="space-y-2">
              {[
                '130 crédits ajoutés',
                'Photos IA avec ton visage',
                '+1200 combinaisons de style',
                'Accès immédiat',
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm" style={{ color: '#d1d5db' }}>
                  <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(230,57,70,0.15)' }}>
                    <Check className="w-2.5 h-2.5" style={{ color: '#E63946' }} />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {error && (
            <p className="text-xs text-red-400 mb-3 text-center">{error}</p>
          )}

          <button
            onClick={handleRecharge}
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-200 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)', boxShadow: '0 4px 20px rgba(230,57,70,0.25)' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Redirection...
              </span>
            ) : (
              'Recharger maintenant'
            )}
          </button>

          <p className="text-center text-xs mt-3" style={{ color: '#6b7280' }}>
            Paiement sécurisé · Satisfait ou remboursé
          </p>
        </div>
      </div>
    </>
  )
}
