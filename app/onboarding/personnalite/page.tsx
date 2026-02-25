import Link from 'next/link'

export default function OnboardingPersonnalite() {
  return (
    <div className="ob-bg" style={{ minHeight: '100dvh', justifyContent: 'flex-end' }}>
      <div className="ob-card" style={{ borderRadius: '2rem 2rem 0 0', minHeight: '60dvh' }}>
        <div className="text-center mb-6">
          <h2 className="ob-title-lg mb-3">
            Personnalisons maintenant<br />ton style de réponses
          </h2>
          <p className="ob-subtitle">
            Réponds à quelques questions pour que l&apos;on adapte Crushmaxxing à ta personnalité !
          </p>
        </div>

        {/* Mascotte placeholder */}
        <div className="flex items-center justify-center py-6 flex-1">
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center"
            style={{
              background: '#F2F2F2',
              border: '3px dashed #DDD',
            }}
          >
            <span className="text-sm font-semibold text-gray-400 text-center px-3">
              Mascotte
            </span>
          </div>
        </div>

        <div className="mt-auto">
          <Link href="/onboarding/personnalite/q/1" className="ob-btn">
            C&apos;est parti !
          </Link>
        </div>
      </div>
    </div>
  )
}
