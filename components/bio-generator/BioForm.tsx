'use client'

import { useState } from 'react'
import { Loader2, Sparkles, Copy, Check, Plus, Trash2 } from 'lucide-react'
import { CREDIT_COSTS } from '@/lib/credits'
import { RechargeModal } from '@/components/credits/RechargeModal'

interface AnalysisData {
  job?: string
  passions?: string[]
  anecdotes?: string[]
  personality?: string
}

interface BioFormProps {
  initialCredits: number
  userId: string
  analysisData?: AnalysisData | null
}

export function BioForm({ initialCredits, userId, analysisData }: BioFormProps) {
  const [credits, setCredits] = useState(initialCredits)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedBio, setGeneratedBio] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showRechargeModal, setShowRechargeModal] = useState(false)

  // Form state - pré-rempli depuis l'analyse (plan d'optimisation)
  const [job, setJob] = useState(analysisData?.job || '')
  const [hobbies, setHobbies] = useState<string[]>(
    analysisData?.passions?.length ? analysisData.passions : ['']
  )
  const [anecdotes, setAnecdotes] = useState<string[]>(
    analysisData?.anecdotes?.length ? analysisData.anecdotes : ['']
  )
  const [personality, setPersonality] = useState(analysisData?.personality || '')
  const [tone, setTone] = useState<'direct' | 'intrigant' | 'humoristique' | 'aventurier'>('direct')

  const handleAddHobby = () => {
    if (hobbies.length < 5) {
      setHobbies([...hobbies, ''])
    }
  }

  const handleRemoveHobby = (index: number) => {
    setHobbies(hobbies.filter((_, i) => i !== index))
  }

  const handleHobbyChange = (index: number, value: string) => {
    const newHobbies = [...hobbies]
    newHobbies[index] = value
    setHobbies(newHobbies)
  }

  const handleAddAnecdote = () => {
    if (anecdotes.length < 3) {
      setAnecdotes([...anecdotes, ''])
    }
  }

  const handleRemoveAnecdote = (index: number) => {
    setAnecdotes(anecdotes.filter((_, i) => i !== index))
  }

  const handleAnecdoteChange = (index: number, value: string) => {
    const newAnecdotes = [...anecdotes]
    newAnecdotes[index] = value
    setAnecdotes(newAnecdotes)
  }

  const handleGenerate = async () => {
    if (credits < CREDIT_COSTS.BIO_GENERATION) {
      alert(`Crédits insuffisants. Vous avez ${credits} crédits, ${CREDIT_COSTS.BIO_GENERATION} requis.`)
      return
    }

    setIsGenerating(true)
    setGeneratedBio(null)

    try {
      const response = await fetch('/api/generate-bio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job: job.trim() || undefined,
          hobbies: hobbies.filter(h => h.trim()),
          anecdotes: anecdotes.filter(a => a.trim()),
          personality: personality.trim() || undefined,
          tone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.type === 'insufficient_credits') {
          setShowRechargeModal(true)
        } else {
          const fullError = data.details ? `${data.error}\n\nDétails: ${data.details}` : data.error
          alert(`Erreur: ${fullError}`)
        }
        return
      }

      setGeneratedBio(data.bio)
      setCredits(credits - CREDIT_COSTS.BIO_GENERATION)
    } catch (error) {
      console.error('Generate bio error:', error)
      alert('Une erreur est survenue lors de la génération')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (!generatedBio) return

    try {
      await navigator.clipboard.writeText(generatedBio)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      alert('Erreur lors de la copie')
    }
  }

  const inputClass = "w-full bg-bg-primary border-2 border-border-primary rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-red-primary transition-colors duration-200"

  return (
    <>
    <div className="grid lg:grid-cols-2 gap-6">

      {/* Formulaire */}
      <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-8 space-y-6">

        {analysisData && (
          <div className="bg-red-primary/10 border border-red-primary/30 rounded-xl px-4 py-3">
            <p className="text-text-secondary text-sm">
              Tes données du profil d&apos;optimisation sont utilisées (métier, passions, anecdotes, personnalité). Tu peux les modifier ci-dessous si besoin.
            </p>
          </div>
        )}

        <h3 className="font-montserrat font-bold text-white text-lg">
          Informations (optionnel si profil complété)
        </h3>

        {/* Métier */}
        <div>
          <label className="text-text-secondary text-sm mb-2 block">Métier</label>
          <input
            type="text"
            value={job}
            onChange={(e) => setJob(e.target.value)}
            placeholder="Ex: Architecte, Développeur, Chef cuisinier..."
            className={inputClass}
          />
        </div>

        {/* Hobbies */}
        <div>
          <label className="text-text-secondary text-sm mb-2 block">Hobbies / Passions</label>
          {hobbies.map((hobby, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={hobby}
                onChange={(e) => handleHobbyChange(index, e.target.value)}
                placeholder="Ex: Surf, Photographie, Cuisine..."
                className={inputClass}
              />
              {hobbies.length > 1 && (
                <button onClick={() => handleRemoveHobby(index)} className="text-text-tertiary hover:text-red-primary transition-colors p-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {hobbies.length < 5 && (
            <button onClick={handleAddHobby} className="text-red-primary hover:text-red-light text-sm flex items-center gap-1 mt-1 transition-colors">
              <Plus className="w-4 h-4" /> Ajouter un hobby
            </button>
          )}
        </div>

        {/* Anecdotes */}
        <div>
          <label className="text-text-secondary text-sm mb-2 block">Anecdotes (1-3)</label>
          {anecdotes.map((anecdote, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={anecdote}
                onChange={(e) => handleAnecdoteChange(index, e.target.value)}
                placeholder="Ex: J'ai fait le tour de l'Europe en van..."
                className={inputClass}
              />
              {anecdotes.length > 1 && (
                <button onClick={() => handleRemoveAnecdote(index)} className="text-text-tertiary hover:text-red-primary transition-colors p-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {anecdotes.length < 3 && (
            <button onClick={handleAddAnecdote} className="text-red-primary hover:text-red-light text-sm flex items-center gap-1 mt-1 transition-colors">
              <Plus className="w-4 h-4" /> Ajouter une anecdote
            </button>
          )}
        </div>

        {/* Personnalité */}
        <div>
          <label className="text-text-secondary text-sm mb-2 block">Personnalité (max 300 caractères)</label>
          <textarea
            value={personality}
            onChange={(e) => setPersonality(e.target.value.slice(0, 300))}
            placeholder="Décris ta personnalité en quelques mots..."
            rows={4}
            className={`${inputClass} resize-none`}
          />
          <p className="text-text-tertiary text-xs mt-1 text-right">{personality.length}/300</p>
        </div>

        {/* Ton */}
        <div>
          <label className="text-text-secondary text-sm mb-3 block">Ton de la bio <span className="text-red-primary">*</span></label>
          <div className="grid grid-cols-2 gap-2">
            {(['direct', 'intrigant', 'humoristique', 'aventurier'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`py-2.5 rounded-lg text-sm font-medium capitalize transition-all duration-200 border-2 ${
                  tone === t
                    ? 'border-red-primary bg-red-primary/10 text-red-primary'
                    : 'border-border-primary text-text-secondary hover:border-red-primary/50'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || credits < CREDIT_COSTS.BIO_GENERATION}
          className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)', boxShadow: '0 4px 16px rgba(230,57,70,0.3)' }}
        >
          {isGenerating ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Génération en cours...</>
          ) : (
            <>Générer ma bio ({CREDIT_COSTS.BIO_GENERATION} crédits)</>
          )}
        </button>
      </div>

      {/* Résultat */}
      <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-8">
        <h3 className="font-montserrat font-bold text-white text-lg mb-6">Bio générée</h3>

        {!generatedBio && !isGenerating && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">✨</div>
            <p className="text-text-secondary text-sm">
              Remplissez le formulaire et cliquez sur &quot;Générer&quot; pour créer votre bio.
            </p>
          </div>
        )}

        {isGenerating && (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-border-primary border-t-red-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary text-sm">Génération de votre bio personnalisée...</p>
          </div>
        )}

        {generatedBio && (
          <div className="space-y-4">
            <div className="bg-bg-primary border-2 border-border-primary rounded-xl p-6">
              <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{generatedBio}</p>
              <p className="text-text-tertiary text-xs mt-4 text-right">{generatedBio.length} caractères</p>
            </div>
            <button
              onClick={handleCopy}
              className="w-full py-3 rounded-xl font-semibold text-sm border-2 border-border-primary text-white hover:border-red-primary hover:text-red-primary flex items-center justify-center gap-2 transition-all duration-200"
            >
              {copied ? <><Check className="w-4 h-4" /> Copié !</> : <><Copy className="w-4 h-4" /> Copier la bio</>}
            </button>
          </div>
        )}
      </div>

    </div>
    <RechargeModal isOpen={showRechargeModal} onClose={() => setShowRechargeModal(false)} currentCredits={credits} />
    </>
  )
}
