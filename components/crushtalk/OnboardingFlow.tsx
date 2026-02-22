'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Zap, Target, MessageSquare } from 'lucide-react'

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

function getPersonalizedInsights(data: OnboardingData) {
  const insights: { icon: React.ReactNode; text: string }[] = []

  if (data.matchesPerDay === "Même pas 1 par jour" || data.matchesPerDay === 'Entre 1 et 2 par jour') {
    insights.push({
      icon: <Target className="w-4 h-4 text-[#F77F00]" />,
      text: "Tu matches peu — souvent c'est le premier message qui fait la différence, pas tes photos.",
    })
  } else {
    insights.push({
      icon: <Target className="w-4 h-4 text-[#F77F00]" />,
      text: "Tu as des matchs. Le vrai enjeu : te démarquer parmi tous ceux qui les contactent aussi.",
    })
  }

  if (data.matchQuality === "Aucun n'est mon type" || data.matchQuality === "Ça va, parfois sympa") {
    insights.push({
      icon: <MessageSquare className="w-4 h-4 text-[#F77F00]" />,
      text: "Tes messages actuels n'accrochent pas les profils que tu vises vraiment.",
    })
  } else {
    insights.push({
      icon: <MessageSquare className="w-4 h-4 text-[#F77F00]" />,
      text: "Tu as de bons matchs. Des messages personnalisés vont les convertir en vraies conversations.",
    })
  }

  if (data.lookingFor === 'Une relation sérieuse') {
    insights.push({
      icon: <Zap className="w-4 h-4 text-[#F77F00]" />,
      text: "Pour une relation sérieuse, on va calibrer tes messages pour montrer ta vraie valeur dès le premier contact.",
    })
  } else {
    insights.push({
      icon: <Zap className="w-4 h-4 text-[#F77F00]" />,
      text: "On va générer des messages qui créent une vraie connexion et donnent envie de te répondre.",
    })
  }

  return insights
}

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
  const [analyzing, setAnalyzing] = useState(false)
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

  // Quand on arrive à l'étape 8, on sauvegarde l'onboarding en fond (sans bloquer l'UI)
  useEffect(() => {
    if (step === 8 && data.satisfaction) {
      setAnalyzing(true)
      fetch('/api/crushtalk/onboarding', {
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
      }).finally(() => setAnalyzing(false))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  const handleComplete = () => {
    setLoading(true)
    onComplete(data)
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
            <div className="space-y-3">
              {[
                'Pas du tout satisfait',
                "Bof, c'est compliqué",
                'Plutôt oui',
                'Oui, très satisfait',
              ].map(opt => (
                <OptionButton key={opt} label={opt} selected={data.satisfaction === opt} onClick={() => handleSelect('satisfaction', opt)} />
              ))}
            </div>
          </div>
        )}

        {/* Étape 8 — Résumé personnalisé + CTA final */}
        {step === 8 && (
          <div>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-[#F77F00]/15 border-2 border-[#F77F00]/40 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-[#F77F00]" />
              </div>
              <h2 className="font-montserrat font-bold text-white text-xl md:text-2xl mb-1">
                On a tout ce qu'il faut.
              </h2>
              <p className="text-text-secondary text-sm">
                Voici ce que CrushTalk va travailler pour toi.
              </p>
            </div>

            {/* Insights personnalisés */}
            <div className="space-y-3 mb-6">
              {getPersonalizedInsights(data).map((insight, i) => (
                <div key={i} className="flex items-start gap-3 bg-bg-primary/50 border border-border-primary rounded-xl p-4">
                  <div className="w-7 h-7 rounded-lg bg-[#F77F00]/10 flex items-center justify-center shrink-0 mt-0.5">
                    {insight.icon}
                  </div>
                  <p className="text-text-secondary text-sm leading-relaxed">{insight.text}</p>
                </div>
              ))}
            </div>

            {/* Cadeau : 5 crédits offerts */}
            <div className="flex items-center gap-3 bg-[#F77F00]/10 border border-[#F77F00]/30 rounded-xl p-4 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#F77F00]/20 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-[#F77F00]" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">5 crédits offerts</p>
                <p className="text-text-tertiary text-xs">Soit 1 génération complète gratuite pour commencer.</p>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleComplete}
              disabled={loading || analyzing}
              className="w-full py-4 rounded-xl font-bold text-base text-white transition-all duration-200 disabled:opacity-70"
              style={{ background: 'linear-gradient(135deg, #F77F00, #FFAA33)', boxShadow: '0 4px 20px rgba(247,127,0,0.25)' }}
            >
              {loading || analyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Préparation...
                </span>
              ) : (
                'Accéder à CrushTalk →'
              )}
            </button>
          </div>
        )}

        {/* Bouton retour */}
        {step > 1 && step < 8 && (
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
