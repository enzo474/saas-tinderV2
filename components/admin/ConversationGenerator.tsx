'use client'

import { useState, useRef, useCallback } from 'react'

export type ConversationMessage = {
  sender: 'lui' | 'elle'
  message: string
  timestamp: string
}

export type GeneratedConversation = {
  id?: string
  conversation: ConversationMessage[]
  hook_explanation?: string
  profile_image_url?: string
  style: string
  length: string
}

interface ConversationGeneratorProps {
  onGenerated: (result: GeneratedConversation & { imagePreview: string }) => void
}

const STYLES = [
  { id: 'trash', label: '🔥 Trash / Provocant' },
  { id: 'drole', label: '😂 Drôle / Absurde' },
  { id: 'direct', label: '🎯 Direct / Osé' },
  { id: 'mysterieux', label: '🌙 Mystérieux / Intriguant' },
  { id: 'flirt', label: '⚡ Flirt Heavy' },
]

const LENGTHS = [
  { id: 'short', label: 'Courte (5–7 messages)' },
  { id: 'medium', label: 'Moyenne (8–12 messages)' },
  { id: 'long', label: 'Longue (12–20 messages)' },
]

async function compressImage(file: File): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX = 1024
        let { width, height } = img
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width); width = MAX }
          else { width = Math.round(width * MAX / height); height = MAX }
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
        const base64 = dataUrl.split(',')[1]
        resolve({ base64, mediaType: 'image/jpeg' })
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function ConversationGenerator({ onGenerated }: ConversationGeneratorProps) {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [context, setContext] = useState('')
  const [style, setStyle] = useState('trash')
  const [length, setLength] = useState('medium')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }, [])

  const handleGenerate = async () => {
    if (!imageFile) { setError('Uploade une photo d\'abord'); return }
    setLoading(true)
    setError(null)
    try {
      const { base64, mediaType } = await compressImage(imageFile)
      const res = await fetch('/api/admin/conversations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mediaType, context, style, length }),
      })
      if (!res.ok) {
        const { error: apiError } = await res.json()
        throw new Error(apiError || 'Erreur lors de la génération')
      }
      const data = await res.json()
      onGenerated({ ...data, style, length, imagePreview: imagePreview! })
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Upload */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
          1. Photo de la meuf
        </h2>
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          style={{
            border: '2px dashed',
            borderColor: imagePreview ? '#ff8c42' : '#444',
            borderRadius: 16,
            padding: 24,
            cursor: 'pointer',
            textAlign: 'center',
            background: imagePreview ? 'rgba(255,140,66,0.05)' : '#111',
            transition: 'all 0.2s',
            position: 'relative',
            minHeight: 160,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {imagePreview ? (
            <div style={{ position: 'relative' }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 12, objectFit: 'cover' }}
              />
              <button
                onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null) }}
                style={{
                  position: 'absolute', top: -8, right: -8,
                  background: '#ff4444', border: 'none', borderRadius: '50%',
                  width: 24, height: 24, color: '#fff', cursor: 'pointer',
                  fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >×</button>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📸</div>
              <p style={{ color: '#888', fontSize: 14 }}>Clique ou glisse une photo ici</p>
              <p style={{ color: '#555', fontSize: 12, marginTop: 4 }}>Story, photo de profil, etc.</p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      {/* Contexte */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
          2. Contexte <span style={{ color: '#666', fontSize: 13, fontWeight: 400 }}>(optionnel)</span>
        </h2>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Ex: Elle poste une story à la salle, elle a un chat sur la photo, ambiance soirée..."
          rows={3}
          style={{
            width: '100%', background: '#111', border: '1px solid #333',
            borderRadius: 12, padding: '12px 14px', color: '#fff',
            fontSize: 14, resize: 'vertical', outline: 'none',
            fontFamily: 'inherit', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Style */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
          3. Style de conversation
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
          {STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setStyle(s.id)}
              style={{
                padding: '14px 12px',
                background: style === s.id ? 'rgba(255,140,66,0.15)' : '#111',
                border: `2px solid ${style === s.id ? '#ff8c42' : '#333'}`,
                borderRadius: 12, color: '#fff', cursor: 'pointer',
                fontSize: 13, fontWeight: style === s.id ? 700 : 400,
                transition: 'all 0.2s', textAlign: 'center',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Longueur */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
          4. Longueur
        </h2>
        <div style={{ display: 'flex', gap: 10 }}>
          {LENGTHS.map((l) => (
            <button
              key={l.id}
              onClick={() => setLength(l.id)}
              style={{
                flex: 1, padding: '12px 8px',
                background: length === l.id ? 'rgba(255,140,66,0.15)' : '#111',
                border: `2px solid ${length === l.id ? '#ff8c42' : '#333'}`,
                borderRadius: 12, color: '#fff', cursor: 'pointer',
                fontSize: 13, fontWeight: length === l.id ? 700 : 400,
                transition: 'all 0.2s', textAlign: 'center',
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(255,68,68,0.1)', border: '1px solid #ff4444',
          borderRadius: 12, padding: '12px 16px', color: '#ff6666', fontSize: 14,
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Générer */}
      <button
        onClick={handleGenerate}
        disabled={loading || !imageFile}
        style={{
          padding: '16px 32px',
          background: loading || !imageFile
            ? '#222'
            : 'linear-gradient(135deg, #ff8c42, #ff6a1a)',
          border: 'none', borderRadius: 14, color: '#fff',
          fontSize: 16, fontWeight: 700, cursor: loading || !imageFile ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s', opacity: loading || !imageFile ? 0.5 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        {loading ? (
          <>
            <span style={{
              width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)',
              borderTopColor: '#fff', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              display: 'inline-block',
            }} />
            Génération en cours...
          </>
        ) : (
          '✨ Générer la conversation'
        )}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
