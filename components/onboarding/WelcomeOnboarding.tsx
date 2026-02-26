'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

// Mettre à true quand la vidéo Tella est prête
const SHOW_VIDEO_INTRO = false
const TELLA_VIDEO_URL = '' // Ex: "https://www.tella.tv/video/xxx/embed"

type QuestionType = 'single' | 'multiple' | 'text'

interface Option {
  label: string
  value: string
}

interface Question {
  id: number
  question: string
  subtitle?: string
  type: QuestionType
  options?: Option[]
  placeholder?: string
  maxLength?: number
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: 'Quels sont tes objectifs ?',
    subtitle: 'Crushmaxxing sera personnalisé en fonction de tes objectifs',
    type: 'multiple',
    options: [
      { label: 'Découvrir de nouvelles disquettes',  value: 'disquettes' },
      { label: 'Engager la conversation facilement',  value: 'engager'    },
      { label: 'Chatter mon pain',                   value: 'tchatcher'  },
      { label: 'Avoir plus de dates',                value: 'dates'      },
    ],
  },
  {
    id: 2,
    question: 'Quel est ton plus gros problème ?',
    type: 'single',
    options: [
      { label: 'Je sais pas quoi dire en premier message', value: 'no_opener'  },
      { label: 'Mes messages restent sans réponse',        value: 'no_reply'   },
      { label: 'Je stresse et j\'envoie rien',             value: 'stress'     },
      { label: 'Je copie-colle partout le même truc',      value: 'copypaste'  },
    ],
  },
  {
    id: 3,
    question: 'Ton style de messages préféré ?',
    type: 'single',
    options: [
      { label: '🎯 Direct (va droit au but)',        value: 'direct'     },
      { label: '😂 Drôle (humour et blagues)',       value: 'drole'      },
      { label: '🌙 Mystérieux (intrigue)',           value: 'mysterieux' },
      { label: '⚡ Compliment (flatteur mais classe)', value: 'compliment' },
    ],
  },
  {
    id: 4,
    question: 'Tes accroches sont plutôt...',
    type: 'single',
    options: [
      { label: 'Subtiles (finesse et indirection)', value: 'subtiles'  },
      { label: 'Directes (cash et assumées)',        value: 'directes'  },
    ],
  },
  {
    id: 5,
    question: 'Choisis ton pseudo',
    subtitle: 'Il sera affiché dans ton espace personnel',
    type: 'text',
    placeholder: 'Ton pseudo...',
    maxLength: 20,
  },
]

const SUCCESS_MESSAGES: Record<string, string> = {
  no_opener: "On va t'écrire des accroches qui font réagir à tous les coups ! 🔥",
  no_reply:  "Fini les messages ignorés ! On génère des accroches qui font répondre ! 💬",
  stress:    "T'inquiète, on fait le taf à ta place. Plus de stress, juste des résultats ! 💪",
  copypaste: "Fini le copier-coller ! Chaque message sera personnalisé selon son profil ! 🎯",
}

function trackEvent(event: string, data: Record<string, unknown> = {}) {
  fetch('/api/tracking/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, data }),
  }).catch(() => {})
}

interface WelcomeOnboardingProps {
  redirectTo?: string
}

export function WelcomeOnboarding({ redirectTo = '/game/accroche' }: WelcomeOnboardingProps) {
  const router = useRouter()

  // showVideo = true uniquement si SHOW_VIDEO_INTRO est activé
  const [showVideo, setShowVideo]     = useState(SHOW_VIDEO_INTRO)
  const [step, setStep]               = useState(0)
  const [answers, setAnswers]         = useState<Record<number, string | string[]>>({})
  const [textVal, setTextVal]         = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const trackedSteps                  = useRef<Set<number>>(new Set())

  // Track onboarding_started au premier render
  useEffect(() => {
    trackEvent('onboarding_started')
  }, [])

  // Track chaque nouvelle question affichée
  useEffect(() => {
    if (showVideo || showSuccess) return
    if (trackedSteps.current.has(step)) return
    trackedSteps.current.add(step)
    trackEvent(`onboarding_question_${step + 1}_viewed`)
  }, [step, showVideo, showSuccess])

  const q = QUESTIONS[step]
  const progress = ((step + 1) / QUESTIONS.length) * 100
  const isLast = step === QUESTIONS.length - 1

  const currentAnswer = answers[step]
  const canProceed =
    q.type === 'text'
      ? textVal.trim().length >= 2
      : q.type === 'single'
      ? !!currentAnswer
      : Array.isArray(currentAnswer) && currentAnswer.length > 0

  const toggleOption = (value: string) => {
    if (q.type === 'single') {
      setAnswers({ ...answers, [step]: value })
    } else {
      const current = (answers[step] as string[]) || []
      setAnswers({
        ...answers,
        [step]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      })
    }
  }

  const isSelected = (value: string) => {
    const ans = answers[step]
    if (q.type === 'single') return ans === value
    return Array.isArray(ans) && ans.includes(value)
  }

  const handleNext = () => {
    const finalAnswers = q.type === 'text'
      ? { ...answers, [step]: textVal.trim() }
      : answers

    if (isLast) {
      try {
        localStorage.setItem('game_onboarding', JSON.stringify(finalAnswers))
        const pseudo = finalAnswers[QUESTIONS.length - 1] as string
        if (pseudo) localStorage.setItem('crushmaxxing_pseudo', pseudo)
      } catch { /* ignore */ }

      trackEvent('onboarding_completed')
      setAnswers(finalAnswers)
      setShowSuccess(true)
    } else {
      if (q.type === 'text') setAnswers(finalAnswers)
      setTextVal('')
      setStep((s) => s + 1)
    }
  }

  const handleGoToDashboard = () => {
    router.push(redirectTo)
  }

  // ─── Page vidéo intro (masquée tant que SHOW_VIDEO_INTRO = false) ────────────
  if (showVideo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: '#0A0A0A' }}>
        <div className="w-full max-w-md rounded-3xl p-7 flex flex-col items-center gap-6" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
          <span className="font-montserrat font-extrabold text-lg" style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Crushmaxxing
          </span>

          <div className="w-full rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9', background: '#000' }}>
            {TELLA_VIDEO_URL ? (
              <iframe
                src={TELLA_VIDEO_URL}
                className="w-full h-full"
                allow="autoplay; fullscreen"
                style={{ border: 'none' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ color: '#6b7280', fontSize: 14 }}>
                Vidéo bientôt disponible
              </div>
            )}
          </div>

          <button
            onClick={() => { trackEvent('onboarding_video_viewed', { duration: 0 }); setShowVideo(false) }}
            className="w-full py-4 rounded-2xl text-white font-semibold text-base transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #FF8C42, #E67A35)' }}
          >
            Commencer →
          </button>

          <button
            onClick={() => setShowVideo(false)}
            className="text-sm transition-colors"
            style={{ color: '#6b7280' }}
          >
            Passer la vidéo
          </button>
        </div>
      </div>
    )
  }

  // ─── Page de succès finale ────────────────────────────────────────────────────
  if (showSuccess) {
    const problem = answers[1] as string
    const successMessage = SUCCESS_MESSAGES[problem] ?? "CrushTalk va t'aider à transformer tes matchs en dates ! 🚀"
    const pseudo = (answers[QUESTIONS.length - 1] as string) || ''

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: '#0A0A0A' }}>
        <div className="w-full max-w-md rounded-3xl p-7 flex flex-col items-center gap-6 text-center" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
          <span className="font-montserrat font-extrabold text-lg" style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Crushmaxxing
          </span>

          <div className="flex flex-col items-center gap-3">
            <div className="text-4xl">🎯</div>
            {pseudo && (
              <p className="text-sm font-medium" style={{ color: '#9da3af' }}>
                Bienvenue, <span className="text-white font-bold">{pseudo}</span> !
              </p>
            )}
            <h2 className="font-montserrat text-xl font-bold text-white leading-snug">
              {successMessage}
            </h2>
            <p className="text-sm" style={{ color: '#9da3af' }}>
              Ton profil est prêt. Lance ta première accroche gratuite maintenant.
            </p>
          </div>

          <button
            onClick={handleGoToDashboard}
            className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
          >
            Générer ma 1ère accroche gratuitement →
          </button>
        </div>
      </div>
    )
  }

  // ─── Questions ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0A0A0A' }}>
      {/* Progress bar */}
      <div className="w-full h-1.5" style={{ background: '#1A1A1A' }}>
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #E63946, #FF4757)',
          }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-md rounded-3xl p-7" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
          {/* Logo */}
          <div className="text-center mb-5">
            <span
              className="font-montserrat font-extrabold text-lg"
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

          {/* Counter */}
          <p className="text-center text-sm font-semibold mb-6" style={{ color: '#6b7280' }}>
            Question {step + 1} sur {QUESTIONS.length}
          </p>

          {/* Question */}
          <div className="mb-7">
            <h2 className="font-montserrat text-lg font-bold text-white mb-1">
              {q.question}
            </h2>
            {q.subtitle && (
              <p className="text-sm" style={{ color: '#9da3af' }}>{q.subtitle}</p>
            )}
          </div>

          {/* Options ou champ texte */}
          {q.type === 'text' ? (
            <div className="mb-7">
              <input
                type="text"
                value={textVal}
                onChange={(e) => setTextVal(e.target.value)}
                placeholder={q.placeholder}
                maxLength={q.maxLength ?? 20}
                className="w-full p-4 rounded-xl border-2 text-white font-medium text-sm transition-all outline-none"
                style={{
                  borderColor: textVal.trim().length >= 2 ? '#E63946' : '#2A2A2A',
                  background: '#252525',
                  color: '#ffffff',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && canProceed) handleNext()
                }}
              />
              <p className="text-xs mt-2 text-right" style={{ color: '#6b7280' }}>
                {textVal.length}/{q.maxLength ?? 20}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 mb-7">
              {q.options?.map((opt) => {
                const sel = isSelected(opt.value)
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleOption(opt.value)}
                    className="w-full p-4 rounded-xl border-2 text-left font-medium text-sm transition-all"
                    style={{
                      borderColor: sel ? '#E63946' : '#2A2A2A',
                      background: sel ? 'rgba(230,57,70,0.08)' : '#252525',
                      color: sel ? '#E63946' : '#ffffff',
                    }}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="w-full py-4 rounded-2xl text-white font-semibold text-base transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
          >
            {isLast ? 'Terminer →' : 'Suivant →'}
          </button>

          {/* Back */}
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="w-full mt-3 py-2 text-sm transition-colors"
              style={{ color: '#6b7280' }}
            >
              ← Retour
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
