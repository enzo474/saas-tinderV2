'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingNom() {
  const router = useRouter()
  const [nom, setNom] = useState('')

  const handleNext = () => {
    if (nom.trim()) {
      localStorage.setItem('ob_nom', nom.trim())
    }
    router.push('/onboarding/age')
  }

  return (
    <div className="ob-bg" style={{ minHeight: '100dvh', justifyContent: 'flex-end' }}>
      <div className="ob-card" style={{ borderRadius: '2rem 2rem 0 0', minHeight: '60dvh' }}>
        <div className="text-center mb-8">
          <h2 className="ob-title-lg">Quel est ton prénom ?</h2>
          <p className="ob-subtitle">Entre ton prénom ou passe à la question suivante</p>
        </div>

        <div className="mb-8">
          <input
            type="text"
            value={nom}
            onChange={e => setNom(e.target.value)}
            placeholder="Ton prénom..."
            className="w-full px-5 py-4 rounded-2xl text-base outline-none"
            style={{
              background: '#F2F2F2',
              color: '#1C1C1E',
              fontSize: '1rem',
              fontWeight: 500,
              border: '2px solid transparent',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => (e.target.style.borderColor = '#E63946')}
            onBlur={e => (e.target.style.borderColor = 'transparent')}
            onKeyDown={e => e.key === 'Enter' && handleNext()}
            autoFocus
          />
        </div>

        <div className="mt-auto">
          <button onClick={handleNext} className="ob-btn">
            Suivant
          </button>
        </div>
      </div>
    </div>
  )
}
