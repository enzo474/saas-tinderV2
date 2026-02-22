'use client'

import { useState, useRef } from 'react'
import { PresalePopup } from './PresalePopup'
import { CountdownTimer } from './CountdownTimer'

const DISPLAY_SLOTS = 50
const REAL_SLOTS = 200
const RATIO = REAL_SLOTS / DISPLAY_SLOTS

interface DiscussionDemoProps {
  presaleCount: number
}

const GOALS = ['Obtenir son numéro', 'Proposer un date', 'Relancer la conv', 'Répondre avec humour'] as const
type GoalType = typeof GOALS[number]

const SIMULATED_SUGGESTIONS: Record<GoalType, { label: string; message: string; score: string }[]> = {
  'Obtenir son numéro': [
    { label: 'Direct & Confiant', message: "On pourrait continuer cette conv autour d'un verre plutôt qu'en messages, t'en dis quoi ?", score: '91%' },
    { label: 'Naturel', message: "J'ai l'impression qu'on serait bien mieux pour se parler en vrai. T'as WhatsApp ?", score: '86%' },
  ],
  'Proposer un date': [
    { label: 'Direct & Confiant', message: "Je pense qu'on a assez chatté pour mériter un café. Ça te dit mercredi ou jeudi ?", score: '89%' },
    { label: 'Playful', message: "J'ai l'impression qu'on pourrait parler pendant des heures... Mais on sera mieux installés qu'ici, non ? 😄", score: '85%' },
  ],
  'Relancer la conv': [
    { label: 'Naturel', message: "Hé, ça fait un moment ! J'espère que tu vas bien — t'as fait quelque chose d'intéressant ce weekend ?", score: '82%' },
    { label: 'Humour', message: "J'allais penser que tu t'étais perdu(e), mais en fait... tu t'étais juste perdu(e). Bienvenue de retour 😄", score: '87%' },
  ],
  'Répondre avec humour': [
    { label: 'Wit', message: "Ah ouais ? Intéressant. Je note ça dans ma liste de trucs à retourner contre toi plus tard 😏", score: '90%' },
    { label: 'Playful', message: "Tu me vois venir là... Et pourtant je recule pas 😄", score: '84%' },
  ],
}

const CONTEXT_ANALYSIS = [
  { icon: '✓', color: 'text-success', text: 'Elle est réceptive (répond rapidement)' },
  { icon: '✓', color: 'text-success', text: 'Elle pose des questions (intérêt confirmé)' },
  { icon: '⚠', color: 'text-gold-primary', text: 'Conversation superficielle — passe au concret' },
]

export function DiscussionDemo({ presaleCount }: DiscussionDemoProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<GoalType>('Proposer un date')
  const [context, setContext] = useState('')
  const [showPopup, setShowPopup] = useState(false)
  const [showSkeleton, setShowSkeleton] = useState(false)
  const [showingResults, setShowingResults] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const displayCount = Math.min(Math.floor(presaleCount / RATIO), DISPLAY_SLOTS)
  const remaining = DISPLAY_SLOTS - displayCount

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setUploadedImage(reader.result as string)
      setShowSkeleton(true)
      setShowingResults(false)
      setTimeout(() => {
        setShowSkeleton(false)
        setShowingResults(true)
      }, 1500)
    }
    reader.readAsDataURL(file)
  }

  const suggestions = SIMULATED_SUGGESTIONS[selectedGoal]

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Bannière countdown urgence */}
        <div
          className="rounded-xl px-4 py-2.5 flex items-center justify-center gap-3 text-sm font-semibold flex-wrap"
          style={{ background: 'linear-gradient(135deg, rgba(247,127,0,0.15), rgba(247,127,0,0.05))', border: '1px solid rgba(247,127,0,0.4)' }}
        >
          <span className="text-gold-primary">🔥 Offre -50% expire dans</span>
          <span className="font-montserrat font-bold text-lg text-white tabular-nums">
            <CountdownTimer variant="inline" color="#F77F00" />
          </span>
          <button
            onClick={() => setShowPopup(true)}
            className="ml-2 px-3 py-1 rounded-lg text-xs font-bold text-black hover:scale-105 transition-transform"
            style={{ background: 'linear-gradient(135deg, #F77F00, #FFAA33)' }}
          >
            Réserver maintenant
          </button>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h1 className="font-montserrat font-bold text-white text-2xl md:text-4xl">Messages Discussion</h1>
              <span className="bg-gold-primary text-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Bientôt</span>
            </div>
            <p className="text-text-secondary text-sm md:text-base">L&apos;IA analyse ta conversation et génère les réponses parfaites pour concrétiser.</p>
          </div>
          <div className="flex-shrink-0">
            <div className="bg-gold-primary/10 border border-gold-primary/30 rounded-xl px-3 py-2 text-center">
              <p className="text-text-tertiary text-xs mb-0.5">Places restantes</p>
              <p className="font-montserrat font-bold text-gold-primary text-base md:text-lg">{remaining}/50</p>
            </div>
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-gold-primary/10 border border-gold-primary/30 rounded-xl p-5 flex items-start gap-4">
          <span className="text-2xl">⚡</span>
          <div className="flex-1">
            <h3 className="font-semibold text-gold-light mb-1">Accès anticipé disponible</h3>
            <p className="text-text-secondary text-sm">
              Sois parmi les {remaining} dernières places.
              <strong className="text-gold-primary"> -50% à vie</strong> tant que tu restes.
            </p>
            <p className="text-xs text-text-tertiary mt-1.5 flex items-center gap-1.5">
              ⏱ Offre expire dans{' '}
              <span className="font-bold tabular-nums">
                <CountdownTimer variant="inline" color="#F77F00" />
              </span>
            </p>
          </div>
          <button
            onClick={() => setShowPopup(true)}
            className="flex-shrink-0 px-4 py-2 rounded-lg font-semibold text-sm text-black hover:scale-105 transition-transform"
            style={{ background: 'linear-gradient(135deg, #F77F00, #FFAA33)' }}
          >
            Réserver (-50%)
          </button>
        </div>

        {/* Demo grid */}
        <div className="grid lg:grid-cols-2 gap-8">

          {/* LEFT */}
          <div className="space-y-5">

            {/* Upload */}
            <div className="card-large">
              <h3 className="font-montserrat font-bold text-white text-lg mb-5">1. Upload la conversation à analyser</h3>

              {!uploadedImage ? (
                <label
                  className="block border-2 border-dashed border-border-primary rounded-2xl p-10 text-center cursor-pointer hover:border-gold-primary transition-colors duration-300 group"
                >
                  <div className="text-3xl md:text-5xl mb-3 group-hover:scale-110 transition-transform">💬</div>
                  <p className="text-text-secondary mb-1">Drag & drop ou cliquez</p>
                  <p className="text-text-tertiary text-sm">Screenshot Tinder, Bumble, Hinge, WhatsApp...</p>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              ) : (
                <div>
                  <img src={uploadedImage} alt="Preview conversation" className="w-full rounded-xl border border-border-primary max-h-64 object-cover" />
                  <button
                    onClick={() => { setUploadedImage(null); setShowingResults(false); setShowSkeleton(false) }}
                    className="text-gold-primary text-sm font-medium mt-2 hover:text-gold-light transition-colors"
                  >
                    Changer l'image
                  </button>
                </div>
              )}
            </div>

            {/* Objectif */}
            <div className="card-large">
              <h3 className="font-montserrat font-bold text-white text-lg mb-5">2. Ton objectif avec cette personne</h3>
              <div className="grid grid-cols-2 gap-2">
                {GOALS.map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGoal(g)}
                    className={`py-3 px-3 rounded-lg border-2 font-medium text-sm text-left transition-all duration-200 ${
                      selectedGoal === g
                        ? 'border-gold-primary bg-gold-primary/10 text-gold-primary'
                        : 'border-border-primary text-text-secondary hover:border-gold-primary/50'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Contexte */}
            <div className="card-large">
              <h3 className="font-montserrat font-bold text-white text-lg mb-4">3. Contexte additionnel (optionnel)</h3>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Ex: On a matché il y a 2 jours, elle aime le surf..."
                rows={4}
                className="input-base resize-none"
              />
            </div>

            {/* CTA */}
            <button
              onClick={() => setShowPopup(true)}
              className="w-full py-4 rounded-xl font-bold text-lg text-black flex items-center justify-center gap-2 hover:scale-[1.02] transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #F77F00, #FFAA33)', boxShadow: '0 8px 32px rgba(247,127,0,0.3)' }}
            >
              <span>✨</span>
              <span>Analyser et générer les réponses</span>
            </button>
          </div>

          {/* RIGHT — Preview */}
          <div className="card-large h-fit lg:sticky lg:top-8">
            <h3 className="font-montserrat font-bold text-white text-lg mb-5">Analyse & Suggestions</h3>

            {!uploadedImage && (
              <div className="h-64 md:h-80 flex flex-col items-center justify-center text-center text-text-tertiary">
                <div className="text-3xl md:text-5xl mb-3">🎯</div>
                <p className="text-sm">Upload une conversation pour obtenir<br />une analyse complète</p>
              </div>
            )}

            {uploadedImage && showSkeleton && (
              <div className="space-y-4">
                <div className="bg-gold-primary/5 border border-gold-primary/20 rounded-xl p-4 animate-pulse">
                  <div className="h-3 bg-border-primary rounded mb-3 w-1/3"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-border-primary rounded w-4/5"></div>
                    <div className="h-3 bg-border-primary rounded w-3/4"></div>
                    <div className="h-3 bg-border-primary rounded w-2/3"></div>
                  </div>
                </div>
                <div className="bg-gold-primary/5 border border-gold-primary/20 rounded-xl p-4 animate-pulse">
                  <div className="h-3 bg-border-primary rounded mb-3 w-1/3"></div>
                  <div className="space-y-3">
                    <div className="h-12 bg-border-primary rounded-xl"></div>
                    <div className="h-12 bg-border-primary rounded-xl"></div>
                  </div>
                </div>
              </div>
            )}

            {uploadedImage && showingResults && (
              <div className="space-y-5">
                {/* Analyse du contexte */}
                <div className="bg-gold-primary/5 border border-gold-primary/20 rounded-xl p-4">
                  <h4 className="font-semibold text-sm text-gold-primary mb-3">📊 Analyse du contexte</h4>
                  <ul className="space-y-2">
                    {CONTEXT_ANALYSIS.map((item, i) => (
                      <li key={i} className={`flex items-start gap-2 text-sm ${item.color}`}>
                        <span className="mt-0.5">{item.icon}</span>
                        <span className="text-text-secondary">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Suggestions */}
                <div className="bg-gold-primary/5 border border-gold-primary/20 rounded-xl p-4">
                  <h4 className="font-semibold text-sm text-gold-primary mb-3">💡 Suggestions de réponses</h4>
                  <div className="space-y-3">
                    {suggestions.map((s, i) => (
                      <div
                        key={i}
                        className="bg-bg-tertiary border border-gold-primary/20 hover:border-gold-primary rounded-xl p-4 cursor-pointer group transition-all duration-200"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="bg-gold-primary/20 text-gold-primary px-2.5 py-0.5 rounded-lg text-xs font-semibold">{s.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gold-primary font-bold text-sm">{s.score}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(s.message) }}
                              className="text-text-tertiary hover:text-gold-primary transition-colors opacity-0 group-hover:opacity-100"
                              title="Copier"
                            >
                              📋
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-text-secondary leading-relaxed">{s.message}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-text-tertiary text-xs text-center">
                  Résultats simulés — Les vrais résultats seront encore meilleurs ✨
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <PresalePopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        feature="discussion"
        presaleCount={presaleCount}
      />
    </>
  )
}
