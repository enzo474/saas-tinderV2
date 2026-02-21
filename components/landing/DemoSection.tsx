'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// ── Types ──────────────────────────────────────────────────────────────────
type Face     = 'a' | 'b' | 'c'
type Style    = 'night' | 'urban' | 'sport' | 'travel' | 'food' | 'business' | 'beach' | 'tennis' | 'foot' | 'basket' | 'lifestyle-boy' | 'lifestyle-man'
type DemoStep = 'pick-face' | 'pick-style' | 'generating' | 'result'

// ── Data ───────────────────────────────────────────────────────────────────
const STYLES: { id: Style; label: string; img: string; result: string }[] = [
  { id: 'night',         label: 'Night',         img: 'https://pnmajvnkvyjlkbscwsto.supabase.co/storage/v1/object/public/style-previews/_%20(56).jpeg',                        result: '/resultats/night-style.jpg'     },
  { id: 'urban',         label: 'Urban',         img: 'https://pnmajvnkvyjlkbscwsto.supabase.co/storage/v1/object/public/style-previews/_%20(3).jpeg',                         result: '/resultats/urban-style.jpeg'    },
  { id: 'sport',         label: 'Sport',         img: 'https://pnmajvnkvyjlkbscwsto.supabase.co/storage/v1/object/public/style-previews/_%20(54).jpeg',                        result: '/resultats/fitness-style.jpeg'  },
  { id: 'travel',        label: 'Travel',        img: 'https://pnmajvnkvyjlkbscwsto.supabase.co/storage/v1/object/public/style-previews/_%20(78).jpeg',                        result: '/resultats/travel-style.jpeg'   },
  { id: 'food',          label: 'Food',          img: 'https://pnmajvnkvyjlkbscwsto.supabase.co/storage/v1/object/public/style-previews/Insta_%20wolfalexanderl%20(1).jpeg',   result: '/resultats/food-style.jpeg'     },
  { id: 'business',      label: 'Business',      img: 'https://pnmajvnkvyjlkbscwsto.supabase.co/storage/v1/object/public/style-previews/_%20(17).jpeg',                        result: '/resultats/hold-money.jpeg'     },
  { id: 'beach',         label: 'Beach',         img: 'https://pnmajvnkvyjlkbscwsto.supabase.co/storage/v1/object/public/style-previews/_%20(28).jpeg',                        result: '/resultats/summer-style.jpeg'   },
  { id: 'tennis',        label: 'Tennis',        img: 'https://pnmajvnkvyjlkbscwsto.supabase.co/storage/v1/object/public/style-previews/_%20(33).jpeg',                        result: '/resultats/tennis-style.jpeg'   },
  { id: 'foot',          label: 'Foot',          img: 'https://pnmajvnkvyjlkbscwsto.supabase.co/storage/v1/object/public/style-previews/_%20(41).jpeg',                        result: '/resultats/foot-style.jpeg'     },
  { id: 'basket',        label: 'Basket',        img: 'https://pnmajvnkvyjlkbscwsto.supabase.co/storage/v1/object/public/style-previews/Kansas%20High%20School%20Basketball.jpeg', result: '/resultats/basket-style.jpg' },
  { id: 'lifestyle-boy', label: 'Lifestyle Boy', img: 'https://pnmajvnkvyjlkbscwsto.supabase.co/storage/v1/object/public/style-previews/cusbclo.jpeg',                         result: '/resultats/boy-lifestyle.jpg'   },
  { id: 'lifestyle-man', label: 'Lifestyle Man', img: 'https://pnmajvnkvyjlkbscwsto.supabase.co/storage/v1/object/public/style-previews/_%20(18).jpeg',                        result: '/resultats/man-lifestyle.jpg'   },
]

// Placeholder gris si image absente
function ImgWithFallback({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [err, setErr] = useState(false)
  return err || !src ? (
    <div className={`bg-[#2A2A2A] flex items-center justify-center ${className ?? ''}`}>
      <span className="text-text-tertiary text-xs">Image</span>
    </div>
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} onError={() => setErr(true)} />
  )
}

// ── Props ───────────────────────────────────────────────────────────────────
interface DemoSectionProps {
  onResult?: (generatedImg: string, face: Face, style: Style) => void
  styleImages?: Record<string, string>
}

// ── Component ──────────────────────────────────────────────────────────────
export function DemoSection({ onResult, styleImages = {} }: DemoSectionProps = {}) {
  const [demoStep, setDemoStep]           = useState<DemoStep>('pick-face')
  const [face, setFace]                   = useState<Face | null>(null)
  const [style, setStyle]                 = useState<Style | null>(null)
  const [progress, setProgress]           = useState(0)
  const [generatedImg, setGeneratedImg]   = useState('')

  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Demo generation ──────────────────────────────────────────────────────
  const startGeneration = () => {
    if (!face || !style) return
    setDemoStep('generating')
    setProgress(0)
    progressRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(progressRef.current!)
          setTimeout(() => {
            const selectedStyle = STYLES.find(s => s.id === style)
            const img = selectedStyle?.result ?? `/resultats/${style}.jpg`
            setGeneratedImg(img)
            setDemoStep('result')
            onResult?.(img, face!, style!)
          }, 400)
          return 100
        }
        return p + 3
      })
    }, 80)
  }

  const resetDemo = () => {
    setDemoStep('pick-face')
    setFace(null)
    setStyle(null)
    setProgress(0)
    setGeneratedImg('')
  }

  useEffect(() => () => { if (progressRef.current) clearInterval(progressRef.current) }, [])

  return (
    <>
      {/* ══════════════════════════════════════════════════
          SECTION DÉMO INTERACTIVE
      ══════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 md:px-12 py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-red-primary/10 border border-red-primary/30 text-red-light text-sm font-semibold px-4 py-2 rounded-full mb-5">
              Démo gratuite
            </span>
            <h2 className="font-montserrat font-black text-4xl md:text-5xl text-white mb-4">
              Teste le générateur<br />
              <span style={{ background: 'linear-gradient(135deg,#E63946,#FF4757)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                maintenant
              </span>
            </h2>
            <p className="text-text-secondary text-lg">100 % gratuit • Aucune inscription requise</p>
          </div>

          {/* Card */}
          <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-8">

            {/* ── ÉTAPE 1 : Visage unique ── */}
            {demoStep === 'pick-face' && (
              <div>
                <p className="font-montserrat font-bold text-white text-lg mb-2">Étape 1 : Choisis ton point de départ</p>
                <p className="text-text-secondary text-sm mb-6">Clique sur le profil de démo pour commencer</p>
                <div className="max-w-xs mx-auto">
                  <button
                    onClick={() => { setFace('a'); setDemoStep('pick-style') }}
                    className="group relative w-full rounded-xl overflow-hidden border-2 border-border-primary hover:border-red-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-primary/20"
                  >
                    <div className="aspect-[3/4]">
                      <ImgWithFallback
                        src="/avant.jpeg"
                        alt="Profil démo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <p className="font-montserrat font-bold text-white text-base">Utiliser ce profil →</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* ── ÉTAPE 2 : Choix du style ── */}
            {demoStep === 'pick-style' && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setDemoStep('pick-face')} className="text-text-tertiary hover:text-white text-sm transition-colors">← Retour</button>
                  <p className="font-montserrat font-bold text-white text-lg">2. Choisis ton style</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                  {STYLES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id === style ? null : s.id)}
                      className={`relative rounded-xl border-2 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 ${
                        style === s.id
                          ? 'border-red-primary shadow-lg shadow-red-primary/20'
                          : 'border-border-primary hover:border-red-primary/50'
                      }`}
                    >
                      <div className="aspect-square">
                        <ImgWithFallback src={styleImages[s.id] ?? s.img} alt={s.label} className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-1.5 text-center"
                           style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)' }}>
                        <p className="font-inter font-semibold text-white text-xs">{s.label}</p>
                      </div>
                      {style === s.id && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-primary rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <button
                  onClick={startGeneration}
                  disabled={!style}
                  className="w-full py-4 rounded-xl font-montserrat font-bold text-white text-lg transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: style ? 'linear-gradient(135deg, #E63946, #FF4757)' : '#2A2A2A',
                    boxShadow: style ? '0 8px 24px rgba(230,57,70,0.35)' : 'none',
                  }}
                >
                  Générer ma photo →
                </button>
              </div>
            )}

            {/* ── ÉTAPE 3 : Génération ── */}
            {demoStep === 'generating' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-6 border-4 border-border-primary border-t-red-primary rounded-full animate-spin" />
                <p className="font-montserrat font-bold text-white text-xl mb-2">Génération en cours...</p>
                <p className="text-text-secondary text-sm mb-6">L&apos;IA travaille sur ta photo</p>
                <div className="max-w-xs mx-auto">
                  <div className="w-full h-2 bg-border-primary rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full transition-all duration-150"
                      style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #E63946, #FF4757)' }}
                    />
                  </div>
                  <p className="text-text-tertiary text-sm">{Math.round(progress)} %</p>
                </div>
              </div>
            )}

            {/* ── ÉTAPE 4 : Résultat ── */}
            {demoStep === 'result' && (
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden border-2 border-red-primary/40 shadow-2xl shadow-red-primary/20 max-w-xs mx-auto">
                    <ImgWithFallback src={generatedImg} alt="Photo générée" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 bg-red-primary/10 border border-red-primary/30 text-red-light text-sm font-semibold px-3 py-1.5 rounded-full mb-4 self-start">
                    🔥 Voilà le résultat !
                  </div>
                  <h3 className="font-montserrat font-black text-white text-2xl mb-3 leading-tight">
                    C&apos;est ça la différence<br />
                    <span className="text-text-secondary font-semibold text-lg">entre photo éclatée et photo qui matche</span>
                  </h3>
                  <p className="text-text-secondary text-sm mb-5 leading-relaxed">
                    Tu viens de voir la transformation.<br />
                    Maintenant imagine avec <span className="text-white font-semibold">TON vrai visage.</span>
                  </p>
                  <ul className="space-y-2 mb-6">
                    {[
                      '+1200 combinaisons de style possible',
                      '12+ styles disponibles',
                      'Téléchargement HD',
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-white">
                        <span className="text-red-light font-bold">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/auth"
                    className="inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-montserrat font-bold text-white text-base transition-all duration-300 hover:-translate-y-1"
                    style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)', boxShadow: '0 8px 24px rgba(230,57,70,0.35)' }}
                  >
                    Transformer mes photos
                  </Link>
                  <button onClick={resetDemo} className="text-text-tertiary text-sm hover:text-white transition-colors mt-3 self-start">
                    Recommencer la démo →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
