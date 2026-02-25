'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getOrCreateAnalysis, uploadSelfie } from '@/lib/actions/onboarding'
import { compressImage } from '@/lib/utils/image'

export const dynamic = 'force-dynamic'

export default function OnboardingStep2() {
  const router = useRouter()
  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    getOrCreateAnalysis().then(analysis => {
      setAnalysisId(analysis?.id || null)
      if (analysis?.selfie_url) setPreview(analysis.selfie_url)
    })
  }, [])

  const handleFileSelect = (selectedFile: File) => {
    compressImage(selectedFile).then(compressed => {
      setFile(compressed)
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result as string)
      reader.readAsDataURL(compressed)
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('image/')) handleFileSelect(f)
  }

  const handleSubmit = async () => {
    if (!analysisId || !file) return
    setLoading(true)
    try {
      await uploadSelfie(analysisId, file)
      router.push('/onboarding/step/3')
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="ob-bg" style={{ minHeight: '100dvh', justifyContent: 'flex-end' }}>
      <div className="ob-card" style={{ borderRadius: '2rem 2rem 0 0', minHeight: '72dvh' }}>
        <div className="text-center mb-6">
          <h2 className="ob-title-lg">Découvre ton potentiel caché</h2>
          <p className="ob-subtitle">
            Upload une photo récente (sans filtre). L&apos;IA va analyser ton potentiel dating et te montrer comment le maximiser.
          </p>
        </div>

        {/* Zone upload */}
        <div
          className="flex-1 mb-6 rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all duration-200 overflow-hidden"
          style={{
            minHeight: 180,
            borderColor: dragging ? '#E63946' : '#D0D0D0',
            background: dragging ? '#FFF0F1' : '#FAFAFA',
          }}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('selfie-input')?.click()}
        >
          {preview ? (
            <img
              src={preview}
              alt="preview"
              className="w-full h-full object-cover"
              style={{ maxHeight: 240 }}
            />
          ) : (
            <div className="text-center px-6 py-8">
              <div className="text-5xl mb-3">📸</div>
              <p className="font-bold text-sm mb-1" style={{ color: '#1C1C1E' }}>
                Clique ou glisse ta photo
              </p>
              <p className="text-xs" style={{ color: '#999' }}>
                JPG, PNG • Sans filtre
              </p>
            </div>
          )}
        </div>

        <input
          id="selfie-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => {
            const f = e.target.files?.[0]
            if (f) handleFileSelect(f)
          }}
        />

        <div className="mt-auto">
          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            className="ob-btn"
          >
            {loading ? 'Upload en cours...' : 'Découvrir mon potentiel →'}
          </button>
        </div>
      </div>
    </div>
  )
}
