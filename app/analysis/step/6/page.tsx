'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StepHeader } from '@/components/ui/StepHeader'
import { LoadingAnimation } from '@/components/ui/LoadingAnimation'
import { getOrCreateAnalysis } from '@/lib/actions/onboarding'
import { calculateAndSaveScores } from '@/lib/actions/analysis'

export const dynamic = 'force-dynamic'

export default function AnalysisStep6() {
  const router = useRouter()
  const [analysisId, setAnalysisId] = useState<string | null>(null)

  useEffect(() => {
    const loadAndCalculate = async () => {
      const analysis = await getOrCreateAnalysis()
      if (!analysis) {
        router.push('/onboarding/intro')
        return
      }
      
      setAnalysisId(analysis.id)

      // Calculate scores in background
      await calculateAndSaveScores(analysis.id)
    }

    loadAndCalculate()
  }, [router])

  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
  const loadingSteps = [
    { text: 'Analyse de tes photos actuelles...', delay: rand(1500, 4000) },
    { text: 'Évaluation de ton positionnement...', delay: rand(1200, 3500) },
    { text: 'Comparaison aux meilleurs profils...', delay: rand(1000, 3000) },
    { text: 'Calcul de ton potentiel réel...', delay: rand(1500, 4000) },
    { text: 'Identification de ta cible idéale...', delay: rand(1200, 3500) },
    { text: "Création de ton plan d'action...", delay: rand(800, 2500) },
  ]

  const handleComplete = () => {
    router.push('/results')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <StepHeader currentStep={6} totalSteps={6} />
      
      <div className="w-full max-w-md mx-auto">
        <h2 className="font-montserrat font-bold text-white text-2xl mb-8 text-center">
          On crée ton profil parfait
        </h2>
        <LoadingAnimation
          steps={loadingSteps}
          onComplete={handleComplete}
          showProgress
        />
      </div>
    </div>
  )
}
