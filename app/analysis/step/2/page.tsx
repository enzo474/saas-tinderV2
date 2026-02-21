'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StepHeader } from '@/components/ui/StepHeader'
import { Button } from '@/components/ui/Button'
import { getOrCreateAnalysis } from '@/lib/actions/onboarding'
import { uploadTinderPhotos } from '@/lib/actions/analysis'
import { compressImage } from '@/lib/utils/image'

export const dynamic = 'force-dynamic'

export default function AnalysisStep2() {
  const router = useRouter()
  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getOrCreateAnalysis().then(analysis => {
      setAnalysisId(analysis?.id || null)
      if (analysis?.photos_urls?.length) {
        setPreviews(analysis.photos_urls)
      }
    })
  }, [])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length + files.length > 6) {
      alert('Maximum 6 photos')
      return
    }

    const compressed = await Promise.all(selectedFiles.map(compressImage))
    const newFiles = [...files, ...compressed].slice(0, 6)
    setFiles(newFiles)

    const newPreviews = newFiles.map(file => URL.createObjectURL(file))
    setPreviews(newPreviews)
  }

  const handleRemove = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    
    const newPreviews = previews.filter((_, i) => i !== index)
    setPreviews(newPreviews)
  }

  const handleSubmit = async () => {
    if (!analysisId || files.length === 0) return

    setLoading(true)
    try {
      await uploadTinderPhotos(analysisId, files)
      router.push('/analysis/step/3')
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <StepHeader currentStep={2} totalSteps={6} />

      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h2 className="font-montserrat font-bold text-white text-2xl mb-2">
            Tes photos Tinder actuelles
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            On va les analyser pour te dire exactement lesquelles garder, lesquelles supprimer, et dans quel ordre les mettre.
          </p>
          <p className="text-red-light text-xs font-semibold mt-2">
            Upload les photos que tu utilises actuellement sur tes apps de rencontre — c'est elles qu'on analyse.
          </p>
        </div>

        <div className="space-y-4">
          <p className="font-inter text-text-tertiary text-sm">
            {files.length} / 6 photos <span className="text-text-tertiary">(minimum 3)</span>
          </p>

          {previews.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-48 object-cover rounded-xl border-2 border-border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-black transition-colors text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {files.length < 6 && (
            <label className="block w-full border-2 border-dashed border-border-primary bg-bg-secondary rounded-xl cursor-pointer hover:border-red-primary transition-colors duration-200">
              <input
                type="file"
                accept="image/jpeg,image/png"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center py-12">
                <svg className="w-10 h-10 text-text-tertiary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-white font-semibold text-sm mb-1">Ajouter des photos</p>
                <p className="text-text-tertiary text-xs">JPG, PNG • Max 10MB chacune</p>
              </div>
            </label>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={files.length < 3 || loading}
          className="w-full justify-center"
        >
          {loading ? 'Upload en cours...' : 'Analyser mes photos →'}
        </Button>
      </div>
    </div>
  )
}
