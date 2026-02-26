'use client'

import { useState, useRef } from 'react'
import ConversationGenerator, { type GeneratedConversation } from './ConversationGenerator'
import ConversationPreview from './ConversationPreview'
import ExportCarousel from './ExportCarousel'
import ConversationHistory from './ConversationHistory'

type ActiveView = 'generator' | 'history'

function toPlainText(conversation: { sender: string; message: string }[]): string {
  return conversation
    .map(msg => `${msg.sender === 'lui' ? 'homme' : 'femme'} : ${msg.message}`)
    .join('\n')
}

export default function AdminConversationsClient() {
  const [activeView, setActiveView] = useState<ActiveView>('generator')
  const [result, setResult] = useState<(GeneratedConversation & { imagePreview: string; storyImagePreview?: string }) | null>(null)
  const [editableConv, setEditableConv] = useState<import('./ConversationGenerator').ConversationMessage[]>([])
  const [copied, setCopied] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleGenerated = (data: GeneratedConversation & { imagePreview: string }) => {
    setResult(data)
    setEditableConv(data.conversation)
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 20px',
    background: active ? 'rgba(255,140,66,0.15)' : 'transparent',
    border: `1px solid ${active ? '#ff8c42' : '#333'}`,
    borderRadius: 10,
    color: active ? '#ff8c42' : '#888',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: active ? 700 : 400,
    transition: 'all 0.2s',
  })

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
            💬 Générateur de Conversations Virales
          </h1>
          <p style={{ color: '#666', fontSize: 15 }}>
            Génère de fausses conversations trash/engageantes pour TikTok et Instagram
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 32 }}>
          <button onClick={() => setActiveView('generator')} style={tabStyle(activeView === 'generator')}>
            ✨ Générateur
          </button>
          <button onClick={() => setActiveView('history')} style={tabStyle(activeView === 'history')}>
            📋 Historique
          </button>
        </div>

        {activeView === 'generator' && (
          <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '600px', gap: 32, justifyContent: 'center' }}>

            {/* Formulaire */}
            <div style={{
              background: '#111', border: '1px solid #222', borderRadius: 20,
              padding: 28,
            }}>
              <ConversationGenerator onGenerated={handleGenerated} />
            </div>

            {/* Preview + Export */}
            {result && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Hook explanation */}
                {result.hook_explanation && (
                  <div style={{
                    background: 'rgba(255,140,66,0.08)',
                    border: '1px solid rgba(255,140,66,0.3)',
                    borderRadius: 14, padding: '14px 16px',
                  }}>
                    <div style={{ color: '#ff8c42', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                      💡 POURQUOI ÇA MARCHE
                    </div>
                    <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.5 }}>
                      {result.hook_explanation}
                    </p>
                  </div>
                )}

                {/* Hint édition */}
                <div style={{ textAlign: 'center', color: '#555', fontSize: 12 }}>
                  ✏️ Clique sur une bulle pour modifier — Entrée pour ajouter un message
                </div>

                {/* Preview */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ overflowY: 'auto', maxHeight: '70vh' }}>
                    <ConversationPreview
                      ref={previewRef}
                      conversation={editableConv}
                      profileImage={result.imagePreview || result.profile_image_url || ''}
                      storyImage={result.storyImagePreview || result.profile_image_url || result.imagePreview || ''}
                      onConversationChange={setEditableConv}
                    />
                  </div>
                </div>

                {/* Export */}
                <ExportCarousel
                  conversationId={result.id}
                  conversation={editableConv}
                  profileImage={result.imagePreview || result.profile_image_url || ''}
                  storyImage={result.storyImagePreview || result.profile_image_url || result.imagePreview || ''}
                  previewRef={previewRef}
                />

                {/* Version texte brut pour react */}
                {(() => {
                  const plain = toPlainText(editableConv)
                  return (
                    <div style={{
                      background: '#111', border: '1px solid #222',
                      borderRadius: 16, padding: '18px 20px',
                    }}>
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
                          onClick={() => handleCopy(plain)}
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
                        value={plain}
                        rows={Math.min(editableConv.length + 2, 18)}
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
                  )
                })()}

                {/* Nouvelle génération */}
                <button
                  onClick={() => setResult(null)}
                  style={{
                    background: 'transparent',
                    border: '1px solid #333',
                    borderRadius: 12, padding: '12px 16px',
                    color: '#888', cursor: 'pointer', fontSize: 14,
                  }}
                >
                  ← Nouvelle génération
                </button>
              </div>
            )}
          </div>
        )}

        {activeView === 'history' && (
          <ConversationHistory
            onReload={(conv) => {
              setResult(conv)
              setEditableConv(conv.conversation)
              setActiveView('generator')
            }}
          />
        )}
      </div>
    </div>
  )
}
