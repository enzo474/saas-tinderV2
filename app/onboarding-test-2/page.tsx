'use client'

import { useState } from 'react'
import { RizzLoadingStep, RizzResultBlurred, type RizzAnalysis } from '@/components/onboarding/RizzSteps'
import { useRizzTracking } from '@/hooks/useRizzTracking'

type Step = 'input' | 'loading' | 'result'
type Tone = 'Direct' | 'Drôle' | 'Mystérieux' | 'Compliment'

const TONES: { id: Tone; label: string }[] = [
  { id: 'Direct',     label: 'Direct' },
  { id: 'Drôle',      label: 'Drôle' },
  { id: 'Mystérieux', label: 'Mystérieux' },
  { id: 'Compliment', label: 'Compliment' },
]

const GIRL_URLS = [
  { id: 'emma',  url: 'https://pnmajvnkvyjlkbscwsto.supabase.co/storage/v1/object/public/fille%20unbor%202/lingerie.jpeg' },
  { id: 'sarah', url: 'https://pnmajvnkvyjlkbscwsto.supabase.co/storage/v1/object/public/fille%20unbor%202/_%20(33).jpeg' },
]

async function urlToBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        resolve(dataUrl.split(',')[1] ?? null)
      }
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

export default function OnboardingTest2() {
  const [step, setStep]                 = useState<Step>('input')
  const [selectedTone, setSelectedTone] = useState<Tone | null>(null)
  const [selectedGirl, setSelectedGirl] = useState<string | null>(null)
  const [girlPreview, setGirlPreview]   = useState<string | null>(null)
  const [storyImage, setStoryImage]     = useState<string | null>(null)
  const [loadingPhoto, setLoadingPhoto] = useState(false)
  const [analysis, setAnalysis]         = useState<RizzAnalysis | null>(null)
  const [sessionId, setSessionId]       = useState<string | null>(null)

  const { track, getSessionId } = useRizzTracking('test-2')

  const ensureSessionId = () => {
    const id = getSessionId()
    if (id && !sessionId) setSessionId(id)
    return id ?? sessionId
  }

  const handlePhotoClick = async () => {
    if (girlPreview || loadingPhoto) return
    setLoadingPhoto(true)
    const picked = GIRL_URLS[Math.floor(Math.random() * GIRL_URLS.length)]
    setSelectedGirl(picked.id)
    setGirlPreview(picked.url)
    const b64 = await urlToBase64(picked.url)
    if (b64) setStoryImage(b64)
    setLoadingPhoto(false)
    track('girl_selected', { girl_id: picked.id })
  }

  const handlePhotoReset = () => {
    setGirlPreview(null)
    setSelectedGirl(null)
    setStoryImage(null)
  }

  const handleToneSelect = (tone: Tone) => {
    setSelectedTone(tone)
    track('tone_selected', { tone })
  }

  const canGenerate = !!selectedTone

  const handleGenerate = () => {
    if (!canGenerate) return
    const sid = ensureSessionId()
    if (sid) setSessionId(sid)
    track('answer_clicked', { tone: selectedTone })
    setStep('loading')
  }

  const handleAnalysisComplete = (result: RizzAnalysis) => {
    setAnalysis(result)
    setStep('result')
  }

  if (step === 'loading' && selectedTone) {
    return (
      <RizzLoadingStep
        storyImageBase64={storyImage || undefined}
        flowType="test-2"
        tone={selectedTone}
        selectedGirl={selectedGirl ?? undefined}
        sessionId={sessionId ?? undefined}
        onComplete={handleAnalysisComplete}
      />
    )
  }

  if (step === 'result' && analysis) {
    return (
      <RizzResultBlurred
        analysis={analysis}
        flowType="test-2"
        sessionId={sessionId ?? undefined}
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
            TESTE TON ACCROCHE EN 10S
          </h1>
        </div>

        {/* Zone photo test — auto-load au clic */}
        <div className="flex justify-center mb-5">
          <button
            onClick={girlPreview ? handlePhotoReset : handlePhotoClick}
            className="relative overflow-hidden rounded-2xl border transition-all hover:border-opacity-80 active:scale-[0.98]"
            style={{
              width: '180px',
              aspectRatio: '9/16',
              borderColor: girlPreview ? '#E63946' : '#2A2A2A',
              background: '#111111',
            }}
          >
            {girlPreview ? (
              <>
                <img src={girlPreview} alt="Photo test" className="w-full h-full object-cover" />
                <div
                  className="absolute bottom-2 inset-x-2 text-center text-xs font-bold py-1 rounded-lg"
                  style={{ background: 'rgba(0,0,0,0.6)', color: '#22c55e' }}
                >
                  Photo chargée
                </div>
              </>
            ) : loadingPhoto ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#E63946', borderTopColor: 'transparent' }} />
              </div>
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
                  <p className="text-xs font-semibold text-white mb-1">Photo test</p>
                  <p className="text-xs" style={{ color: '#6b7280' }}>Clique pour charger</p>
                </div>
              </div>
            )}
          </button>
        </div>

        {/* Choix du ton */}
        <div
          className="rounded-2xl p-5 border mb-5"
          style={{ background: '#111111', borderColor: '#1F1F1F' }}
        >
          <p className="text-white font-semibold text-sm mb-3 text-center">
            Quel ton veux-tu utiliser ?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {TONES.map(t => (
              <button
                key={t.id}
                onClick={() => handleToneSelect(t.id)}
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

        {/* Bouton CTA */}
        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="w-full py-4 rounded-xl font-bold text-white text-base transition-all mb-5"
          style={{
            background: canGenerate
              ? 'linear-gradient(135deg, #E63946, #FF4757)'
              : '#1F1F1F',
            color: canGenerate ? '#fff' : '#4b5563',
            cursor: canGenerate ? 'pointer' : 'not-allowed',
          }}
        >
          {canGenerate ? 'GÉNÉRER MON ACCROCHE' : 'Choisis un ton pour continuer'}
        </button>

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
