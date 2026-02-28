'use client'

import { useState, useRef } from 'react'
import { RizzLoadingStep, RizzResultBlurred, type RizzAnalysis } from '@/components/onboarding/RizzSteps'

type Step = 'input' | 'loading' | 'result'

export default function OnboardingTest1() {
  const [step, setStep]               = useState<Step>('input')
  const [message, setMessage]         = useState('')
  const [answer, setAnswer]           = useState<'oui' | 'non' | null>(null)
  const [analysis, setAnalysis]       = useState<RizzAnalysis | null>(null)
  const [storyImage, setStoryImage]   = useState<string | null>(null)  // base64
  const [storyPreview, setStoryPreview] = useState<string | null>(null)
  const inputRef                      = useRef<HTMLTextAreaElement>(null)
  const fileInputRef                  = useRef<HTMLInputElement>(null)

  const handleStoryClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      setStoryPreview(result)
      // Extraire uniquement le base64 (sans le prefix data:...)
      const base64 = result.split(',')[1]
      setStoryImage(base64)
    }
    reader.readAsDataURL(file)
  }

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
        storyImageBase64={storyImage || undefined}
        flowType="test-1"
        onComplete={handleAnalysisComplete}
      />
    )
  }

  if (step === 'result' && analysis && answer) {
    return (
      <RizzResultBlurred
        userMessage={message}
        analysis={analysis}
        flowType="test-1"
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
        <div className="text-center mb-6">
          <h1 className="font-montserrat font-extrabold text-white text-2xl leading-tight">
            🎯 TESTE TON RIZZ<br />EN 10 SECONDES
          </h1>
        </div>

        {/* Zone story — clickable pour upload */}
        <div className="flex justify-center mb-5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={handleStoryClick}
            className="relative overflow-hidden rounded-2xl border transition-all hover:border-opacity-80 active:scale-[0.98]"
            style={{
              width: '180px',
              aspectRatio: '9/16',
              borderColor: storyPreview ? '#E63946' : '#2A2A2A',
              background: '#111111',
            }}
          >
            {storyPreview ? (
              <img
                src={storyPreview}
                alt="Story uploadée"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(230,57,70,0.15)' }}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#E63946">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-white mb-1">Ajouter une story</p>
                  <p className="text-xs" style={{ color: '#6b7280' }}>Clique pour uploader</p>
                </div>
              </div>
            )}
            {/* Badge overlay si image présente */}
            {storyPreview && (
              <div
                className="absolute bottom-2 inset-x-2 text-center text-xs font-bold py-1 rounded-lg"
                style={{ background: 'rgba(0,0,0,0.6)', color: '#22c55e' }}
              >
                ✓ Story ajoutée
              </div>
            )}
          </button>
        </div>

        {/* Question */}
        <div
          className="rounded-2xl p-5 border mb-4"
          style={{ background: '#111111', borderColor: '#1F1F1F' }}
        >
          <p className="text-white font-semibold text-sm mb-3 text-center">
            À cette story, qu'est-ce que tu lui aurais envoyé ?
          </p>
          <textarea
            ref={inputRef}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Tape ton accroche ici..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border text-white text-sm outline-none resize-none transition-colors"
            style={{ background: '#0D0D0D', borderColor: message.trim() ? '#E63946' : '#2A2A2A', color: '#fff' }}
          />
        </div>

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
