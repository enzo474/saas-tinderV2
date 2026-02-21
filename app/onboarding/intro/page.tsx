import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function OnboardingIntro() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-4 py-12">
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(230,57,70,0.08), transparent 60%)' }}
      />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <h1 className="font-montserrat font-black text-white text-4xl md:text-6xl mb-6 leading-tight">
          Bienvenue sur<br />
          <span style={{
            background: 'linear-gradient(135deg, #E63946, #FF4757)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Crushmaxxing
          </span>
        </h1>
        <p className="text-text-secondary text-lg md:text-xl mb-10 leading-relaxed">
          Marre d&apos;être ignoré sur les apps de&nbsp;dating&nbsp;?<br />On va régler ça. Ensemble.
        </p>

        <Link
          href="/onboarding/step/1"
          className="btn-primary text-lg"
        >
          C&apos;est parti ! →
        </Link>

        <p className="text-text-tertiary text-sm mt-6">
          5 minutes • Des résultats qui changent tout
        </p>
      </div>
    </div>
  )
}
