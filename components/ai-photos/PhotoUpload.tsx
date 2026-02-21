'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
// next/image non utilisé — previews blob:// servies via <img>

interface PhotoUploadProps {
  onGenerate: (files: File[]) => void
  isGenerating: boolean
}

export default function PhotoUpload({ onGenerate, isGenerating }: PhotoUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Limiter à 6 photos maximum
    const newFiles = [...files, ...acceptedFiles].slice(0, 6)
    setFiles(newFiles)

    // Créer les previews
    const newPreviews: string[] = []
    newFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        newPreviews.push(reader.result as string)
        if (newPreviews.length === newFiles.length) {
          setPreviews(newPreviews)
        }
      }
      reader.readAsDataURL(file)
    })
  }, [files])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
  })

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
    setPreviews(previews.filter((_, i) => i !== index))
  }

  const handleGenerate = () => {
    if (files.length >= 4) {
      onGenerate(files)
    }
  }

  const isValid = files.length >= 4 && files.length <= 6

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Upload tes photos sources</h2>
        <p className="text-gray-600">
          4 à 6 photos claires de toi pour générer tes photos IA optimisées
        </p>
      </div>

      {/* Zone de drop */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-pink-500 bg-pink-50'
            : 'border-gray-300 hover:border-pink-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-sm text-gray-600">
            {isDragActive
              ? 'Dépose tes photos ici'
              : 'Clique ou glisse tes photos ici'}
          </p>
          <p className="text-xs text-gray-500">JPG ou PNG • Max 10MB par photo</p>
        </div>
      </div>

      {/* Grille de previews */}
      {previews.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">
              {files.length} photo{files.length > 1 ? 's' : ''} sélectionnée{files.length > 1 ? 's' : ''}
            </p>
            {files.length < 4 && (
              <p className="text-sm text-orange-600">
                Minimum 4 photos requises
              </p>
            )}
            {files.length > 6 && (
              <p className="text-sm text-red-600">Maximum 6 photos</p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bouton Générer */}
      <button
        onClick={handleGenerate}
        disabled={!isValid || isGenerating}
        className={`w-full py-4 rounded-lg font-semibold text-white transition-colors ${
          isValid && !isGenerating
            ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'
            : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        {isGenerating ? 'Génération en cours...' : 'Générer mes photos IA'}
      </button>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Conseils pour de meilleurs résultats :</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ Photos bien éclairées, de face ou 3/4</li>
          <li>✓ Visage clairement visible sans lunettes ni masque</li>
          <li>✓ Différentes expressions et angles</li>
          <li>✓ Haute résolution (pas de photos floues)</li>
        </ul>
      </div>
    </div>
  )
}
