'use client'

import { useState } from 'react'
import { submitFeedback } from './actions'

const FEEDBACK_OPTIONS = [
  { value: 'feature', label: 'Fonctionnalité à ajouter' },
  { value: 'modification', label: 'Modification à faire' },
  { value: 'style', label: 'Style pour génération d\'images' },
  { value: 'improvement', label: 'Retour / amélioration' },
] as const

export function FeedbackForm() {
  const [feedbackType, setFeedbackType] = useState<string>('feature')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const result = await submitFeedback(feedbackType, content)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setContent('')
      }
    } catch {
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-10 text-center">
        <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}>
          ✓
        </div>
        <h3 className="font-montserrat font-bold text-white text-xl mb-2">Idée enregistrée !</h3>
        <p className="text-text-secondary text-sm mb-6">Merci pour ton retour, ça nous aide vraiment.</p>
        <button
          onClick={() => setSuccess(false)}
          className="text-red-light hover:text-white text-sm font-medium transition-colors"
        >
          Envoyer une autre idée →
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-6 space-y-5">
      <div>
        <label htmlFor="feedbackType" className="block text-text-secondary text-sm font-medium mb-2">
          Type d&apos;idée
        </label>
        <select
          id="feedbackType"
          value={feedbackType}
          onChange={(e) => setFeedbackType(e.target.value)}
          className="w-full bg-bg-primary border-2 border-border-primary rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-red-primary transition-colors duration-200"
        >
          {FEEDBACK_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-bg-primary">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="content" className="block text-text-secondary text-sm font-medium mb-2">
          Votre idée <span className="text-red-primary">*</span>
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Décrivez votre idée en détail..."
          rows={5}
          required
          className="w-full bg-bg-primary border-2 border-border-primary rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-red-primary transition-colors duration-200 resize-none placeholder:text-text-tertiary"
        />
      </div>

      {error && (
        <p className="text-red-light text-sm">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="w-full text-white font-semibold py-3.5 rounded-xl transition-all duration-300 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)', boxShadow: '0 4px 16px rgba(230,57,70,0.3)' }}
      >
        {loading ? 'Envoi en cours...' : 'Envoyer'}
      </button>
    </form>
  )
}
