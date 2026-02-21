'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface IntroAnimationProps {
  children: React.ReactNode
}

export function IntroAnimation({ children }: IntroAnimationProps) {
  const [phase, setPhase]           = useState<'intro' | 'fading' | 'landing'>('intro')
  const [textMoved, setTextMoved]   = useState(false)
  const [showBefore, setShowBefore] = useState(false)
  const [showArrow, setShowArrow]   = useState(false)
  const [showAfter, setShowAfter]   = useState(false)

  const skipToLanding = useCallback(() => setPhase('landing'), [])

  useEffect(() => {
    const t: ReturnType<typeof setTimeout>[] = []
    t.push(setTimeout(() => setTextMoved(true),  1400))
    t.push(setTimeout(() => setShowBefore(true), 1700))
    t.push(setTimeout(() => setShowArrow(true),  2900))
    t.push(setTimeout(() => setShowAfter(true),  3300))
    t.push(setTimeout(() => setPhase('fading'),  5000))
    t.push(setTimeout(() => setPhase('landing'), 6000))
    return () => t.forEach(clearTimeout)
  }, [])

  if (phase === 'landing') return <>{children}</>

  return (
    <>
      {/* ── OVERLAY INTRO ── */}
      <div
        onClick={skipToLanding}
        style={{
          position: 'fixed',
          inset: 0,
          background: '#0A0A0A',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflow: 'hidden',
          cursor: 'pointer',
          animation: phase === 'fading' ? 'introFadeOut 1s ease-out forwards' : undefined,
        }}
      >
        {/* Glow subtil */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 40%, rgba(230,57,70,0.07), transparent 60%)',
        }} />

        {/* ── SPACER TOP : contrôle la position verticale du texte ── */}
        <div style={{
          flexShrink: 0,
          height: textMoved ? '7vh' : '35vh',
          transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />

        {/* ── TEXTE ── */}
        <div style={{ textAlign: 'center', pointerEvents: 'none', position: 'relative', zIndex: 2 }}>
          {/* Ligne 1 : "Arrête d'être" — blanc avec lueur rouge */}
          <div style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 900,
            fontSize: 'clamp(44px, 8vw, 82px)',
            color: '#FFFFFF',
            lineHeight: 1.1,
            margin: 0,
            whiteSpace: 'nowrap',
            opacity: 0,
            transform: 'scale(0.9)',
            animation: 'introWordAppear 0.6s ease-out 0s forwards',
            textShadow: '0 0 20px rgba(230,57,70,0.35), 0 0 50px rgba(230,57,70,0.2), 0 0 90px rgba(230,57,70,0.1)',
          }}>
            Arrête d&apos;être
          </div>

          {/* Ligne 2 : "ignoré" — rouge */}
          <div style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 900,
            fontSize: 'clamp(44px, 8vw, 82px)',
            color: '#E63946',
            lineHeight: 1.1,
            margin: 0,
            opacity: 0,
            transform: 'scale(0.9)',
            animation: 'introWordAppear 0.6s ease-out 0.8s forwards',
          }}>
            ignoré
          </div>
        </div>

        {/* ── GAP entre texte et images ── */}
        <div style={{
          flexShrink: 0,
          height: textMoved ? '5vh' : 0,
          transition: 'height 0.8s ease-out 0.3s',
        }} />

        {/* ── COMPARAISON ── */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 'clamp(20px, 4vw, 52px)',
          opacity: textMoved ? 1 : 0,
          transition: 'opacity 0.5s ease 0.2s',
        }}>

          {/* AVANT */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p style={{
              fontFamily: "'Montserrat', sans-serif", fontWeight: 700,
              fontSize: 11, color: '#6B7280', letterSpacing: '3px',
              marginBottom: 10,
            }}>
              AVANT
            </p>
            <div style={{
              width: 'clamp(140px, 18vw, 260px)',
              aspectRatio: '3/4',
              borderRadius: 14,
              border: '2px solid #2A2A2A',
              overflow: 'hidden',
              background: '#1A1A1A',
              opacity: 0,
              transform: 'translateY(40px)',
              animation: showBefore ? 'introSlideUp 0.8s ease-out forwards' : undefined,
            }}>
              <Image src="/avant.jpeg?v=2" alt="Avant" width={280} height={373}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} priority />
            </div>
            <p style={{
              fontFamily: "'Montserrat', sans-serif", fontWeight: 700,
              fontSize: 'clamp(13px, 2vw, 16px)', color: '#4B5563',
              marginTop: 10,
              opacity: showBefore ? 1 : 0, transition: 'opacity 0.5s ease 0.5s',
            }}>
              3.2 / 10
            </p>
          </div>

          {/* FLÈCHE */}
          <div style={{
            fontSize: 'clamp(26px, 3.5vw, 40px)',
            color: '#E63946',
            marginBottom: 'clamp(55px, 8vw, 90px)',
            flexShrink: 0,
            opacity: 0,
            transform: 'scale(0.5)',
            animation: showArrow ? 'introArrowPop 0.4s ease-out forwards' : undefined,
          }}>
            →
          </div>

          {/* APRÈS */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p style={{
              fontFamily: "'Montserrat', sans-serif", fontWeight: 700,
              fontSize: 11, color: '#6B7280', letterSpacing: '3px',
              marginBottom: 10,
            }}>
              APRÈS
            </p>
            <div style={{
              width: 'clamp(140px, 18vw, 260px)',
              aspectRatio: '3/4',
              borderRadius: 14,
              border: '2px solid #3A3A3A',
              overflow: 'hidden',
              background: '#1A1A1A',
              opacity: 0,
              transform: 'translateX(60px)',
              animation: showAfter ? 'introSlideFromRight 0.8s ease-out forwards' : undefined,
              boxShadow: showAfter ? '0 0 40px rgba(230,57,70,0.35), 0 0 80px rgba(230,57,70,0.15)' : undefined,
            }}>
              <Image src="/apres.jpeg?v=2" alt="Après" width={280} height={373}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} priority />
            </div>
            <p style={{
              fontFamily: "'Montserrat', sans-serif", fontWeight: 800,
              fontSize: 'clamp(13px, 2vw, 16px)', color: '#E63946',
              marginTop: 10,
              opacity: showAfter ? 1 : 0, transition: 'opacity 0.5s ease 0.5s',
            }}>
              8.4 / 10
            </p>
          </div>
        </div>

        {/* Skip hint */}
        <p style={{
          position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          fontFamily: "'Inter', sans-serif", fontSize: 11,
          color: '#333', letterSpacing: '2px', pointerEvents: 'none', whiteSpace: 'nowrap',
          opacity: showBefore ? 1 : 0, transition: 'opacity 0.6s ease',
        }}>
          CLIQUER POUR PASSER
        </p>
      </div>

      {/* Landing pré-rendue mais invisible */}
      <div style={{ visibility: 'hidden', position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {children}
      </div>
    </>
  )
}
