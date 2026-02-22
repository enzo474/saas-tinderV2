'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, Copy, Check, RefreshCw, MessageSquare, Zap, Infinity } from 'lucide-react'
import { RechargeModal } from './RechargeModal'

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
  { label: 'Direct', emoji: '🎯' },
  { label: 'Drôle', emoji: '😂' },
  { label: 'Mystérieux', emoji: '🌙' },
  { label: 'Compliment', emoji: '⚡' },
]

const CREDITS_PER_GENERATION = 5

function compressImage(file: File): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const img = new window.Image()
      img.onload = () => {
        const MAX = 1280
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * ratio)
        canvas.height = Math.round(img.height * ratio)
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
        resolve({ base64: dataUrl.split(',')[1], mediaType: 'image/jpeg' })
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function MessageGenerator({ messageType: initialType, initialCredits, initialSubscriptionType, userId }: MessageGeneratorProps) {
  const [activeType, setActiveType] = useState<'accroche' | 'reponse'>(initialType)
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [selectedTones, setSelectedTones] = useState<string[]>(['Direct'])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<GeneratedMessage[] | null>(null)
  const [credits, setCredits] = useState(initialCredits)
  const [subscriptionType, setSubscriptionType] = useState<string | null>(initialSubscriptionType ?? null)
  const [showRechargeModal, setShowRechargeModal] = useState(false)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isUnlimited = subscriptionType === 'charo'
  const hasEnoughCredits = isUnlimited || credits >= CREDITS_PER_GENERATION

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

  const toggleTone = (tone: string) => {
    setSelectedTones(prev =>
      prev.includes(tone)
        ? prev.length > 1 ? prev.filter(t => t !== tone) : prev
        : [...prev, tone]
    )
  }

  const handleGenerate = async () => {
    if (!screenshot) {
      setError('Upload un screenshot de profil pour continuer.')
      return
    }
    if (!hasEnoughCredits) {
      setShowRechargeModal(true)
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
          selectedTones,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.type === 'insufficient_credits') {
          setError(`Crédits insuffisants. Il te faut ${CREDITS_PER_GENERATION} crédits, tu en as ${data.balance}.`)
        } else {
          setError(data.error || 'Erreur lors de la génération')
        }
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

      {/* Header avec crédits */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-montserrat font-bold text-white text-2xl md:text-3xl">
            {activeType === 'accroche' ? 'Messages d\'accroche' : 'Répondre à un message'}
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {activeType === 'accroche'
              ? 'Upload un profil, l\'IA génère 4 messages personnalisés pour toi.'
              : 'Upload la conversation, l\'IA génère des réponses percutantes.'}
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
          style={{ background: isUnlimited ? 'linear-gradient(135deg, #F77F00, #FFAA33)' : 'linear-gradient(135deg, #E63946, #FF4757)' }}
          onClick={() => !isUnlimited && setShowRechargeModal(true)}
          title={isUnlimited ? 'Pack Charo — Illimité' : 'Cliquer pour recharger'}
        >
          {isUnlimited ? (
            <>
              <Infinity className="w-4 h-4 text-white" />
              <span className="font-montserrat font-bold text-white text-sm">Illimité</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-white" />
              <span className="font-montserrat font-bold text-white text-sm">{credits}</span>
              <span className="text-white/80 text-xs">crédits</span>
            </>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Colonne gauche — Inputs */}
        <div className="space-y-4">

          {/* Type de message */}
          <div className="rounded-2xl p-5 border" style={{ background: '#111111', borderColor: '#1F1F1F' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(247,127,0,0.7)' }}>Type de message</p>
            <div className="grid grid-cols-2 gap-2">
              {(['accroche', 'reponse'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => { setActiveType(type); setResults(null); setError(null) }}
                  className="px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200"
                  style={activeType === type ? {
                    borderColor: '#F77F00',
                    background: 'rgba(247,127,0,0.1)',
                    color: '#fff',
                  } : {
                    borderColor: '#1F1F1F',
                    color: '#9da3af',
                  }}
                >
                  <div className="font-semibold">{type === 'accroche' ? 'Accroche' : 'Répondre'}</div>
                  <div className="text-xs mt-0.5 opacity-70">
                    {type === 'accroche' ? 'Premier message' : 'Continuer la conv'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Upload screenshot */}
          <div className="rounded-2xl p-5 border" style={{ background: '#111111', borderColor: '#1F1F1F' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(247,127,0,0.7)' }}>
              {activeType === 'accroche' ? 'Screenshot du profil' : 'Screenshot de la conversation'}
            </p>

            {!screenshotPreview ? (
              <label
                className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors duration-200"
                style={isDragging ? {
                  borderColor: '#F77F00',
                  background: 'rgba(247,127,0,0.08)',
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
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(247,127,0,0.1)' }}>
                  <Upload className="w-6 h-6" style={{ color: '#F77F00' }} />
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


          {/* Sélecteur de tons */}
          <div className="rounded-2xl p-5 border" style={{ background: '#111111', borderColor: '#1F1F1F' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(247,127,0,0.7)' }}>Ton souhaité</p>
            <div className="grid grid-cols-2 gap-2">
              {TONES.map(tone => (
                <button
                  key={tone.label}
                  onClick={() => toggleTone(tone.label)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200"
                  style={selectedTones.includes(tone.label) ? {
                    borderColor: '#F77F00',
                    background: 'rgba(247,127,0,0.1)',
                    color: '#fff',
                  } : {
                    borderColor: '#1F1F1F',
                    color: '#9da3af',
                  }}
                >
                  <span>{tone.emoji}</span>
                  <span>{tone.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bouton générer */}
          {error && (
            <div className="p-4 rounded-xl border" style={{ background: 'rgba(247,127,0,0.08)', borderColor: 'rgba(247,127,0,0.25)' }}>
              <p className="text-sm" style={{ color: '#FFAA33' }}>{error}</p>
            </div>
          )}
          <button
            onClick={handleGenerate}
            disabled={!screenshot || loading}
            className="w-full py-4 rounded-xl font-bold text-base text-white flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ background: 'linear-gradient(135deg, #F77F00, #FFAA33)' }}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4" />
                {isUnlimited ? 'Générer mes messages' : `Générer mes messages (${CREDITS_PER_GENERATION} crédits)`}
              </>
            )}
          </button>
        </div>

        {/* Colonne droite — Résultats */}
        <div className="rounded-2xl p-5 border" style={{ background: '#111111', borderColor: '#1F1F1F' }}>
          {!results && !loading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(247,127,0,0.1)' }}>
                <MessageSquare className="w-8 h-8" style={{ color: '#F77F00' }} />
              </div>
              <h3 className="font-montserrat font-bold text-white text-lg mb-2">Tes messages apparaîtront ici</h3>
              <p className="text-sm max-w-xs" style={{ color: '#6b7280' }}>
                Upload un screenshot et l&apos;IA analyse le profil pour générer des messages ultra-personnalisés.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 animate-pulse" style={{ background: 'rgba(247,127,0,0.1)' }}>
                <MessageSquare className="w-8 h-8" style={{ color: '#F77F00' }} />
              </div>
              <h3 className="font-montserrat font-bold text-white text-lg mb-2">Analyse en cours...</h3>
              <p className="text-sm" style={{ color: '#6b7280' }}>Claude analyse le profil et rédige tes messages</p>
              <div className="flex gap-1 mt-4">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ background: '#F77F00', animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          {results && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-montserrat font-bold text-white text-lg">
                  {results.length} messages générés
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

      {/* Bannière recharge quand crédits insuffisants */}
      {!isUnlimited && credits < CREDITS_PER_GENERATION && (
        <div className="flex items-center justify-between bg-[#F77F00]/10 border border-[#F77F00]/30 rounded-xl p-4">
          <p className="text-[#F77F00] text-sm font-medium">
            Tu n'as plus assez de crédits ({credits} restants · {CREDITS_PER_GENERATION} requis).
          </p>
          <button
            onClick={() => setShowRechargeModal(true)}
            className="ml-4 px-4 py-2 rounded-lg text-sm font-bold text-white flex-shrink-0 transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #F77F00, #FFAA33)' }}
          >
            Recharger
          </button>
        </div>
      )}

      {/* Modal recharge */}
      {showRechargeModal && (
        <RechargeModal
          onClose={() => setShowRechargeModal(false)}
          currentBalance={credits}
        />
      )}
    </div>
  )
}
