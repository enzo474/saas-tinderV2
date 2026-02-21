'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Style {
  id: string
  style_name: string
  style_description: string
  preview_image_url: string | null
  photo_number: number
}

interface StylePickerProps {
  availableStyles: Style[]
  onStylesSelected: (styleIds: string[]) => void
}

export function StylePicker({ availableStyles, onStylesSelected }: StylePickerProps) {
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleStyleSelect = (styleId: string) => {
    setError(null)
    if (selectedStyles.includes(styleId)) {
      setSelectedStyles(prev => prev.filter(id => id !== styleId))
    } else {
      if (selectedStyles.length >= 5) {
        setError('Maximum 5 styles (un par image)')
        return
      }
      setSelectedStyles(prev => [...prev, styleId])
    }
  }

  const handleContinue = () => {
    if (selectedStyles.length < 5) {
      setError('Veuillez sélectionner 5 styles')
      return
    }
    onStylesSelected(selectedStyles)
  }

  return (
    <div className="space-y-6">
      {/* Counter */}
      <div className="p-4 bg-bg-primary border-2 border-border-primary rounded-xl">
        <p className="text-white text-sm">
          <span className="font-bold text-red-light text-lg">{selectedStyles.length}</span>
          <span className="text-text-secondary"> / 5 styles sélectionnés</span>
        </p>
        {selectedStyles.length > 0 && selectedStyles.length < 5 && (
          <p className="text-text-tertiary text-xs mt-1">
            Sélectionnez encore {5 - selectedStyles.length} style{5 - selectedStyles.length > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-primary/10 border border-red-primary/30 rounded-xl">
          <p className="text-red-light text-sm">{error}</p>
        </div>
      )}

      {/* Styles Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {availableStyles.map((style) => {
          const isSelected = selectedStyles.includes(style.id)
          const selectionIndex = selectedStyles.indexOf(style.id)

          return (
            <button
              key={style.id}
              onClick={() => handleStyleSelect(style.id)}
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
                  <span className="text-white text-xs font-bold">{selectionIndex + 1}</span>
                </div>
              )}

              {/* Preview Image */}
              {style.preview_image_url ? (
                <div className="aspect-[3/4] overflow-hidden bg-bg-tertiary">
                  <img src={style.preview_image_url} alt={style.style_name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-[3/4] bg-bg-tertiary flex items-center justify-center">
                  <span className="text-text-tertiary text-xs">Pas de preview</span>
                </div>
              )}

              <div className="p-3 bg-bg-secondary">
                <h3 className="font-montserrat font-bold text-white text-sm mb-0.5 truncate">{style.style_name}</h3>
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

      {/* Continue Button */}
      {selectedStyles.length === 5 && (
        <Button onClick={handleContinue} className="w-full">
          Continuer avec ces 5 styles
        </Button>
      )}
    </div>
  )
}
