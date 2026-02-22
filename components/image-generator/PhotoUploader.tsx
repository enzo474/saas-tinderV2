'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface PhotoUploaderProps {
  onPhotosUploaded: (photos: File[]) => void
}

export function PhotoUploader({ onPhotosUploaded }: PhotoUploaderProps) {
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null)
    const totalFiles = photos.length + acceptedFiles.length
    if (totalFiles > 6) {
      setError('Maximum 6 photos autorisées')
      return
    }
    const invalidFiles = acceptedFiles.filter(file => file.size > 10 * 1024 * 1024)
    if (invalidFiles.length > 0) {
      setError('Certaines photos dépassent 10MB')
      return
    }
    const newPreviews: string[] = []
    acceptedFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push(reader.result as string)
        if (newPreviews.length === acceptedFiles.length) {
          setPreviews(prev => [...prev, ...newPreviews])
        }
      }
      reader.readAsDataURL(file)
    })
    setPhotos(prev => [...prev, ...acceptedFiles])
  }, [photos])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: true,
    maxFiles: 6,
  })

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
    setError(null)
  }

  const handleContinue = () => {
    if (photos.length < 1) {
      setError('Minimum 1 photo requise')
      return
    }
    onPhotosUploaded(photos)
  }

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive
            ? 'border-red-primary bg-red-primary/10'
            : 'border-border-primary hover:border-red-primary/50 hover:bg-bg-tertiary/50'
          }
        `}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-text-tertiary" />
        <p className="text-white text-sm font-medium mb-2">
          {isDragActive ? 'Déposez vos photos ici...' : 'Cliquez ou glissez vos photos'}
        </p>
        <p className="text-text-tertiary text-xs">
          1-6 photos • JPG, PNG, WEBP • Max 10MB par photo
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-primary/10 border border-red-primary/30 rounded-xl">
          <p className="text-red-light text-sm">{error}</p>
        </div>
      )}

      {/* Previews */}
      {previews.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-white text-sm font-medium">
              {photos.length} photo{photos.length > 1 ? 's' : ''} uploadée{photos.length > 1 ? 's' : ''}
            </p>
            {photos.length < 1 && (
              <p className="text-text-tertiary text-xs">Minimum 1 photo</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative aspect-square group">
                <img
                  src={preview}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover rounded-xl border-2 border-border-primary"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 p-1.5 bg-black/80 hover:bg-black rounded-full transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded-lg text-xs text-white font-bold">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Continue Button */}
      {photos.length >= 1 && (
        <Button onClick={handleContinue} className="w-full">
          Continuer avec {photos.length} photo{photos.length > 1 ? 's' : ''}
        </Button>
      )}
    </div>
  )
}
