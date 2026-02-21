'use client'

import { Check } from 'lucide-react'

interface BioSelectorProps {
  availableBios: any[]
  selectedBio: string
  onSelectBio: (bio: string) => void
}

export function BioSelector({ availableBios, selectedBio, onSelectBio }: BioSelectorProps) {
  if (availableBios.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-border-primary rounded-xl">
        <p className="text-text-secondary text-sm mb-1">Aucune bio disponible</p>
        <p className="text-text-tertiary text-xs">Générez des bios d&apos;abord sur le dashboard</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => onSelectBio('')}
        className={`
          w-full p-4 rounded-xl border-2 transition-all duration-200 text-left
          ${!selectedBio
            ? 'border-red-primary bg-red-primary/10'
            : 'border-border-primary hover:border-red-primary/50 bg-bg-primary'
          }
        `}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white text-sm font-medium mb-1">Pas de bio</p>
            <p className="text-text-tertiary text-xs">Afficher uniquement les images</p>
          </div>
          {!selectedBio && <Check className="w-5 h-5 text-red-primary" />}
        </div>
      </button>

      {availableBios.map((bio, index) => {
        const isSelected = selectedBio === bio.bio_text
        return (
          <button
            key={bio.id}
            onClick={() => onSelectBio(bio.bio_text)}
            className={`
              w-full p-4 rounded-xl border-2 transition-all duration-200 text-left
              ${isSelected
                ? 'border-red-primary bg-red-primary/10'
                : 'border-border-primary hover:border-red-primary/50 bg-bg-primary'
              }
            `}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <p className="text-white text-sm font-medium">Bio {index + 1}</p>
                  {bio.tone && (
                    <span className="px-2 py-0.5 bg-bg-tertiary border border-border-primary text-text-tertiary text-xs rounded-full">
                      {bio.tone}
                    </span>
                  )}
                </div>
                <p className="text-text-secondary text-sm line-clamp-3">{bio.bio_text}</p>
              </div>
              {isSelected && <Check className="w-5 h-5 text-red-primary flex-shrink-0" />}
            </div>
          </button>
        )
      })}
    </div>
  )
}
