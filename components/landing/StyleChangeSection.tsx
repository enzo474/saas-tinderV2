'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

interface Props {
  generatedImg?: string
  face?: string | null
  style?: string | null
}

function ImgWithFallback({ src, alt, className, fallbackText }: {
  src: string; alt: string; className?: string; fallbackText?: string
}) {
  const [err, setErr] = useState(false)
  return err || !src ? (
    <div className={`bg-[#2A2A2A] flex flex-col items-center justify-center gap-2 ${className ?? ''}`}>
      <span className="text-text-tertiary text-xs text-center px-3">{fallbackText ?? 'Image'}</span>
    </div>
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} onError={() => setErr(true)} />
  )
}

type UploadStep = 'idle' | 'uploading' | 'done'

export function StyleChangeSection({ generatedImg, face, style }: Props) {
  // Col 1 — photo de base (fausse upload si pas de démo)
  const [baseStep, setBaseStep]         = useState<UploadStep>('idle')
  const [baseProgress, setBaseProgress] = useState(0)
  const [baseImg, setBaseImg]           = useState('')

  // Col 2 — photo de référence
  const [uploadStep, setUploadStep]         = useState<UploadStep>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)

  // Col 3 — résultat
  const [loading, setLoading]     = useState(false)
  const [resultImg, setResultImg] = useState('')
  const [progress, setProgress]   = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fakeUpload = (
    setStep: (s: UploadStep) => void,
    setProg: (fn: (p: number) => number) => void,
    onDone: () => void
  ) => {
    setStep('uploading')
    setProgValue(0)
    const iv = setInterval(() => {
      setProgValue(p => {
        if (p >= 100) { clearInterval(iv); setTimeout(onDone, 300); return 100 }
        return p + 5
      })
    }, 40)
    function setProgValue(v: number | ((p: number) => number)) {
      setProg(typeof v === 'function' ? v : () => v)
    }
  }

  const handleBaseUpload = () => {
    if (baseStep !== 'idle') return
    fakeUpload(
      setBaseStep,
      setBaseProgress,
      () => { setBaseStep('done'); setBaseImg('/style_1.jpeg') }
    )
  }

  const handleUpload = () => {
    if (uploadStep !== 'idle') return
    fakeUpload(
      setUploadStep,
      setUploadProgress,
      () => { setUploadStep('done'); triggerGeneration() }
    )
  }

  const triggerGeneration = () => {
    setLoading(true)
    setProgress(0)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(timerRef.current!)
          setTimeout(() => { setResultImg('/resultat_style_1.jpg'); setLoading(false) }, 300)
          return 100
        }
        return p + 3
      })
    }, 60)
  }

  const reset = () => {
    setBaseStep('idle'); setBaseProgress(0); setBaseImg('')
    setUploadStep('idle'); setUploadProgress(0)
    setLoading(false); setResultImg(''); setProgress(0)
  }

  const currentBaseImg = baseImg

  return (
    <section className="relative z-10 px-6 md:px-12 py-24">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 bg-red-primary/10 border border-red-primary/30 text-red-light text-sm font-semibold px-4 py-2 rounded-full mb-5">
            Change ton style
          </span>
          <h2 className="font-montserrat font-black text-4xl md:text-5xl text-white mb-4">
            Choisis ton propre style
          </h2>
          <p className="text-text-secondary text-lg">
            Même photo.{' '}
            <span style={{ background: 'linear-gradient(135deg,#E63946,#FF4757)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Juste les vêtements qui changent.
            </span>
          </p>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 items-start">

          {/* Col 1 — Photo de base */}
          <div>
            <p className="font-montserrat font-bold text-white text-sm uppercase tracking-widest mb-3">
              Ta photo actuelle
            </p>
            <div className="aspect-[3/4] rounded-2xl overflow-hidden border-2 border-border-primary">
              {currentBaseImg ? (
                <ImgWithFallback
                  src={currentBaseImg}
                  alt="Photo de base"
                  className="w-full h-full object-cover"
                />
              ) : (
                <button
                  onClick={handleBaseUpload}
                  disabled={baseStep !== 'idle'}
                  className={`w-full h-full flex flex-col items-center justify-center gap-3 p-6 transition-all duration-300 ${
                    baseStep === 'idle' ? 'bg-[#1A1A1A] hover:bg-red-primary/5 cursor-pointer' : 'bg-[#1A1A1A] cursor-default'
                  }`}
                >
                  {baseStep === 'idle' && (
                    <>
                      <div className="w-14 h-14 rounded-full flex items-center justify-center"
                           style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="font-montserrat font-bold text-white text-sm">Ajouter ma photo</p>
                        <p className="text-text-tertiary text-xs mt-1">Clique pour uploader</p>
                      </div>
                    </>
                  )}
                  {baseStep === 'uploading' && (
                    <>
                      <div className="w-10 h-10 border-4 border-border-primary border-t-red-primary rounded-full animate-spin" />
                      <div className="w-full px-6">
                        <p className="text-white text-sm font-semibold text-center mb-2">Upload en cours...</p>
                        <div className="w-full h-1.5 bg-border-primary rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-100"
                               style={{ width: `${baseProgress}%`, background: 'linear-gradient(90deg,#E63946,#FF4757)' }} />
                        </div>
                        <p className="text-text-tertiary text-xs text-center mt-1">{Math.round(baseProgress)}%</p>
                      </div>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Col 2 — Zone upload référence */}
          <div className="mt-10">
            <p className="font-montserrat font-bold text-white text-sm uppercase tracking-widest mb-3">
              Ta photo de référence
            </p>
            <p className="text-text-tertiary text-xs mb-4">Upload une photo pour changer la tenue</p>

            <button
              onClick={handleUpload}
              disabled={uploadStep !== 'idle'}
              className={`w-full aspect-[3/4] rounded-2xl border-2 border-dashed overflow-hidden flex flex-col items-center justify-center gap-4 transition-all duration-300 disabled:cursor-default ${
                uploadStep === 'idle'
                  ? 'border-border-primary bg-bg-primary hover:border-red-primary/60 hover:bg-red-primary/5 cursor-pointer'
                  : uploadStep === 'uploading'
                  ? 'border-red-primary/50 bg-red-primary/5'
                  : 'border-red-primary/60 bg-red-primary/10'
              }`}
            >
              {uploadStep === 'idle' && (
                <>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center"
                       style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <div className="text-center px-4">
                    <p className="font-montserrat font-bold text-white text-sm">Ajouter une photo</p>
                    <p className="text-text-tertiary text-xs mt-1">Clique pour uploader</p>
                  </div>
                </>
              )}

              {uploadStep === 'uploading' && (
                <>
                  <div className="w-10 h-10 border-4 border-border-primary border-t-red-primary rounded-full animate-spin" />
                  <div className="w-full px-8">
                    <p className="text-white text-sm font-semibold text-center mb-2">Upload en cours...</p>
                    <div className="w-full h-1.5 bg-border-primary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-100"
                        style={{ width: `${uploadProgress}%`, background: 'linear-gradient(90deg,#E63946,#FF4757)' }}
                      />
                    </div>
                    <p className="text-text-tertiary text-xs text-center mt-1">{Math.round(uploadProgress)}%</p>
                  </div>
                </>
              )}

              {uploadStep === 'done' && (
                <div className="relative w-full h-full">
                  <ImgWithFallback
                    src="/style_modif_1.jpeg"
                    alt="Photo de référence"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-center"
                       style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                    <button
                      onClick={e => { e.stopPropagation(); reset() }}
                      className="text-white text-xs font-semibold hover:text-red-light transition-colors"
                    >
                      ✓ Changer →
                    </button>
                  </div>
                </div>
              )}
            </button>
          </div>

          {/* Col 3 — Résultat */}
          <div>
            <p className="font-montserrat font-bold text-white text-sm uppercase tracking-widest mb-3">
              Nouveau look
            </p>
            <div className="aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all duration-500"
                 style={{ borderColor: resultImg ? 'rgba(230,57,70,0.5)' : 'var(--border-primary)' }}>
              {uploadStep === 'idle' && !loading && !resultImg && (
                <div className="w-full h-full bg-[#1A1A1A] flex flex-col items-center justify-center gap-3 p-6">
                  <div className="w-10 h-10 rounded-full border-2 border-dashed border-border-primary flex items-center justify-center">
                    <span className="text-text-tertiary text-lg">→</span>
                  </div>
                  <p className="text-text-tertiary text-xs text-center leading-relaxed">
                    Sélectionne un style<br />pour voir le résultat
                  </p>
                </div>
              )}

              {loading && (
                <div className="w-full h-full bg-[#1A1A1A] flex flex-col items-center justify-center gap-4 p-6">
                  <div className="w-10 h-10 border-4 border-border-primary border-t-red-primary rounded-full animate-spin" />
                  <p className="text-white text-sm font-semibold">Application du style...</p>
                  <div className="w-full max-w-[120px]">
                    <div className="w-full h-1.5 bg-border-primary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-100"
                        style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#E63946,#FF4757)' }}
                      />
                    </div>
                    <p className="text-text-tertiary text-xs text-center mt-1">{Math.round(progress)}%</p>
                  </div>
                </div>
              )}

              {!loading && resultImg && (
                <div className="relative w-full h-full" style={{ animation: 'fadeInScale 0.5s ease-out' }}>
                  <ImgWithFallback
                    src={resultImg}
                    alt="Nouveau style"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-center"
                       style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                    <p className="text-white text-xs font-semibold">Même personne, nouveau look</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-8 text-center">
          <p className="text-text-secondary text-lg mb-6">
            Génère autant de variations que tu veux avec <span className="text-white font-semibold">ton vrai visage</span>
          </p>
          <Link
            href="/auth"
            className="inline-flex items-center justify-center py-4 px-10 rounded-xl font-montserrat font-bold text-white text-lg transition-all duration-300 hover:-translate-y-1"
            style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)', boxShadow: '0 8px 24px rgba(230,57,70,0.35)' }}
          >
            Créer mes photos
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </section>
  )
}
