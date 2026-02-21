'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StepHeader } from '@/components/ui/StepHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getOrCreateAnalysis } from '@/lib/actions/onboarding'
import { saveAnalysisStep5 } from '@/lib/actions/analysis'

const lifestyleOptions = [
  { label: 'Ambitieux / Business', img: '/lifestyle-business.jpeg' },
  { label: 'Social / Sorties',     img: '/lifestyle-social.jpeg' },
  { label: 'Posé / Minimal',       img: '/lifestyle-pose.jpeg' },
  { label: 'Sportif / Actif',      img: '/lifestyle-sportif.jpeg' },
  { label: 'Voyageur',             img: '/lifestyle-voyageur.jpeg' },
  { label: 'Créatif / Artistique', img: '/lifestyle-creatif.jpeg' },
]

const vibeOptions = [
  { label: 'Mystérieux',       img: '/vibe-mysterieux.jpeg' },
  { label: 'Ambitieux',        img: '/vibe-ambitieux.jpeg' },
  { label: 'Drôle / Fun',      img: '/vibe-fun.jpeg' },
  { label: 'Classe / Élégant', img: '/vibe-elegant.jpeg' },
  { label: 'Calme & confiant', img: '/vibe-calme.jpeg' },
  { label: 'Aventurier',       img: '/vibe-aventurier.jpeg' },
]

export const dynamic = 'force-dynamic'

export default function AnalysisStep4() {
  const router = useRouter()
  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [height, setHeight] = useState('')
  const [job, setJob] = useState('')
  const [sport, setSport] = useState('')
  const [personality, setPersonality] = useState('')
  const [lifestyle, setLifestyle] = useState<string[]>([])
  const [vibe, setVibe] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getOrCreateAnalysis().then(analysis => {
      setAnalysisId(analysis?.id || null)
      setHeight(analysis?.height?.toString() || '')
      setJob(analysis?.job || '')
      setSport(analysis?.sport || '')
      setPersonality(analysis?.personality || '')
      setLifestyle(analysis?.lifestyle || [])
      setVibe(analysis?.vibe || [])
    })
  }, [])

  const handleLifestyleToggle = (item: string) => {
    if (lifestyle.includes(item)) {
      setLifestyle(lifestyle.filter(l => l !== item))
    } else if (lifestyle.length < 2) {
      setLifestyle([...lifestyle, item])
    }
  }

  const handleVibeToggle = (item: string) => {
    if (vibe.includes(item)) {
      setVibe(vibe.filter(v => v !== item))
    } else if (vibe.length < 2) {
      setVibe([...vibe, item])
    }
  }

  const handleSubmit = async () => {
    if (!analysisId || !height || !job || !sport || !personality || lifestyle.length === 0 || vibe.length === 0) return

    setLoading(true)
    try {
      await saveAnalysisStep5(analysisId, {
        height: parseInt(height),
        job,
        sport,
        personality,
        lifestyle,
        vibe
      })
      router.push('/analysis/step/5')
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <StepHeader currentStep={4} totalSteps={6} />

      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h2 className="font-montserrat font-bold text-white text-2xl mb-2">
            Construisons ton profil
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            Ces infos vont nous aider à créer une bio qui te ressemble et à choisir les bonnes photos.
          </p>
        </div>

        <div className="space-y-5">
          {/* Taille */}
          <div>
            <p className="font-montserrat font-semibold text-white text-sm mb-2">Ta taille</p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="180"
                min="150"
                max="220"
              />
              <span className="text-text-secondary font-inter text-sm">cm</span>
            </div>
          </div>

          {/* Métier */}
          <div>
            <p className="font-montserrat font-semibold text-white text-sm mb-2">Ton métier / études</p>
            <Input
              value={job}
              onChange={(e) => setJob(e.target.value)}
              placeholder="Ex: Architecte, En école de commerce..."
              maxLength={50}
            />
          </div>

          {/* Sports / Hobbies */}
          <div>
            <p className="font-montserrat font-semibold text-white text-sm mb-2">Tes sports / hobbies</p>
            <Input
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              placeholder="Ex: Boxe, Voyage, Photo..."
              maxLength={40}
            />
          </div>

          {/* Personnalité */}
          <div>
            <p className="font-montserrat font-semibold text-white text-sm mb-1">Ta personnalité en 2-3 lignes</p>
            <p className="text-text-tertiary text-xs mb-2">Ton caractère, ce qui te rend unique...</p>
            <textarea
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              placeholder="Ex: Direct et sarcastique. Passionné de tech et de bon vin. J'aime les débats intelligents et les soirées entre potes."
              maxLength={300}
              rows={4}
              className="w-full bg-bg-secondary border-2 border-border-primary rounded-xl px-4 py-3 text-white font-inter text-sm focus:outline-none focus:border-red-primary transition-colors resize-none placeholder:text-text-tertiary"
            />
            <p className="text-text-tertiary font-inter text-xs mt-1 text-right">
              {personality.length}/300
            </p>
          </div>

          {/* Style de vie */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-montserrat font-semibold text-white text-sm">Ton style de vie</p>
              <span className="text-text-tertiary text-xs">{lifestyle.length} / 2 max</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {lifestyleOptions.map((option) => {
                const selected = lifestyle.includes(option.label)
                const disabled = !selected && lifestyle.length >= 2
                return (
                  <button
                    key={option.label}
                    onClick={() => !disabled && handleLifestyleToggle(option.label)}
                    disabled={disabled}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all duration-200 aspect-square ${
                      selected
                        ? 'border-red-primary ring-2 ring-red-primary/30 scale-[1.02]'
                        : disabled
                        ? 'border-border-primary opacity-40 cursor-not-allowed'
                        : 'border-border-primary hover:border-red-primary/50'
                    }`}
                  >
                    <img src={option.img} alt={option.label} className="w-full h-full object-cover" />
                    <div className={`absolute inset-0 transition-all duration-200 ${selected ? 'bg-red-primary/30' : 'bg-black/40'}`} />
                    {selected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-primary rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    )}
                    <p className="absolute bottom-0 inset-x-0 px-1 py-1.5 text-white font-semibold text-center leading-tight" style={{ fontSize: '10px' }}>
                      {option.label}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Vibe */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-montserrat font-semibold text-white text-sm">Ta vibe</p>
              <span className="text-text-tertiary text-xs">{vibe.length} / 2 max</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {vibeOptions.map((option) => {
                const selected = vibe.includes(option.label)
                const disabled = !selected && vibe.length >= 2
                return (
                  <button
                    key={option.label}
                    onClick={() => !disabled && handleVibeToggle(option.label)}
                    disabled={disabled}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all duration-200 aspect-square ${
                      selected
                        ? 'border-red-primary ring-2 ring-red-primary/30 scale-[1.02]'
                        : disabled
                        ? 'border-border-primary opacity-40 cursor-not-allowed'
                        : 'border-border-primary hover:border-red-primary/50'
                    }`}
                  >
                    <img src={option.img} alt={option.label} className="w-full h-full object-cover" />
                    <div className={`absolute inset-0 transition-all duration-200 ${selected ? 'bg-red-primary/30' : 'bg-black/40'}`} />
                    {selected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-primary rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    )}
                    <p className="absolute bottom-0 inset-x-0 px-1 py-1.5 text-white font-semibold text-center leading-tight" style={{ fontSize: '10px' }}>
                      {option.label}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!(height && job && sport && personality && lifestyle.length > 0 && vibe.length > 0) || loading}
          className="w-full justify-center"
        >
          {loading ? 'Chargement...' : 'Finaliser mon profil →'}
        </Button>
      </div>
    </div>
  )
}
