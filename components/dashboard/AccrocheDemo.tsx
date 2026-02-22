'use client'

import { useState, useRef } from 'react'
import { PresalePopup } from './PresalePopup'
import { CountdownTimer } from './CountdownTimer'

const DISPLAY_SLOTS = 50
const REAL_SLOTS = 200
const RATIO = REAL_SLOTS / DISPLAY_SLOTS

interface AccrocheDemoProps {
  presaleCount: number
}

const STYLES = ['Direct', 'Drôle', 'Mystérieux', 'Compliment'] as const
type StyleType = typeof STYLES[number]

const SIMULATED_RESULTS: Record<StyleType, { style: StyleType; message: string; score: string }[]> = {
  Direct: [
    { style: 'Direct', message: "J'ai vu que tu aimais la photographie, on devrait faire un shooting ensemble 📸", score: '89%' },
    { style: 'Direct', message: "T'as un truc qui me rend curieux dans ta bio, on en parle autour d'un café ?", score: '84%' },
    { style: 'Direct', message: "Entre passionnés d'aventure, je pense qu'on aurait plein de choses à se raconter.", score: '81%' },
  ],
  Drôle: [
    { style: 'Drôle', message: "Entre passionné(e) de voyage, on pourrait se raconter nos pires galères d'aéroport 😅", score: '92%' },
    { style: 'Drôle', message: "Ta photo avec le chien... c'est le tien ou tu l'as volé pour matcher ? 🐶", score: '88%' },
    { style: 'Drôle', message: "Je viens de lire ta bio 3 fois pour trouver un défaut. J'ai pas trouvé. C'est louche.", score: '85%' },
  ],
  Mystérieux: [
    { style: 'Mystérieux', message: "Ta bio m'intrigue... Raconte-moi l'histoire derrière ta photo en Patagonie", score: '85%' },
    { style: 'Mystérieux', message: "J'ai l'impression qu'on a un truc en commun. Mais je te le dirai seulement si tu réponds 👀", score: '82%' },
    { style: 'Mystérieux', message: "Il y a quelque chose dans tes photos qui dit que t'as une bonne histoire à raconter.", score: '79%' },
  ],
  Compliment: [
    { style: 'Compliment', message: "Ta passion pour [élément de sa bio] est vraiment rare, ça m'a sauté aux yeux 🙌", score: '87%' },
    { style: 'Compliment', message: "Honnêtement, ton profil est l'un des rares qui m'a donné envie d'écrire quelque chose de vrai.", score: '90%' },
    { style: 'Compliment', message: "La façon dont tu décris [ta passion] montre que t'es quelqu'un d'authentique. Rare.", score: '83%' },
  ],
}

export function AccrocheDemo({ presaleCount }: AccrocheDemoProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<StyleType>('Direct')
  const [mentionBio, setMentionBio] = useState(false)
  const [mentionPhoto, setMentionPhoto] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [showingResults, setShowingResults] = useState(false)
  const [showSkeleton, setShowSkeleton] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const displayCount = Math.min(Math.floor(presaleCount / RATIO), DISPLAY_SLOTS)
  const remaining = DISPLAY_SLOTS - displayCount

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setUploadedImage(reader.result as string)
      setShowSkeleton(true)
      setShowingResults(false)
      setTimeout(() => {
        setShowSkeleton(false)
        setShowingResults(true)
      }, 1500)
    }
    reader.readAsDataURL(file)
  }

  const handleGenerate = () => {
    setShowPopup(true)
  }

  const results = SIMULATED_RESULTS[selectedStyle]

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Bannière countdown urgence */}
        <div
          className="rounded-xl px-4 py-3 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-sm font-semibold text-center"
          style={{ background: 'linear-gradient(135deg, rgba(247,127,0,0.15), rgba(247,127,0,0.05))', border: '1px solid rgba(247,127,0,0.4)' }}
        >
          <span className="text-gold-primary">🔥 Offre -50% expire dans</span>
          <span className="font-montserrat font-bold text-lg text-white tabular-nums">
            <CountdownTimer variant="inline" color="#F77F00" />
          </span>
          <button
            onClick={() => setShowPopup(true)}
            className="px-4 py-1.5 rounded-lg text-xs font-bold text-black hover:scale-105 transition-transform"
            style={{ background: 'linear-gradient(135deg, #F77F00, #FFAA33)' }}
          >
            Réserver maintenant
          </button>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h1 className="font-montserrat font-bold text-white text-2xl md:text-4xl">Messages Accroche</h1>
              <span className="bg-gold-primary text-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Bientôt</span>
            </div>
            <p className="text-text-secondary text-sm md:text-base">L&apos;IA analyse le profil et génère les accroches parfaites pour matcher.</p>
          </div>
          <div className="flex-shrink-0">
            <div className="bg-gold-primary/10 border border-gold-primary/30 rounded-xl px-3 py-2 text-center">
              <p className="text-text-tertiary text-xs mb-0.5">Places restantes</p>
              <p className="font-montserrat font-bold text-gold-primary text-base md:text-lg">{remaining}/50</p>
            </div>
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-gold-primary/10 border border-gold-primary/30 rounded-xl p-4 md:p-5">
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">⚡</span>
            <div className="flex-1">
              {/* Ligne titre + bouton desktop */}
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-gold-light">Accès anticipé disponible</h3>
                <button
                  onClick={() => setShowPopup(true)}
                  className="hidden md:block flex-shrink-0 px-4 py-2 rounded-lg font-semibold text-sm text-black hover:scale-105 transition-transform"
                  style={{ background: 'linear-gradient(135deg, #F77F00, #FFAA33)' }}
                >
                  Réserver (-50%)
                </button>
              </div>
              <p className="text-text-secondary text-sm mt-1">
                Sois parmi les {remaining} dernières places. <strong className="text-gold-primary">-50% à vie</strong> tant que tu restes.
              </p>
              <div className="flex items-center justify-between mt-2 gap-3">
                <p className="text-xs text-text-tertiary">
                  ⏱ Expire dans{' '}
                  <span className="font-bold tabular-nums text-gold-primary">
                    <CountdownTimer variant="inline" color="#F77F00" />
                  </span>
                </p>
                {/* Bouton mobile */}
                <button
                  onClick={() => setShowPopup(true)}
                  className="md:hidden flex-shrink-0 px-3 py-1.5 rounded-lg font-semibold text-xs text-black hover:scale-105 transition-transform"
                  style={{ background: 'linear-gradient(135deg, #F77F00, #FFAA33)' }}
                >
                  Réserver (-50%)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Demo grid */}
        <div className="grid lg:grid-cols-2 gap-8">

          {/* LEFT */}
          <div className="space-y-5">

            {/* Upload */}
            <div className="card-large">
              <h3 className="font-montserrat font-bold text-white text-lg mb-5">1. Upload le profil à analyser</h3>

              {!uploadedImage ? (
                <label
                  className="block border-2 border-dashed border-border-primary rounded-2xl p-10 text-center cursor-pointer hover:border-gold-primary transition-colors duration-300 group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-3xl md:text-5xl mb-3 group-hover:scale-110 transition-transform">📱</div>
                  <p className="text-text-secondary mb-1">Drag & drop ou cliquez</p>
                  <p className="text-text-tertiary text-sm">Screenshot du profil Tinder/Bumble/Hinge</p>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              ) : (
                <div>
                  <img src={uploadedImage} alt="Preview profil" className="w-full rounded-xl border border-border-primary max-h-64 object-cover" />
                  <button
                    onClick={() => { setUploadedImage(null); setShowingResults(false); setShowSkeleton(false) }}
                    className="text-gold-primary text-sm font-medium mt-2 hover:text-gold-light transition-colors"
                  >
                    Changer l&apos;image
                  </button>
                </div>
              )}
            </div>

            {/* Style */}
            <div className="card-large">
              <h3 className="font-montserrat font-bold text-white text-lg mb-5">2. Personnalise ton approche</h3>

              <div className="mb-5">
                <label className="block text-text-secondary text-sm font-medium mb-3">Ton de l&apos;accroche</label>
                <div className="grid grid-cols-2 gap-2">
                  {STYLES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedStyle(s)}
                      className={`py-2.5 rounded-lg border-2 font-medium text-sm transition-all duration-200 ${
                        selectedStyle === s
                          ? 'border-gold-primary bg-gold-primary/10 text-gold-primary'
                          : 'border-border-primary text-text-secondary hover:border-gold-primary/50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() => setMentionBio(!mentionBio)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${mentionBio ? 'border-gold-primary bg-gold-primary' : 'border-border-primary'}`}
                  >
                    {mentionBio && <span className="text-black text-xs font-bold">✓</span>}
                  </div>
                  <span className="text-sm text-text-secondary group-hover:text-white transition-colors">Mentionner un élément de sa bio</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() => setMentionPhoto(!mentionPhoto)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${mentionPhoto ? 'border-gold-primary bg-gold-primary' : 'border-border-primary'}`}
                  >
                    {mentionPhoto && <span className="text-black text-xs font-bold">✓</span>}
                  </div>
                  <span className="text-sm text-text-secondary group-hover:text-white transition-colors">Référencer une de ses photos</span>
                </label>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleGenerate}
              className="w-full py-4 rounded-xl font-bold text-lg text-black flex items-center justify-center gap-2 hover:scale-[1.02] transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #F77F00, #FFAA33)', boxShadow: '0 8px 32px rgba(247,127,0,0.3)' }}
            >
              <span>✨</span>
              <span>Générer mes accroches</span>
            </button>
          </div>

          {/* RIGHT — Preview */}
          <div className="card-large h-fit lg:sticky lg:top-8">
            <h3 className="font-montserrat font-bold text-white text-lg mb-5">Aperçu des accroches générées</h3>

            {!uploadedImage && (
              <div className="h-64 md:h-80 flex flex-col items-center justify-center text-center text-text-tertiary">
                <div className="text-3xl md:text-5xl mb-3">💬</div>
                <p className="text-sm">Upload un screenshot de profil<br />pour voir la magie opérer</p>
              </div>
            )}

            {uploadedImage && showSkeleton && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-bg-tertiary border border-border-primary rounded-xl p-5 animate-pulse">
                    <div className="h-3 bg-border-primary rounded mb-3 w-1/4"></div>
                    <div className="h-3 bg-border-primary rounded mb-2 w-4/5"></div>
                    <div className="h-3 bg-border-primary rounded w-3/5"></div>
                  </div>
                ))}
              </div>
            )}

            {uploadedImage && showingResults && (
              <div className="space-y-3">
                {results.map((r, i) => (
                  <div
                    key={i}
                    className="bg-gold-primary/5 border-2 border-gold-primary/30 rounded-xl p-5 hover:border-gold-primary transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-gold-primary/20 text-gold-primary px-2.5 py-0.5 rounded-lg text-xs font-semibold">{r.style}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gold-primary font-bold text-sm">{r.score}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(r.message) }}
                          className="text-text-tertiary hover:text-gold-primary transition-colors opacity-0 group-hover:opacity-100"
                          title="Copier"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">{r.message}</p>
                  </div>
                ))}
                <p className="text-text-tertiary text-xs text-center pt-2">
                  Résultats simulés — Les vrais résultats seront encore meilleurs ✨
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <PresalePopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        feature="accroche"
        presaleCount={presaleCount}
      />
    </>
  )
}
