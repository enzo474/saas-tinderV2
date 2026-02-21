'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StepHeader } from '@/components/ui/StepHeader'
import { Button } from '@/components/ui/Button'
import { PillButton } from '@/components/ui/PillButton'
import { getOrCreateAnalysis, saveOnboardingStep1 } from '@/lib/actions/onboarding'

const matchOptions = [
  { label: '0 – 2', value: '0-2' },
  { label: '3 – 5', value: '3-5' },
  { label: '6 – 10', value: '6-10' },
  { label: '10+', value: '10+' },
]

const seniorityOptions = [
  { label: 'Moins d\'1 mois', value: 'less-1' },
  { label: '1 à 3 mois', value: '1-3' },
  { label: '3 à 6 mois', value: '3-6' },
  { label: '6 mois ou plus', value: '6+' },
]

export default function OnboardingStep1() {
  const router = useRouter()
  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [currentMatches, setCurrentMatches] = useState<string | null>(null)
  const [tinderSeniority, setTinderSeniority] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Load analysis on mount
  useEffect(() => {
    setMounted(true)
    getOrCreateAnalysis().then(analysis => {
      setAnalysisId(analysis?.id || null)
      setCurrentMatches(analysis?.current_matches || null)
      setTinderSeniority(analysis?.tinder_seniority || null)
    })
  }, [])

  const handleSubmit = async () => {
    if (!analysisId || !currentMatches || !tinderSeniority) return

    setLoading(true)
    try {
      await saveOnboardingStep1({
        analysisId,
        currentMatches,
        tinderSeniority,
      })
      router.push('/onboarding/step/2')
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  const isValid = currentMatches && tinderSeniority

  if (!mounted) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-border-primary border-t-red-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md mx-auto">
        <StepHeader currentStep={1} totalSteps={3} />

        <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-8 space-y-8">
          <div className="text-center">
            <h2 className="font-montserrat font-bold text-white text-2xl mb-2">
              D&apos;où tu pars ?
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              Pour créer le meilleur profil possible, on a besoin de comprendre ta situation actuelle.
            </p>
          </div>

          {/* Question 1 */}
          <div>
            <p className="text-white text-sm font-medium mb-4">
              Combien de matchs obtiens-tu en moyenne par&nbsp;semaine&nbsp;?
            </p>
            <div className="flex flex-wrap gap-3">
              {matchOptions.map((option) => (
                <PillButton
                  key={option.value}
                  selected={currentMatches === option.value}
                  onClick={() => setCurrentMatches(option.value)}
                >
                  {option.label}
                </PillButton>
              ))}
            </div>
          </div>

          {/* Question 2 */}
          <div>
            <p className="text-white text-sm font-medium mb-4">
              Depuis combien de temps es-tu actif sur Tinder ?
            </p>
            <div className="flex flex-wrap gap-3">
              {seniorityOptions.map((option) => (
                <PillButton
                  key={option.value}
                  selected={tinderSeniority === option.value}
                  onClick={() => setTinderSeniority(option.value)}
                >
                  {option.label}
                </PillButton>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className="w-full justify-center"
          >
            {loading ? 'Chargement...' : 'Continuer →'}
          </Button>
        </div>
      </div>
    </div>
  )
}
