'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const OPTIONS = [
  { label: 'TikTok', emoji: '📱' },
  { label: 'Instagram', emoji: '📸' },
  { label: 'Youtube', emoji: '📺' },
  { label: 'Amis', emoji: '👥' },
  { label: 'Recherche App Store', emoji: '🔍' },
]

export default function OnboardingDecouverte() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)

  const handleNext = () => {
    if (selected) localStorage.setItem('ob_decouverte', selected)
    router.push('/onboarding/demo')
  }

  return (
    <div className="ob-bg" style={{ minHeight: '100dvh', justifyContent: 'flex-end' }}>
      <div className="ob-card" style={{ borderRadius: '2rem 2rem 0 0', minHeight: '70dvh' }}>
        <div className="text-center mb-8">
          <h2 className="ob-title-lg">Comment as-tu connu l&apos;app ?</h2>
        </div>

        <div className="flex flex-col gap-3 mb-8">
          {OPTIONS.map(({ label, emoji }) => (
            <button
              key={label}
              onClick={() => setSelected(label)}
              className={`ob-option-row ${selected === label ? 'ob-option-row-active' : ''}`}
            >
              <span className="ob-option-row-icon">{emoji}</span>
              <span>{label}</span>
              {selected === label && (
                <span className="ml-auto" style={{ color: '#E63946' }}>✓</span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-auto">
          <button
            onClick={handleNext}
            className="ob-btn"
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  )
}
