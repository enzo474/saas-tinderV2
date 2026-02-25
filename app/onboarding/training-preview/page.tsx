import Link from 'next/link'

const GIRLS = [
  { name: 'Léa', type: 'Sympa', badge: 'FACILE', badgeColor: '#22C55E' },
  { name: 'Clara', type: 'Exigeante', badge: 'MOYEN', badgeColor: '#F59E0B' },
  { name: 'Victoria', type: 'Froide', badge: 'DIFFICILE', badgeColor: '#EF4444' },
]

export default function OnboardingTrainingPreview() {
  return (
    <div className="ob-bg" style={{ minHeight: '100dvh', justifyContent: 'flex-end' }}>
      <div className="ob-card" style={{ borderRadius: '2rem 2rem 0 0', minHeight: '72dvh' }}>
        <div className="text-center mb-6">
          <h2 className="ob-title-lg mb-2">Mode Entraînement</h2>
          <p className="ob-subtitle">
            Entraîne ton football avec nos bots IA personnalisées !
          </p>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          {GIRLS.map(girl => (
            <div
              key={girl.name}
              className="flex items-center gap-4 px-4 py-3.5 rounded-2xl"
              style={{ background: '#1C1C1E' }}
            >
              {/* Avatar placeholder */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: '#2A2A2A',
                  border: `2px solid ${girl.badgeColor}40`,
                  fontSize: '1.3rem',
                }}
              >
                👤
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-white font-bold text-base">
                  {girl.name} - {girl.type}
                </span>
              </div>
              <span
                className="text-xs font-black px-3 py-1 rounded-full flex-shrink-0"
                style={{ background: girl.badgeColor, color: '#fff' }}
              >
                {girl.badge}
              </span>
            </div>
          ))}
        </div>

        <p className="text-center text-sm mb-6" style={{ color: '#999' }}>
          3 niveaux de difficulté
        </p>

        <div className="mt-auto">
          <Link href="/onboarding/personnalite" className="ob-btn">
            Continuer
          </Link>
        </div>
      </div>
    </div>
  )
}
