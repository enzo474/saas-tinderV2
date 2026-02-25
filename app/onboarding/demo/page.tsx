import Link from 'next/link'

export default function OnboardingDemo() {
  return (
    <div className="ob-bg" style={{ minHeight: '100dvh', justifyContent: 'flex-end' }}>
      <div className="ob-card" style={{ borderRadius: '2rem 2rem 0 0', minHeight: '72dvh' }}>
        <div className="text-center mb-5">
          <h2 className="ob-title-lg mb-2">
            Test Crushmaxxing sur<br />une conversation
          </h2>
          <p className="ob-subtitle font-semibold" style={{ color: '#555' }}>
            Nous générons des réponses sur n&apos;importe quelles images
          </p>
        </div>

        {/* Démo conversation */}
        <div
          className="rounded-2xl overflow-hidden mb-5 flex-1"
          style={{ background: '#1A1A1A', minHeight: 180, maxHeight: 220 }}
        >
          <div className="px-3 py-2 flex items-center gap-2 border-b" style={{ borderColor: '#2A2A2A' }}>
            <div className="w-6 h-6 rounded-full" style={{ background: '#333' }} />
            <span className="text-xs text-white/60">10:58</span>
            <span className="text-xs text-white/40 ml-auto">Vous avez répondu à sa story</span>
          </div>
          <div className="p-3 flex flex-col gap-2">
            {/* Message envoyé */}
            <div className="flex justify-end">
              <div
                className="px-4 py-2.5 text-sm text-white rounded-2xl rounded-br-sm max-w-[75%]"
                style={{ background: '#6B5CE7' }}
              >
                salut j&apos;ai une question
              </div>
            </div>
            {/* Typage */}
            <div className="flex items-center gap-1.5 pl-2">
              <div className="w-6 h-6 rounded-full" style={{ background: '#2A2A2A' }} />
              <span className="text-xs" style={{ color: '#666' }}>?</span>
            </div>
          </div>
        </div>

        <Link href="/onboarding/demo/refs" className="ob-btn">
          Voir comment ça marche
        </Link>
      </div>
    </div>
  )
}
