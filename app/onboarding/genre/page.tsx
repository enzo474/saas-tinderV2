'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const OPTIONS = ['Homme', 'Femme', 'Neutre']

export default function OnboardingGenre() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)

  const handleNext = () => {
    if (selected) localStorage.setItem('ob_genre', selected)
    router.push('/onboarding/objectifs')
  }

  return (
    <div className="ob-bg" style={{ minHeight: '100dvh', justifyContent: 'flex-end' }}>
      <div className="ob-card" style={{ borderRadius: '2rem 2rem 0 0', minHeight: '60dvh' }}>
        <div className="text-center mb-8">
          <h2 className="ob-title-lg">Quel est ton genre ?</h2>
          <p className="ob-subtitle">Tes réponses seront adaptées en fonction de ton genre</p>
        </div>

        <div className="flex flex-col gap-3 mb-8">
          {OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => setSelected(opt)}
              className={`ob-pill ${selected === opt ? 'ob-pill-dark-active' : ''}`}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="mt-auto">
          <button
            onClick={handleNext}
            className="ob-btn"
            style={{ opacity: selected ? 1 : 0.4 }}
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  )
}
