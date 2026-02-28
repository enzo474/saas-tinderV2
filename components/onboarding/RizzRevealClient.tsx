'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { RizzAnalysis } from './RizzSteps'

interface RizzPending {
  analysis: RizzAnalysis
  flowType: 'test-1' | 'test-2'
  userMessage: string
}

export function RizzRevealClient() {
  const router = useRouter()
  const [data, setData]       = useState<RizzPending | null>(null)
  const [copied, setCopied]   = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('rizz_pending')
      if (raw) {
        const parsed = JSON.parse(raw) as RizzPending
        setData(parsed)
      }
    } catch { /* non-bloquant */ }
    setLoading(false)
  }, [])

  const handleCopy = async () => {
    if (!data?.analysis.accroche_optimisee) return
    try {
      await navigator.clipboard.writeText(data.analysis.accroche_optimisee)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch { /* non-bloquant */ }
  }

  const handleNewAnalysis = () => {
    try { localStorage.removeItem('rizz_pending') } catch { /* non-bloquant */ }
    router.push('/game/accroche')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0A' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#E63946', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!data) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
        style={{ background: '#0A0A0A' }}
      >
        <div className="text-4xl mb-4">😕</div>
        <h1 className="font-montserrat font-bold text-white text-xl mb-3">
          Session expirée
        </h1>
        <p className="text-sm mb-6" style={{ color: '#6b7280' }}>
          Les données de ton analyse n'ont pas été retrouvées.
        </p>
        <button
          onClick={() => router.push('/game/accroche')}
          className="px-6 py-3 rounded-xl font-bold text-white text-sm"
          style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
        >
          Accéder au dashboard
        </button>
      </div>
    )
  }

  const accroche = data.analysis.accroche_optimisee

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 py-8"
      style={{ background: '#0A0A0A' }}
    >
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 20%, rgba(34,197,94,0.06), transparent 60%)' }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-6">
          <span
            className="font-montserrat font-extrabold text-xl"
            style={{
              background: 'linear-gradient(135deg, #E63946, #FF4757)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Crushmaxxing
          </span>
        </div>

        {/* Header succès */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">✅</div>
          <h1 className="font-montserrat font-bold text-white text-2xl">
            TON ACCROCHE OPTIMISÉE
          </h1>
        </div>

        {/* Accroche défloutée */}
        <div
          className="rounded-2xl p-6 border mb-5"
          style={{
            background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.03))',
            borderColor: 'rgba(34,197,94,0.3)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: '#22c55e' }}
            />
            <span className="text-xs font-bold" style={{ color: '#22c55e' }}>ACCROCHE DÉBLOQUÉE</span>
          </div>
          <p className="text-white font-bold text-xl leading-relaxed">
            "{accroche}"
          </p>
        </div>

        {/* Bouton copier */}
        <button
          onClick={handleCopy}
          className="w-full py-4 rounded-xl font-bold text-white text-base transition-all hover:scale-[1.02] active:scale-[0.98] mb-3"
          style={{ background: copied ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #E63946, #FF4757)' }}
        >
          {copied ? '✓ Copié !' : 'Copier l\'accroche'}
        </button>

        {/* Raisons du succès */}
        <div
          className="rounded-2xl p-5 border mb-5"
          style={{ background: '#111111', borderColor: '#1F1F1F' }}
        >
          <p className="text-xs font-semibold mb-3" style={{ color: '#22c55e' }}>
            POURQUOI ÇA VA MARCHER :
          </p>
          <div className="space-y-2">
            {(data.analysis.raisons_succes || []).map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <span style={{ color: '#22c55e' }}>✓</span>
                <span className="text-sm" style={{ color: '#9da3af' }}>{r}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Séparateur */}
        <div className="h-px mb-5" style={{ background: '#2A2A2A' }} />

        {/* Bonus 1 analyse */}
        <div
          className="rounded-2xl p-5 border mb-5"
          style={{
            background: 'linear-gradient(135deg, rgba(230,57,70,0.08), rgba(230,57,70,0.03))',
            borderColor: 'rgba(230,57,70,0.2)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🎁</span>
            <span className="font-bold text-white text-sm">1 ANALYSE GRATUITE</span>
          </div>
          <p className="text-xs" style={{ color: '#9da3af' }}>
            Tu as reçu 1 analyse gratuite dans le dashboard. Utilise-la pour optimiser ta prochaine accroche.
          </p>
        </div>

        {/* CTA dashboard */}
        <button
          onClick={handleNewAnalysis}
          className="w-full py-4 rounded-xl font-bold text-white text-base transition-all hover:scale-[1.02] active:scale-[0.98] border"
          style={{ background: '#111111', borderColor: '#2A2A2A' }}
        >
          Analyser un nouveau profil →
        </button>

        <p className="text-center text-xs mt-4" style={{ color: '#6b7280' }}>
          Accès complet au dashboard Crushmaxxing
        </p>
      </div>
    </div>
  )
}
