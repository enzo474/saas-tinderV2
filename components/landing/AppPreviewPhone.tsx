'use client'

import { useState } from 'react'

type AppTab = 'tinder' | 'fruitz' | 'hinge'

const APPS: { id: AppTab; label: string; color: string }[] = [
  { id: 'tinder',  label: 'Tinder',  color: '#FE3B49' },
  { id: 'fruitz',  label: 'Fruitz',  color: '#E63946' },
  { id: 'hinge',   label: 'Hinge',   color: '#E63946' },
]

// Placeholder gris si image absente
function PlaceholderImg({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [err, setErr] = useState(false)
  if (err || !src) {
    return (
      <div className={`bg-[#2A2A2A] flex items-center justify-center ${className ?? ''}`}>
        <span className="text-[#555] text-xs">📷</span>
      </div>
    )
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} onError={() => setErr(true)} />
}

// ── Tinder Screen ──────────────────────────────────────────────────────────
function TinderScreen() {
  const [idx, setIdx] = useState(0)
  const photos = [
    '/resultats/night-style.jpeg',
    '/resultats/urban-style.jpeg',
    '/resultats/fitness-style.jpeg',
    '/resultats/travel-style.jpeg',
    '/resultats/food-style.jpeg',
    '/resultats/hold-money.jpeg',
  ]

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    if (clickX > rect.width / 2) {
      setIdx(i => Math.min(i + 1, photos.length - 1))
    } else {
      setIdx(i => Math.max(i - 1, 0))
    }
  }

  return (
    <div className="relative w-full h-full bg-black cursor-pointer select-none" onClick={handleClick}>
      <PlaceholderImg src={photos[idx]} alt={`Tinder ${idx + 1}`} className="w-full h-full object-cover" />

      {/* Dots */}
      <div className="absolute top-3 left-0 right-0 flex justify-center gap-1 px-4">
        {photos.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i === idx ? '#fff' : 'rgba(255,255,255,0.4)' }}
          />
        ))}
      </div>

      {/* Infos bas */}
      <div className="absolute bottom-0 left-0 right-0 p-4"
           style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)' }}>
        <p className="font-montserrat font-black text-white text-xl leading-none">Lucas, 26</p>
        <p className="text-white/70 text-xs mt-1">📍 Paris · 3 km</p>
      </div>

      {/* Tap hint */}
      <div className="absolute top-1/2 left-2 -translate-y-1/2 opacity-40">
        <span className="text-white text-lg">‹</span>
      </div>
      <div className="absolute top-1/2 right-2 -translate-y-1/2 opacity-40">
        <span className="text-white text-lg">›</span>
      </div>
    </div>
  )
}

// ── Fruitz Screen ──────────────────────────────────────────────────────────
function FruitzScreen() {
  const photos = [
    '/resultats/summer-style.jpeg',
    '/resultats/tennis-style.jpeg',
    '/resultats/foot-style.jpeg',
    '/resultats/basket-style.jpeg',
    '/resultats/boy-lifestyle.jpeg',
    '/resultats/man-lifestyle.jpeg',
  ]
  return (
    <div className="w-full h-full overflow-y-auto bg-white" style={{ scrollbarWidth: 'none' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-3 py-2 bg-white border-b border-gray-100">
        <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200">
          <PlaceholderImg src={photos[0]} alt="avatar" className="w-full h-full object-cover" />
        </div>
        <span className="font-black text-base" style={{ color: '#E63946' }}>fruitz</span>
        <div className="text-gray-400 text-base">···</div>
      </div>

      {/* Photos */}
      {photos.map((src, i) => (
        <div key={i} className="aspect-[3/4] w-full relative">
          <PlaceholderImg src={src} alt={`fruitz ${i + 1}`} className="w-full h-full object-cover" />
          {i === 0 && (
            <div className="absolute bottom-0 left-0 right-0 p-3"
                 style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
              <p className="font-montserrat font-black text-white text-lg">Maxime, 28</p>
              <p className="text-white/70 text-xs">📍 Lyon · 2 km</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Hinge Screen ──────────────────────────────────────────────────────────
function HingeScreen() {
  const photos = [
    '/resultats/night-style.jpeg',
    '/resultats/urban-style.jpeg',
    '/resultats/fitness-style.jpeg',
    '/resultats/travel-style.jpeg',
    '/resultats/food-style.jpeg',
  ]
  return (
    <div className="w-full h-full overflow-y-auto bg-white" style={{ scrollbarWidth: 'none' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-3 py-2.5 bg-white border-b border-gray-100">
        <div className="w-5 h-5 text-[#E63946]">←</div>
        <p className="font-montserrat font-black text-base text-gray-900">Théo, 25</p>
        <div className="text-gray-400 text-base">···</div>
      </div>

      {/* First photo */}
      <div className="aspect-[4/5] w-full relative">
        <PlaceholderImg src={photos[0]} alt="hinge 1" className="w-full h-full object-cover" />
        <button className="absolute bottom-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md">
          <span style={{ color: '#E63946', fontSize: 16 }}>♥</span>
        </button>
      </div>

      {/* Info */}
      <div className="px-3 py-3 border-b border-gray-100">
        <p className="font-bold text-gray-900 text-sm">Théo · 25 ans</p>
        <p className="text-gray-500 text-xs">Homme · 180 cm · Paris</p>
      </div>

      {/* More photos + prompts */}
      {photos.slice(1).map((src, i) => (
        <div key={i}>
          <div className="aspect-[4/5] w-full relative">
            <PlaceholderImg src={src} alt={`hinge ${i + 2}`} className="w-full h-full object-cover" />
            <button className="absolute bottom-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md">
              <span style={{ color: '#E63946', fontSize: 16 }}>♥</span>
            </button>
          </div>
          {i === 0 && (
            <div className="mx-3 my-3 p-3 bg-gray-50 rounded-xl">
              <p className="text-gray-400 text-xs mb-1">Ma plus grande ambition :</p>
              <p className="font-bold text-gray-900 text-sm">Voyager dans 30 pays avant 30 ans.</p>
              <button className="mt-2 w-8 h-8 border border-gray-200 rounded-full flex items-center justify-center">
                <span style={{ color: '#E63946', fontSize: 14 }}>♥</span>
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────
export function AppPreviewPhone() {
  const [activeTab, setActiveTab] = useState<AppTab>('tinder')

  return (
    <section className="relative z-10 px-6 md:px-12 py-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 bg-red-primary/10 border border-red-primary/30 text-red-light text-sm font-semibold px-4 py-2 rounded-full mb-5">
            Multi-apps
          </span>
          <h2 className="font-montserrat font-black text-4xl md:text-5xl text-white mb-4">
            Domine sur toutes<br />
            <span style={{ background: 'linear-gradient(135deg,#E63946,#FF4757)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              les apps en même temps
            </span>
          </h2>
          <p className="text-text-secondary text-lg">Pendant que d&apos;autres galèrent sur une app,<br className="hidden md:block" /> toi tu cartonnes partout.</p>
        </div>

        <div className="flex flex-col items-center gap-10 md:flex-row md:items-start md:justify-center">
          {/* Tab selector */}
          <div className="flex md:flex-col gap-3">
            {APPS.map(app => (
              <button
                key={app.id}
                onClick={() => setActiveTab(app.id)}
                className={`px-5 py-3 rounded-xl font-montserrat font-bold text-sm transition-all duration-300 ${
                  activeTab === app.id
                    ? 'text-white shadow-lg'
                    : 'text-text-secondary hover:text-white border border-border-primary bg-bg-secondary'
                }`}
                style={activeTab === app.id ? { background: app.color, boxShadow: `0 8px 20px ${app.color}40` } : {}}
              >
                {app.label}
              </button>
            ))}
          </div>

          {/* Phone mockup */}
          <div className="relative flex-shrink-0 w-[212px] md:w-[265px]">
            {/* Phone shell */}
            <div
              className="relative rounded-[32px] overflow-hidden shadow-2xl w-[212px] h-[445px] md:w-[265px] md:h-[556px]"
              style={{
                border: '8px solid #1A1A1A',
                boxShadow: '0 0 0 1px #333, 0 32px 64px rgba(0,0,0,0.8)',
                background: '#0A0A0A',
              }}
            >
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-[#0A0A0A] rounded-b-xl z-20" />

              {/* Screen */}
              <div className="w-full h-full overflow-hidden rounded-[26px]">
                {activeTab === 'tinder' && <TinderScreen />}
                {activeTab === 'fruitz' && <FruitzScreen />}
                {activeTab === 'hinge' && <HingeScreen />}
              </div>
            </div>

            {/* Glow */}
            <div
              className="absolute -inset-6 rounded-full opacity-20 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse, ${APPS.find(a => a.id === activeTab)?.color ?? '#E63946'}, transparent 70%)`,
                transition: 'background 0.5s ease',
              }}
            />
          </div>

          {/* Description */}
          <div className="max-w-xs flex flex-col gap-4">
            <div className="bg-bg-secondary border border-border-primary rounded-xl p-4">
              <p className="font-montserrat font-bold text-white text-sm mb-1">Profil optimisé multi-plateformes</p>
              <p className="text-text-secondary text-xs leading-relaxed">Tes photos sont calibrées pour Tinder, Fruitz et Hinge. Résultats partout.</p>
            </div>
            <div className="bg-bg-secondary border border-border-primary rounded-xl p-4">
              <p className="font-montserrat font-bold text-white text-sm mb-1">Stratégie d&apos;ordre prouvée</p>
              <p className="text-text-secondary text-xs leading-relaxed">Photo principale = face. Puis lifestyle. On sait ce qui marche.</p>
            </div>
            <div className="bg-bg-secondary border border-border-primary rounded-xl p-4">
              <p className="font-montserrat font-bold text-white text-sm mb-1">x3 à x5 plus de matchs</p>
              <p className="text-text-secondary text-xs leading-relaxed">Résultat moyen de nos utilisateurs. Ça peut être toi aussi.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
