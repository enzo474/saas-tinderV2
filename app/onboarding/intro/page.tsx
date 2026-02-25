import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function OnboardingIntro() {
  return (
    <div className="ob-bg items-center justify-between" style={{ minHeight: '100dvh' }}>
      {/* Contenu haut */}
      <div className="flex flex-col items-center justify-center flex-1 px-6 pt-20 pb-8 text-center">
        <p
          className="text-white/90 font-semibold text-base mb-3"
          style={{ fontFamily: 'var(--font-montserrat)' }}
        >
          Bienvenue sur
        </p>
        <h1
          className="text-white font-black mb-4"
          style={{
            fontFamily: 'var(--font-montserrat)',
            fontSize: 'clamp(3rem, 14vw, 4.5rem)',
            lineHeight: 1.05,
            letterSpacing: '-1px',
            textShadow: '0 2px 12px rgba(0,0,0,0.2)',
          }}
        >
          Crushmaxxing
        </h1>
        <p
          className="text-white font-bold text-lg leading-tight"
          style={{ fontFamily: 'var(--font-montserrat)' }}
        >
          L&apos;app qui te transforme en vrai<br />
          tombeur de disquettes.
        </p>
      </div>

      {/* Zone mascotte (placeholder) */}
      <div className="flex items-end justify-center px-8 pb-0" style={{ flex: '0 0 auto' }}>
        <div
          className="w-48 h-48 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '3px dashed rgba(255,255,255,0.4)',
          }}
        >
          <span className="text-white/60 text-sm font-semibold text-center px-4">
            Mascotte
          </span>
        </div>
      </div>

      {/* CTA bas */}
      <div className="px-6 pb-10 pt-6">
        <Link
          href="/onboarding/start"
          className="ob-btn ob-btn-red"
          style={{ fontSize: '1.05rem', letterSpacing: '0.01em' }}
        >
          Commencer
        </Link>
        <div
          className="w-24 h-1 mx-auto mt-6 rounded-full"
          style={{ background: 'rgba(0,0,0,0.3)' }}
        />
      </div>
    </div>
  )
}
