'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Upload, Copy, Check, RefreshCw, MessageSquare, Zap, Infinity, X } from 'lucide-react'
interface GeneratedMessage {
  tone: string
  emoji: string
  content: string
}

interface MessageGeneratorProps {
  messageType: 'accroche' | 'reponse'
  initialCredits: number
  initialSubscriptionType?: string | null
  userId: string
}

const TONES = [
  { label: 'Direct', description: null },
  { label: 'Drôle', description: null },
  { label: 'Mystérieux', description: null },
  { label: 'Compliment', description: null },
  { label: 'CrushTalk', description: 'Adapté par l\'IA' },
]

const CREDITS_PER_GENERATION = 5

const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const
type ValidImageType = typeof VALID_IMAGE_TYPES[number]

function cleanBase64(str: string): string {
  // Supprime tout caractère non-base64 (espaces, retours à la ligne, etc.)
  return str.replace(/[^A-Za-z0-9+/=]/g, '')
}

function compressImage(file: File): Promise<{ base64: string; mediaType: ValidImageType }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const dataUrl = reader.result as string
      const commaIdx = dataUrl.indexOf(',')
      if (commaIdx === -1) { reject(new Error('Format image invalide')); return }

      const header = dataUrl.slice(0, commaIdx)
      const rawBase64 = dataUrl.slice(commaIdx + 1)
      const detectedType = header.match(/data:([^;]+)/)?.[1] ?? 'image/jpeg'
      const originalMediaType: ValidImageType = VALID_IMAGE_TYPES.includes(detectedType as ValidImageType)
        ? (detectedType as ValidImageType)
        : 'image/jpeg'

      // Essayer la compression canvas
      const img = new window.Image()
      img.onload = () => {
        try {
          const MAX = 1280
          const ratio = Math.min(MAX / img.width, MAX / img.height, 1)
          const canvas = document.createElement('canvas')
          canvas.width = Math.round(img.width * ratio)
          canvas.height = Math.round(img.height * ratio)
          const ctx = canvas.getContext('2d')
          if (!ctx) { resolve({ base64: cleanBase64(rawBase64), mediaType: originalMediaType }); return }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          const compressed = canvas.toDataURL('image/jpeg', 0.85)
          const compressedBase64 = cleanBase64(compressed.slice(compressed.indexOf(',') + 1))
          // Vérifier que la compression a bien fonctionné (pas une image vide)
          if (compressedBase64.length > 200) {
            resolve({ base64: compressedBase64, mediaType: 'image/jpeg' })
          } else {
            resolve({ base64: cleanBase64(rawBase64), mediaType: originalMediaType })
          }
        } catch {
          resolve({ base64: cleanBase64(rawBase64), mediaType: originalMediaType })
        }
      }
      img.onerror = () => resolve({ base64: cleanBase64(rawBase64), mediaType: originalMediaType })
      img.src = dataUrl
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function MessageGenerator({ messageType: initialType, initialCredits, initialSubscriptionType, userId }: MessageGeneratorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeType = initialType
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [selectedTone, setSelectedTone] = useState<string>('CrushTalk')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<GeneratedMessage[] | null>(null)
  const [credits, setCredits] = useState(initialCredits)
  const [subscriptionType, setSubscriptionType] = useState<string | null>(initialSubscriptionType ?? null)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isUnlimited = subscriptionType === 'charo' || subscriptionType === 'chill'
  const hasEnoughCredits = isUnlimited || credits >= CREDITS_PER_GENERATION

  // Afficher le banner de bienvenue si ?welcome=true dans l'URL
  useEffect(() => {
    if (searchParams.get('welcome') === 'true') {
      setShowWelcomeBanner(true)
    }
  }, [searchParams])

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Fichier invalide. Upload une image (JPG, PNG, WEBP).')
      return
    }
    setScreenshot(file)
    setError(null)
    const url = URL.createObjectURL(file)
    setScreenshotPreview(url)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const selectTone = (tone: string) => {
    setSelectedTone(tone)
  }

  const handleGenerate = async () => {
    if (!screenshot) {
      setError('Upload un screenshot de profil pour continuer.')
      return
    }
    if (!hasEnoughCredits) {
      router.push('/game/pricing')
      return
    }

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const { base64, mediaType } = await compressImage(screenshot)

      const res = await fetch('/api/crushtalk/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mediaType,
          messageType: activeType,
          selectedTones: [selectedTone],
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.type === 'insufficient_credits') {
          router.push('/game/pricing')
          return
        }
        setError(data.error || 'Erreur lors de la génération')
        return
      }

      setResults(data.messages)
      if (data.isUnlimited) {
        setSubscriptionType('charo')
      } else {
        setCredits(data.newBalance)
      }
    } catch (e: any) {
      setError(e.message || 'Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 2000)
    })
  }

  const handleReset = () => {
    setScreenshot(null)
    setScreenshotPreview(null)
    setResults(null)
    setError(null)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Banner bienvenue — 5 crédits offerts */}
      {showWelcomeBanner && (
        <div
          className="flex items-center justify-between rounded-xl p-4 border"
          style={{ background: 'rgba(230,57,70,0.08)', borderColor: 'rgba(230,57,70,0.3)' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🎁</span>
            <div>
              <p className="text-white text-sm font-semibold">Bienvenue ! Tu as 5 crédits gratuits</p>
              <p className="text-xs" style={{ color: '#9da3af' }}>
                Upload un screenshot pour générer ton premier message. Coût : 5 crédits.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowWelcomeBanner(false)}
            className="flex-shrink-0 ml-3 transition-colors"
            style={{ color: '#6b7280' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-montserrat font-bold text-white text-xl md:text-3xl whitespace-nowrap">
            {activeType === 'accroche' ? 'Disquettes' : 'Conversation'}
          </h1>
          <p className="text-text-secondary text-sm mt-1 line-clamp-2">
            {activeType === 'accroche'
              ? 'Upload un profil, l\'IA génère 4 messages personnalisés pour toi.'
              : 'Upload la conversation, l\'IA génère des réponses percutantes.'}
          </p>
        </div>
        {/* Badge visible uniquement pour les abonnés illimités */}
        {isUnlimited && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
          >
            <Infinity className="w-3.5 h-3.5 text-white" />
            <span className="font-montserrat font-bold text-white text-xs">Illimité</span>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Colonne gauche — Inputs */}
        <div className="space-y-4">

          {/* Upload screenshot */}
          <div className="rounded-2xl p-5 border" style={{ background: '#111111', borderColor: '#1F1F1F' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(230,57,70,0.8)' }}>
              {activeType === 'accroche' ? 'Screenshot du profil' : 'Screenshot de la conversation'}
            </p>

            {!screenshotPreview ? (
              <label
                className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors duration-200"
                style={isDragging ? {
                  borderColor: '#E63946',
                  background: 'rgba(230,57,70,0.08)',
                } : {
                  borderColor: '#2A2A2A',
                }}
                onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                />
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(230,57,70,0.1)' }}>
                  <Upload className="w-6 h-6" style={{ color: '#E63946' }} />
                </div>
                <p className="text-white text-sm font-medium mb-1">
                  {activeType === 'accroche' ? 'Upload le profil à analyser' : 'Upload la conversation'}
                </p>
                <p className="text-xs text-center" style={{ color: '#6b7280' }}>
                  Drag & drop ou cliquez · JPG, PNG, WEBP
                </p>
              </label>
            ) : (
              <div className="relative">
                <img
                  src={screenshotPreview}
                  alt="Screenshot"
                  className="w-full max-h-64 object-contain rounded-xl border"
                  style={{ borderColor: '#2A2A2A' }}
                />
                <button
                  onClick={() => { setScreenshot(null); setScreenshotPreview(null); setResults(null) }}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/70 hover:bg-black rounded-full text-white flex items-center justify-center text-sm transition-colors"
                >
                  ×
                </button>
              </div>
            )}
          </div>


          {/* Sélecteur de ton */}
          <div className="rounded-2xl p-5 border" style={{ background: '#111111', borderColor: '#1F1F1F' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(230,57,70,0.8)' }}>Ton souhaité</p>
            <div className="grid grid-cols-2 gap-2">
              {TONES.filter(t => t.label !== 'CrushTalk').map(tone => {
                const isActive = selectedTone === tone.label
                return (
                  <button
                    key={tone.label}
                    onClick={() => selectTone(tone.label)}
                    className="flex items-center justify-center px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200"
                    style={isActive ? {
                      borderColor: '#E63946',
                      background: 'rgba(230,57,70,0.1)',
                      color: '#fff',
                    } : {
                      borderColor: '#1F1F1F',
                      color: '#9da3af',
                    }}
                  >
                    <span>{tone.label}</span>
                  </button>
                )
              })}

              {/* CrushTalk — pleine largeur en bas */}
              {(() => {
                const isActive = selectedTone === 'CrushTalk'
                return (
                  <button
                    onClick={() => selectTone('CrushTalk')}
                    className="col-span-2 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200"
                    style={isActive ? {
                      borderColor: '#E63946',
                      background: 'rgba(230,57,70,0.1)',
                      color: '#fff',
                    } : {
                      borderColor: '#1F1F1F',
                      color: '#9da3af',
                    }}
                  >
                    <span>CrushTalk</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: isActive ? 'rgba(230,57,70,0.2)' : 'rgba(255,255,255,0.06)', color: isActive ? '#FF4757' : '#6b7280' }}>
                      Adapté par l&apos;IA
                    </span>
                  </button>
                )
              })()}
            </div>
          </div>

          {/* Bouton générer */}
          {error && (
            <div className="p-4 rounded-xl border" style={{ background: 'rgba(230,57,70,0.08)', borderColor: 'rgba(230,57,70,0.25)' }}>
              <p className="text-sm" style={{ color: '#FF4757' }}>{error}</p>
            </div>
          )}
          <button
            onClick={handleGenerate}
            disabled={!screenshot || loading}
            className="w-full py-4 rounded-xl font-bold text-base text-white flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4" />
                {activeType === 'accroche' ? 'Générer une accroche' : 'Générer une réponse'}
              </>
            )}
          </button>
        </div>

        {/* Colonne droite — Résultats */}
        <div className="rounded-2xl p-5 border" style={{ background: '#111111', borderColor: '#1F1F1F' }}>
          {!results && !loading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(230,57,70,0.1)' }}>
                <MessageSquare className="w-8 h-8" style={{ color: '#E63946' }} />
              </div>
              <h3 className="font-montserrat font-bold text-white text-lg mb-2">Tes messages apparaîtront ici</h3>
              <p className="text-sm max-w-xs" style={{ color: '#6b7280' }}>
                Upload un screenshot et l&apos;IA analyse le profil pour générer des messages ultra-personnalisés.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 animate-pulse" style={{ background: 'rgba(230,57,70,0.1)' }}>
                <MessageSquare className="w-8 h-8" style={{ color: '#E63946' }} />
              </div>
              <h3 className="font-montserrat font-bold text-white text-lg mb-2">Analyse en cours...</h3>
              <p className="text-sm" style={{ color: '#6b7280' }}>Claude analyse le profil et rédige tes messages</p>
              <div className="flex gap-1 mt-4">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ background: '#E63946', animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          {results && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-montserrat font-bold text-white text-lg whitespace-nowrap">
                  {results.length} {results.length > 1 ? 'messages générés' : 'message généré'}
                </h3>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-xs transition-colors hover:text-white"
                  style={{ color: '#6b7280' }}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Nouvelle analyse
                </button>
              </div>

              {results.map((msg, idx) => (
                <div
                  key={idx}
                  className="rounded-xl p-4 border"
                  style={{ background: 'rgba(255,255,255,0.03)', borderColor: '#2A2A2A' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{msg.emoji}</span>
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>
                        {msg.tone}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(msg.content, idx)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200 hover:text-white"
                      style={{ borderColor: '#2A2A2A', color: '#6b7280' }}
                    >
                      {copiedIdx === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-400" />
                          <span className="text-green-400">Copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copier
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-white text-sm leading-relaxed">{msg.content}</p>
                </div>
              ))}

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-3 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:text-white"
                style={{ borderColor: '#2A2A2A', color: '#6b7280' }}
              >
                <RefreshCw className="w-4 h-4" />
                {isUnlimited ? 'Regénérer' : `Regénérer (${CREDITS_PER_GENERATION} crédits)`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Paywall — crédits insuffisants → redirection vers la page pricing */}
      {!isUnlimited && credits < CREDITS_PER_GENERATION && (
        <div className="flex items-center justify-between rounded-xl p-4 border" style={{ background: 'rgba(230,57,70,0.08)', borderColor: 'rgba(230,57,70,0.3)' }}>
          <p className="text-sm font-medium" style={{ color: '#FF4757' }}>
            Tu as utilisé tes crédits gratuits ! Choisis un plan pour continuer.
          </p>
          <button
            onClick={() => router.push('/game/pricing')}
            className="ml-4 px-4 py-2 rounded-lg text-sm font-bold text-white flex-shrink-0 transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
          >
            Voir les offres
          </button>
        </div>
      )}

    </div>
  )
}
