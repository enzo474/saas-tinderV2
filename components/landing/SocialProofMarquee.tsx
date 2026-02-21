'use client'

const TESTIMONIALS = [
  {
    text: 'Ça faisait 6 mois que je swipais dans le vide. L\'analyse m\'a ouvert les yeux sur mes erreurs. Nouvelles photos, nouvelle bio, et boom : 8 matchs en 3 jours. Jamais eu ça.',
    stars: 5,
  },
  {
    text: 'J\'allais supprimer Tinder. Zéro match en 2 mois, j\'en pouvais plus. J\'ai testé par curiosité et là... 12 matchs la première semaine. Ça redonne confiance grave.',
    stars: 5,
  },
  {
    text: 'Je pensais que c\'était moi le problème. En fait c\'était juste mes photos de merde. 3 nouvelles photos IA + bio refaite = x4 plus de matchs. Simple mais efficace.',
    stars: 5,
  },
  {
    text: 'J\'y croyais pas trop au début. Mais les photos générées sont indétectables, même mes potes ont pas vu la différence. Premier date prévu ce week-end après 2 mois de galère.',
    stars: 5,
  },
  {
    text: 'Je doutais que l\'IA puisse faire des photos réalistes. Résultat : personne capte que c\'est généré et ça matche direct. J\'aurais dû le faire il y a 6 mois.',
    stars: 5,
  },
  {
    text: 'Passé de 2-3 matchs par mois à 15+ par semaine. L\'analyse a pointé tous mes fails : ordre des photos, bio générique, éclairage pourri. Corrigé en 10 minutes. Résultats instantanés.',
    stars: 5,
  },
  {
    text: 'J\'ai testé pendant 3 mois avec mes propres photos : 4 matchs. Avec les photos IA : 23 matchs en 3 semaines.',
    stars: 5,
  },
  {
    text: 'J\'osais même plus ouvrir Tinder tellement c\'était déprimant. Après l\'optimisation, j\'ai retrouvé confiance. Les résultats suivent direct. Ça change vraiment tout.',
    stars: 5,
  },
  {
    text: 'Je me sentais invisible sur les apps. Genre je swipe à droite, personne me voit. Maintenant c\'est l\'inverse : je dois choisir. La différence est énorme.',
    stars: 5,
  },
  {
    text: 'Pendant que mes potes galèrent encore avec leurs selfies miroir, moi j\'enchaine les dates. Les photos IA sont tellement mieux que ce que je pourrais faire moi-même. Ça vaut le coup.',
    stars: 5,
  },
]

// Double pour loop infini
const ITEMS = [...TESTIMONIALS, ...TESTIMONIALS]

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} style={{ color: '#E63946', fontSize: 12 }}>★</span>
      ))}
    </div>
  )
}

export function SocialProofMarquee() {
  return (
    <section className="relative z-10 py-16 overflow-hidden">
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 md:w-24 z-10"
           style={{ background: 'linear-gradient(to right, #0A0A0A, transparent)' }} />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 md:w-24 z-10"
           style={{ background: 'linear-gradient(to left, #0A0A0A, transparent)' }} />

      {/* Track */}
      <div className="flex gap-6 w-max" style={{ animation: 'marquee 38s linear infinite' }}>
        {ITEMS.map((t, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[260px] md:w-80 bg-gradient-to-br from-bg-secondary to-bg-tertiary border border-border-primary rounded-2xl p-5 hover:border-red-primary/40 transition-colors duration-300"
          >
            {/* Stars */}
            <Stars n={t.stars} />

            {/* Text */}
            <p className="font-inter text-white text-sm leading-relaxed mt-3 mb-4">
              &ldquo;{t.text}&rdquo;
            </p>

            {/* Footer */}
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-montserrat font-bold text-white text-xs flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
              >
                A
              </div>
              <p className="font-semibold text-text-secondary text-xs">Anonyme</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
