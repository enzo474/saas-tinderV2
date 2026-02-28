'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export interface RizzAnalysis {
  verdict: string
  raisons_echec: string[]
  accroche_optimisee: string
  raisons_succes: string[]
  session_id?: string
}

interface RizzLoadingProps {
  userMessage: string
  userAnswer: 'oui' | 'non'
  storyImageBase64?: string
  flowType: 'test-1' | 'test-2'
  onComplete: (analysis: RizzAnalysis) => void
}

export function RizzLoadingStep({ userMessage, userAnswer, storyImageBase64, flowType, onComplete }: RizzLoadingProps) {
  const [checkStep, setCheckStep] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const runAnalysis = useCallback(async () => {
    try {
      const response = await fetch('/api/analyze-rizz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-flow-type': flowType,
        },
        body: JSON.stringify({
          user_message: userMessage,
          storyImageBase64: storyImageBase64,
          user_answer: userAnswer,
        }),
      })

      if (!response.ok) throw new Error('Erreur API')
      const data = await response.json()
      onComplete(data as RizzAnalysis)
    } catch {
      setError('Erreur lors de l\'analyse. Réessaie.')
    }
  }, [userMessage, userAnswer, storyImageBase64, flowType, onComplete])

  useEffect(() => {
    runAnalysis()

    const t1 = setTimeout(() => setCheckStep(1), 2000)
    const t2 = setTimeout(() => setCheckStep(2), 5000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [runAnalysis])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: '#0A0A0A' }}
    >
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 20%, rgba(230,57,70,0.07), transparent 60%)' }}
      />

      <div className="relative z-10 w-full max-w-sm text-center">
        <div className="mb-8">
          <div
            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6"
            style={{ background: 'rgba(230,57,70,0.15)' }}
          >
            <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#E63946', borderTopColor: 'transparent' }} />
          </div>
          <h1 className="font-montserrat font-bold text-white text-2xl mb-2">
            🔍 Analyse de ton accroche...
          </h1>
        </div>

        <div
          className="rounded-2xl p-6 border text-left space-y-4"
          style={{ background: '#111111', borderColor: '#1F1F1F' }}
        >
          <CheckItem
            text="✓ Message analysé"
            active={checkStep >= 1}
            done={checkStep >= 1}
          />
          <CheckItem
            text="✓ Profil analysé"
            active={checkStep >= 2}
            done={checkStep >= 2}
          />
          <CheckItem
            text="⏳ Génération de l'accroche optimale..."
            active={checkStep >= 2}
            done={false}
            pulse
          />
        </div>

        <p className="text-sm mt-6" style={{ color: '#6b7280' }}>
          L'IA analyse ton message et génère l'accroche parfaite...
        </p>

        {error && (
          <div
            className="mt-4 p-3 rounded-xl"
            style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.3)' }}
          >
            <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
            <button
              onClick={runAnalysis}
              className="mt-2 text-sm font-semibold underline"
              style={{ color: '#E63946' }}
            >
              Réessayer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function CheckItem({ text, active, done, pulse }: { text: string; active: boolean; done: boolean; pulse?: boolean }) {
  return (
    <div className={`flex items-center gap-3 transition-all duration-500 ${active ? 'opacity-100' : 'opacity-30'}`}>
      <div
        className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center ${pulse && active ? 'animate-pulse' : ''}`}
        style={{ background: done ? 'rgba(34,197,94,0.2)' : 'rgba(230,57,70,0.15)' }}
      >
        {done ? (
          <span style={{ color: '#22c55e', fontSize: '10px' }}>✓</span>
        ) : (
          <span style={{ color: '#E63946', fontSize: '10px' }}>⏳</span>
        )}
      </div>
      <span className="text-sm font-medium text-white">{text}</span>
    </div>
  )
}

// ─── Step 3 : Résultat flouté ────────────────────────────────────────────────

interface RizzResultBlurredProps {
  userMessage: string
  analysis: RizzAnalysis
  flowType: 'test-1' | 'test-2'
  onUnlock: () => void
}

export function RizzResultBlurred({ userMessage, analysis, flowType, onUnlock }: RizzResultBlurredProps) {
  const router = useRouter()

  const handleUnlock = () => {
    // Sauvegarder les données avant la redirection vers l'auth
    try {
      localStorage.setItem('rizz_pending', JSON.stringify({
        analysis,
        flowType,
        userMessage,
      }))
    } catch { /* non-bloquant */ }

    // Tracker le clic
    if (analysis.session_id) {
      fetch('/api/analyze-rizz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: analysis.session_id, track_unlock: true }),
      }).catch(() => {})
    }

    onUnlock()
    router.push(`/auth?context=rizz&from=${flowType}`)
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 py-8"
      style={{ background: '#0A0A0A' }}
    >
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 20%, rgba(230,57,70,0.07), transparent 60%)' }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">📊</div>
          <h1 className="font-montserrat font-bold text-white text-2xl">
            ANALYSE TERMINÉE
          </h1>
        </div>

        {/* Message user */}
        <div
          className="rounded-2xl p-5 border mb-4"
          style={{ background: '#111111', borderColor: '#1F1F1F' }}
        >
          <p className="text-xs font-semibold mb-2" style={{ color: '#6b7280' }}>TON ACCROCHE :</p>
          <p className="text-white font-medium">"{userMessage}"</p>

          <div
            className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: 'rgba(230,57,70,0.15)', color: '#E63946', border: '1px solid rgba(230,57,70,0.3)' }}
          >
            ❌ Elle ne va PAS répondre
          </div>
        </div>

        {/* Raisons d'échec */}
        <div
          className="rounded-2xl p-5 border mb-4"
          style={{ background: '#111111', borderColor: '#1F1F1F' }}
        >
          <p className="text-xs font-semibold mb-3" style={{ color: '#E63946' }}>
            POURQUOI ÇA NE MARCHE PAS :
          </p>
          <div className="space-y-2">
            {(analysis.raisons_echec || []).map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <span style={{ color: '#E63946' }}>✗</span>
                <span className="text-sm" style={{ color: '#9da3af' }}>{r}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Séparateur */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: '#2A2A2A' }} />
          <span className="text-xs font-bold" style={{ color: '#6b7280' }}>ACCROCHE OPTIMISÉE</span>
          <div className="flex-1 h-px" style={{ background: '#2A2A2A' }} />
        </div>

        {/* Accroche floutée */}
        <div
          className="rounded-2xl p-5 border mb-4"
          style={{ background: '#111111', borderColor: '#1F1F1F' }}
        >
          <div
            className="p-4 rounded-xl mb-3"
            style={{
              background: 'rgba(230,57,70,0.05)',
              border: '1px solid rgba(230,57,70,0.2)',
              filter: 'blur(6px)',
              userSelect: 'none',
            }}
          >
            <p className="text-white font-bold text-lg text-center">
              {analysis.accroche_optimisee || 'Tu ronfles ?'}
            </p>
          </div>
          <p className="text-xs text-center" style={{ color: '#6b7280' }}>
            Cette accroche a beaucoup plus de chances de la faire répondre.
          </p>
        </div>

        {/* Raisons succès floutées */}
        <div
          className="rounded-2xl p-5 border mb-6"
          style={{ background: '#111111', borderColor: '#1F1F1F' }}
        >
          <p className="text-xs font-semibold mb-3" style={{ color: '#22c55e' }}>
            POURQUOI ÇA MARCHE :
          </p>
          <div
            className="space-y-2"
            style={{ filter: 'blur(5px)', userSelect: 'none' }}
          >
            {(analysis.raisons_succes || ['Raison 1', 'Raison 2', 'Raison 3']).map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <span style={{ color: '#22c55e' }}>✓</span>
                <span className="text-sm" style={{ color: '#9da3af' }}>{r}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Séparateur */}
        <div className="h-px mb-6" style={{ background: '#2A2A2A' }} />

        {/* CTA principal */}
        <button
          onClick={handleUnlock}
          className="w-full py-4 rounded-xl font-bold text-white text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
        >
          Voir l'accroche 🔓
        </button>

        <div className="flex items-center justify-center gap-4 mt-4">
          <span className="text-xs" style={{ color: '#6b7280' }}>⚡ Gratuit</span>
          <span className="text-xs" style={{ color: '#6b7280' }}>·</span>
          <span className="text-xs" style={{ color: '#6b7280' }}>💬 Connexion Google</span>
          <span className="text-xs" style={{ color: '#6b7280' }}>·</span>
          <span className="text-xs" style={{ color: '#6b7280' }}>🔒 Sécurisé</span>
        </div>
      </div>
    </div>
  )
}
