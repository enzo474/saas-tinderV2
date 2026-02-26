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
  storyImagePreview?: string  // preview locale de la photo story
}

interface ConversationGeneratorProps {
  onGenerated: (result: GeneratedConversation & { imagePreview: string; storyImagePreview: string }) => void
}

const STYLES = [
  { id: 'trash',       label: '🔥 Trash / Provocant' },
  { id: 'viral_choc',  label: '💥 Accroche Virale' },
  { id: 'drole',       label: '😂 Drôle / Absurde' },
  { id: 'direct',      label: '🎯 Direct / Osé' },
  { id: 'mysterieux',  label: '🌙 Mystérieux / Intriguant' },
  { id: 'flirt',       label: '⚡ Flirt Heavy' },
]

const LENGTHS = [
  { id: 'short',  label: 'Courte (10–13 slides) — sympa' },
  { id: 'medium', label: 'Moyenne (14–18 slides) — froide' },
  { id: 'long',   label: 'Longue (18–20 slides) — glaciale' },
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

// ─── Zone d'upload réutilisable ───────────────────────────────────────────────
function UploadZone({
  preview, onFile, onClear, icon, label, hint,
}: {
  preview: string | null
  onFile: (file: File) => void
  onClear: () => void
  icon: string
  label: string
  hint: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const pick = (file: File) => {
    if (file.type.startsWith('image/')) onFile(file)
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) pick(f) }}
        onDragOver={(e) => e.preventDefault()}
        style={{
          border: '2px dashed',
          borderColor: preview ? '#ff8c42' : '#444',
          borderRadius: 14,
          padding: '16px 12px',
          cursor: 'pointer',
          textAlign: 'center',
          background: preview ? 'rgba(255,140,66,0.05)' : '#111',
          transition: 'all 0.2s',
          position: 'relative',
          minHeight: 130,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {preview ? (
          <div style={{ position: 'relative' }}>
            <img src={preview} alt="Preview" style={{ maxHeight: 160, maxWidth: '100%', borderRadius: 10, objectFit: 'cover' }} />
            <button
              onClick={(e) => { e.stopPropagation(); onClear() }}
              style={{
                position: 'absolute', top: -8, right: -8,
                background: '#ff4444', border: 'none', borderRadius: '50%',
                width: 22, height: 22, color: '#fff', cursor: 'pointer',
                fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >×</button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 32, marginBottom: 6 }}>{icon}</div>
            <p style={{ color: '#888', fontSize: 13 }}>{label}</p>
            <p style={{ color: '#555', fontSize: 11, marginTop: 3 }}>{hint}</p>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) pick(f) }} />
    </div>
  )
}

export default function ConversationGenerator({ onGenerated }: ConversationGeneratorProps) {
  // Photo de profil (avatar dans les bulles)
  const [profileFile, setProfileFile] = useState<File | null>(null)
  const [profilePreview, setProfilePreview] = useState<string | null>(null)
  // Photo de la story (analysée par Claude + affichée dans le slide 1)
  const [storyFile, setStoryFile] = useState<File | null>(null)
  const [storyPreview, setStoryPreview] = useState<string | null>(null)

  const [context, setContext] = useState('')
  const [customAccroche, setCustomAccroche] = useState('')
  const [customFirstReply, setCustomFirstReply] = useState('')
  const [customSecondMessage, setCustomSecondMessage] = useState('')
  const [style, setStyle] = useState('trash')
  const [length, setLength] = useState('medium')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setFile = (setter: (f: File | null) => void, previewSetter: (p: string | null) => void) =>
    (file: File) => {
      setter(file)
      const reader = new FileReader()
      reader.onload = (ev) => previewSetter(ev.target?.result as string)
      reader.readAsDataURL(file)
    }

  const handleGenerate = async () => {
    if (!storyFile) { setError('Uploade la photo de la story d\'abord'); return }
    setLoading(true)
    setError(null)

    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 4000

    try {
      const story   = await compressImage(storyFile)
      const profile = profileFile ? await compressImage(profileFile) : null

      const body = JSON.stringify({
        storyImageBase64:   story.base64,
        storyMediaType:     story.mediaType,
        profileImageBase64: profile?.base64 || null,
        profileMediaType:   profile?.mediaType || null,
        context,
        customAccroche: customAccroche.trim() || undefined,
        customFirstReply: customFirstReply.trim() || undefined,
        customSecondMessage: customSecondMessage.trim() || undefined,
        style,
        length,
      })

      let res: Response | null = null
      let lastError = ''

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        res = await fetch('/api/admin/conversations/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
        })

        if (res.ok) break

        // Lire le corps une seule fois
        const errBody = await res.json().catch(() => ({}))
        lastError = errBody?.error || `Erreur ${res.status}`

        // 529 = Anthropic overloaded — on retente après délai
        if (res.status === 529 && attempt < MAX_RETRIES) {
          setError(`Claude est surchargé, nouvelle tentative ${attempt}/${MAX_RETRIES - 1}…`)
          await new Promise(r => setTimeout(r, RETRY_DELAY_MS * attempt))
          setError(null)
          continue
        }

        throw new Error(lastError)
      }

      if (!res || !res.ok) throw new Error(lastError || 'Erreur lors de la génération')

      const data = await res.json()
      onGenerated({
        ...data,
        style,
        length,
        imagePreview:       profilePreview || storyPreview!,
        storyImagePreview:  storyPreview!,
      })
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Uploads côte à côte */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
          1. Photos
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <p style={{ color: '#888', fontSize: 12, marginBottom: 6, fontWeight: 600 }}>
              👤 Photo de profil <span style={{ color: '#555', fontWeight: 400 }}>(avatar)</span>
            </p>
            <UploadZone
              preview={profilePreview}
              onFile={setFile(setProfileFile, setProfilePreview)}
              onClear={() => { setProfileFile(null); setProfilePreview(null) }}
              icon="👤"
              label="Photo de profil"
              hint="Avatar dans les bulles"
            />
          </div>
          <div>
            <p style={{ color: '#888', fontSize: 12, marginBottom: 6, fontWeight: 600 }}>
              📸 Photo de la story <span style={{ color: '#ff8c42', fontWeight: 400 }}>(requis)</span>
            </p>
            <UploadZone
              preview={storyPreview}
              onFile={setFile(setStoryFile, setStoryPreview)}
              onClear={() => { setStoryFile(null); setStoryPreview(null) }}
              icon="📸"
              label="Photo de la story"
              hint="Analysée par l'IA · slide 1"
            />
          </div>
        </div>
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

      {/* Accroche personnalisée */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
          3. Accroche personnalisée{' '}
          <span style={{ color: '#666', fontSize: 13, fontWeight: 400 }}>(optionnel)</span>
        </h2>
        <p style={{ color: '#666', fontSize: 13, marginBottom: 12, lineHeight: '1.5' }}>
          Si renseigné, Claude utilisera <strong style={{ color: '#aaa' }}>exactement</strong> ce texte comme 1er message de lui et générera la suite. La photo de story apparaîtra quand même en slide 1.
        </p>
        <textarea
          value={customAccroche}
          onChange={(e) => setCustomAccroche(e.target.value)}
          placeholder='Ex: "Quelle heure demain pour le date" ou "Tu me dragues ?"'
          rows={2}
          style={{
            width: '100%', background: '#111', border: '1px solid #333',
            borderRadius: 12, padding: '12px 14px', color: '#fff',
            fontSize: 14, resize: 'vertical', outline: 'none',
            fontFamily: 'inherit', boxSizing: 'border-box',
          }}
          onFocus={(e) => { e.target.style.borderColor = '#ff8c42' }}
          onBlur={(e) => { e.target.style.borderColor = '#333' }}
        />
      </div>

      {/* Première réponse d'elle */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
          4. Première réponse d'elle{' '}
          <span style={{ color: '#666', fontSize: 13, fontWeight: 400 }}>(optionnel)</span>
        </h2>
        <p style={{ color: '#666', fontSize: 13, marginBottom: 12, lineHeight: '1.5' }}>
          Si renseigné, Claude utilisera <strong style={{ color: '#aaa' }}>exactement</strong> ce texte comme 1er message d'elle (en réponse à l'accroche).
        </p>
        <textarea
          value={customFirstReply}
          onChange={(e) => setCustomFirstReply(e.target.value)}
          placeholder={"Ex: \"t'es sérieux là 😂\" ou \"et ?\" ou \"lol ok\""}
          rows={2}
          style={{
            width: '100%', background: '#111', border: '1px solid #333',
            borderRadius: 12, padding: '12px 14px', color: '#fff',
            fontSize: 14, resize: 'vertical', outline: 'none',
            fontFamily: 'inherit', boxSizing: 'border-box',
          }}
          onFocus={(e) => { e.target.style.borderColor = '#ff8c42' }}
          onBlur={(e) => { e.target.style.borderColor = '#333' }}
        />
      </div>

      {/* Réplique de lui (3e message) */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
          5. Réplique de lui (3e message){' '}
          <span style={{ color: '#666', fontSize: 13, fontWeight: 400 }}>(optionnel)</span>
        </h2>
        <p style={{ color: '#666', fontSize: 13, marginBottom: 12, lineHeight: '1.5' }}>
          Sa réponse au 1er message d'elle. Claude génère ensuite la suite à partir de là.
        </p>
        <textarea
          value={customSecondMessage}
          onChange={(e) => setCustomSecondMessage(e.target.value)}
          placeholder={"Ex: \"c'est tout ce que t'as à dire ?\" ou \"je savais que tu répondrais ça\""}
          rows={2}
          style={{
            width: '100%', background: '#111', border: '1px solid #333',
            borderRadius: 12, padding: '12px 14px', color: '#fff',
            fontSize: 14, resize: 'vertical', outline: 'none',
            fontFamily: 'inherit', boxSizing: 'border-box',
          }}
          onFocus={(e) => { e.target.style.borderColor = '#ff8c42' }}
          onBlur={(e) => { e.target.style.borderColor = '#333' }}
        />
      </div>

      {/* Style */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
          6. Style de conversation
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
          7. Longueur
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
        disabled={loading || !storyFile}
        style={{
          padding: '16px 32px',
          background: loading || !storyFile
            ? '#222'
            : 'linear-gradient(135deg, #ff8c42, #ff6a1a)',
          border: 'none', borderRadius: 14, color: '#fff',
          fontSize: 16, fontWeight: 700, cursor: loading || !storyFile ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s', opacity: loading || !storyFile ? 0.5 : 1,
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
