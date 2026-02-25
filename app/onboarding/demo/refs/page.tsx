import Link from 'next/link'

export default function OnboardingDemoRefs() {
  return (
    <div className="ob-bg" style={{ minHeight: '100dvh' }}>
      {/* Header */}
      <div className="px-6 pt-16 pb-4 text-center">
        <h2
          className="text-white font-black text-2xl leading-tight"
          style={{ fontFamily: 'var(--font-montserrat)', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
        >
          Obtiens des réponses<br />avec les refs du moment
        </h2>
      </div>

      {/* Démo conversation */}
      <div className="px-5 flex-1">
        <div className="rounded-2xl overflow-hidden" style={{ background: '#1A1A1A' }}>
          <div className="px-3 py-2 flex items-center gap-2 border-b" style={{ borderColor: '#2A2A2A' }}>
            <div className="w-6 h-6 rounded-full" style={{ background: '#333' }} />
            <span className="text-xs text-white/60">10:58</span>
            <span className="text-xs text-white/40 ml-auto">Vous avez répondu à sa story</span>
          </div>
          <div className="p-3 flex flex-col gap-2">
            <div className="flex justify-end">
              <div
                className="px-4 py-2.5 text-sm text-white rounded-2xl rounded-br-sm max-w-[75%]"
                style={{ background: '#6B5CE7' }}
              >
                salut j&apos;ai une question
              </div>
            </div>
            <div className="flex items-center gap-1.5 pl-2">
              <div className="w-6 h-6 rounded-full" style={{ background: '#2A2A2A' }} />
              <span className="text-xs" style={{ color: '#666' }}>?</span>
            </div>
          </div>
        </div>
      </div>

      {/* Réponse générée */}
      <div className="px-5 pt-4">
        <div
          className="px-5 py-4 rounded-2xl text-white font-semibold text-sm flex items-center gap-2"
          style={{ background: '#4A90E2', fontSize: '0.9375rem', lineHeight: 1.4 }}
        >
          <span>ta boulangerie recrute un nouveau pain ?</span>
          <span className="flex-shrink-0 text-xl">🥹</span>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-10 pt-6">
        <Link href="/onboarding/demo/style" className="ob-btn ob-btn-red">
          Continuer
        </Link>
      </div>
    </div>
  )
}
