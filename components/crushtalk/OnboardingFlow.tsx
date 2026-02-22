'use client'

import { useState } from 'react'

interface OnboardingData {
  gender: string
  ageRange: string
  lookingFor: string
  datingApps: string[]
  matchesPerDay: string
  matchQuality: string
  satisfaction: string
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void
}

const DATING_APPS = ['Tinder', 'Bumble', 'Hinge', 'Fruitz', 'Happn', 'Badoo', 'Meetic', 'OkCupid', 'Once', 'The League']

const TOTAL_STEPS = 7

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
            i < step ? 'bg-red-primary' : 'bg-border-primary'
          }`}
        />
      ))}
    </div>
  )
}

function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-5 py-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
        selected
          ? 'border-red-primary bg-red-primary/10 text-white'
          : 'border-border-primary bg-bg-primary/40 text-text-secondary hover:border-red-primary/50 hover:text-white'
      }`}
    >
      {label}
    </button>
  )
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    gender: '',
    ageRange: '',
    lookingFor: '',
    datingApps: [],
    matchesPerDay: '',
    matchQuality: '',
    satisfaction: '',
  })

  const handleNext = () => setStep(s => s + 1)

  const handleSelect = (field: keyof OnboardingData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }))
    setTimeout(handleNext, 200)
  }

  const toggleApp = (app: string) => {
    setData(prev => ({
      ...prev,
      datingApps: prev.datingApps.includes(app)
        ? prev.datingApps.filter(a => a !== app)
        : [...prev.datingApps, app],
    }))
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      await fetch('/api/crushtalk/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gender: data.gender,
          ageRange: data.ageRange,
          lookingFor: data.lookingFor,
          datingApps: data.datingApps,
          matchesPerDay: data.matchesPerDay,
          matchQuality: data.matchQuality,
          satisfaction: data.satisfaction,
        }),
      })
      onComplete(data)
    } catch (e) {
      onComplete(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-6 md:p-8">
        <ProgressBar step={step} />

        {/* Étape 1 — Genre */}
        {step === 1 && (
          <div>
            <p className="text-text-tertiary text-xs font-semibold uppercase tracking-wider mb-2">Étape 1 / {TOTAL_STEPS}</p>
            <h2 className="font-montserrat font-bold text-white text-xl md:text-2xl mb-2">Quel est ton genre ?</h2>
            <p className="text-text-secondary text-sm mb-6">Pour personnaliser tes messages d'accroche.</p>
            <div className="space-y-3">
              {['Homme', 'Femme', 'Autre'].map(opt => (
                <OptionButton key={opt} label={opt} selected={data.gender === opt} onClick={() => handleSelect('gender', opt)} />
              ))}
            </div>
          </div>
        )}

        {/* Étape 2 — Âge */}
        {step === 2 && (
          <div>
            <p className="text-text-tertiary text-xs font-semibold uppercase tracking-wider mb-2">Étape 2 / {TOTAL_STEPS}</p>
            <h2 className="font-montserrat font-bold text-white text-xl md:text-2xl mb-2">Quel âge as-tu ?</h2>
            <p className="text-text-secondary text-sm mb-6">Le ton des messages varie selon la tranche d'âge.</p>
            <div className="space-y-3">
              {['18-24 ans', '25-34 ans', '35-44 ans', '45 ans et +'].map(opt => (
                <OptionButton key={opt} label={opt} selected={data.ageRange === opt} onClick={() => handleSelect('ageRange', opt)} />
              ))}
            </div>
          </div>
        )}

        {/* Étape 3 — Objectif */}
        {step === 3 && (
          <div>
            <p className="text-text-tertiary text-xs font-semibold uppercase tracking-wider mb-2">Étape 3 / {TOTAL_STEPS}</p>
            <h2 className="font-montserrat font-bold text-white text-xl md:text-2xl mb-2">Qu'est-ce que tu recherches ?</h2>
            <p className="text-text-secondary text-sm mb-6">Pour adapter le style des messages à ton objectif.</p>
            <div className="space-y-3">
              {[
                'Une relation sérieuse',
                'Du fun et des rencontres',
                'Des dates sans prise de tête',
                "Je sais pas encore, je cherche",
              ].map(opt => (
                <OptionButton key={opt} label={opt} selected={data.lookingFor === opt} onClick={() => handleSelect('lookingFor', opt)} />
              ))}
            </div>
          </div>
        )}

        {/* Étape 4 — Apps */}
        {step === 4 && (
          <div>
            <p className="text-text-tertiary text-xs font-semibold uppercase tracking-wider mb-2">Étape 4 / {TOTAL_STEPS}</p>
            <h2 className="font-montserrat font-bold text-white text-xl md:text-2xl mb-2">Quelles apps tu utilises ?</h2>
            <p className="text-text-secondary text-sm mb-6">Sélectionne toutes celles que tu utilises.</p>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {DATING_APPS.map(app => (
                <button
                  key={app}
                  onClick={() => toggleApp(app)}
                  className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                    data.datingApps.includes(app)
                      ? 'border-red-primary bg-red-primary/10 text-white'
                      : 'border-border-primary bg-bg-primary/40 text-text-secondary hover:border-red-primary/50 hover:text-white'
                  }`}
                >
                  {app}
                </button>
              ))}
            </div>
            <button
              onClick={handleNext}
              disabled={data.datingApps.length === 0}
              className="w-full py-4 rounded-xl font-bold text-base text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
            >
              Continuer →
            </button>
          </div>
        )}

        {/* Étape 5 — Matchs par jour */}
        {step === 5 && (
          <div>
            <p className="text-text-tertiary text-xs font-semibold uppercase tracking-wider mb-2">Étape 5 / {TOTAL_STEPS}</p>
            <h2 className="font-montserrat font-bold text-white text-xl md:text-2xl mb-2">Combien de matchs tu obtiens ?</h2>
            <p className="text-text-secondary text-sm mb-6">En moyenne par jour sur toutes tes apps.</p>
            <div className="space-y-3">
              {[
                "Même pas 1 par jour",
                'Entre 1 et 2 par jour',
                '3 à 10 par jour',
                '10+ par jour',
              ].map(opt => (
                <OptionButton key={opt} label={opt} selected={data.matchesPerDay === opt} onClick={() => handleSelect('matchesPerDay', opt)} />
              ))}
            </div>
          </div>
        )}

        {/* Étape 6 — Qualité des matchs */}
        {step === 6 && (
          <div>
            <p className="text-text-tertiary text-xs font-semibold uppercase tracking-wider mb-2">Étape 6 / {TOTAL_STEPS}</p>
            <h2 className="font-montserrat font-bold text-white text-xl md:text-2xl mb-2">Comment tu jugerais tes matchs ?</h2>
            <p className="text-text-secondary text-sm mb-6">Parle-nous de la qualité de tes matchs actuels.</p>
            <div className="space-y-3">
              {[
                "Aucun n'est mon type",
                "Ça va, parfois sympa",
                'Bien, des personnes intéressantes',
                'Parfait, exactement mon type',
              ].map(opt => (
                <OptionButton key={opt} label={opt} selected={data.matchQuality === opt} onClick={() => handleSelect('matchQuality', opt)} />
              ))}
            </div>
          </div>
        )}

        {/* Étape 7 — Satisfaction */}
        {step === 7 && (
          <div>
            <p className="text-text-tertiary text-xs font-semibold uppercase tracking-wider mb-2">Étape 7 / {TOTAL_STEPS}</p>
            <h2 className="font-montserrat font-bold text-white text-xl md:text-2xl mb-2">Tu es satisfait de ton expérience ?</h2>
            <p className="text-text-secondary text-sm mb-6">Sur les apps de dating en général.</p>
            <div className="space-y-3 mb-6">
              {[
                'Pas du tout satisfait',
                "Bof, c'est compliqué",
                'Plutôt oui',
                'Oui, très satisfait',
              ].map(opt => (
                <OptionButton key={opt} label={opt} selected={data.satisfaction === opt} onClick={() => setData(prev => ({ ...prev, satisfaction: opt }))} />
              ))}
            </div>
            <button
              onClick={handleComplete}
              disabled={!data.satisfaction || loading}
              className="w-full py-4 rounded-xl font-bold text-base text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
            >
              {loading ? 'Préparation...' : 'Accéder à CrushTalk →'}
            </button>
          </div>
        )}

        {/* Bouton retour */}
        {step > 1 && step < 7 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="mt-4 text-text-tertiary hover:text-text-secondary text-sm transition-colors"
          >
            ← Retour
          </button>
        )}
      </div>
    </div>
  )
}
