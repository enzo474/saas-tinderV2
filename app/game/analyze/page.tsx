import Link from 'next/link'
import { ArrowLeft, Clock } from 'lucide-react'

export default function AnalyzePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div
        className="rounded-2xl p-10 text-center border"
        style={{ background: '#1A1A1A', borderColor: '#2A2A2A' }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: '#252525', border: '2px solid #E63946' }}
        >
          <Clock size={28} style={{ color: '#E63946' }} />
        </div>

        <h2 className="font-montserrat text-2xl font-bold text-white mb-3">
          Analyse de messages
        </h2>
        <p className="text-sm mb-2" style={{ color: '#9da3af' }}>
          🚧 Fonctionnalité en construction
        </p>
        <p className="text-xs mb-8" style={{ color: '#555' }}>
          L'analyse de tes conversations Tinder sera disponible prochainement
        </p>

        <Link
          href="/game"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: 'rgba(230,57,70,0.1)',
            border: '1px solid rgba(230,57,70,0.4)',
            color: '#E63946',
          }}
        >
          <ArrowLeft size={16} />
          Retour au Dashboard
        </Link>
      </div>
    </div>
  )
}
