'use client'

import { useState, RefObject } from 'react'
import type { ConversationMessage } from './ConversationGenerator'

interface ExportCarouselProps {
  conversationId?: string
  conversation: ConversationMessage[]
  profileImage: string   // avatar (petite bulle circulaire)
  storyImage?: string    // photo story (grande image slide 1)
  previewRef: RefObject<HTMLDivElement | null>
}

// ─── Constantes de rendu (@2x pour HD) ───────────────────────────────────────
const SC = 2           // scale factor
const W  = 393 * SC    // largeur canvas
const PH = 14 * SC     // padding horizontal
const PV = 16 * SC     // padding vertical
const FS = 15 * SC     // font size messages
const LH = FS * 1.45   // line height
const BP_H = 10 * SC   // bubble padding vertical
const BP_W = 16 * SC   // bubble padding horizontal
const BR  = 22 * SC    // bubble radius
const BR_S = 6 * SC    // bubble radius réduit (groupes)
const MAX_BUBBLE_W = Math.round(W * 0.70)  // 70% de la largeur
const AVATAR_SIZE = 26 * SC
const AVATAR_GAP  = 6 * SC
const MSG_GAP  = 2 * SC   // espace entre messages du même groupe
const GRP_GAP  = 6 * SC   // espace entre groupes différents

// ─── Utilitaires ─────────────────────────────────────────────────────────────

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => {
      // Fallback : cercle gris si l'image échoue
      const fallback = document.createElement('canvas')
      fallback.width = 100; fallback.height = 100
      const c = fallback.getContext('2d')!
      c.fillStyle = '#444'
      c.arc(50, 50, 50, 0, Math.PI * 2)
      c.fill()
      const i = new Image()
      i.src = fallback.toDataURL()
      i.onload = () => resolve(i)
    }
    img.src = src
  })
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  tl: number, tr: number, br: number, bl: number
) {
  // Clamp identique au comportement CSS : les rayons ne peuvent pas dépasser la moitié
  // de la plus petite dimension, sinon les arcs se chevauchent (bug visuel)
  const maxR = Math.min(w, h) / 2
  tl = Math.min(tl, maxR); tr = Math.min(tr, maxR)
  br = Math.min(br, maxR); bl = Math.min(bl, maxR)

  ctx.beginPath()
  ctx.moveTo(x + tl, y)
  ctx.lineTo(x + w - tr, y)
  ctx.arcTo(x + w, y,     x + w, y + tr, tr)
  ctx.lineTo(x + w, y + h - br)
  ctx.arcTo(x + w, y + h, x + w - br, y + h, br)
  ctx.lineTo(x + bl, y + h)
  ctx.arcTo(x,     y + h, x,     y + h - bl, bl)
  ctx.lineTo(x, y + tl)
  ctx.arcTo(x,     y,     x + tl, y,    tl)
  ctx.closePath()
}

function roundedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.save()
  roundedRect(ctx, x, y, w, h, r, r, r, r)
  ctx.clip()
  ctx.drawImage(img, x, y, w, h)
  ctx.restore()
}

// Dessine une bulle avec textBaseline='top' (appelé APRÈS avoir mis textBaseline='top' sur ctx)
// Retourne la hauteur totale de la bulle
function drawBubble(
  ctx: CanvasRenderingContext2D,
  text: string,
  isSent: boolean,
  isFirst: boolean,
  isLast: boolean,
  yStart: number,
  avatar: HTMLImageElement | null
): number {
  ctx.font = `${FS}px -apple-system, BlinkMacSystemFont, 'SF Pro Text', Helvetica, sans-serif`
  const innerW = MAX_BUBBLE_W - BP_W * 2
  const lines  = wrapText(ctx, text, innerW)

  // Avec textBaseline='top' : hauteur réelle = (n-1)*LH + FS + 2*BP_H
  const bH = (lines.length - 1) * LH + FS + BP_H * 2
  const bW = Math.min(MAX_BUBBLE_W, Math.max(...lines.map(l => ctx.measureText(l).width)) + BP_W * 2)

  // Position X
  const avatarSlot = !isSent ? AVATAR_SIZE + AVATAR_GAP : 0
  const bX = isSent ? W - PH - bW : PH + avatarSlot

  // Border radius selon groupe
  let tl = BR, tr = BR, br = BR, bl = BR
  if (isSent) {
    if (!isFirst) tr = BR_S
    if (!isLast)  br = BR_S
  } else {
    if (!isFirst) tl = BR_S
    if (!isLast)  bl = BR_S
  }

  // Fond bulle
  ctx.fillStyle = isSent ? '#8935f0' : '#262626'
  roundedRect(ctx, bX, yStart, bW, bH, tl, tr, br, bl)
  ctx.fill()

  // Texte (textBaseline='top' → y est le haut de chaque ligne)
  ctx.fillStyle = '#ffffff'
  lines.forEach((line, i) => {
    ctx.fillText(line, bX + BP_W, yStart + BP_H + i * LH)
  })

  // Avatar (last du groupe reçu)
  if (!isSent && isLast && avatar) {
    const ax = PH
    const ay = yStart + bH - AVATAR_SIZE
    ctx.save()
    ctx.beginPath()
    ctx.arc(ax + AVATAR_SIZE / 2, ay + AVATAR_SIZE / 2, AVATAR_SIZE / 2, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(avatar, ax, ay, AVATAR_SIZE, AVATAR_SIZE)
    ctx.restore()
  }

  return bH
}

// ─── Génération d'un slide canvas ─────────────────────────────────────────────
// Stratégie : render sur un canvas 3000px de haut, on track y en temps réel,
// puis on recadre exactement à la hauteur du contenu + padding. Rien ne sera coupé.

// Hauteur minimum : 220px @1x (440 @2x) pour éviter les slides trop "fins"
// On ne centre PAS verticalement — le contenu part toujours du haut
const MIN_SLIDE_H = 220 * SC

async function makeSlideBlob(
  messages: ConversationMessage[],
  avatar: HTMLImageElement,
  storyData?: { msg: ConversationMessage; img: HTMLImageElement; withReply?: ConversationMessage }
): Promise<Blob> {
  const TALL = 3000 * SC
  const canvas  = document.createElement('canvas')
  canvas.width  = W
  canvas.height = TALL
  const ctx     = canvas.getContext('2d')!

  // textBaseline='top' : le y passé à fillText est le HAUT de la ligne
  ctx.textBaseline = 'top'
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, W, TALL)

  const PV_STORY = 28 * SC  // padding vertical plus grand pour les story slides
  let y = storyData ? PV_STORY : PV

  if (storyData) {
    // Label "Vous avez répondu à sa story"
    const LABEL_FS = 12 * SC
    ctx.font      = `${LABEL_FS}px -apple-system, BlinkMacSystemFont, 'SF Pro Text', Helvetica, sans-serif`
    ctx.fillStyle = '#888888'
    const labelTxt = 'Vous avez répondu à sa story'
    const labelW   = ctx.measureText(labelTxt).width
    ctx.fillText(labelTxt, W - PH - labelW, y)
    y += LABEL_FS + 14 * SC  // plus d'espace entre label et image

    // Image story alignée à droite
    const imgW = 136 * SC
    const imgH = 172 * SC
    roundedImage(ctx, storyData.img, W - PH - imgW, y, imgW, imgH, 18 * SC)
    y += imgH + 16 * SC  // plus d'espace entre image et bulle

    // Bulle accroche (lui)
    const accH = drawBubble(ctx, storyData.msg.message, true, true, true, y, null)
    y += accH + 16 * SC

    // Réponse elle (slide 2 uniquement)
    if (storyData.withReply) {
      const repH = drawBubble(ctx, storyData.withReply.message, false, true, true, y, avatar)
      y += repH + GRP_GAP
    }
  }

  for (let i = 0; i < messages.length; i++) {
    const msg     = messages[i]
    const prev    = messages[i - 1]
    const next    = messages[i + 1]
    const isFirst = !prev || prev.sender !== msg.sender
    const isLast  = !next || next.sender !== msg.sender
    const isSent  = msg.sender === 'lui'
    const bH = drawBubble(ctx, msg.message, isSent, isFirst, isLast, y, avatar)
    y += bH + (isLast ? GRP_GAP : MSG_GAP)
  }

  // Hauteur finale = contenu + padding bas, avec minimum
  const rawH   = y + (storyData ? PV_STORY : PV)
  const finalH = Math.max(Math.ceil(rawH), MIN_SLIDE_H)

  const cropped  = document.createElement('canvas')
  cropped.width  = W
  cropped.height = finalH
  const cc = cropped.getContext('2d')!
  cc.fillStyle = '#000000'
  cc.fillRect(0, 0, W, finalH)
  // Pas de centrage vertical : contenu part toujours du haut
  cc.drawImage(canvas, 0, 0, W, Math.ceil(rawH), 0, 0, W, Math.ceil(rawH))

  return new Promise(resolve => cropped.toBlob(b => resolve(b!), 'image/png'))
}

// ─── Composant ────────────────────────────────────────────────────────────────

export default function ExportCarousel({
  conversationId,
  conversation,
  profileImage,
  storyImage,
  previewRef,
}: ExportCarouselProps) {
  const [exportingPng,      setExportingPng]      = useState(false)
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
      const JSZip    = (await import('jszip')).default
      const zip      = new JSZip()
      const avatar   = await loadImg(profileImage)
      const storyImg = storyImage ? await loadImg(storyImage) : avatar  // story séparée ou fallback avatar

      const hasStory = conversation[0]?.sender === 'lui'
      const storyMsg = hasStory ? conversation[0] : null
      const rest     = hasStory ? conversation.slice(1) : conversation

      let slideIdx = 0

      if (storyMsg) {
        // Slide 1 : story + accroche (utilise storyImg pour la grande photo)
        const blob1 = await makeSlideBlob([], avatar, { msg: storyMsg, img: storyImg })
        zip.file(`slide-${String(++slideIdx).padStart(2, '0')}.png`, blob1)

        // Slide 2 : story + accroche + 1ère réponse
        if (rest[0]) {
          const blob2 = await makeSlideBlob([], avatar, { msg: storyMsg, img: storyImg, withReply: rest[0] })
          zip.file(`slide-${String(++slideIdx).padStart(2, '0')}.png`, blob2)

          // Slides suivants : 1 échange (2 messages) par slide
          for (let i = 1; i < rest.length; i += 2) {
            const blob = await makeSlideBlob(rest.slice(i, i + 2), avatar)
            zip.file(`slide-${String(++slideIdx).padStart(2, '0')}.png`, blob)
          }
        }
      } else {
        for (let i = 0; i < conversation.length; i += 2) {
          const blob = await makeSlideBlob(conversation.slice(i, i + 2), avatar)
          zip.file(`slide-${String(++slideIdx).padStart(2, '0')}.png`, blob)
        }
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

  const btn = (loading: boolean, color: string): React.CSSProperties => ({
    flex: 1, padding: '14px 16px', background: loading ? '#222' : color,
    border: 'none', borderRadius: 14, color: '#fff', fontSize: 14, fontWeight: 700,
    cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
    transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  })

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <button onClick={exportAsImage}      disabled={exportingPng}      style={btn(exportingPng,      '#1a1a2e')}>
        {exportingPng      ? <><Spinner /> Export...</> : '📸 Image PNG'}
      </button>
      <button onClick={exportAsCarousel}   disabled={exportingCarousel} style={btn(exportingCarousel, '#0a0a1a')}>
        {exportingCarousel ? <><Spinner /> ZIP...</>    : '📱 Carrousel ZIP'}
      </button>
    </div>
  )
}

function Spinner() {
  return <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
}
