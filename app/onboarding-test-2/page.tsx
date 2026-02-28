'use client'

import { useState, useRef } from 'react'
import { RizzLoadingStep, RizzResultBlurred, type RizzAnalysis } from '@/components/onboarding/RizzSteps'

type Step = 'input' | 'loading' | 'result'

const GIRLS = [
  {
    id: 'emma',
    name: '👱‍♀️ Emma, 23 ans',
    placeholder: 'https://placehold.co/300x450/1A1A1A/888888?text=Emma',
  },
  {
    id: 'sarah',
    name: '👩 Sarah, 24 ans',
    placeholder: 'https://placehold.co/300x450/151515/888888?text=Sarah',
  },
]

export default function OnboardingTest2() {
  const [step, setStep]               = useState<Step>('input')
  const [message, setMessage]         = useState('')
  const [answer, setAnswer]           = useState<'oui' | 'non' | null>(null)
  const [analysis, setAnalysis]       = useState<RizzAnalysis | null>(null)
  const [selectedGirl, setSelectedGirl] = useState<string | null>(null)
  const inputRef                      = useRef<HTMLTextAreaElement>(null)

  const handleAnswer = (chosen: 'oui' | 'non') => {
    if (!message.trim()) {
      inputRef.current?.focus()
      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
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

        {/* 2 photos sélectionnables */}
        <p className="text-center text-xs font-semibold mb-3" style={{ color: '#9da3af' }}>
          Choisis une fille pour tester ton rizz :
        </p>
        <div className="grid grid-cols-2 gap-3 mb-5">
          {GIRLS.map((girl) => {
            const isSelected = selectedGirl === girl.id
            return (
              <button
                key={girl.id}
                onClick={() => setSelectedGirl(girl.id)}
                className="flex flex-col items-center gap-2 transition-all"
              >
                <div
                  className="w-full rounded-2xl overflow-hidden border-2 transition-all"
                  style={{
                    aspectRatio: '2/3',
                    borderColor: isSelected ? '#E63946' : '#2A2A2A',
                    boxShadow: isSelected ? '0 0 16px rgba(230,57,70,0.35)' : 'none',
                    transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                  }}
                >
                  <img
                    src={girl.placeholder}
                    alt={girl.name}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div
                      className="absolute inset-0 rounded-2xl pointer-events-none"
                      style={{ background: 'rgba(230,57,70,0.08)' }}
                    />
                  )}
                </div>
                <span
                  className="text-xs font-semibold transition-colors"
                  style={{ color: isSelected ? '#E63946' : '#9da3af' }}
                >
                  {isSelected ? '✓ ' : ''}{girl.name}
                </span>
              </button>
            )
          })}
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
            style={{
              background: '#0D0D0D',
              borderColor: message.trim() ? '#E63946' : '#2A2A2A',
              color: '#fff',
            }}
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
              style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                opacity: message.trim() ? 1 : 0.5,
              }}
            >
              OUI, elle va répondre
            </button>
            <button
              onClick={() => handleAnswer('non')}
              className="py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #E63946, #FF4757)',
                opacity: message.trim() ? 1 : 0.5,
              }}
            >
              NON, elle va ignorer
            </button>
          </div>

          {!message.trim() && (
            <p className="text-xs text-center mt-3 font-semibold animate-pulse" style={{ color: '#E63946' }}>
              ↑ Tape d'abord ton accroche
            </p>
          )}
        </div>

        {/* Footer */}
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
