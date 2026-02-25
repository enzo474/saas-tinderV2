'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const STEPS = [
  'Construction de ton profil',
  'Focus sur tes objectifs',
  'Personnalisation de ton style de réponses',
  'Calibration des disquettes',
  'Finalisation',
]

export default function OnboardingAnalyse() {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  useEffect(() => {
    let step = 0
    const totalTime = 3000
    const stepTime = totalTime / STEPS.length

    const interval = setInterval(() => {
      step += 1
      setCompletedSteps(prev => [...prev, step - 1])
      setProgress(Math.round((step / STEPS.length) * 100))
      if (step >= STEPS.length) {
        clearInterval(interval)
        setTimeout(() => router.push('/onboarding/profil-pret'), 500)
      }
    }, stepTime)

    return () => clearInterval(interval)
  }, [router])

  return (
    <div className="ob-bg items-center justify-center" style={{ minHeight: '100dvh' }}>
      {/* Titre */}
      <div className="text-center mb-12 px-6">
        <h2
          className="text-white font-black text-3xl"
          style={{ fontFamily: 'var(--font-montserrat)', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
        >
          Analyse de tes réponses
        </h2>
      </div>

      {/* Cercle de progression */}
      <div className="relative flex items-center justify-center mb-12">
        <svg width={120} height={120} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={60} cy={60} r={52} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={8} />
          <circle
            cx={60}
            cy={60}
            r={52}
            fill="none"
            stroke="white"
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 52}`}
            strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <span
          className="absolute text-white font-black text-2xl"
          style={{ fontFamily: 'var(--font-montserrat)' }}
        >
          {progress}%
        </span>
      </div>

      {/* Checklist */}
      <div className="px-8 w-full max-w-xs">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center gap-3 mb-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
              style={{
                background: completedSteps.includes(i) ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)',
              }}
            >
              {completedSteps.includes(i) && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="#E63946" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span
              className="text-sm font-semibold transition-all duration-300"
              style={{ color: completedSteps.includes(i) ? 'white' : 'rgba(255,255,255,0.5)' }}
            >
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
