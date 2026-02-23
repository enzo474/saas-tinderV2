'use client'

import { forwardRef } from 'react'
import type { ConversationMessage } from './ConversationGenerator'

interface ConversationPreviewProps {
  conversation: ConversationMessage[]
  profileImage: string
}

const ConversationPreview = forwardRef<HTMLDivElement, ConversationPreviewProps>(
  function ConversationPreview({ conversation, profileImage }, ref) {
    const storyReplyMessage = conversation[0]?.sender === 'lui' ? conversation[0] : null
    const restMessages = storyReplyMessage ? conversation.slice(1) : conversation

    return (
      <div
        ref={ref}
        id="conversation-preview"
        style={{
          width: 393,
          background: '#ffffff',
          overflow: 'hidden',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif',
        }}
      >
        {/* ── HEADER ────────────────────────────────────────── */}
        <div style={{
          background: '#ffffff',
          padding: '12px 16px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          borderBottom: '0.5px solid #e5e5e5',
        }}>
          {/* Chevron gauche */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, flexShrink: 0 }}>
            <polyline points="15 18 9 12 15 6" />
          </svg>

          {/* Avatar */}
          <img
            src={profileImage}
            alt="Profile"
            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, marginRight: 10 }}
          />

          {/* Nom + chevron droit */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ color: '#000', fontWeight: 700, fontSize: 15, letterSpacing: '-0.2px' }}>
              claraaa.study
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>

          {/* Icônes droite : téléphone, vidéo, tag */}
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            {/* Téléphone */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.1 1.16 2 2 0 012.08 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.41-.41a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
            </svg>
            {/* Caméra vidéo */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" />
            </svg>
            {/* Tag / étiquette */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
          </div>
        </div>

        {/* ── MESSAGES ──────────────────────────────────────── */}
        <div style={{
          background: '#ffffff',
          padding: '14px 10px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}>

          {/* Story reply group */}
          {storyReplyMessage && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, marginBottom: 6 }}>

              {/* Photo story — juste l'image, comme un message image envoyé */}
              <div style={{
                width: 136,
                height: 172,
                borderRadius: 16,
                overflow: 'hidden',
                flexShrink: 0,
              }}>
                <img
                  src={profileImage}
                  alt="Story"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>

              {/* Bulle texte d'accroche */}
              <div style={{
                background: 'linear-gradient(to bottom right, #9B34B0, #C13584)',
                color: '#fff',
                padding: '10px 15px',
                borderRadius: '20px 20px 5px 20px',
                maxWidth: '75%',
                wordBreak: 'break-word',
                fontSize: 14.5,
                lineHeight: 1.45,
                fontWeight: 400,
              }}>
                {storyReplyMessage.message}
              </div>

              <span style={{ fontSize: 11, color: '#8e8e8e', marginRight: 2 }}>
                {storyReplyMessage.timestamp}
              </span>
            </div>
          )}

          {/* Reste de la conversation */}
          {restMessages.map((msg, idx) => {
            const isSent = msg.sender === 'lui'
            const nextMsg = restMessages[idx + 1]
            const prevMsg = idx > 0 ? restMessages[idx - 1] : null
            const isFirstInGroup = !prevMsg || prevMsg.sender !== msg.sender
            const isLastInGroup = !nextMsg || nextMsg.sender !== msg.sender

            // Border radius selon position dans le groupe
            const getBorderRadius = () => {
              if (isSent) {
                if (isFirstInGroup && isLastInGroup) return '20px 20px 5px 20px'
                if (isFirstInGroup) return '20px 20px 20px 20px'
                if (isLastInGroup) return '20px 20px 5px 20px'
                return '20px 20px 20px 20px'
              } else {
                if (isFirstInGroup && isLastInGroup) return '5px 20px 20px 20px'
                if (isFirstInGroup) return '5px 20px 20px 20px'
                if (isLastInGroup) return '20px 20px 20px 5px'
                return '5px 20px 20px 5px'
              }
            }

            return (
              <div key={idx}>
                {/* Rangée message */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: isSent ? 'flex-end' : 'flex-start',
                  gap: 6,
                  marginBottom: isLastInGroup ? 1 : 2,
                }}>
                  {/* Avatar elle — visible seulement dernier du groupe */}
                  {!isSent && (
                    isLastInGroup ? (
                      <img
                        src={profileImage}
                        alt="elle"
                        style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, marginBottom: 2 }}
                      />
                    ) : (
                      <div style={{ width: 26, flexShrink: 0 }} />
                    )
                  )}

                  <div style={{
                    padding: '9px 14px',
                    borderRadius: getBorderRadius(),
                    maxWidth: '70%',
                    wordBreak: 'break-word',
                    fontSize: 14.5,
                    lineHeight: 1.45,
                    ...(isSent
                      ? {
                          background: 'linear-gradient(to bottom right, #9B34B0, #C13584)',
                          color: '#ffffff',
                        }
                      : {
                          background: '#efefef',
                          color: '#000000',
                        }
                    ),
                  }}>
                    {msg.message}
                  </div>
                </div>

                {/* Timestamp — seulement fin de groupe */}
                {isLastInGroup && (
                  <div style={{
                    textAlign: isSent ? 'right' : 'left',
                    paddingLeft: isSent ? 0 : 32,
                    paddingRight: isSent ? 4 : 0,
                    marginBottom: 8,
                  }}>
                    <span style={{ fontSize: 11, color: '#8e8e8e' }}>
                      {msg.timestamp}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ── BARRE DE SAISIE ────────────────────────────────── */}
        <div style={{
          background: '#ffffff',
          borderTop: '0.5px solid #e5e5e5',
          padding: '10px 14px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          {/* Champ texte */}
          <div style={{
            flex: 1,
            border: '1px solid #dbdbdb',
            borderRadius: 22,
            padding: '8px 16px',
            color: '#8e8e8e',
            fontSize: 14,
            background: '#fff',
          }}>
            Votre message...
          </div>

          {/* Micro */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
            <path d="M19 10v2a7 7 0 01-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>

          {/* Image */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>

          {/* Sticker + */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </div>
      </div>
    )
  }
)

export default ConversationPreview
