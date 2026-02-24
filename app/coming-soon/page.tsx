import Link from 'next/link'

export default function ComingSoonPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: '#0A0A0A' }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-10 text-center border"
        style={{ background: '#1A1A1A', borderColor: '#2A2A2A' }}
      >
        {/* Icon */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6"
          style={{ background: 'rgba(230,57,70,0.1)', border: '2px solid rgba(230,57,70,0.3)' }}
        >
          🔒
        </div>

        <h1
          className="font-montserrat text-2xl font-bold text-white mb-3"
        >
          Bientôt disponible
        </h1>
        <p className="text-sm mb-2" style={{ color: '#9da3af' }}>
          Cette fonctionnalité est en cours de développement.
        </p>
        <p className="text-xs mb-8" style={{ color: '#555' }}>
          Reviens bientôt pour découvrir les Photos IA et toutes les nouvelles fonctionnalités.
        </p>

        <Link
          href="/game"
          className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-white font-semibold text-sm transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
        >
          Retour au Dashboard
        </Link>
      </div>
    </div>
  )
}
