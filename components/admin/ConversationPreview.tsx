'use client'

import { forwardRef } from 'react'
import type { ConversationMessage } from './ConversationGenerator'

interface ConversationPreviewProps {
  conversation: ConversationMessage[]
  profileImage: string
}

const ConversationPreview = forwardRef<HTMLDivElement, ConversationPreviewProps>(
  function ConversationPreview({ conversation, profileImage }, ref) {
    return (
      <div
        ref={ref}
        id="conversation-preview"
        style={{
          width: 390,
          background: '#000',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* Header Instagram DM */}
        <div style={{
          background: '#1a1a1a',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          borderBottom: '1px solid #2a2a2a',
        }}>
          {/* Flèche retour */}
          <span style={{ color: '#fff', fontSize: 20, opacity: 0.7, marginRight: 4 }}>‹</span>

          <div style={{ position: 'relative' }}>
            <img
              src={profileImage}
              alt="Profile"
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            {/* Point vert "en ligne" */}
            <div style={{
              position: 'absolute', bottom: 1, right: 1,
              width: 11, height: 11,
              background: '#4CAF50',
              borderRadius: '50%',
              border: '2px solid #1a1a1a',
            }} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Sarah</div>
            <div style={{ color: '#888', fontSize: 12 }}>En ligne</div>
          </div>

          {/* Icônes droite */}
          <div style={{ display: 'flex', gap: 16, opacity: 0.7 }}>
            <span style={{ color: '#fff', fontSize: 20 }}>📞</span>
            <span style={{ color: '#fff', fontSize: 20 }}>📷</span>
          </div>
        </div>

        {/* Messages */}
        <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {conversation.map((msg, idx) => {
            const isSent = msg.sender === 'lui'
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isSent ? 'flex-end' : 'flex-start',
                  gap: 3,
                }}
              >
                {/* Avatar pour "elle" */}
                {!isSent && (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
                    <img
                      src={profileImage}
                      alt="elle"
                      style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div style={{
                      background: '#3a3a3c',
                      color: '#fff',
                      padding: '10px 14px',
                      borderRadius: '18px 18px 18px 4px',
                      maxWidth: '72%',
                      wordBreak: 'break-word',
                      fontSize: 15,
                      lineHeight: 1.4,
                    }}>
                      {msg.message}
                    </div>
                  </div>
                )}

                {/* Bulle "lui" */}
                {isSent && (
                  <div style={{
                    background: '#0084ff',
                    color: '#fff',
                    padding: '10px 14px',
                    borderRadius: '18px 18px 4px 18px',
                    maxWidth: '72%',
                    wordBreak: 'break-word',
                    fontSize: 15,
                    lineHeight: 1.4,
                  }}>
                    {msg.message}
                  </div>
                )}

                <span style={{ fontSize: 11, color: '#555', marginLeft: isSent ? 0 : 30, marginRight: isSent ? 4 : 0 }}>
                  {msg.timestamp}
                </span>
              </div>
            )
          })}
        </div>

        {/* Input bar */}
        <div style={{
          background: '#1a1a1a',
          borderTop: '1px solid #2a2a2a',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            flex: 1,
            background: '#2a2a2a',
            borderRadius: 24,
            padding: '10px 16px',
            color: '#555',
            fontSize: 14,
          }}>
            Message...
          </div>
          <span style={{ fontSize: 22 }}>👍</span>
        </div>
      </div>
    )
  }
)

export default ConversationPreview
