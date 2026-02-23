'use client'

import { useState, RefObject } from 'react'
import type { ConversationMessage } from './ConversationGenerator'

interface ExportCarouselProps {
  conversationId?: string
  conversation: ConversationMessage[]
  profileImage: string
  previewRef: RefObject<HTMLDivElement | null>
}

const MESSAGES_PER_SLIDE = 4

export default function ExportCarousel({
  conversationId,
  conversation,
  profileImage,
  previewRef,
}: ExportCarouselProps) {
  const [exportingPng, setExportingPng] = useState(false)
  const [exportingCarousel, setExportingCarousel] = useState(false)

  const buildSlideHtml = (messages: ConversationMessage[]): string => {
    const bubbles = messages.map((msg) => {
      const isSent = msg.sender === 'lui'
      return `
        <div style="display:flex;flex-direction:column;align-items:${isSent ? 'flex-end' : 'flex-start'};gap:3px;margin-bottom:10px;">
          ${!isSent ? `<div style="display:flex;align-items:flex-end;gap:6px;">
            <img src="${profileImage}" style="width:24px;height:24px;border-radius:50%;object-fit:cover;flex-shrink:0;" />
            <div style="background:#3a3a3c;color:#fff;padding:10px 14px;border-radius:18px 18px 18px 4px;max-width:72%;word-break:break-word;font-size:15px;line-height:1.4;">${msg.message}</div>
          </div>` : `<div style="background:#0084ff;color:#fff;padding:10px 14px;border-radius:18px 18px 4px 18px;max-width:72%;word-break:break-word;font-size:15px;line-height:1.4;">${msg.message}</div>`}
          <span style="font-size:11px;color:#555;margin-left:${isSent ? 0 : 30}px;margin-right:${isSent ? 4 : 0}px;">${msg.timestamp}</span>
        </div>`
    }).join('')

    return `
      <div style="width:390px;background:#000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;border-radius:20px;overflow:hidden;">
        <div style="background:#1a1a1a;padding:14px 16px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #2a2a2a;">
          <span style="color:#fff;font-size:20px;opacity:0.7;margin-right:4px;">‹</span>
          <div style="position:relative;">
            <img src="${profileImage}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;" />
            <div style="position:absolute;bottom:1px;right:1px;width:11px;height:11px;background:#4CAF50;border-radius:50%;border:2px solid #1a1a1a;"></div>
          </div>
          <div>
            <div style="color:#fff;font-weight:700;font-size:15px;">Sarah</div>
            <div style="color:#888;font-size:12px;">En ligne</div>
          </div>
        </div>
        <div style="padding:16px 12px;">${bubbles}</div>
      </div>`
  }

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

      const slides: ConversationMessage[][] = []
      for (let i = 0; i < conversation.length; i += MESSAGES_PER_SLIDE) {
        slides.push(conversation.slice(i, i + MESSAGES_PER_SLIDE))
      }

      for (let i = 0; i < slides.length; i++) {
        const slideHtml = buildSlideHtml(slides[i])
        const wrapper = document.createElement('div')
        wrapper.style.cssText = 'position:fixed;left:-9999px;top:0;'
        wrapper.innerHTML = slideHtml
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
        {exportingPng ? (
          <>
            <Spinner />
            Export...
          </>
        ) : '📸 Image PNG'}
      </button>

      <button onClick={exportAsCarousel} disabled={exportingCarousel} style={btnStyle(exportingCarousel, '#0a0a1a')}>
        {exportingCarousel ? (
          <>
            <Spinner />
            ZIP...
          </>
        ) : '📱 Carrousel ZIP'}
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
