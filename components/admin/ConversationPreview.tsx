'use client'

import { forwardRef } from 'react'
import type { ConversationMessage } from './ConversationGenerator'

interface ConversationPreviewProps {
  conversation: ConversationMessage[]
  profileImage: string
}

// SVG icons inline pour éviter les dépendances
const ChevronLeft = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)
const Phone = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.1 1.16 2 2 0 012.08.001h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.41-.41a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
  </svg>
)
const Video = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
)
const Info = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
)
const Image = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
)
const Mic = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
    <path d="M19 10v2a7 7 0 01-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
)

const ConversationPreview = forwardRef<HTMLDivElement, ConversationPreviewProps>(
  function ConversationPreview({ conversation, profileImage }, ref) {
    // Séparer le premier message "lui" du reste pour l'afficher comme story reply
    const firstLuiIdx = conversation.findIndex(m => m.sender === 'lui')
    const storyReplyMessage = firstLuiIdx === 0 ? conversation[0] : null
    const restMessages = storyReplyMessage ? conversation.slice(1) : conversation

    return (
      <div
        ref={ref}
        id="conversation-preview"
        style={{
          width: 390,
          background: '#fff',
          borderRadius: 0,
          overflow: 'hidden',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* Header Instagram DM — fond blanc */}
        <div style={{
          background: '#fff',
          padding: '10px 12px 10px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          borderBottom: '1px solid #efefef',
        }}>
          {/* Flèche retour */}
          <span style={{ color: '#000', display: 'flex', alignItems: 'center', padding: '0 4px' }}>
            <ChevronLeft />
          </span>

          {/* Avatar sans point vert */}
          <img
            src={profileImage}
            alt="Profile"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              objectFit: 'cover',
              display: 'block',
              marginRight: 8,
            }}
          />

          {/* Nom + chevron */}
          <div style={{ flex: 1 }}>
            <div style={{ color: '#000', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 2 }}>
              claraaa.study
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" style={{ marginLeft: 2 }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>

          {/* Icônes droite — noir */}
          <div style={{ display: 'flex', gap: 14, color: '#000' }}>
            <Phone />
            <Video />
            <Info />
          </div>
        </div>

        {/* Zone messages */}
        <div style={{
          background: '#fff',
          padding: '12px 12px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          minHeight: 400,
        }}>

          {/* Story reply — premier message "lui" */}
          {storyReplyMessage && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, marginBottom: 4 }}>
              {/* Image story */}
              <div style={{
                borderRadius: 18,
                overflow: 'hidden',
                width: 160,
                height: 200,
                position: 'relative',
                border: '1px solid #efefef',
              }}>
                <img
                  src={profileImage}
                  alt="Story"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                {/* Overlay "Story" label */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.5))',
                  padding: '20px 10px 8px',
                  color: '#fff', fontSize: 11, textAlign: 'center',
                }}>
                  A répondu à ta story
                </div>
              </div>
              {/* Bulle message d'accroche */}
              <div style={{
                background: 'linear-gradient(135deg, #833AB4, #C13584)',
                color: '#fff',
                padding: '10px 14px',
                borderRadius: '18px 18px 4px 18px',
                maxWidth: '72%',
                wordBreak: 'break-word',
                fontSize: 15,
                lineHeight: 1.4,
              }}>
                {storyReplyMessage.message}
              </div>
              <span style={{ fontSize: 11, color: '#aaa', marginRight: 4 }}>
                {storyReplyMessage.timestamp}
              </span>
            </div>
          )}

          {/* Reste de la conversation */}
          {restMessages.map((msg, idx) => {
            const isSent = msg.sender === 'lui'

            // Grouper les avatars : montrer l'avatar seulement sur le dernier message consécutif de "elle"
            const nextMsg = restMessages[idx + 1]
            const isLastInGroup = !nextMsg || nextMsg.sender !== msg.sender

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isSent ? 'flex-end' : 'flex-start',
                  gap: 2,
                }}
              >
                {!isSent ? (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
                    {/* Avatar visible seulement sur dernier message du groupe */}
                    {isLastInGroup ? (
                      <img
                        src={profileImage}
                        alt="elle"
                        style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                      />
                    ) : (
                      <div style={{ width: 28, flexShrink: 0 }} />
                    )}
                    <div style={{
                      background: '#efefef',
                      color: '#000',
                      padding: '10px 14px',
                      borderRadius: isLastInGroup ? '18px 18px 18px 4px' : '18px',
                      maxWidth: '68%',
                      wordBreak: 'break-word',
                      fontSize: 15,
                      lineHeight: 1.4,
                    }}>
                      {msg.message}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: 'linear-gradient(135deg, #833AB4, #C13584)',
                    color: '#fff',
                    padding: '10px 14px',
                    borderRadius: isLastInGroup ? '18px 18px 4px 18px' : '18px',
                    maxWidth: '68%',
                    wordBreak: 'break-word',
                    fontSize: 15,
                    lineHeight: 1.4,
                  }}>
                    {msg.message}
                  </div>
                )}

                {/* Timestamp discret, seulement en fin de groupe */}
                {isLastInGroup && (
                  <span style={{
                    fontSize: 11,
                    color: '#aaa',
                    marginLeft: isSent ? 0 : 34,
                    marginRight: isSent ? 4 : 0,
                    marginBottom: 4,
                  }}>
                    {msg.timestamp}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Barre de saisie Instagram */}
        <div style={{
          background: '#fff',
          borderTop: '1px solid #efefef',
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          {/* Icône camera/media gauche */}
          <span style={{ color: '#000' }}><Image /></span>

          {/* Champ texte */}
          <div style={{
            flex: 1,
            border: '1px solid #dbdbdb',
            borderRadius: 22,
            padding: '9px 16px',
            color: '#aaa',
            fontSize: 14,
            background: '#fff',
          }}>
            Message...
          </div>

          {/* Micro + sticker droite */}
          <span style={{ color: '#000' }}><Mic /></span>
        </div>
      </div>
    )
  }
)

export default ConversationPreview
