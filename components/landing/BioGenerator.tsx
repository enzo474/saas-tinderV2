'use client'

import { useState } from 'react'
import Link from 'next/link'

type Tone = 'direct' | 'drole' | 'mysterieux' | 'intrigant'

const TONES: { id: Tone; label: string }[] = [
  { id: 'direct',     label: 'Direct'     },
  { id: 'drole',      label: 'Drôle'      },
  { id: 'mysterieux', label: 'Mystérieux' },
  { id: 'intrigant',  label: 'Intrigant'  },
]

const BIOS: Record<Tone, string[]> = {
  direct: [
    'Je prends mon café noir, mes décisions rapides, et mes billets d\'avion en aller simple. Si tu cherches quelqu\'un qui planifie tout, swipe à gauche. Si tu veux juste voir où ça mène, on va bien s\'entendre.',
  ],
  drole: [
    'J\'ai une théorie : les meilleurs roadtrips c\'est ceux qui finissent nulle part au programme. Genre tu vises Bordeaux, tu finis au Portugal avec quelqu\'un que tu connaissais pas la veille. Bon après j\'avoue, mes roadtrips Tinder c\'est pareil — destination floue, mais le trajet promet.',
  ],
  mysterieux: [
    'J\'ai une règle pour les premiers verres : je choisis le lieu, tu choisis l\'heure de fin. Jusqu\'ici, personne n\'est partie à l\'heure prévue.',
  ],
  intrigant: [
    'J\'ai une théorie : les meilleures connexions commencent par un décalage horaire et finissent par un réveil qu\'on veut pas entendre.\n\nSi t\'es du genre à prendre l\'avion sur un coup de tête, on va bien s\'entendre. Sinon, je te convaincs en deux verres.',
  ],
}

export function BioGenerator() {
  const [tone, setTone]       = useState<Tone>('direct')
  const [bioIdx, setBioIdx]   = useState(0)
  const [fading, setFading]   = useState(false)

  const changeBio = (newTone: Tone) => {
    if (newTone === tone) {
      setFading(true)
      setTimeout(() => {
        setBioIdx(i => (i + 1) % BIOS[tone].length)
        setFading(false)
      }, 200)
    } else {
      setFading(true)
      setTimeout(() => {
        setTone(newTone)
        setBioIdx(0)
        setFading(false)
      }, 200)
    }
  }

  const currentBio = BIOS[tone][bioIdx]

  return (
    <section className="relative z-10 px-6 md:px-12 py-24">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 bg-red-primary/10 border border-red-primary/30 text-red-light text-sm font-semibold px-4 py-2 rounded-full mb-5">
            Bio IA
          </span>
          <h2 className="font-montserrat font-black text-4xl md:text-5xl text-white mb-4">
            Arrête de sous-estimer<br />
            <span style={{ background: 'linear-gradient(135deg,#E63946,#FF4757)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              ta bio
            </span>
          </h2>
          <p className="text-text-secondary text-lg">75% des mecs la négligent. C&apos;est pour ça qu&apos;ils<br />ont 0 match. Toi, fais la différence.</p>
        </div>

        {/* Card */}
        <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-8">
          {/* Tone selector */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {TONES.map(t => (
              <button
                key={t.id}
                onClick={() => changeBio(t.id)}
                className={`py-3 px-2 rounded-xl border-2 text-center transition-all duration-200 hover:-translate-y-0.5 ${
                  tone === t.id
                    ? 'border-red-primary bg-red-primary/15 shadow-lg shadow-red-primary/20'
                    : 'border-border-primary bg-bg-primary hover:border-red-primary/50'
                }`}
              >
                <p className={`font-inter font-semibold text-xs ${tone === t.id ? 'text-white' : 'text-text-secondary'}`}>
                  {t.label}
                </p>
              </button>
            ))}
          </div>

          {/* Bio display */}
          <div
            className="bg-bg-primary border border-border-primary rounded-xl p-6 mb-6 min-h-[120px] flex items-center"
            style={{ transition: 'opacity 0.2s ease', opacity: fading ? 0 : 1 }}
          >
            <div className="w-full">
              {/* App badge */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-[#FE3B49] flex items-center justify-center">
                  <span className="text-white text-xs font-black">T</span>
                </div>
                <span className="text-text-tertiary text-xs font-semibold uppercase tracking-wider">Aperçu Tinder</span>
                <div className="flex-1" />
                <button
                  onClick={() => changeBio(tone)}
                  className="text-text-tertiary hover:text-red-light text-xs transition-colors"
                >
                  Regénérer ↺
                </button>
              </div>

              {/* Bio text */}
              <p className="text-white text-sm leading-relaxed font-inter whitespace-pre-line">
                {currentBio}
              </p>

              {/* Char count */}
              <p className="text-text-tertiary text-xs mt-3 text-right">{currentBio.length} / 300 caractères</p>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-text-tertiary text-xs text-center mb-6">
            Aperçu d&apos;exemple. Tes 4 bios seront 100% personnalisées.
          </p>

          {/* CTA */}
          <Link
            href="/auth"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-montserrat font-bold text-white text-base md:text-lg transition-all duration-300 hover:-translate-y-1 whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)', boxShadow: '0 8px 24px rgba(230,57,70,0.35)' }}
          >
            Créer mes bios maintenant →
          </Link>
        </div>
      </div>
    </section>
  )
}
