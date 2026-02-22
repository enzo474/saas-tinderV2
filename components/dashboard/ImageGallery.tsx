'use client'

import { useState, useEffect } from 'react'
import { Download, Loader2, X, Image as ImageIcon } from 'lucide-react'

interface GeneratedImage {
  id: string
  image_url: string
  photo_number: number
  generation_type: string
  created_at: string
}

interface ImageGalleryProps {
  initialImages: GeneratedImage[]
  userId: string
}

export function ImageGallery({ initialImages, userId }: ImageGalleryProps) {
  // Filtrer les images avec des URLs placeholder invalides
  const validImages = initialImages.filter(img => 
    img.image_url && 
    !img.image_url.includes('placeholder.com') &&
    !img.image_url.includes('undefined')
  )
  const [images, setImages] = useState(validImages)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)

  const handleDownload = async (imageUrl: string, fileName: string) => {
    try {
      const proxyUrl = `/api/download-image?url=${encodeURIComponent(imageUrl)}`
      const response = await fetch(proxyUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Erreur lors du téléchargement')
    }
  }

  // Polling pour rafraîchir les images quand elles sont prêtes
  useEffect(() => {
    // Vérifier s'il y a des images avec placeholder
    const hasPlaceholders = initialImages.some(img => 
      img.image_url && img.image_url.includes('placeholder.com')
    )

    if (hasPlaceholders) {
      // Poller toutes les 5 secondes pour vérifier les nouvelles images
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/user/images?userId=${userId}`)
          const data = await response.json()
          if (data.images) {
            const newValidImages = data.images.filter((img: GeneratedImage) => 
              img.image_url && 
              !img.image_url.includes('placeholder.com') &&
              !img.image_url.includes('undefined')
            )
            setImages(newValidImages)
          }
        } catch (error) {
          console.error('Failed to refresh images:', error)
        }
      }, 5000)

      return () => {
        clearInterval(interval)
      }
    }
  }, [initialImages, userId])

  // Vérifier s'il y a des images en cours de génération
  const hasGeneratingImages = initialImages.some(img => 
    img.image_url && img.image_url.includes('placeholder.com')
  )

  if (images.length === 0) {
    return (
      <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-12 text-center">
        <div className="max-w-sm mx-auto">
          <div className="w-16 h-16 bg-red-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            {hasGeneratingImages ? (
              <Loader2 className="w-8 h-8 text-red-primary animate-spin" />
            ) : (
              <ImageIcon className="w-8 h-8 text-red-primary/60" />
            )}
          </div>
          <h3 className="font-montserrat font-bold text-white text-lg mb-2">
            {hasGeneratingImages ? 'Images en cours de génération...' : 'Aucune image générée'}
          </h3>
          <p className="text-text-secondary text-sm">
            {hasGeneratingImages
              ? 'Vos images apparaîtront ici une fois la génération terminée. Actualisation automatique...'
              : "Générez vos premières photos IA depuis le générateur d'images."
            }
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            onClick={() => setSelectedImage(image)}
            className="relative group bg-bg-secondary rounded-xl overflow-hidden aspect-square max-w-[160px] mx-auto w-full cursor-pointer border-2 border-border-primary hover:border-red-primary hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
          >
            <img
              src={image.image_url}
              alt={`Photo ${image.photo_number}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Overlay téléchargement — desktop uniquement (mobile = tap → lightbox) */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDownload(image.image_url, `photo-${image.id}.jpg`)
                }}
                className="bg-red-primary hover:bg-red-dark text-white p-3 rounded-full transition-colors shadow-lg"
                title="Télécharger"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>

            <div className="absolute top-2 left-2 pointer-events-none">
              <span className="bg-black/70 text-white text-xs px-2 py-1 rounded-lg">
                Photo {image.photo_number}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox plein écran */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Aperçu image"
        >
          {/* Header */}
          <div className="flex items-center justify-between w-full px-4 py-3 flex-shrink-0">
            <span className="text-white/60 text-sm">Photo {selectedImage.photo_number}</span>
            <button
              onClick={() => setSelectedImage(null)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Fermer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Image */}
          <div className="flex-1 flex items-center justify-center w-full px-4 min-h-0">
            <img
              src={selectedImage.image_url}
              alt={`Photo ${selectedImage.photo_number}`}
              className="max-h-full max-w-full object-contain rounded-xl"
              style={{ maxHeight: 'calc(100vh - 140px)' }}
            />
          </div>

          {/* Bouton télécharger en bas */}
          <div className="w-full px-4 py-4 flex-shrink-0">
            <button
              onClick={() => handleDownload(selectedImage.image_url, `photo-${selectedImage.id}.jpg`)}
              className="w-full bg-red-primary hover:bg-red-dark text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 transition-colors shadow-lg text-base active:scale-95"
            >
              <Download className="w-5 h-5" />
              Télécharger cette photo
            </button>
          </div>
        </div>
      )}
    </>
  )
}
