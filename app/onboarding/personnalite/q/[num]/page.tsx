'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

const QUESTIONS = [
  { label: 'Tu préfères être plutôt...', left: 'Sérieux', right: 'Tchatcheur', key: 'serieux_tchatcheur' },
  { label: 'Tes approches sont plutôt...', left: 'Subtiles', right: 'Directes', key: 'subtil_direct' },
  { label: 'Ton humour est...', left: 'Léger', right: 'Sarcastique', key: 'leger_sarcastique' },
  { label: "Ton style d'écriture est...", left: 'Familier', right: 'Soigné', key: 'familier_soigne' },
  { label: 'Utilises-tu des réfs ?', left: 'Aucune', right: 'Full réfs', key: 'refs' },
]

const TOTAL = QUESTIONS.length

// 5 barres style equalizer
function EqualizerBars({ value }: { value: number }) {
  const heights = [35, 55, 80, 55, 35]
  const activeIndex = Math.round((value / 100) * 4)

  return (
    <div className="flex items-end justify-center gap-2.5 mb-6" style={{ height: 80 }}>
      {heights.map((h, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: 24,
            height: h,
            background: i === activeIndex ? '#E63946' : '#E5E5E5',
          }}
        />
      ))}
    </div>
  )
}

export default function PersonnaliteQuestion() {
  const router = useRouter()
  const { num } = useParams<{ num: string }>()
  const questionIndex = parseInt(num, 10) - 1
  const question = QUESTIONS[questionIndex]
  const progress = ((questionIndex + 1) / TOTAL) * 100

  const [value, setValue] = useState(50)

  useEffect(() => {
    const saved = localStorage.getItem(`ob_p_${question?.key}`)
    if (saved) setValue(parseInt(saved, 10))
    else setValue(50)
  }, [question?.key])

  if (!question) return null

  const handleNext = () => {
    localStorage.setItem(`ob_p_${question.key}`, String(value))
    if (questionIndex + 1 < TOTAL) {
      router.push(`/onboarding/personnalite/q/${questionIndex + 2}`)
    } else {
      router.push('/onboarding/analyse')
    }
  }

  return (
    <div className="ob-bg" style={{ minHeight: '100dvh', justifyContent: 'flex-end' }}>
      <div className="ob-card" style={{ borderRadius: '2rem 2rem 0 0', minHeight: '72dvh' }}>
        {/* Barre de progression */}
        <div className="ob-progress-track">
          <div className="ob-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <p className="ob-subtitle font-bold mb-4" style={{ color: '#1C1C1E', fontSize: '1rem' }}>
          Question {questionIndex + 1} sur {TOTAL}
        </p>

        {/* Question avec mascotte */}
        <div className="flex items-start gap-3 mb-6">
          {/* Mascotte mini */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#F2F2F2', border: '2px dashed #DDD' }}
          >
            <span className="text-[10px] text-gray-400 text-center font-semibold px-1">M</span>
          </div>
          {/* Bulle */}
          <div
            className="flex-1 px-4 py-3 rounded-2xl rounded-tl-sm"
            style={{ background: '#F2F2F2' }}
          >
            <p className="font-bold text-base" style={{ color: '#1C1C1E' }}>
              {question.label}
            </p>
          </div>
        </div>

        {/* Equalizer */}
        <EqualizerBars value={value} />

        {/* Slider */}
        <div className="mb-2 px-1">
          <input
            type="range"
            min={0}
            max={100}
            step={25}
            value={value}
            onChange={e => setValue(parseInt(e.target.value, 10))}
            className="w-full"
            style={{
              accentColor: '#E63946',
              height: 6,
              cursor: 'pointer',
            }}
          />
        </div>

        {/* Labels */}
        <div className="flex justify-between px-1 mb-8">
          <span className="text-sm font-semibold" style={{ color: '#888' }}>{question.left}</span>
          <span className="text-sm font-semibold" style={{ color: '#888' }}>{question.right}</span>
        </div>

        <div className="mt-auto">
          <button onClick={handleNext} className="ob-btn">
            {questionIndex + 1 === TOTAL ? 'Terminer' : 'Suivant'}
          </button>
        </div>
      </div>
    </div>
  )
}
