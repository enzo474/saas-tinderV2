'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StepHeader } from '@/components/ui/StepHeader'
import { Button } from '@/components/ui/Button'
import { getOrCreateAnalysis } from '@/lib/actions/onboarding'
import { saveAnalysisStep4 } from '@/lib/actions/analysis'

const relationshipOptions = [
  { label: 'Relation sérieuse', value: 'serious',   img: '/serieuse.webp' },
  { label: 'Rien de sérieux',   value: 'casual',    img: '/casual.webp' },
  { label: 'Ouvert à tout',     value: 'lt_open',   img: '/ouvert.webp' },
  { label: 'Pas encore sûr',    value: 'undefined', img: '/incertain.webp' },
]

const womenTypes = [
  { label: 'Séduisante & confiante',   img: '/seduisante.webp' },
  { label: 'Douce & féminine',         img: '/douce.webp' },
  { label: 'Extravertie & solaire',    img: '/extravertie.webp' },
  { label: 'Intelligente & cultivée',  img: '/intelligente.webp' },
  { label: 'Sportive & disciplinée',   img: '/sportive.webp' },
  { label: 'Créative & originale',     img: '/creative.webp' },
  { label: 'Élégante & sophistiquée',  img: '/elegante.webp' },
  { label: 'Aventurière',              img: '/aventuriere.webp' },
]

export const dynamic = 'force-dynamic'

export default function AnalysisStep3() {
  const router = useRouter()
  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [relationshipGoal, setRelationshipGoal] = useState<string | null>(null)
  const [targetWomen, setTargetWomen] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getOrCreateAnalysis().then(analysis => {
      setAnalysisId(analysis?.id || null)
      setRelationshipGoal(analysis?.relationship_goal || null)
      setTargetWomen(analysis?.target_women || [])
    })
  }, [])

  const handleWomenToggle = (label: string) => {
    if (targetWomen.includes(label)) {
      setTargetWomen(targetWomen.filter(t => t !== label))
    } else if (targetWomen.length < 3) {
      setTargetWomen([...targetWomen, label])
    }
  }

  const handleSubmit = async () => {
    if (!analysisId || !relationshipGoal || targetWomen.length === 0) return

    setLoading(true)
    try {
      await saveAnalysisStep4(analysisId, { relationshipGoal, targetWomen })
      router.push('/analysis/step/4')
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  const isValid = relationshipGoal && targetWomen.length > 0

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <StepHeader currentStep={3} totalSteps={6} />

      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h2 className="font-montserrat font-bold text-white text-2xl mb-2">
            Définis ce que tu veux vraiment
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            On va optimiser ton profil pour attirer exactement le type de femmes que tu recherches.
          </p>
        </div>

        <div className="bg-bg-primary border-2 border-border-primary rounded-2xl p-6 space-y-6">
          {/* Question 1 — Relation */}
          <div>
            <p className="font-montserrat font-semibold text-white text-sm mb-3">
              Quel type de relation tu cherches ?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {relationshipOptions.map((option) => {
                const selected = relationshipGoal === option.value
                return (
                  <button
                    key={option.value}
                    onClick={() => setRelationshipGoal(option.value)}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all duration-200 aspect-[4/3] ${
                      selected ? 'border-red-primary ring-2 ring-red-primary/30 scale-[1.02]' : 'border-border-primary hover:border-red-primary/50'
                    }`}
                  >
                    <img src={option.img} alt={option.label} className="w-full h-full object-cover" />
                    <div className={`absolute inset-0 transition-all duration-200 ${selected ? 'bg-red-primary/30' : 'bg-black/40'}`} />
                    {selected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-red-primary rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    )}
                    <p className="absolute bottom-0 inset-x-0 px-2 py-2 text-white text-xs font-semibold text-center leading-tight">
                      {option.label}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Question 2 — Type de femmes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="font-montserrat font-semibold text-white text-sm">
                Quel type de femmes t&apos;attire ?
              </p>
              <span className="text-text-tertiary text-xs">{targetWomen.length} / 3 max</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {womenTypes.map((type) => {
                const selected = targetWomen.includes(type.label)
                const disabled = !selected && targetWomen.length >= 3
                return (
                  <button
                    key={type.label}
                    onClick={() => !disabled && handleWomenToggle(type.label)}
                    disabled={disabled}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all duration-200 aspect-[3/4] ${
                      selected
                        ? 'border-red-primary ring-2 ring-red-primary/30 scale-[1.02]'
                        : disabled
                        ? 'border-border-primary opacity-40 cursor-not-allowed'
                        : 'border-border-primary hover:border-red-primary/50'
                    }`}
                  >
                    <img src={type.img} alt={type.label} className="w-full h-full object-cover" />
                    <div className={`absolute inset-0 transition-all duration-200 ${selected ? 'bg-red-primary/30' : 'bg-black/40'}`} />
                    {selected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-primary rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    )}
                    <p className="absolute bottom-0 inset-x-0 px-1 py-1.5 text-white text-xs font-semibold text-center leading-tight" style={{ fontSize: '10px' }}>
                      {type.label}
                    </p>
                  </button>
                )
              })}
            </div>
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
  )
}
