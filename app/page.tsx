'use client'

import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()

  const handleCTA = () => {
    router.push('/onboarding-test-2')
  }

  return (
    <div
      style={{
        background: '#0A0A0A',
        minHeight: '100vh',
        color: '#fff',
        fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
        overflowX: 'hidden',
      }}
    >
      {/* Ambient gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(230,57,70,0.09), transparent 55%)',
          zIndex: 0,
        }}
      />

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="relative flex items-center justify-between px-6 py-4 max-w-5xl mx-auto" style={{ zIndex: 20 }}>
        <span
          className="font-extrabold text-xl"
          style={{
            background: 'linear-gradient(135deg, #E63946, #FF4757)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Crushmaxxing
        </span>
        <button
          onClick={handleCTA}
          className="text-sm font-semibold px-4 py-2 rounded-xl border transition-all hover:bg-white/5"
          style={{ borderColor: '#2A2A2A', color: '#9da3af' }}
        >
          Commencer →
        </button>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center text-center px-4 pt-8 pb-20" style={{ zIndex: 10 }}>

        {/* Stats bar */}
        <div
          className="flex items-stretch rounded-full border mb-10"
          style={{ borderColor: '#2A2A2A', background: '#111111', overflow: 'hidden' }}
        >
          {[
            { value: '+1 500', label: 'UTILISATEURS' },
            { value: '4.9★', label: 'SATISFACTION' },
          ].map((stat, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center px-5 py-3"
              style={{ borderRight: i < 1 ? '1px solid #2A2A2A' : 'none' }}
            >
              <span className="font-extrabold text-sm text-white">{stat.value}</span>
              <span className="text-xs" style={{ color: '#6b7280' }}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* H1 */}
        <h1 className="font-extrabold text-4xl sm:text-5xl leading-tight mb-5 max-w-lg">
          Débloque Ton{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #E63946, #FF8FAB)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Charisme Naturel
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base max-w-sm mb-8" style={{ color: '#9da3af', lineHeight: '1.75' }}>
          L&apos;IA qui génère des accroches personnalisées basées sur son profil pour obtenir plus de réponses
        </p>

        {/* CTA */}
        <button
          onClick={handleCTA}
          className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base mb-5 transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #E63946, #FF4757)',
            color: '#fff',
            boxShadow: '0 0 50px rgba(230,57,70,0.25)',
          }}
        >
          🎯 Commencer Mon Évaluation Gratuite →
        </button>

        {/* Trust */}
        <div className="flex items-center gap-3 text-xs" style={{ color: '#6b7280' }}>
          <span>✓ Gratuit</span>
          <span>·</span>
          <span>✓ 2 minutes</span>
          <span>·</span>
          <span>✓ Sans carte bancaire</span>
        </div>
      </section>

      {/* ── Press / Médias ─────────────────────────────────────────── */}
      <section className="relative px-4 pb-20" style={{ zIndex: 10 }}>
        <div className="max-w-2xl mx-auto">

          {/* Label */}
          <div className="flex justify-center mb-5">
            <span
              className="text-xs font-semibold tracking-widest px-4 py-2 rounded-full border"
              style={{ borderColor: '#2A2A2A', color: '#6b7280', background: '#111111' }}
            >
              VU DANS LES MÉDIAS
            </span>
          </div>

          {/* Title */}
          <h2 className="font-extrabold text-2xl sm:text-3xl text-center mb-10">
            Recommandé par les{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #E63946, #FF8FAB)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Meilleurs Médias
            </span>
          </h2>

          {/* Scrolling logos */}
          <div className="overflow-hidden mb-10">
            <div className="landing-scroll-track flex gap-12 whitespace-nowrap">
              {['TikTok', 'Instagram', 'Le Monde', 'Konbini', 'TikTok', 'Instagram', 'Le Monde', 'Konbini'].map(
                (logo, i) => (
                  <span key={i} className="font-extrabold text-xl inline-block" style={{ color: '#3A3A3A' }}>
                    {logo}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { quote: "Ça change la vie pour les messages Tinder, j'ai beaucoup plus de réponses qu'avant", author: 'Lucas' },
              { quote: "Simple et efficace, ça fonctionne bien, j'en suis content", author: 'Thomas' },
              { quote: "Enfin un outil qui marche vraiment", author: 'Alex' },
            ].map((card, i) => (
              <div
                key={i}
                className="flex flex-col p-5 rounded-2xl border"
                style={{ background: '#111111', borderColor: '#1F1F1F' }}
              >
                <div className="text-3xl font-bold mb-3" style={{ color: '#E63946', lineHeight: 1 }}>"</div>
                <p className="font-bold text-sm text-white flex-1 mb-4">{card.quote}</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(230,57,70,0.15)', color: '#E63946' }}>
                    {card.author[0]}
                  </div>
                  <span className="text-xs font-semibold" style={{ color: '#9da3af' }}>{card.author}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              '✓ Sans carte bancaire',
              '✓ Données sécurisées',
              '✓ Essai gratuit',
              '✓ +1 500 utilisateurs satisfaits',
              '✓ 4.9/5 de satisfaction',
              '✓ Accroches personnalisées',
            ].map((badge) => (
              <div
                key={badge}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold"
                style={{ background: '#0F0F0F', borderColor: '#1F1F1F', color: '#9da3af' }}
              >
                <span style={{ color: '#E63946' }}>{badge.slice(0, 1)}</span>
                <span>{badge.slice(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social Proof ───────────────────────────────────────────── */}
      <section className="relative px-4 pb-6" style={{ zIndex: 10 }}>
        <div className="max-w-sm mx-auto">
          <div
            className="flex items-center gap-3 p-4 rounded-2xl border"
            style={{ background: '#111111', borderColor: '#1F1F1F' }}
          >
            <div className="text-lg flex-shrink-0">⭐⭐⭐⭐⭐</div>
            <p className="text-sm" style={{ color: '#9da3af', lineHeight: '1.5' }}>
              <span className="font-bold text-white">Plus de 1 500 utilisateurs</span> ont obtenu plus de réponses sur les applis de rencontres
            </p>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ─────────────────────────────────────────────── */}
      <section className="relative px-4 py-16" style={{ zIndex: 10 }}>
        <div className="max-w-sm mx-auto">
          <div
            className="rounded-3xl border p-8 text-center"
            style={{ background: '#111111', borderColor: '#1F1F1F' }}
          >
            <h2 className="font-extrabold text-2xl leading-tight mb-4">
              Prêt à Transformer Ta{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #E63946, #FF8FAB)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Vie Amoureuse ?
              </span>
            </h2>
            <p className="text-sm mb-6" style={{ color: '#9da3af', lineHeight: '1.75' }}>
              Rejoins plus de 1 500 utilisateurs qui ont déjà découvert leur superpouvoir sur les applis de rencontres
            </p>
            <button
              onClick={handleCTA}
              className="w-full py-4 rounded-2xl font-bold text-base mb-5 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #E63946, #FF4757)',
                color: '#fff',
                boxShadow: '0 0 40px rgba(230,57,70,0.2)',
              }}
            >
              🚀 Faire le Quiz Gratuit Maintenant →
            </button>
            <div className="flex items-center justify-center gap-3 text-xs" style={{ color: '#6b7280' }}>
              <span>🔒 100% Privé</span>
              <span>·</span>
              <span>⏱ Quiz 2 Min</span>
              <span>·</span>
              <span>✓ Toutes les Applis</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer
        className="relative px-6 py-10 text-center"
        style={{ borderTop: '1px solid #1A1A1A', zIndex: 10 }}
      >
        <div className="max-w-sm mx-auto">
          {/* Social icons */}
          <div className="flex justify-center gap-3 mb-6">
            {[
              { label: 'Instagram', svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg> },
              { label: 'TikTok', svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/></svg> },
              { label: 'X', svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
              { label: 'YouTube', svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
            ].map((s) => (
              <button
                key={s.label}
                aria-label={s.label}
                className="w-10 h-10 rounded-full flex items-center justify-center border transition-all hover:border-[#E63946] hover:text-[#E63946]"
                style={{ borderColor: '#2A2A2A', color: '#6b7280', background: '#111111' }}
              >
                {s.svg}
              </button>
            ))}
          </div>

          {/* Legal links */}
          <div className="flex justify-center flex-wrap gap-4 mb-5">
            {[
              { label: 'Support', href: '#' },
              { label: 'CGU', href: '/terms' },
              { label: 'Confidentialité', href: '/privacy' },
              { label: 'Remboursement', href: '#' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs transition-colors hover:text-white"
                style={{ color: '#6b7280' }}
              >
                {link.label}
              </a>
            ))}
          </div>

          <p className="text-xs mb-1" style={{ color: '#4b5563' }}>
            © 2026 Crushmaxxing. Tous droits réservés.
          </p>
          <p className="text-xs" style={{ color: '#4b5563' }}>
            <span style={{ color: '#9da3af' }}>Crushmaxxing®</span> est une marque déposée.
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes landing-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .landing-scroll-track {
          animation: landing-scroll 22s linear infinite;
        }
      `}</style>
    </div>
  )
}
