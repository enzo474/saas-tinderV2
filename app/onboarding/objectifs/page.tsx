'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const OPTIONS = [
  'Découvrir de nouvelles disquettes',
  'Engager la conversation facilement',
  'Tchatcher mon pain',
  'Avoir plus de dates',
]

export default function OnboardingObjectifs() {
  const router = useRouter()
  const [selected, setSelected] = useState<string[]>([])

  const toggle = (opt: string) => {
    setSelected(prev =>
      prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
    )
  }

  const handleNext = () => {
    if (selected.length > 0) localStorage.setItem('ob_objectifs', JSON.stringify(selected))
    router.push('/onboarding/decouverte')
  }

  return (
    <div className="ob-bg" style={{ minHeight: '100dvh', justifyContent: 'flex-end' }}>
      <div className="ob-card" style={{ borderRadius: '2rem 2rem 0 0', minHeight: '65dvh' }}>
        <div className="text-center mb-8">
          <h2 className="ob-title-lg">Quels sont tes objectifs ?</h2>
          <p className="ob-subtitle">
            Crushmaxxing sera personnalisé en fonction de tes objectifs
          </p>
        </div>

        <div className="flex flex-col gap-3 mb-8">
          {OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              className={`ob-pill ${selected.includes(opt) ? 'ob-pill-active' : ''}`}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="mt-auto">
          <button
            onClick={handleNext}
            className="ob-btn"
            style={{ opacity: selected.length > 0 ? 1 : 0.4 }}
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  )
}
