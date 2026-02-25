'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StepHeader } from '@/components/ui/StepHeader'
import { Button } from '@/components/ui/Button'
import { LoadingAnimation } from '@/components/ui/LoadingAnimation'
import { MetricDisplay } from '@/components/ui/MetricDisplay'
import { Card } from '@/components/ui/Card'
import { getOrCreateAnalysis, calculateAndSaveMetrics } from '@/lib/actions/onboarding'

export const dynamic = 'force-dynamic'

export default function OnboardingStep3() {
  const router = useRouter()
  const [phase, setPhase] = useState<'loading' | 'results'>('loading')
  const [metrics, setMetrics] = useState<{
    visualPotential: number
    currentExploitation: number
    inexploitedPercent: number
    currentMatches: string
  } | null>(null)

  useEffect(() => {
    const loadAndCalculate = async () => {
      const analysis = await getOrCreateAnalysis()
      if (!analysis || !analysis.current_matches) {
        router.push('/onboarding/step/1')
        return
      }

      const result = await calculateAndSaveMetrics(
        analysis.id,
        analysis.current_matches
      )

      if ('error' in result) {
        console.error(result.error)
        return
      }

      setMetrics({
        ...result,
        currentMatches: analysis.current_matches,
      })
    }

    loadAndCalculate()
  }, [router])

  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
  const loadingSteps = [
    { text: 'Détection de tes points forts...', delay: rand(1200, 3500) },
    { text: 'Évaluation de ton look...', delay: rand(1000, 3000) },
    { text: 'Analyse de ta photo...', delay: rand(1500, 4000) },
    { text: 'Calcul du score attractivité...', delay: rand(1200, 3500) },
    { text: 'Préparation des recommandations...', delay: rand(800, 2500) },
  ]

  const handleComplete = () => {
    setPhase('results')
  }

  const handleContinue = () => {
    router.push('/analysis/intro')
  }

  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md mx-auto">
          <StepHeader currentStep={3} totalSteps={3} />
          <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-8">
            <h2 className="font-montserrat font-bold text-white text-2xl mb-8 text-center">
              Analyse de ton potentiel...
            </h2>
            <LoadingAnimation
              steps={loadingSteps}
              onComplete={handleComplete}
              showProgress
            />
          </div>
        </div>
      </div>
    )
  }

  if (!metrics) return null

  const showSpecialMessage = metrics.currentMatches === '10+'

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md mx-auto">
        <StepHeader currentStep={3} totalSteps={3} />

        <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-8 space-y-6">
          {/* Titre */}
          <div className="text-center">
            <h2 className="font-montserrat font-black text-white text-2xl mb-1">
              Ton potentiel réel
            </h2>
            <p className="text-text-secondary text-sm">Comment tu apparais</p>
          </div>

          {/* Métriques */}
          <MetricDisplay
            title="Potentiel visuel brut"
            value={metrics.visualPotential}
            size="large"
          />

          <MetricDisplay
            title="Exploitation actuelle estimée"
            value={metrics.currentExploitation}
            size="medium"
          />

          {/* Box rouge potentiel gâché */}
          <div
            className="rounded-xl p-5 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(230,57,70,0.15), rgba(255,71,87,0.1))', border: '1px solid rgba(230,57,70,0.4)' }}
          >
            <p className="text-white text-lg font-semibold leading-snug">
              <span className="font-montserrat font-black text-4xl" style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {metrics.inexploitedPercent}%
              </span>
              {' '}de ton potentiel est gâché
            </p>
          </div>

          <Button onClick={handleContinue} className="w-full justify-center">
            Débloquer mon potentiel →
          </Button>
        </div>
      </div>
    </div>
  )
}
