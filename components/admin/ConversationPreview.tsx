'use client'

import { forwardRef } from 'react'
import type { ConversationMessage } from './ConversationGenerator'

interface ConversationPreviewProps {
  conversation: ConversationMessage[]
  profileImage: string    // avatar (petite bulle circulaire)
  storyImage?: string     // photo story (grande image slide 1)
}

const ConversationPreview = forwardRef<HTMLDivElement, ConversationPreviewProps>(
  function ConversationPreview({ conversation, profileImage, storyImage }, ref) {
    const storyImg = storyImage || profileImage  // fallback si pas de story séparée
    const storyReplyMessage = conversation[0]?.sender === 'lui' ? conversation[0] : null
    const restMessages = storyReplyMessage ? conversation.slice(1) : conversation

    return (
      <div
        ref={ref}
        id="conversation-preview"
        style={{
          width: 393,
          background: '#000000',
          overflow: 'hidden',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif',
        }}
      >
        {/* ── HEADER ────────────────────────────────────────── */}
        <div style={{
          background: '#000000',
          padding: '12px 16px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          borderBottom: '0.5px solid #2a2a2a',
        }}>
          {/* Chevron gauche */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, flexShrink: 0 }}>
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
            <span style={{ color: '#ffffff', fontWeight: 700, fontSize: 15, letterSpacing: '-0.2px' }}>
              claraaa.study
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>

          {/* Icônes droite : téléphone, vidéo, tag */}
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.1 1.16 2 2 0 012.08 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.41-.41a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
            </svg>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" />
            </svg>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
          </div>
        </div>

        {/* ── MESSAGES ──────────────────────────────────────── */}
        <div style={{
          background: '#000000',
          padding: '14px 10px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}>

          {/* Story reply group */}
          {storyReplyMessage && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, marginBottom: 6 }}>

              {/* Label "Vous avez répondu à sa story" */}
              <span style={{
                color: '#888',
                fontSize: 12,
                marginRight: 4,
                marginBottom: 2,
              }}>
                Vous avez répondu à sa story
              </span>

              {/* Photo story */}
              <div style={{
                width: 136,
                height: 172,
                borderRadius: 18,
                overflow: 'hidden',
                flexShrink: 0,
              }}>
                <img
                  src={storyImg}
                  alt="Story"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>

              {/* Bulle texte d'accroche */}
              <div style={{
                background: '#8935f0',
                color: '#fff',
                padding: '10px 16px',
                borderRadius: 22,
                maxWidth: '75%',
                wordBreak: 'break-word',
                fontSize: 15,
                lineHeight: 1.4,
              }}>
                {storyReplyMessage.message}
              </div>
            </div>
          )}

          {/* Reste de la conversation */}
          {restMessages.map((msg, idx) => {
            const isSent = msg.sender === 'lui'
            const prevMsg = restMessages[idx - 1]
            const nextMsg = restMessages[idx + 1]
            const isFirstInGroup = !prevMsg || prevMsg.sender !== msg.sender
            const isLastInGroup = !nextMsg || nextMsg.sender !== msg.sender
            const isSolo = isFirstInGroup && isLastInGroup
            const S = 6  // petit rayon pour les coins intérieurs du groupe

            // Calcul border-radius selon position dans le groupe
            // Reçus (gauche) : le côté gauche se "resserre" entre messages consécutifs
            // Envoyés (droite) : le côté droit se "resserre"
            let borderRadius: string
            if (isSolo) {
              borderRadius = '22px'
            } else if (isSent) {
              if (isFirstInGroup)      borderRadius = `22px 22px ${S}px 22px`  // bas-droite petit
              else if (isLastInGroup)  borderRadius = `22px ${S}px 22px 22px`  // haut-droite petit
              else                     borderRadius = `22px ${S}px ${S}px 22px` // haut+bas droite petits
            } else {
              if (isFirstInGroup)      borderRadius = `22px 22px 22px ${S}px`  // bas-gauche petit
              else if (isLastInGroup)  borderRadius = `${S}px 22px 22px 22px`  // haut-gauche petit
              else                     borderRadius = `${S}px 22px 22px ${S}px` // haut+bas gauche petits
            }

            return (
              <div key={idx} style={{ marginBottom: isLastInGroup ? 6 : 2 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: isSent ? 'flex-end' : 'flex-start',
                  gap: 6,
                }}>
                  {/* Avatar elle — visible seulement sur le dernier du groupe */}
                  {!isSent && (
                    isLastInGroup ? (
                      <img
                        src={profileImage}
                        alt="elle"
                        style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                      />
                    ) : (
                      <div style={{ width: 26, flexShrink: 0 }} />
                    )
                  )}

                  <div style={{
                    padding: '10px 16px',
                    borderRadius,
                    maxWidth: '70%',
                    wordBreak: 'break-word',
                    fontSize: 15,
                    lineHeight: 1.4,
                    ...(isSent
                      ? { background: '#8935f0', color: '#fff' }
                      : { background: '#262626', color: '#fff' }
                    ),
                  }}>
                    {msg.message}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── BARRE DE SAISIE ────────────────────────────────── */}
        <div style={{
          background: '#000000',
          borderTop: '0.5px solid #2a2a2a',
          padding: '10px 14px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          {/* Champ texte */}
          <div style={{
            flex: 1,
            border: '1px solid #333',
            borderRadius: 22,
            padding: '8px 16px',
            color: '#555',
            fontSize: 14,
            background: '#000',
          }}>
            Votre message...
          </div>

          {/* Micro */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
            <path d="M19 10v2a7 7 0 01-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>

          {/* Image */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>

          {/* + */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
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
