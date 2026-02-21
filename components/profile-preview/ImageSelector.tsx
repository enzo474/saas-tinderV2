'use client'

interface ImageSelectorProps {
  availableImages: string[]
  selectedImages: string[]
  onImagesSelected: (images: string[]) => void
}

export function ImageSelector({ availableImages, selectedImages, onImagesSelected }: ImageSelectorProps) {
  const toggleImage = (imageUrl: string) => {
    if (selectedImages.includes(imageUrl)) {
      onImagesSelected(selectedImages.filter(url => url !== imageUrl))
    } else {
      if (selectedImages.length >= 6) return
      onImagesSelected([...selectedImages, imageUrl])
    }
  }

  if (availableImages.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-border-primary rounded-xl">
        <p className="text-text-secondary text-sm mb-1">Aucune image disponible</p>
        <p className="text-text-tertiary text-xs">Générez des images d&apos;abord sur le dashboard</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-white text-sm">
          <span className="font-bold text-red-light">{selectedImages.length}</span>{' '}
          <span className="text-text-secondary">/ 6 sélectionnées</span>
        </p>
        {selectedImages.length > 0 && (
          <button
            onClick={() => onImagesSelected([])}
            className="text-text-tertiary hover:text-white text-xs transition-colors"
          >
            Tout désélectionner
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {availableImages.map((imageUrl, index) => {
          const isSelected = selectedImages.includes(imageUrl)
          const selectionIndex = selectedImages.indexOf(imageUrl)

          return (
            <button
              key={index}
              onClick={() => toggleImage(imageUrl)}
              className={`
                relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200
                ${isSelected
                  ? 'border-red-primary ring-2 ring-red-primary/30'
                  : 'border-border-primary hover:border-red-primary/50'
                }
              `}
            >
              <img src={imageUrl} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />

              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-red-primary rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-xs font-bold">{selectionIndex + 1}</span>
                </div>
              )}

              {!isSelected && (
                <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white/50 rounded-full opacity-0 group-hover:opacity-100" />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
