'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ConversationMessage, GeneratedConversation } from './ConversationGenerator'

type HistoryItem = {
  id: string
  profile_image_url: string | null
  context: string | null
  style: string
  length: string
  conversation: ConversationMessage[]
  hook_explanation: string | null
  created_at: string
}

const STYLE_LABELS: Record<string, string> = {
  trash: '🔥 Trash',
  drole: '😂 Drôle',
  direct: '🎯 Direct',
  mysterieux: '🌙 Mystérieux',
  flirt: '⚡ Flirt',
}

const LENGTH_LABELS: Record<string, string> = {
  short: 'Courte',
  medium: 'Moyenne',
  long: 'Longue',
}

interface ConversationHistoryProps {
  onReload: (conv: GeneratedConversation & { imagePreview: string }) => void
}

export default function ConversationHistory({ onReload }: ConversationHistoryProps) {
  const [conversations, setConversations] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchConversations = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('admin_generated_conversations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    setConversations(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchConversations() }, [fetchConversations])

  const handleView = (item: HistoryItem) => {
    onReload({
      id: item.id,
      conversation: item.conversation,
      hook_explanation: item.hook_explanation || undefined,
      profile_image_url: item.profile_image_url || undefined,
      style: item.style,
      length: item.length,
      imagePreview: item.profile_image_url || '',
    })
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
        Chargement de l'historique...
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: 40, color: '#555',
        border: '1px dashed #333', borderRadius: 16,
      }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
        <p>Aucune conversation générée pour l'instant</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>
          Historique ({conversations.length})
        </h2>
        <button
          onClick={fetchConversations}
          style={{
            background: '#1a1a1a', border: '1px solid #333', borderRadius: 8,
            color: '#888', fontSize: 13, padding: '6px 12px', cursor: 'pointer',
          }}
        >
          ↻ Actualiser
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 12,
      }}>
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => handleView(conv)}
            style={{
              background: '#111', border: '1px solid #222', borderRadius: 14,
              overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#ff8c42')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#222')}
          >
            {/* Image */}
            <div style={{ height: 120, background: '#1a1a1a', overflow: 'hidden' }}>
              {conv.profile_image_url ? (
                <img
                  src={conv.profile_image_url}
                  alt="Profile"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', fontSize: 32 }}>
                  👤
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ padding: '10px 12px' }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                <span style={{
                  background: 'rgba(255,140,66,0.15)', color: '#ff8c42',
                  fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                }}>
                  {STYLE_LABELS[conv.style] || conv.style}
                </span>
                <span style={{
                  background: '#1a1a1a', color: '#888',
                  fontSize: 11, padding: '2px 8px', borderRadius: 20,
                }}>
                  {LENGTH_LABELS[conv.length] || conv.length}
                </span>
              </div>

              <div style={{ color: '#555', fontSize: 11 }}>
                {new Date(conv.created_at).toLocaleDateString('fr-FR', {
                  day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit',
                })}
              </div>

              <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
                {conv.conversation?.length || 0} messages
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
