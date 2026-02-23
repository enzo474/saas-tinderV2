'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface OnboardingData {
  struggle_point: string
  matching_behaviors: string[]
  response_rate: string
  goals: string[]
  preferred_style: string
  usage_preference: string
}

const TOTAL_QUESTIONS = 6

const BIO_EXAMPLES = [
  "J'ai une règle pour les premiers verres : je choisis le lieu, tu choisis l'heure de fin. Jusqu'ici, personne n'est partie à l'heure prévue.",
]

function getPersonalizedMessage(data: OnboardingData): string {
  if (
    data.struggle_point === 'Premier message (accroche)' &&
    data.response_rate === 'Moins de 10% (presque jamais de réponse)'
  ) {
    return "D'après tes réponses, tu galères à ouvrir les convos et tes messages ne font presque jamais réagir.\n\nCrushTalk va t'écrire des accroches qui font répondre à tous les coups !"
  }
  if (
    data.matching_behaviors.includes("Je stresse et j'envoie rien") ||
    data.matching_behaviors.includes("Je réfléchis 10 minutes puis j'abandonne")
  ) {
    return "T'es pas seul ! La plupart des mecs overthink leurs messages et finissent par ne rien envoyer.\n\nCrushTalk va te donner des messages tout faits que tu pourras envoyer en 2 secondes, sans stress !"
  }
  if (
    data.struggle_point === 'Relancer quand elle ghoste' &&
    data.response_rate === '50%+ (plutôt bien)'
  ) {
    return "Tes messages d'ouverture marchent déjà bien ! Le problème c'est quand la convo meurt.\n\nCrushTalk va t'aider à relancer intelligemment pour transformer ces matchs en dates !"
  }
  if (data.goals.length >= 3) {
    return "Tu veux maîtriser TOUT le parcours : de l'accroche jusqu'au date.\n\nCrushTalk va t'accompagner à chaque étape pour maximiser tes résultats !"
  }
  if (data.matching_behaviors.includes('Je copie-colle le même message')) {
    return "Copier-coller le même message à tout le monde ? Normal que ça marche pas.\n\nCrushTalk va personnaliser chaque message selon son profil pour des résultats x10 !"
  }
  if (data.struggle_point === 'Partout, je suis perdu') {
    return "Aucun stress ! Beaucoup de mecs galèrent sur les apps.\n\nCrushTalk va te guider à chaque étape : de l'accroche jusqu'au date. Tu vas cartonner !"
  }
  if (data.preferred_style === 'Aucune préférence, juste ce qui marche le mieux') {
    return "Approche intelligente ! CrushTalk va analyser chaque profil et te donner exactement le message qui convertit le mieux.\n\nFini les tests à l'aveugle, on optimise pour toi !"
  }
  return "D'après tes réponses, CrushTalk va t'aider à transformer tes matchs en dates.\n\nPrêt à voir la magie opérer ?"
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-8">
      {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
        <div
          key={i}
          className="h-1 flex-1 rounded-full transition-all duration-300"
          style={{ background: i < step ? '#F77F00' : '#1F1F1F' }}
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
      className="w-full text-left px-5 py-4 rounded-xl border-2 text-sm font-medium transition-all duration-200"
      style={
        selected
          ? { borderColor: '#F77F00', background: 'rgba(247,127,0,0.1)', color: '#fff' }
          : { borderColor: '#1F1F1F', background: 'rgba(255,255,255,0.02)', color: '#9da3af' }
      }
    >
      {label}
    </button>
  )
}

function MultiOptionButton({
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
      className="w-full text-left px-5 py-4 rounded-xl border-2 text-sm font-medium transition-all duration-200"
      style={
        selected
          ? { borderColor: '#F77F00', background: 'rgba(247,127,0,0.1)', color: '#fff' }
          : { borderColor: '#1F1F1F', background: 'rgba(255,255,255,0.02)', color: '#9da3af' }
      }
    >
      {label}
    </button>
  )
}

export function OnboardingFlow() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [carouselIdx, setCarouselIdx] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    struggle_point: '',
    matching_behaviors: [],
    response_rate: '',
    goals: [],
    preferred_style: '',
    usage_preference: '',
  })

  const goNext = () => setStep(s => s + 1)
  const goBack = () => setStep(s => s - 1)

  const handleSingleSelect = (field: keyof OnboardingData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }))
    setTimeout(goNext, 200)
  }

  const handleMultiToggle = (field: 'matching_behaviors' | 'goals', value: string) => {
    setData(prev => {
      const arr = prev[field] as string[]
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
      }
    })
  }

  const handleStart = () => {
    localStorage.setItem('ct_onboarding', JSON.stringify(data))
    router.push('/crushtalk/login')
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: '#0A0A0A' }}
    >
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2">
        <span
          className="font-montserrat font-extrabold text-2xl"
          style={{
            background: 'linear-gradient(135deg, #F77F00, #FFAA33)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Crushmaxxing
        </span>
        <div
          className="px-2.5 py-1 rounded-full border text-xs font-bold"
          style={{
            background: 'rgba(247,127,0,0.1)',
            borderColor: 'rgba(247,127,0,0.3)',
            color: '#F77F00',
          }}
        >
          CrushTalk
        </div>
      </div>

      <div className="w-full max-w-lg">
        <div
          className="rounded-2xl p-6 md:p-8 border"
          style={{ background: '#111111', borderColor: '#1F1F1F' }}
        >

          {/* Progress bar for Q1-Q6 */}
          {step <= TOTAL_QUESTIONS && <ProgressBar step={step} />}

          {/* Q1 */}
          {step === 1 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(247,127,0,0.7)' }}>
                Question 1 / {TOTAL_QUESTIONS}
              </p>
              <h2 className="font-montserrat font-bold text-white text-xl mb-6">
                Où tu galères le plus ?
              </h2>
              <div className="space-y-2.5">
                {[
                  'Premier message (accroche)',
                  'Répondre à ses messages',
                  'Relancer quand elle ghoste',
                  'Proposer un date',
                  'Partout, je suis perdu',
                ].map(opt => (
                  <OptionButton
                    key={opt}
                    label={opt}
                    selected={data.struggle_point === opt}
                    onClick={() => handleSingleSelect('struggle_point', opt)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Q2 — multi-select */}
          {step === 2 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(247,127,0,0.7)' }}>
                Question 2 / {TOTAL_QUESTIONS}
              </p>
              <h2 className="font-montserrat font-bold text-white text-xl mb-1">
                Quand tu matches, tu fais quoi ?
              </h2>
              <p className="text-sm mb-5" style={{ color: '#6b7280' }}>
                Tu peux en sélectionner plusieurs
              </p>
              <div className="space-y-2.5 mb-5">
                {[
                  "J'envoie direct un message",
                  "J'attends qu'elle écrive en premier",
                  "Je stresse et j'envoie rien",
                  'Je copie-colle le même message',
                  "Je réfléchis 10 minutes puis j'abandonne",
                ].map(opt => (
                  <MultiOptionButton
                    key={opt}
                    label={opt}
                    selected={data.matching_behaviors.includes(opt)}
                    onClick={() => handleMultiToggle('matching_behaviors', opt)}
                  />
                ))}
              </div>
              <button
                onClick={goNext}
                disabled={data.matching_behaviors.length === 0}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #F77F00, #FFAA33)' }}
              >
                Continuer →
              </button>
            </div>
          )}

          {/* Q3 */}
          {step === 3 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(247,127,0,0.7)' }}>
                Question 3 / {TOTAL_QUESTIONS}
              </p>
              <h2 className="font-montserrat font-bold text-white text-xl mb-6">
                Quel est ton taux de réponse actuel ?
              </h2>
              <div className="space-y-2.5">
                {[
                  'Moins de 10% (presque jamais de réponse)',
                  '10-30% (pas terrible)',
                  '30-50% (moyen)',
                  '50%+ (plutôt bien)',
                ].map(opt => (
                  <OptionButton
                    key={opt}
                    label={opt}
                    selected={data.response_rate === opt}
                    onClick={() => handleSingleSelect('response_rate', opt)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Q4 — multi-select */}
          {step === 4 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(247,127,0,0.7)' }}>
                Question 4 / {TOTAL_QUESTIONS}
              </p>
              <h2 className="font-montserrat font-bold text-white text-xl mb-1">
                Qu&apos;est-ce que tu veux que CrushTalk t&apos;aide à faire ?
              </h2>
              <p className="text-sm mb-5" style={{ color: '#6b7280' }}>
                Tu peux en sélectionner plusieurs
              </p>
              <div className="space-y-2.5 mb-5">
                {[
                  'Écrire des accroches qui font répondre',
                  'Relancer intelligemment',
                  'Transformer la convo en date',
                  'Me démarquer des autres mecs',
                ].map(opt => (
                  <MultiOptionButton
                    key={opt}
                    label={opt}
                    selected={data.goals.includes(opt)}
                    onClick={() => handleMultiToggle('goals', opt)}
                  />
                ))}
              </div>
              <button
                onClick={goNext}
                disabled={data.goals.length === 0}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #F77F00, #FFAA33)' }}
              >
                Continuer →
              </button>
            </div>
          )}

          {/* Q5 */}
          {step === 5 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(247,127,0,0.7)' }}>
                Question 5 / {TOTAL_QUESTIONS}
              </p>
              <h2 className="font-montserrat font-bold text-white text-xl mb-6">
                Ton style préféré de messages ?
              </h2>
              <div className="space-y-2.5">
                {[
                  "Direct : \"Salut, t'es canon, on boit un verre ?\"",
                  'Drôle : Blagues et humour',
                  'Mystérieux : Intriguant, pas évident',
                  'Compliment : Flatteur mais pas lourd',
                  'Aucune préférence, juste ce qui marche le mieux',
                ].map(opt => (
                  <OptionButton
                    key={opt}
                    label={opt}
                    selected={data.preferred_style === opt}
                    onClick={() => handleSingleSelect('preferred_style', opt)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Q6 */}
          {step === 6 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(247,127,0,0.7)' }}>
                Question 6 / {TOTAL_QUESTIONS}
              </p>
              <h2 className="font-montserrat font-bold text-white text-xl mb-6">
                Si CrushTalk génère un message, tu veux pouvoir... ?
              </h2>
              <div className="space-y-2.5">
                {[
                  'Le copier tel quel et l\'envoyer',
                  'Avoir plusieurs variantes pour choisir',
                  'L\'adapter un peu avant d\'envoyer',
                  'Comprendre pourquoi ce message marche',
                ].map(opt => (
                  <OptionButton
                    key={opt}
                    label={opt}
                    selected={data.usage_preference === opt}
                    onClick={() => handleSingleSelect('usage_preference', opt)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Step 7 — Personalized message */}
          {step === 7 && (
            <div className="text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(247,127,0,0.15)' }}
              >
                <span className="text-2xl">📊</span>
              </div>
              <h2 className="font-montserrat font-bold text-white text-xl mb-4">
                Analyse de ton profil
              </h2>
              <div
                className="rounded-xl p-5 text-left border mb-6 text-sm leading-relaxed whitespace-pre-line"
                style={{
                  background: 'rgba(247,127,0,0.05)',
                  borderColor: 'rgba(247,127,0,0.2)',
                  color: '#d1d5db',
                }}
              >
                {getPersonalizedMessage(data)}
              </div>
              <button
                onClick={goNext}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #F77F00, #FFAA33)' }}
              >
                Continuer →
              </button>
            </div>
          )}

          {/* Step 8 — Carousel */}
          {step === 8 && (
            <div>
              {/* Slide 1 — Photos IA avant/après */}
              {carouselIdx === 0 && (
                <div className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(247,127,0,0.7)' }}>CrushPicture</p>
                  <h3 className="font-montserrat font-bold text-white text-lg mb-4">Photos IA professionnelles</h3>
                  <div className="flex gap-2 mb-3" style={{ height: '180px' }}>
                    <div className="relative flex-1 rounded-xl overflow-hidden">
                      <img src="/avant.webp" alt="Avant" className="w-full h-full object-cover object-center" />
                      <div
                        className="absolute bottom-2 left-0 right-0 flex justify-center"
                      >
                        <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.75)', color: '#9da3af' }}>Avant</span>
                      </div>
                    </div>
                    <div className="relative flex-1 rounded-xl overflow-hidden">
                      <img src="/apres.webp" alt="Après" className="w-full h-full object-cover" style={{ objectPosition: '30% center' }} />
                      <div
                        className="absolute bottom-2 left-0 right-0 flex justify-center"
                      >
                        <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'rgba(247,127,0,0.9)', color: '#fff' }}>Après</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm" style={{ color: '#9da3af' }}>Des photos lifestyle générées par IA. Fini les selfies pourris.</p>
                </div>
              )}

              {/* Slide 2 — Bio exemples */}
              {carouselIdx === 1 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(247,127,0,0.7)' }}>Bio IA</p>
                  <h3 className="font-montserrat font-bold text-white text-lg mb-1">Bio optimisée par l&apos;IA</h3>
                  <p className="text-xs mb-4" style={{ color: '#6b7280' }}>4 bios différentes générées selon ton style</p>
                  <div
                    className="rounded-xl p-5 text-left"
                    style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}
                  >
                    <p className="text-sm leading-relaxed" style={{ color: '#d1d5db' }}>{BIO_EXAMPLES[0]}</p>
                  </div>
                </div>
              )}

              {/* Slide 3 — Exemple rizz */}
              {carouselIdx === 2 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2 text-center" style={{ color: 'rgba(247,127,0,0.7)' }}>CrushTalk</p>
                  <h3 className="font-montserrat font-bold text-white text-lg mb-4 text-center">Messages d&apos;accroche IA</h3>
                  <div className="rounded-xl overflow-hidden mb-4">
                    <img src="/exemplerizz.jpeg" alt="Exemple conversation" className="w-full object-cover rounded-xl" style={{ maxHeight: '200px', objectPosition: 'top' }} />
                  </div>
                  {/* Exemple de réponse CrushTalk */}
                  <div className="rounded-xl p-4" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(247,127,0,0.15)', color: '#F77F00' }}>
                        Exemple de réponse générée
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: '#d1d5db' }}>
                      Parfait, moi non plus je cherche pas de couple... juste quelqu&apos;un qui apprécie mon talent légendaire en drague apparemment 😏
                    </p>
                  </div>
                </div>
              )}

              {/* Dots */}
              <div className="flex items-center justify-center gap-2 mt-5 mb-5">
                {[0, 1, 2].map(i => (
                  <button
                    key={i}
                    onClick={() => setCarouselIdx(i)}
                    className="h-2 rounded-full transition-all duration-200"
                    style={{
                      background: i === carouselIdx ? '#F77F00' : '#2A2A2A',
                      width: i === carouselIdx ? '24px' : '8px',
                    }}
                  />
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="flex gap-3">
                {carouselIdx > 0 && (
                  <button
                    onClick={() => setCarouselIdx(i => i - 1)}
                    className="flex-1 py-3 rounded-xl border text-sm font-medium transition-all"
                    style={{ borderColor: '#1F1F1F', color: '#6b7280' }}
                  >
                    ←
                  </button>
                )}
                {carouselIdx < 2 ? (
                  <button
                    onClick={() => setCarouselIdx(i => i + 1)}
                    className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white"
                    style={{ background: 'linear-gradient(135deg, #F77F00, #FFAA33)' }}
                  >
                    Suivant →
                  </button>
                ) : (
                  <button
                    onClick={handleStart}
                    className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white"
                    style={{ background: 'linear-gradient(135deg, #F77F00, #FFAA33)' }}
                  >
                    Commencer 🔥
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Back button (Q2-Q6 only) */}
          {step > 1 && step <= 6 && (
            <button
              onClick={goBack}
              className="mt-5 text-sm transition-colors hover:text-white"
              style={{ color: '#6b7280' }}
            >
              ← Retour
            </button>
          )}
        </div>

        {/* Lien connexion compte existant */}
        <p className="text-center text-sm mt-5" style={{ color: '#6b7280' }}>
          Déjà un compte ?{' '}
          <Link
            href="/crushtalk/login"
            className="font-semibold transition-colors hover:text-white"
            style={{ color: '#F77F00' }}
          >
            Se connecter →
          </Link>
        </p>
      </div>
    </div>
  )
}
