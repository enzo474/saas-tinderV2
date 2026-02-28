'use client'

import { useState, useRef } from 'react'
import { RizzLoadingStep, RizzResultBlurred, type RizzAnalysis } from '@/components/onboarding/RizzSteps'

type Step = 'input' | 'loading' | 'result'

const GIRLS = [
  {
    name: '👱‍♀️ Emma, 23 ans',
    placeholder: 'https://placehold.co/400x600/1A1A1A/666666?text=Emma+23ans',
  },
  {
    name: '👩 Sarah, 24 ans',
    placeholder: 'https://placehold.co/400x600/111111/666666?text=Sarah+24ans',
  },
]

export default function OnboardingTest2() {
  const [step, setStep]           = useState<Step>('input')
  const [message, setMessage]     = useState('')
  const [answer, setAnswer]       = useState<'oui' | 'non' | null>(null)
  const [analysis, setAnalysis]   = useState<RizzAnalysis | null>(null)
  const inputRef                  = useRef<HTMLTextAreaElement>(null)

  const handleAnswer = (chosen: 'oui' | 'non') => {
    if (!message.trim()) {
      inputRef.current?.focus()
      return
    }
    setAnswer(chosen)
    setStep('loading')
  }

  const handleAnalysisComplete = (result: RizzAnalysis) => {
    setAnalysis(result)
    setStep('result')
  }

  if (step === 'loading' && answer) {
    return (
      <RizzLoadingStep
        userMessage={message}
        userAnswer={answer}
        flowType="test-2"
        onComplete={handleAnalysisComplete}
      />
    )
  }

  if (step === 'result' && analysis && answer) {
    return (
      <RizzResultBlurred
        userMessage={message}
        analysis={analysis}
        flowType="test-2"
        onUnlock={() => {}}
      />
    )
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

        {/* Titre */}
        <div className="text-center mb-5">
          <h1 className="font-montserrat font-extrabold text-white text-2xl leading-tight">
            🎯 TESTE TON RIZZ<br />EN 10 SECONDES
          </h1>
        </div>

        {/* Séparateur */}
        <div className="h-px mb-5" style={{ background: '#2A2A2A' }} />

        {/* 2 photos côte à côte */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {GIRLS.map((girl) => (
            <div key={girl.name} className="flex flex-col items-center gap-2">
              <div
                className="w-full rounded-2xl overflow-hidden border"
                style={{ borderColor: '#2A2A2A', aspectRatio: '2/3' }}
              >
                <img
                  src={girl.placeholder}
                  alt={girl.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-semibold" style={{ color: '#9da3af' }}>
                {girl.name}
              </span>
            </div>
          ))}
        </div>

        {/* Séparateur */}
        <div className="h-px mb-5" style={{ background: '#2A2A2A' }} />

        {/* Question accroche */}
        <div
          className="rounded-2xl p-5 border mb-4"
          style={{ background: '#111111', borderColor: '#1F1F1F' }}
        >
          <p className="text-white font-semibold text-sm mb-3 text-center">
            Qu'est-ce que tu lui aurais envoyé comme accroche ?
          </p>
          <textarea
            ref={inputRef}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Tape ton message ici..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border text-white text-sm outline-none resize-none transition-colors"
            style={{ background: '#0D0D0D', borderColor: '#2A2A2A', color: '#fff' }}
          />
        </div>

        {/* Séparateur */}
        <div className="h-px mb-4" style={{ background: '#2A2A2A' }} />

        {/* Question Oui/Non */}
        <div
          className="rounded-2xl p-5 border mb-5"
          style={{ background: '#111111', borderColor: '#1F1F1F' }}
        >
          <p className="text-white font-semibold text-sm mb-4 text-center">
            Tu penses qu'elle t'aurait répondu ?
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleAnswer('oui')}
              className="py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
            >
              OUI, elle va répondre
            </button>
            <button
              onClick={() => handleAnswer('non')}
              className="py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
            >
              NON, elle va ignorer
            </button>
          </div>

          {!message.trim() && (
            <p className="text-xs text-center mt-3" style={{ color: '#E63946' }}>
              Tape ton accroche d'abord ↑
            </p>
          )}
        </div>

        {/* Footer features */}
        <div className="flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm">⚡</span>
            <span className="text-xs font-medium" style={{ color: '#9da3af' }}>Analyse IA instantanée</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">💬</span>
            <span className="text-xs font-medium" style={{ color: '#9da3af' }}>Accroche optimisée générée</span>
          </div>
        </div>
      </div>
    </div>
  )
}
