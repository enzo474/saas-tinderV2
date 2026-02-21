'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Check } from 'lucide-react'

interface Style {
  id: string
  style_name: string
  style_description: string
  preview_image_url: string | null
  photo_number: number
}

interface SingleStylePickerProps {
  availableStyles: Style[]
  onStyleSelected: (styleId: string) => void
}

export function SingleStylePicker({ availableStyles, onStyleSelected }: SingleStylePickerProps) {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)

  const selectedStyleData = availableStyles.find(s => s.id === selectedStyle)

  return (
    <div className="space-y-6">
      {/* Selected Style Info */}
      {selectedStyle && (
        <div className="flex items-center gap-3 p-4 bg-red-primary/10 border border-red-primary/30 rounded-xl">
          <Check className="w-5 h-5 text-red-primary flex-shrink-0" />
          <p className="text-white text-sm">
            Style sélectionné :{' '}
            <span className="font-bold text-red-light">{selectedStyleData?.style_name}</span>
          </p>
        </div>
      )}

      {/* Styles Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {availableStyles.map((style) => {
          const isSelected = selectedStyle === style.id
          return (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={`
                relative p-0 rounded-2xl border-2 transition-all duration-200 text-left overflow-hidden
                ${isSelected
                  ? 'border-red-primary ring-2 ring-red-primary/30'
                  : 'border-border-primary hover:border-red-primary/50 hover:-translate-y-0.5'
                }
              `}
            >
              {/* Selection Badge */}
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 w-6 h-6 bg-red-primary rounded-full flex items-center justify-center z-10 shadow-lg">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              )}

              {/* Preview Image */}
              {style.preview_image_url ? (
                <div className="aspect-[3/4] overflow-hidden bg-bg-tertiary">
                  <img
                    src={style.preview_image_url}
                    alt={style.style_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[3/4] bg-bg-tertiary flex items-center justify-center">
                  <span className="text-text-tertiary text-xs">Pas de preview</span>
                </div>
              )}

              {/* Style Info */}
              <div className="p-3 bg-bg-secondary">
                <h3 className="font-montserrat font-bold text-white text-sm mb-0.5 truncate">
                  {style.style_name}
                </h3>
                <p className="text-text-tertiary text-xs line-clamp-2">{style.style_description}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* No styles */}
      {availableStyles.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-border-primary rounded-2xl">
          <p className="text-text-secondary text-sm">Aucun style disponible. Contactez l&apos;administrateur.</p>
        </div>
      )}

      {/* Generate Button */}
      {selectedStyle && (
        <Button onClick={() => onStyleSelected(selectedStyle)} className="w-full">
          Générer avec ce style (10 crédits)
        </Button>
      )}
    </div>
  )
}
