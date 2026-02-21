'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StepHeader } from '@/components/ui/StepHeader'
import { Button } from '@/components/ui/Button'
import { PillButton } from '@/components/ui/PillButton'
import { getOrCreateAnalysis } from '@/lib/actions/onboarding'
import { saveAnalysisStep1 } from '@/lib/actions/analysis'

const targetOptions = [
  { label: '5 à 8 matchs', value: '5-8' },
  { label: '8 à 10 matchs', value: '8-10' },
  { label: '+10 matchs', value: '10+' },
]

export const dynamic = 'force-dynamic'

export default function AnalysisStep1() {
  const router = useRouter()
  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [targetMatches, setTargetMatches] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getOrCreateAnalysis().then(analysis => {
      setAnalysisId(analysis?.id || null)
      setTargetMatches(analysis?.target_matches || null)
    })
  }, [])

  const handleSubmit = async () => {
    if (!analysisId || !targetMatches) return

    setLoading(true)
    try {
      await saveAnalysisStep1(analysisId, targetMatches)
      router.push('/analysis/step/2')
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <StepHeader currentStep={1} totalSteps={6} />

      <div className="w-full max-w-md mx-auto space-y-8">
        <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-8 space-y-6">
          <div className="text-center">
            <h2 className="font-montserrat font-bold text-white text-2xl mb-2">
              Fixe ton objectif
            </h2>
            <p className="text-text-secondary text-sm">
              Combien de matchs par semaine tu veux atteindre ?
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {targetOptions.map((option) => (
              <PillButton
                key={option.value}
                selected={targetMatches === option.value}
                onClick={() => setTargetMatches(option.value)}
              >
                {option.label}
              </PillButton>
            ))}
          </div>

          <div className="flex items-center gap-2 px-4 py-3 bg-bg-primary/50 border border-border-primary rounded-xl">
            <span className="text-base shrink-0">💡</span>
            <p className="font-inter text-text-secondary text-sm">
              On va créer le profil pour y arriver
            </p>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!targetMatches || loading}
          className="w-full justify-center"
        >
          {loading ? 'Chargement...' : 'Continuer →'}
        </Button>
      </div>
    </div>
  )
}
