import Link from 'next/link'

const ROWS = [
  'Analyse précises des conversations et stories',
  'Personnalisé pour la drague',
  'Langage et Styles de réponses adaptés',
  "Entraîné sur les Réfs actuelles",
  'Disquettes et techniques de drague mises à jour régulièrement',
  'Interface simple et rapide',
]

function CheckIcon({ ok }: { ok: boolean }) {
  return ok ? (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="#E63946" fillOpacity="0.12" />
      <path d="M6 10l3 3 5-5" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="#F5F5F5" />
      <path d="M7 7l6 6M13 7l-6 6" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function OnboardingComparaison() {
  return (
    <div className="ob-bg" style={{ minHeight: '100dvh', justifyContent: 'flex-end' }}>
      <div className="ob-card" style={{ borderRadius: '2rem 2rem 0 0', minHeight: '82dvh' }}>
        <div className="text-center mb-6">
          <h2 className="ob-title mb-2">
            Pourquoi Crushmaxxing plutôt qu&apos;une Autre IA ?
          </h2>
        </div>

        {/* Header tableau */}
        <div className="flex items-center mb-3 px-1">
          <div className="flex-1" />
          <div className="w-24 text-center font-black text-sm" style={{ color: '#E63946' }}>
            Crushmaxxing
          </div>
          <div className="w-20 text-center font-bold text-sm" style={{ color: '#999' }}>
            Autre IA
          </div>
        </div>

        {/* Ligne séparateur */}
        <div className="h-px mb-2" style={{ background: '#F0F0F0' }} />

        {/* Rows */}
        <div className="flex flex-col">
          {ROWS.map(row => (
            <div key={row} className="ob-compare-row">
              <p className="flex-1 text-xs leading-snug pr-2" style={{ color: '#555', fontWeight: 500 }}>
                {row}
              </p>
              <div className="w-24 flex justify-center">
                <CheckIcon ok={true} />
              </div>
              <div className="w-20 flex justify-center">
                <CheckIcon ok={false} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Link href="/auth" className="ob-btn ob-btn-red" style={{ fontSize: '1.05rem' }}>
            Commencer maintenant 🚀
          </Link>
        </div>
      </div>
    </div>
  )
}
