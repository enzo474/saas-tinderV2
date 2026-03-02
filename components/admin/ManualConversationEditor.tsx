'use client'

import { useState, useRef } from 'react'
import type { ConversationMessage } from './ConversationGenerator'
import ConversationPreview from './ConversationPreview'
import ExportCarousel from './ExportCarousel'

function compressImage(file: File): Promise<string> {
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
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

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
  const pick = (file: File) => { if (file.type.startsWith('image/')) onFile(file) }

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

function makeTimestamp() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

const INITIAL_CONVERSATION: ConversationMessage[] = [
  { sender: 'lui', message: '', timestamp: makeTimestamp() },
  { sender: 'elle', message: '', timestamp: makeTimestamp() },
]

export default function ManualConversationEditor() {
  const [storyPreview, setStoryPreview] = useState<string | null>(null)
  const [profilePreview, setProfilePreview] = useState<string | null>(null)
  const [conversation, setConversation] = useState<ConversationMessage[]>(INITIAL_CONVERSATION)
  const [copied, setCopied] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  const handleStory = async (file: File) => {
    const dataUrl = await compressImage(file)
    setStoryPreview(dataUrl)
  }

  const handleProfile = async (file: File) => {
    const dataUrl = await compressImage(file)
    setProfilePreview(dataUrl)
  }

  const addMessage = (sender: 'lui' | 'elle') => {
    setConversation(prev => [...prev, { sender, message: '', timestamp: makeTimestamp() }])
  }

  const resetAll = () => {
    setConversation(INITIAL_CONVERSATION)
    setStoryPreview(null)
    setProfilePreview(null)
  }

  const toPlainText = () =>
    conversation.map(m => `${m.sender === 'lui' ? 'homme' : 'femme'} : ${m.message}`).join('\n')

  const handleCopy = () => {
    navigator.clipboard.writeText(toPlainText())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const hasContent = storyPreview || profilePreview || conversation.some(m => m.message.trim())

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 32, alignItems: 'start' }}>

      {/* Colonne gauche — config */}
      <div style={{ background: '#111', border: '1px solid #222', borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>

        <div>
          <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Mode Manuel</h3>
          <p style={{ color: '#666', fontSize: 13 }}>Écris les bulles toi-même, des deux côtés.</p>
        </div>

        {/* Photos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ color: '#ccc', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              📸 Photo de la story <span style={{ color: '#ff8c42' }}>*</span>
            </div>
            <UploadZone
              preview={storyPreview}
              onFile={handleStory}
              onClear={() => setStoryPreview(null)}
              icon="🖼️"
              label="Upload la photo story"
              hint="Elle apparaît dans le premier slide"
            />
          </div>
          <div>
            <div style={{ color: '#ccc', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              👤 Photo de profil <span style={{ color: '#555', fontSize: 11, fontWeight: 400 }}>(optionnel)</span>
            </div>
            <UploadZone
              preview={profilePreview}
              onFile={handleProfile}
              onClear={() => setProfilePreview(null)}
              icon="👤"
              label="Avatar dans les bulles"
              hint="Petite photo ronde à gauche"
            />
          </div>
        </div>

        {/* Ajouter des messages */}
        <div>
          <div style={{ color: '#ccc', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
            Ajouter une bulle
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => addMessage('lui')}
              style={{
                flex: 1, padding: '12px 8px',
                background: 'rgba(137, 53, 240, 0.15)',
                border: '1px solid rgba(137, 53, 240, 0.5)',
                borderRadius: 12, color: '#c084fc',
                cursor: 'pointer', fontSize: 13, fontWeight: 600,
              }}
            >
              + Lui (homme)
            </button>
            <button
              onClick={() => addMessage('elle')}
              style={{
                flex: 1, padding: '12px 8px',
                background: 'rgba(38, 38, 38, 0.8)',
                border: '1px solid #444',
                borderRadius: 12, color: '#aaa',
                cursor: 'pointer', fontSize: 13, fontWeight: 600,
              }}
            >
              + Elle (femme)
            </button>
          </div>
          <p style={{ color: '#555', fontSize: 12, marginTop: 8, lineHeight: 1.5 }}>
            ✏️ Clique sur une bulle dans la preview pour écrire — Entrée pour en ajouter une, Suppr sur vide pour effacer
          </p>
        </div>

        {/* Aperçu liste */}
        <div>
          <div style={{ color: '#ccc', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            Bulles ({conversation.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
            {conversation.map((m, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 10px', borderRadius: 8,
                background: m.sender === 'lui' ? 'rgba(137,53,240,0.1)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${m.sender === 'lui' ? 'rgba(137,53,240,0.3)' : '#2a2a2a'}`,
              }}>
                <span style={{ fontSize: 11, color: m.sender === 'lui' ? '#c084fc' : '#888', fontWeight: 600, minWidth: 30 }}>
                  {m.sender === 'lui' ? 'Lui' : 'Elle'}
                </span>
                <span style={{ fontSize: 12, color: '#555', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.message || <em style={{ color: '#333' }}>vide</em>}
                </span>
                <button
                  onClick={() => setConversation(prev => prev.filter((_, j) => j !== i))}
                  style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 14, padding: '0 2px' }}
                >×</button>
              </div>
            ))}
          </div>
        </div>

        {/* Reset */}
        {hasContent && (
          <button
            onClick={resetAll}
            style={{
              background: 'transparent', border: '1px solid #333',
              borderRadius: 10, padding: '10px 14px',
              color: '#666', cursor: 'pointer', fontSize: 13,
            }}
          >
            Tout réinitialiser
          </button>
        )}
      </div>

      {/* Colonne droite — preview + export */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {!storyPreview && (
          <div style={{
            background: 'rgba(255,140,66,0.06)', border: '1px solid rgba(255,140,66,0.2)',
            borderRadius: 12, padding: '12px 16px',
            color: '#ff8c42', fontSize: 13,
          }}>
            Upload la photo story pour voir la preview complète
          </div>
        )}

        <div style={{ textAlign: 'center', color: '#555', fontSize: 12 }}>
          ✏️ Clique sur une bulle pour modifier — Entrée pour ajouter un message
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ overflowY: 'auto', maxHeight: '70vh' }}>
            <ConversationPreview
              ref={previewRef}
              conversation={conversation}
              profileImage={profilePreview || ''}
              storyImage={storyPreview || profilePreview || ''}
              onConversationChange={setConversation}
            />
          </div>
        </div>

        <ExportCarousel
          conversationId={undefined}
          conversation={conversation}
          profileImage={profilePreview || ''}
          storyImage={storyPreview || profilePreview || ''}
          previewRef={previewRef}
        />

        {/* Version texte */}
        {conversation.some(m => m.message.trim()) && (
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: 16, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>
                  📝 Version texte — pour react / sous-titres
                </div>
                <div style={{ color: '#666', fontSize: 12, marginTop: 2 }}>
                  Copie-colle directement dans ton éditeur vidéo
                </div>
              </div>
              <button
                onClick={handleCopy}
                style={{
                  background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(255,140,66,0.12)',
                  border: `1px solid ${copied ? '#22c55e' : '#ff8c42'}`,
                  borderRadius: 10, padding: '8px 16px',
                  color: copied ? '#22c55e' : '#ff8c42',
                  cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  transition: 'all 0.2s', whiteSpace: 'nowrap',
                }}
              >
                {copied ? '✓ Copié !' : 'Copier'}
              </button>
            </div>
            <textarea
              readOnly
              value={toPlainText()}
              rows={Math.min(conversation.length + 2, 18)}
              style={{
                width: '100%', background: '#0a0a0a',
                border: '1px solid #2a2a2a', borderRadius: 10,
                padding: '12px 14px', color: '#ccc',
                fontSize: 13, lineHeight: '1.7', resize: 'vertical',
                outline: 'none', fontFamily: 'monospace',
                boxSizing: 'border-box',
              }}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />
          </div>
        )}
      </div>
    </div>
  )
}
