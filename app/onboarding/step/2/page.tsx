'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StepHeader } from '@/components/ui/StepHeader'
import { Button } from '@/components/ui/Button'
import { UploadZone } from '@/components/ui/UploadZone'
import { getOrCreateAnalysis, uploadSelfie } from '@/lib/actions/onboarding'
import { compressImage } from '@/lib/utils/image'

export const dynamic = 'force-dynamic'

export default function OnboardingStep2() {
  const router = useRouter()
  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getOrCreateAnalysis().then(analysis => {
      setAnalysisId(analysis?.id || null)
      if (analysis?.selfie_url) {
        setPreview(analysis.selfie_url)
      }
    })
  }, [])

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile) {
      setFile(null)
      setPreview(null)
      return
    }

    compressImage(selectedFile).then((compressed) => {
      setFile(compressed)
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result as string)
      reader.readAsDataURL(compressed)
    })
  }

  const handleSubmit = async () => {
    if (!analysisId || !file) return

    setLoading(true)
    try {
      await uploadSelfie(analysisId, file)
      router.push('/onboarding/step/3')
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md mx-auto">
        <StepHeader currentStep={2} totalSteps={3} />

        <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-8 space-y-6">
          <div className="text-center">
            <h2 className="font-montserrat font-bold text-white text-2xl mb-2">
              Découvre ton potentiel caché
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              Upload une photo récente (sans filtre). L&apos;IA va analyser ton potentiel dating et te montrer comment le maximiser.
            </p>
          </div>

          <UploadZone
            onFileSelect={handleFileSelect}
            preview={preview}
            label="Cliquez ou glissez votre photo"
          />

          <Button
            onClick={handleSubmit}
            disabled={!file || loading}
            className="w-full justify-center"
          >
            {loading ? 'Upload en cours...' : 'Découvrir mon potentiel →'}
          </Button>
        </div>
      </div>
    </div>
  )
}
