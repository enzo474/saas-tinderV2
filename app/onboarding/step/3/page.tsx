'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getOrCreateAnalysis, calculateAndSaveMetrics } from '@/lib/actions/onboarding'

export const dynamic = 'force-dynamic'

const LOADING_STEPS = [
  'Détection de tes points forts...',
  'Évaluation de ton look...',
  'Analyse de ta photo...',
  'Calcul du score attractivité...',
  'Préparation des recommandations...',
]

export default function OnboardingStep3() {
  const router = useRouter()
  const [phase, setPhase] = useState<'loading' | 'results'>('loading')
  const [stepsDone, setStepsDone] = useState<number[]>([])
  const [progress, setProgress] = useState(0)
  const [metrics, setMetrics] = useState<{
    visualPotential: number
    currentExploitation: number
    inexploitedPercent: number
    currentMatches: string
  } | null>(null)

  useEffect(() => {
    const loadAndCalculate = async () => {
      const analysis = await getOrCreateAnalysis()
      if (!analysis?.current_matches) {
        router.push('/onboarding/step/1')
        return
      }

      // Start loading animation
      let i = 0
      const tick = setInterval(() => {
        i++
        setStepsDone(prev => [...prev, i - 1])
        setProgress(Math.round((i / LOADING_STEPS.length) * 100))
        if (i >= LOADING_STEPS.length) {
          clearInterval(tick)
          calculateAndSaveMetrics(analysis.id, analysis.current_matches).then(result => {
            if (!('error' in result)) {
              setMetrics({ ...result, currentMatches: analysis.current_matches })
              setTimeout(() => setPhase('results'), 400)
            }
          })
        }
      }, 600)
    }
    loadAndCalculate()
  }, [router])

  if (phase === 'loading') {
    return (
      <div className="ob-bg items-center justify-center" style={{ minHeight: '100dvh' }}>
        <div className="text-center mb-10 px-6">
          <h2
            className="text-white font-black text-3xl"
            style={{ fontFamily: 'var(--font-montserrat)', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
          >
            Analyse de ton potentiel...
          </h2>
        </div>

        {/* Cercle */}
        <div className="relative flex items-center justify-center mb-10">
          <svg width={120} height={120} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={60} cy={60} r={52} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={8} />
            <circle
              cx={60} cy={60} r={52}
              fill="none" stroke="white" strokeWidth={8} strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <span className="absolute text-white font-black text-2xl" style={{ fontFamily: 'var(--font-montserrat)' }}>
            {progress}%
          </span>
        </div>

        <div className="px-8 w-full max-w-xs">
          {LOADING_STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-3 mb-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                style={{ background: stepsDone.includes(i) ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)' }}
              >
                {stepsDone.includes(i) && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#E63946" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span
                className="text-sm font-semibold transition-all duration-300"
                style={{ color: stepsDone.includes(i) ? 'white' : 'rgba(255,255,255,0.4)' }}
              >
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!metrics) return null

  return (
    <div className="ob-bg" style={{ minHeight: '100dvh', justifyContent: 'flex-end' }}>
      <div className="ob-card" style={{ borderRadius: '2rem 2rem 0 0', minHeight: '65dvh' }}>
        <div className="text-center mb-6">
          <h2 className="ob-title-lg">Ton potentiel réel</h2>
          <p className="ob-subtitle">Comment tu apparais aux autres</p>
        </div>

        {/* Métriques */}
        <div className="flex flex-col gap-4 mb-6 flex-1">
          {/* Potentiel visuel */}
          <div className="rounded-2xl p-5" style={{ background: '#FAFAFA', border: '1px solid #EFEFEF' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: '#999' }}>Potentiel visuel brut</p>
            <div className="flex items-end gap-2">
              <span
                className="font-black text-4xl"
                style={{
                  fontFamily: 'var(--font-montserrat)',
                  background: 'linear-gradient(135deg, #E63946, #FF4757)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {metrics.visualPotential.toFixed(1)}
              </span>
              <span className="text-sm mb-1.5" style={{ color: '#999' }}>/10</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden mt-2" style={{ background: '#EBEBEB' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${metrics.visualPotential * 10}%`, background: 'linear-gradient(90deg, #E63946, #FF4757)' }}
              />
            </div>
          </div>

          {/* Exploitation */}
          <div className="rounded-2xl p-5" style={{ background: '#FAFAFA', border: '1px solid #EFEFEF' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: '#999' }}>Exploitation actuelle estimée</p>
            <div className="flex items-end gap-2">
              <span className="font-black text-3xl" style={{ fontFamily: 'var(--font-montserrat)', color: '#1C1C1E' }}>
                {metrics.currentExploitation.toFixed(1)}
              </span>
              <span className="text-sm mb-1" style={{ color: '#999' }}>/10</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden mt-2" style={{ background: '#EBEBEB' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${metrics.currentExploitation * 10}%`, background: '#AAAAAA' }}
              />
            </div>
          </div>

          {/* Box potentiel gâché */}
          <div
            className="rounded-2xl p-5 text-center"
            style={{ background: '#FFF0F1', border: '1px solid #FECDD3' }}
          >
            <p className="text-sm font-semibold mb-1" style={{ color: '#888' }}>Potentiel inexploité</p>
            <span
              className="font-black text-5xl"
              style={{
                fontFamily: 'var(--font-montserrat)',
                background: 'linear-gradient(135deg, #E63946, #FF4757)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {metrics.inexploitedPercent}%
            </span>
            <p className="text-sm font-semibold mt-1" style={{ color: '#E63946' }}>
              de ton potentiel est gâché
            </p>
          </div>
        </div>

        <div className="mt-auto">
          <button
            onClick={() => router.push('/analysis/intro')}
            className="ob-btn ob-btn-red"
          >
            Débloquer mon potentiel →
          </button>
        </div>
      </div>
    </div>
  )
}
