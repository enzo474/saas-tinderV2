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
  tone: string
  selectedGirl?: string
  sessionId?: string
  onComplete: (analysis: RizzAnalysis) => void
}

function trackEvent(sessionId: string | undefined, event: string, data?: Record<string, unknown>) {
  if (!sessionId) return
  fetch('/api/tracking/rizz-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, event, data }),
  }).catch(() => {})
}

export function RizzLoadingStep({ userMessage, userAnswer, storyImageBase64, flowType, tone, selectedGirl, sessionId, onComplete }: RizzLoadingProps) {
  const [checkStep, setCheckStep] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const runAnalysis = useCallback(async () => {
    try {
      const response = await fetch('/api/analyze-rizz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-flow-type': flowType,
          ...(selectedGirl ? { 'x-selected-girl': selectedGirl } : {}),
        },
        body: JSON.stringify({
          user_message: userMessage,
          storyImageBase64,
          user_answer: userAnswer,
          tone,
          session_id: sessionId,
        }),
      })

      if (!response.ok) throw new Error('Erreur API')
      const data = await response.json()
      // Mettre à jour le session_id si l'API en renvoie un
      const finalSessionId = data.session_id || sessionId
      if (finalSessionId) {
        try { localStorage.setItem('rizz_session_id', finalSessionId) } catch {}
      }
      onComplete({ ...data, session_id: finalSessionId } as RizzAnalysis)
    } catch {
      setError('Erreur lors de l\'analyse. Réessaie.')
    }
  }, [userMessage, userAnswer, storyImageBase64, flowType, tone, selectedGirl, sessionId, onComplete])

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
            Analyse de ton football...
          </h1>
          <p className="text-sm" style={{ color: '#6b7280' }}>
            Ton : <span className="font-semibold" style={{ color: '#E63946' }}>{tone}</span>
          </p>
        </div>

        <div
          className="rounded-2xl p-6 border text-left space-y-4"
          style={{ background: '#111111', borderColor: '#1F1F1F' }}
        >
          <CheckItem text="Message analysé"                    active={checkStep >= 1} done={checkStep >= 1} />
          <CheckItem text="Profil analysé"                     active={checkStep >= 2} done={checkStep >= 2} />
          <CheckItem text="Génération du football optimal..." active={checkStep >= 2} done={false} pulse />
        </div>

        <p className="text-sm mt-6" style={{ color: '#6b7280' }}>
          L'IA analyse ton message et génère le football parfait...
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
        <span style={{ color: done ? '#22c55e' : '#E63946', fontSize: '10px' }}>{done ? '✓' : '·'}</span>
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
  sessionId?: string
  onUnlock: () => void
}

export function RizzResultBlurred({ userMessage, analysis, flowType, sessionId, onUnlock }: RizzResultBlurredProps) {
  const router = useRouter()
  const sid = analysis.session_id || sessionId

  // Tracking : vue du résultat flouté
  useEffect(() => {
    trackEvent(sid, 'saw_result', { verdict: analysis.verdict })
  }, [sid, analysis.verdict])

  const handleUnlock = () => {
    trackEvent(sid, 'clicked_unlock')
    try {
      localStorage.setItem('rizz_pending', JSON.stringify({
        analysis,
        flowType,
        userMessage,
        sessionId: sid,
      }))
    } catch { /* non-bloquant */ }
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
          <h1 className="font-montserrat font-bold text-white text-2xl">
            ANALYSE TERMINÉE
          </h1>
        </div>

        {/* Message user */}
        <div
          className="rounded-2xl p-5 border mb-4"
          style={{ background: '#111111', borderColor: '#1F1F1F' }}
        >
          <p className="text-xs font-semibold mb-2" style={{ color: '#6b7280' }}>TON FOOTBALL :</p>
          <p className="text-white font-medium">"{userMessage}"</p>
          <div
            className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: 'rgba(230,57,70,0.15)', color: '#E63946', border: '1px solid rgba(230,57,70,0.3)' }}
          >
            Elle ne va PAS répondre
          </div>
        </div>

        {/* Raisons échec */}
        <div
          className="rounded-2xl p-5 border mb-4"
          style={{ background: '#111111', borderColor: '#1F1F1F' }}
        >
          <p className="text-xs font-semibold mb-3" style={{ color: '#E63946' }}>
            POURQUOI CA NE MARCHE PAS :
          </p>
          <div className="space-y-2">
            {(analysis.raisons_echec || []).map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-xs mt-0.5 flex-shrink-0" style={{ color: '#E63946' }}>—</span>
                <span className="text-sm" style={{ color: '#9da3af' }}>{r}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Séparateur */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: '#2A2A2A' }} />
          <span className="text-xs font-bold" style={{ color: '#6b7280' }}>FOOTBALL OPTIMISÉ</span>
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
            Ce football a beaucoup plus de chances de la faire répondre.
          </p>
        </div>

        {/* Raisons succès floutées */}
        <div
          className="rounded-2xl p-5 border mb-6"
          style={{ background: '#111111', borderColor: '#1F1F1F' }}
        >
          <p className="text-xs font-semibold mb-3" style={{ color: '#22c55e' }}>
            POURQUOI CA MARCHE :
          </p>
          <div className="space-y-2" style={{ filter: 'blur(5px)', userSelect: 'none' }}>
            {(analysis.raisons_succes || ['Raison 1', 'Raison 2', 'Raison 3']).map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-xs mt-0.5 flex-shrink-0" style={{ color: '#22c55e' }}>—</span>
                <span className="text-sm" style={{ color: '#9da3af' }}>{r}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px mb-6" style={{ background: '#2A2A2A' }} />

        {/* CTA */}
        <button
          onClick={handleUnlock}
          className="w-full py-4 rounded-xl font-bold text-white text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
        >
          Voir le football
        </button>

        <div className="flex items-center justify-center gap-4 mt-4">
          <span className="text-xs" style={{ color: '#6b7280' }}>Gratuit</span>
          <span className="text-xs" style={{ color: '#6b7280' }}>·</span>
          <span className="text-xs" style={{ color: '#6b7280' }}>Connexion Google</span>
          <span className="text-xs" style={{ color: '#6b7280' }}>·</span>
          <span className="text-xs" style={{ color: '#6b7280' }}>Sécurisé</span>
        </div>
      </div>
    </div>
  )
}
