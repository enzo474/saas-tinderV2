'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Check, X } from 'lucide-react'

interface GeneratedImage {
  id: string
  image_url: string
  photo_number: number
  created_at: string
}

interface ImageSourceSelectorProps {
  generatedImages: GeneratedImage[]
  onImageSelected: (imageUrl: string) => void
}

export function ImageSourceSelector({ generatedImages, onImageSelected }: ImageSourceSelectorProps) {
  const [selectedTab, setSelectedTab] = useState<'upload' | 'gallery'>('upload')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null)

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    const file = acceptedFiles[0]
    if (file.size > 10 * 1024 * 1024) {
      alert("L'image dépasse 10MB")
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      setUploadedImage(reader.result as string)
      onImageSelected(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: false,
    maxFiles: 1,
  })

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-bg-primary rounded-xl border border-border-primary">
        {(['upload', 'gallery'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedTab === tab
                ? 'bg-red-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            {tab === 'upload' ? 'Upload image' : 'Mes images générées'}
          </button>
        ))}
      </div>

      {/* Upload Tab */}
      {selectedTab === 'upload' && (
        <div>
          {!uploadedImage ? (
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
                {isDragActive ? 'Déposez votre image ici...' : 'Cliquez ou glissez votre image'}
              </p>
              <p className="text-text-tertiary text-xs">1 image • JPG, PNG, WEBP • Max 10MB</p>
            </div>
          ) : (
            <div className="relative w-fit mx-auto">
              <img src={uploadedImage} alt="Uploaded" className="max-w-xs rounded-2xl border-2 border-border-primary" />
              <button
                onClick={() => { setUploadedImage(null); onImageSelected('') }}
                className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black rounded-full text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Gallery Tab */}
      {selectedTab === 'gallery' && (
        <div>
          {generatedImages.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border-primary rounded-2xl">
              <p className="text-text-secondary text-sm mb-1">Aucune image générée</p>
              <p className="text-text-tertiary text-xs">Générez d&apos;abord des images en mode &quot;Nouvelle image&quot;</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {generatedImages.map((image) => {
                const isSelected = selectedGalleryImage === image.image_url
                return (
                  <button
                    key={image.id}
                    onClick={() => {
                      setSelectedGalleryImage(image.image_url)
                      onImageSelected(image.image_url)
                    }}
                    className={`
                      relative aspect-[9/16] rounded-xl overflow-hidden border-2 transition-all duration-200
                      ${isSelected
                        ? 'border-red-primary ring-2 ring-red-primary/30'
                        : 'border-border-primary hover:border-red-primary/50'
                      }
                    `}
                  >
                    <img src={image.image_url} alt={`Photo ${image.photo_number}`} className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-red-primary/20 flex items-center justify-center">
                        <div className="w-8 h-8 bg-red-primary rounded-full flex items-center justify-center shadow-lg">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
