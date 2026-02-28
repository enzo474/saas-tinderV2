'use client'

import { useState, useRef } from 'react'
import { RizzLoadingStep, RizzResultBlurred, type RizzAnalysis } from '@/components/onboarding/RizzSteps'

type Step = 'input' | 'loading' | 'result'
type Tone = 'Direct' | 'Drôle' | 'Mystérieux' | 'Compliment'

const TONES: { id: Tone; label: string }[] = [
  { id: 'Direct',     label: 'Direct' },
  { id: 'Drôle',      label: 'Drôle' },
  { id: 'Mystérieux', label: 'Mystérieux' },
  { id: 'Compliment', label: 'Compliment' },
]

const GIRLS = [
  { id: 'emma',  img: 'https://pnmajvnkvyjlkbscwsto.supabase.co/storage/v1/object/public/fille%20unbor%202/lingerie.jpeg' },
  { id: 'sarah', img: 'https://pnmajvnkvyjlkbscwsto.supabase.co/storage/v1/object/public/fille%20unbor%202/_%20(33).jpeg' },
]

export default function OnboardingTest2() {
  const [step, setStep]                 = useState<Step>('input')
  const [message, setMessage]           = useState('')
  const [selectedTone, setSelectedTone] = useState<Tone | null>(null)
  const [selectedGirl, setSelectedGirl] = useState<string | null>(null)
  const [answer, setAnswer]             = useState<'oui' | 'non' | null>(null)
  const [analysis, setAnalysis]         = useState<RizzAnalysis | null>(null)
  const inputRef                        = useRef<HTMLTextAreaElement>(null)

  const canProceed = message.trim() && selectedTone

  const handleAnswer = (chosen: 'oui' | 'non') => {
    if (!canProceed) {
      if (!message.trim()) inputRef.current?.focus()
      return
    }
    setAnswer(chosen)
    setStep('loading')
  }

  const handleAnalysisComplete = (result: RizzAnalysis) => {
    setAnalysis(result)
    setStep('result')
  }

  if (step === 'loading' && answer && selectedTone) {
    return (
      <RizzLoadingStep
        userMessage={message}
        userAnswer={answer}
        flowType="test-2"
        tone={selectedTone}
        onComplete={handleAnalysisComplete}
      />
    )
  }

  if (step === 'result' && analysis) {
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
            TESTE TON FOOTBALL EN 10S
          </h1>
        </div>

        <div className="h-px mb-5" style={{ background: '#2A2A2A' }} />

        {/* 2 photos sélectionnables */}
        <p className="text-center text-xs font-semibold mb-3" style={{ color: '#9da3af' }}>
          Choisis une fille pour tester ton football :
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
                  <img src={girl.img} alt="profil" className="w-full h-full object-cover" />
                </div>
              </button>
            )
          })}
        </div>

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
            style={{ background: '#0D0D0D', borderColor: message.trim() ? '#E63946' : '#2A2A2A', color: '#fff' }}
          />
        </div>

        {/* Choix du ton */}
        <div
          className="rounded-2xl p-5 border mb-4"
          style={{ background: '#111111', borderColor: '#1F1F1F' }}
        >
          <p className="text-white font-semibold text-sm mb-3 text-center">
            Quel ton veux-tu utiliser ?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {TONES.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTone(t.id)}
                className="py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all"
                style={{
                  background: selectedTone === t.id ? '#E63946' : 'transparent',
                  borderColor: selectedTone === t.id ? '#E63946' : '#2A2A2A',
                  color: selectedTone === t.id ? '#fff' : '#9da3af',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

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
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', opacity: canProceed ? 1 : 0.4 }}
            >
              OUI, elle va répondre
            </button>
            <button
              onClick={() => handleAnswer('non')}
              className="py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)', opacity: canProceed ? 1 : 0.4 }}
            >
              NON, elle va ignorer
            </button>
          </div>

          {!canProceed && (
            <p className="text-xs text-center mt-3 font-semibold animate-pulse" style={{ color: '#E63946' }}>
              {!message.trim() ? 'Tape ton accroche et choisis un ton' : 'Choisis un ton pour continuer'}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-6">
          <span className="text-xs font-medium" style={{ color: '#9da3af' }}>Analyse IA instantanée</span>
          <span className="text-xs" style={{ color: '#4b5563' }}>·</span>
          <span className="text-xs font-medium" style={{ color: '#9da3af' }}>Accroche optimisée générée</span>
        </div>
      </div>
    </div>
  )
}
