'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StepHeader } from '@/components/ui/StepHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getOrCreateAnalysis } from '@/lib/actions/onboarding'
import { saveAnalysisStep6 } from '@/lib/actions/analysis'

export const dynamic = 'force-dynamic'

export default function AnalysisStep5() {
  const router = useRouter()
  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [anecdote1, setAnecdote1] = useState('')
  const [anecdote2, setAnecdote2] = useState('')
  const [anecdote3, setAnecdote3] = useState('')
  const [passion1, setPassion1] = useState('')
  const [passion2, setPassion2] = useState('')
  const [passion3, setPassion3] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getOrCreateAnalysis().then(analysis => {
      setAnalysisId(analysis?.id || null)
      const anecdotes = analysis?.anecdotes || []
      setAnecdote1(anecdotes[0] || '')
      setAnecdote2(anecdotes[1] || '')
      setAnecdote3(anecdotes[2] || '')
      const passions = analysis?.passions || []
      setPassion1(passions[0] || '')
      setPassion2(passions[1] || '')
      setPassion3(passions[2] || '')
    })
  }, [])

  const handleSubmit = async () => {
    if (!analysisId || !anecdote1 || !passion1) return

    setLoading(true)
    try {
      await saveAnalysisStep6(analysisId, {
        anecdotes: [anecdote1, anecdote2, anecdote3],
        passions: [passion1, passion2, passion3]
      })
      router.push('/analysis/step/6')
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  const isValid = anecdote1 && passion1

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <StepHeader currentStep={5} totalSteps={6} />

      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h2 className="font-montserrat font-bold text-white text-2xl mb-2">
            Parle-nous de toi
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            Ces anecdotes et passions vont enrichir ta bio pour la rendre unique et mémorable. Sois authentique.
          </p>
        </div>

        <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-6 space-y-6">
          {/* Anecdotes */}
          <div>
            <p className="font-montserrat font-semibold text-white text-sm mb-3">
              Donne 3 anecdotes sur toi
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-text-tertiary text-xs mb-1.5">Obligatoire</p>
                <Input
                  value={anecdote1}
                  onChange={(e) => setAnecdote1(e.target.value)}
                  placeholder="Une chose insolite ou marquante sur toi"
                  maxLength={200}
                />
                <p className="text-text-tertiary text-xs mt-1 ml-1">Ex: J&apos;ai fait le tour de l&apos;Europe en van pendant 6 mois</p>
              </div>
              <div>
                <p className="text-text-tertiary text-xs mb-1.5">Facultatif</p>
                <Input
                  value={anecdote2}
                  onChange={(e) => setAnecdote2(e.target.value)}
                  placeholder="Un accomplissement dont tu es fier"
                  maxLength={200}
                />
                <p className="text-text-tertiary text-xs mt-1 ml-1">Ex: J&apos;ai monté ma boîte à 22 ans</p>
              </div>
              <div>
                <p className="text-text-tertiary text-xs mb-1.5">Facultatif</p>
                <Input
                  value={anecdote3}
                  onChange={(e) => setAnecdote3(e.target.value)}
                  placeholder="Ce que tes potes diraient de toi en une phrase"
                  maxLength={200}
                />
                <p className="text-text-tertiary text-xs mt-1 ml-1">Ex: &quot;Toujours partant pour une aventure, même les pires idées&quot;</p>
              </div>
            </div>
          </div>

          {/* Passions */}
          <div>
            <p className="font-montserrat font-semibold text-white text-sm mb-3">
              Quelles sont tes passions ?
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-text-tertiary text-xs mb-1.5">Obligatoire</p>
                <Input
                  value={passion1}
                  onChange={(e) => setPassion1(e.target.value)}
                  placeholder="Ex: Photographie, Voyage, Cuisine..."
                  maxLength={80}
                />
              </div>
              <div>
                <p className="text-text-tertiary text-xs mb-1.5">Facultatif</p>
                <Input
                  value={passion2}
                  onChange={(e) => setPassion2(e.target.value)}
                  placeholder="Passion secondaire"
                  maxLength={80}
                />
              </div>
              <div>
                <p className="text-text-tertiary text-xs mb-1.5">Facultatif</p>
                <Input
                  value={passion3}
                  onChange={(e) => setPassion3(e.target.value)}
                  placeholder="Autre passion"
                  maxLength={80}
                />
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!isValid || loading}
          className="w-full justify-center"
        >
          {loading ? 'Chargement...' : 'Finaliser mon profil →'}
        </Button>
      </div>
    </div>
  )
}
