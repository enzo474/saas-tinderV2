'use client'

import { useState, RefObject } from 'react'
import type { ConversationMessage } from './ConversationGenerator'

interface ExportCarouselProps {
  conversationId?: string
  conversation: ConversationMessage[]
  profileImage: string
  previewRef: RefObject<HTMLDivElement | null>
}

const W = 393      // largeur slide
const PAD = 12     // padding horizontal
const S = 6        // petit radius pour groupes consécutifs

function getBubbleRadius(isSent: boolean, isFirst: boolean, isLast: boolean): string {
  if (isFirst && isLast) return '22px'
  if (isSent) {
    if (isFirst)    return `22px 22px ${S}px 22px`
    if (isLast)     return `22px ${S}px 22px 22px`
    return          `22px ${S}px ${S}px 22px`
  } else {
    if (isFirst)    return `22px 22px 22px ${S}px`
    if (isLast)     return `${S}px 22px 22px 22px`
    return          `${S}px 22px 22px ${S}px`
  }
}

function buildBubble(msg: ConversationMessage, isFirst: boolean, isLast: boolean, profileImage: string): string {
  const isSent = msg.sender === 'lui'
  const radius = getBubbleRadius(isSent, isFirst, isLast)
  const bg = isSent ? '#8935f0' : '#262626'
  const marginBottom = isLast ? '8' : '2'

  if (isSent) {
    return `
      <div style="display:flex;justify-content:flex-end;margin-bottom:${marginBottom}px;">
        <div style="background:${bg};color:#fff;padding:10px 16px;border-radius:${radius};max-width:70%;word-break:break-word;font-size:15px;line-height:1.4;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text',sans-serif;">
          ${msg.message}
        </div>
      </div>`
  } else {
    const avatar = isLast
      ? `<img src="${profileImage}" style="width:26px;height:26px;border-radius:50%;object-fit:cover;flex-shrink:0;" />`
      : `<div style="width:26px;flex-shrink:0;"></div>`
    return `
      <div style="display:flex;align-items:flex-end;gap:6px;margin-bottom:${marginBottom}px;">
        ${avatar}
        <div style="background:${bg};color:#fff;padding:10px 16px;border-radius:${radius};max-width:70%;word-break:break-word;font-size:15px;line-height:1.4;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text',sans-serif;">
          ${msg.message}
        </div>
      </div>`
  }
}

function buildMessagesHtml(messages: ConversationMessage[], profileImage: string): string {
  return messages.map((msg, idx) => {
    const prev = messages[idx - 1]
    const next = messages[idx + 1]
    const isFirst = !prev || prev.sender !== msg.sender
    const isLast = !next || next.sender !== msg.sender
    return buildBubble(msg, isFirst, isLast, profileImage)
  }).join('')
}

// Slide 1 : story reply (label + image + premier message)
function buildStorySlide(storyMessage: ConversationMessage, profileImage: string): string {
  return `
    <div style="width:${W}px;background:#000;padding:${PAD}px;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text',sans-serif;">
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;margin-bottom:8px;">
        <span style="color:#888;font-size:12px;margin-right:4px;">Vous avez répondu à sa story</span>
        <div style="width:136px;height:172px;border-radius:18px;overflow:hidden;">
          <img src="${profileImage}" style="width:100%;height:100%;object-fit:cover;display:block;" />
        </div>
        <div style="background:#8935f0;color:#fff;padding:10px 16px;border-radius:22px;max-width:75%;word-break:break-word;font-size:15px;line-height:1.4;">
          ${storyMessage.message}
        </div>
      </div>
    </div>`
}

// Slide 2 : story image + accroche + première réponse de elle
function buildStoryWithReplySlide(storyMessage: ConversationMessage, replyMessage: ConversationMessage, profileImage: string): string {
  return `
    <div style="width:${W}px;background:#000;padding:${PAD}px;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text',sans-serif;">
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;margin-bottom:8px;">
        <span style="color:#888;font-size:12px;margin-right:4px;">Vous avez répondu à sa story</span>
        <div style="width:136px;height:172px;border-radius:18px;overflow:hidden;">
          <img src="${profileImage}" style="width:100%;height:100%;object-fit:cover;display:block;" />
        </div>
        <div style="background:#8935f0;color:#fff;padding:10px 16px;border-radius:22px;max-width:75%;word-break:break-word;font-size:15px;line-height:1.4;">
          ${storyMessage.message}
        </div>
      </div>
      <div style="display:flex;align-items:flex-end;gap:6px;margin-top:4px;">
        <img src="${profileImage}" style="width:26px;height:26px;border-radius:50%;object-fit:cover;flex-shrink:0;" />
        <div style="background:#262626;color:#fff;padding:10px 16px;border-radius:22px;max-width:70%;word-break:break-word;font-size:15px;line-height:1.4;">
          ${replyMessage.message}
        </div>
      </div>
    </div>`
}

// Slides suivants : juste les messages sur fond noir
function buildRegularSlide(messages: ConversationMessage[], profileImage: string): string {
  const content = buildMessagesHtml(messages, profileImage)
  return `
    <div style="width:${W}px;background:#000;padding:${PAD}px;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text',sans-serif;">
      ${content}
    </div>`
}

export default function ExportCarousel({
  conversationId,
  conversation,
  profileImage,
  previewRef,
}: ExportCarouselProps) {
  const [exportingPng, setExportingPng] = useState(false)
  const [exportingCarousel, setExportingCarousel] = useState(false)

  const exportAsImage = async () => {
    if (!previewRef.current) return
    setExportingPng(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: '#000',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      } as Parameters<typeof html2canvas>[1])
      const link = document.createElement('a')
      link.download = `conversation-${conversationId || Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Export PNG error:', err)
    } finally {
      setExportingPng(false)
    }
  }

  const exportAsCarousel = async () => {
    setExportingCarousel(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()

      // Identifier le premier message (story reply)
      const hasStoryReply = conversation[0]?.sender === 'lui'
      const storyMsg = hasStoryReply ? conversation[0] : null
      const rest = hasStoryReply ? conversation.slice(1) : conversation

      // Construire les slides HTML
      const slidesHtml: string[] = []

      if (storyMsg) {
        // Slide 1 : story + accroche
        slidesHtml.push(buildStorySlide(storyMsg, profileImage))

        // Slide 2 : story + accroche + première réponse (si elle existe)
        if (rest[0]) {
          slidesHtml.push(buildStoryWithReplySlide(storyMsg, rest[0], profileImage))
          // Reste à partir de la 2ème réponse, par échanges de 2
          for (let i = 1; i < rest.length; i += 2) {
            slidesHtml.push(buildRegularSlide(rest.slice(i, i + 2), profileImage))
          }
        }
      } else {
        // Pas de story reply — slides de 2 messages
        for (let i = 0; i < conversation.length; i += 2) {
          slidesHtml.push(buildRegularSlide(conversation.slice(i, i + 2), profileImage))
        }
      }

      // Render chaque slide avec html2canvas
      for (let i = 0; i < slidesHtml.length; i++) {
        const wrapper = document.createElement('div')
        wrapper.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;'
        wrapper.innerHTML = slidesHtml[i]
        document.body.appendChild(wrapper)
        const slideEl = wrapper.firstElementChild as HTMLElement

        const canvas = await html2canvas(slideEl, {
          backgroundColor: '#000',
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
        } as Parameters<typeof html2canvas>[1])
        document.body.removeChild(wrapper)

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/png')
        })
        zip.file(`slide-${String(i + 1).padStart(2, '0')}.png`, blob)
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const link = document.createElement('a')
      link.download = `carousel-${conversationId || Date.now()}.zip`
      link.href = URL.createObjectURL(zipBlob)
      link.click()
    } catch (err) {
      console.error('Export carousel error:', err)
    } finally {
      setExportingCarousel(false)
    }
  }

  const btnStyle = (loading: boolean, color: string): React.CSSProperties => ({
    flex: 1,
    padding: '14px 16px',
    background: loading ? '#222' : color,
    border: 'none',
    borderRadius: 14,
    color: '#fff',
    fontSize: 14,
    fontWeight: 700,
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.6 : 1,
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  })

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <button onClick={exportAsImage} disabled={exportingPng} style={btnStyle(exportingPng, '#1a1a2e')}>
        {exportingPng ? <><Spinner /> Export...</> : '📸 Image PNG'}
      </button>
      <button onClick={exportAsCarousel} disabled={exportingCarousel} style={btnStyle(exportingCarousel, '#0a0a1a')}>
        {exportingCarousel ? <><Spinner /> ZIP...</> : '📱 Carrousel ZIP'}
      </button>
    </div>
  )
}

function Spinner() {
  return (
    <span style={{
      width: 16, height: 16,
      border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: '#fff',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      display: 'inline-block',
    }} />
  )
}
