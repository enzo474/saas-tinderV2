'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getOrCreateAnalysis, saveOnboardingStep1 } from '@/lib/actions/onboarding'

const matchOptions = [
  { label: '0 – 2', value: '0-2' },
  { label: '3 – 5', value: '3-5' },
  { label: '6 – 10', value: '6-10' },
  { label: '10+', value: '10+' },
]

const seniorityOptions = [
  { label: "Moins d'1 mois", value: 'less-1' },
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
      await saveOnboardingStep1({ analysisId, currentMatches, tinderSeniority })
      router.push('/onboarding/step/2')
    } catch {
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="ob-bg items-center justify-center" style={{ minHeight: '100dvh' }}>
        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  const isValid = currentMatches && tinderSeniority

  return (
    <div className="ob-bg" style={{ minHeight: '100dvh', justifyContent: 'flex-end' }}>
      <div className="ob-card" style={{ borderRadius: '2rem 2rem 0 0', minHeight: '72dvh' }}>
        <div className="text-center mb-6">
          <h2 className="ob-title-lg">D&apos;où tu pars ?</h2>
          <p className="ob-subtitle">
            Pour créer le meilleur profil possible, on a besoin de comprendre ta situation actuelle.
          </p>
        </div>

        {/* Matchs */}
        <div className="mb-6">
          <p className="font-bold text-sm mb-3" style={{ color: '#1C1C1E' }}>
            Combien de matchs obtiens-tu en moyenne par semaine ?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {matchOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setCurrentMatches(opt.value)}
                className={`ob-pill ${currentMatches === opt.value ? 'ob-pill-active' : ''}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ancienneté */}
        <div className="mb-8">
          <p className="font-bold text-sm mb-3" style={{ color: '#1C1C1E' }}>
            Depuis combien de temps es-tu actif sur Tinder ?
          </p>
          <div className="flex flex-col gap-2">
            {seniorityOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setTinderSeniority(opt.value)}
                className={`ob-pill ${tinderSeniority === opt.value ? 'ob-pill-dark-active' : ''}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto">
          <button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className="ob-btn"
          >
            {loading ? 'Chargement...' : 'Continuer'}
          </button>
        </div>
      </div>
    </div>
  )
}
