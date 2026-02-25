import Link from 'next/link'

const FEATURES = [
  {
    icon: '💬',
    title: 'Analyse de conversations & images',
    desc: 'Compatible avec iMessage, Tinder, Hinge, Instagram, Snapchat...',
  },
  {
    icon: '✍️',
    title: 'Écris manuellement',
    desc: 'Parfait pour Snapchat : écris ta conversation sans screenshot',
  },
  {
    icon: '✨',
    title: 'Générateur de disquettes',
    desc: 'Engage la conversation facilement grâce à nos meilleures disquettes',
  },
  {
    icon: '🏆',
    title: 'Mode Entraînement',
    desc: "Entraîne ton football avec nos IA avant de passer aux vraies conversations",
  },
  {
    icon: '🎯',
    title: 'Ultra Personnalisé',
    desc: 'Ajoute des infos sur ton crush et des mots-clés spécifiques',
  },
]

export default function OnboardingFonctionnalites() {
  return (
    <div className="ob-bg" style={{ minHeight: '100dvh', justifyContent: 'flex-end' }}>
      <div className="ob-card" style={{ borderRadius: '2rem 2rem 0 0', minHeight: '82dvh' }}>
        <div className="text-center mb-6">
          <h2 className="ob-title-lg">Fonctionnalités</h2>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          {FEATURES.map(f => (
            <div key={f.title} className="ob-feature-item">
              <div className="ob-feature-icon">{f.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm mb-0.5" style={{ color: '#1C1C1E' }}>{f.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: '#888' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto">
          <Link href="/onboarding/comparaison" className="ob-btn">
            Continuer
          </Link>
        </div>
      </div>
    </div>
  )
}
