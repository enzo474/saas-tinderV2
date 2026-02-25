import Link from 'next/link'

export default function OnboardingStart() {
  return (
    <div className="ob-bg" style={{ minHeight: '100dvh' }}>
      {/* Zone mascotte haut */}
      <div className="flex items-center justify-center pt-16 pb-4 px-8 flex-1">
        <div
          className="w-40 h-40 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '3px dashed rgba(255,255,255,0.4)',
          }}
        >
          <span className="text-white/60 text-sm font-semibold text-center px-4">
            Mascotte
          </span>
        </div>
      </div>

      {/* Card bas */}
      <div className="ob-card" style={{ borderRadius: '2rem 2rem 0 0' }}>
        <div className="text-center mb-6">
          <h2 className="ob-title-lg mb-3">
            Créons ensemble<br />ton profil
          </h2>
          <p className="ob-subtitle">
            Cela va nous permettre d&apos;optimiser au<br />mieux l&apos;app pour toi
          </p>
        </div>

        <div className="mt-auto pt-4">
          <Link href="/onboarding/nom" className="ob-btn">
            C&apos;est parti !
          </Link>
        </div>
      </div>
    </div>
  )
}
