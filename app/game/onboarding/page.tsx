'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type QuestionType = 'single' | 'multiple' | 'slider'

interface Option {
  icon?: string
  label: string
  value: string
}

interface Question {
  id: number
  question: string
  subtitle?: string
  type: QuestionType
  options?: Option[]
  leftLabel?: string
  rightLabel?: string
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "Comment as-tu connu l'app ?",
    type: 'single',
    options: [
      { icon: '📱', label: 'TikTok',              value: 'tiktok'    },
      { icon: '📷', label: 'Instagram',           value: 'instagram' },
      { icon: '📺', label: 'YouTube',             value: 'youtube'   },
      { icon: '👥', label: 'Amis',                value: 'amis'      },
      { icon: '🔍', label: 'Recherche App Store', value: 'app_store' },
    ],
  },
  {
    id: 2,
    question: 'Quels sont tes objectifs ?',
    subtitle: 'Crushmaxxing sera personnalisé en fonction de tes objectifs',
    type: 'multiple',
    options: [
      { label: 'Découvrir de nouvelles disquettes',   value: 'disquettes' },
      { label: 'Engager la conversation facilement',  value: 'engager'    },
      { label: 'Tchatcher mon pain',                  value: 'tchatcher'  },
      { label: 'Avoir plus de dates',                 value: 'dates'      },
    ],
  },
  {
    id: 3,
    question: 'Quel est ton genre ?',
    subtitle: 'Tes réponses seront adaptées en fonction de ton genre',
    type: 'single',
    options: [
      { label: 'Homme',  value: 'homme'  },
      { label: 'Femme',  value: 'femme'  },
      { label: 'Neutre', value: 'neutre' },
    ],
  },
  {
    id: 4,
    question: 'Quel est ton âge ?',
    type: 'single',
    options: [
      { label: 'Moins de 20', value: '<20'   },
      { label: '20–24',       value: '20-24' },
      { label: '25–34',       value: '25-34' },
      { label: '35–44',       value: '35-44' },
      { label: '45+',         value: '45+'   },
    ],
  },
  {
    id: 5,
    question: 'Tu préfères être plutôt...',
    type: 'slider',
    leftLabel: 'Sérieux',
    rightLabel: 'Tchatcheur',
  },
  {
    id: 6,
    question: 'Tes approches sont plutôt...',
    type: 'slider',
    leftLabel: 'Subtiles',
    rightLabel: 'Directes',
  },
  {
    id: 7,
    question: 'Ton humour est...',
    type: 'slider',
    leftLabel: 'Léger',
    rightLabel: 'Sarcastique',
  },
]

export default function GameOnboarding() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({})
  const [sliderVal, setSliderVal] = useState(50)

  const q = QUESTIONS[step]
  const progress = ((step + 1) / QUESTIONS.length) * 100
  const isLast = step === QUESTIONS.length - 1

  const currentAnswer = answers[step]
  const canProceed =
    q.type === 'slider'
      ? true
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
    if (q.type === 'slider') {
      setAnswers({ ...answers, [step]: String(sliderVal) })
      setSliderVal(50)
    }
    if (isLast) {
      const finalAnswers = q.type === 'slider'
        ? { ...answers, [step]: String(sliderVal) }
        : answers
      try {
        localStorage.setItem('game_onboarding', JSON.stringify(finalAnswers))
      } catch { /* ignore */ }
      router.push('/game')
    } else {
      setStep((s) => s + 1)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#0A0A0A' }}
    >
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

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <div
          className="w-full max-w-md rounded-3xl p-7"
          style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}
        >
          {/* Counter */}
          <p className="text-center text-sm font-semibold mb-6" style={{ color: '#6b7280' }}>
            Question {step + 1} sur {QUESTIONS.length}
          </p>

          {/* Mascotte + Question */}
          <div className="flex items-start gap-4 mb-7">
            {/* Mascotte placeholder */}
            <div
              className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-3xl"
              style={{
                background: 'rgba(230,57,70,0.1)',
                border: '2px solid rgba(230,57,70,0.3)',
              }}
            >
              🎮
            </div>

            <div className="flex-1">
              <h2 className="font-montserrat text-lg font-bold text-white mb-1">
                {q.question}
              </h2>
              {q.subtitle && (
                <p className="text-xs" style={{ color: '#9da3af' }}>{q.subtitle}</p>
              )}
            </div>
          </div>

          {/* Options / Slider */}
          {q.type === 'slider' ? (
            <div className="py-2 mb-7">
              <input
                type="range"
                min={0}
                max={100}
                value={sliderVal}
                onChange={(e) => setSliderVal(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer mb-3"
                style={{
                  background: `linear-gradient(to right, #E63946 ${sliderVal}%, #2A2A2A ${sliderVal}%)`,
                  accentColor: '#E63946',
                }}
              />
              <div className="flex justify-between text-sm font-medium" style={{ color: '#9da3af' }}>
                <span>{q.leftLabel}</span>
                <span>{q.rightLabel}</span>
              </div>
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
                    {opt.icon && <span className="mr-2">{opt.icon}</span>}
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
            {isLast ? 'Terminer' : 'Suivant →'}
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
