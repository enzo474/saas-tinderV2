'use client'

import { useState } from 'react'
import { Copy, Check, FileText } from 'lucide-react'

export interface GeneratedBio {
  id: string
  bio_text: string
  tone: string | null
  generation_type?: string
  created_at?: string
}

interface BioListProps {
  initialBios: GeneratedBio[]
  userId: string
}

export function BioList({ initialBios, userId }: BioListProps) {
  const [bios, setBios] = useState(initialBios)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = async (bioText: string, bioId: string) => {
    try {
      await navigator.clipboard.writeText(bioText)
      setCopiedId(bioId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
      alert('Erreur lors de la copie')
    }
  }

  if (bios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center text-text-tertiary">
        <span className="text-5xl mb-4">✨</span>
        <p className="text-sm">
          Remplissez le formulaire et cliquez sur &quot;Générer&quot;<br />pour créer votre bio.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
      {bios.map((bio) => (
        <div
          key={bio.id}
          className="bg-bg-tertiary border border-border-primary rounded-xl p-5 hover:border-red-primary/50 transition-colors group"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            {bio.tone && (
              <span className="inline-block bg-red-primary/15 text-red-primary text-xs font-semibold px-3 py-1 rounded-lg capitalize">
                {bio.tone}
              </span>
            )}
            <button
              onClick={() => handleCopy(bio.bio_text, bio.id)}
              className="flex-shrink-0 bg-border-primary hover:bg-red-primary text-text-secondary hover:text-white p-2.5 rounded-lg transition-all duration-200"
              title="Copier"
            >
              {copiedId === bio.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
            {bio.bio_text}
          </p>

          {bio.created_at && (
            <p className="text-text-tertiary text-xs mt-3">
              {new Date(bio.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
