import Link from 'next/link'
import { ArrowLeft, Clock } from 'lucide-react'

const GIRL_NAMES: Record<string, string> = {
  '1': 'Léa',
  '2': 'Clara',
  '3': 'Victoria',
}

export default function ChatPage({ params }: { params: { girlId: string } }) {
  const name = GIRL_NAMES[params.girlId] ?? `Girl #${params.girlId}`

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className="rounded-2xl p-10 text-center border"
        style={{ background: '#1A1A1A', borderColor: '#2A2A2A' }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-5"
          style={{ background: '#252525', border: '2px solid #FF8C42' }}
        >
          <Clock size={28} style={{ color: '#FF8C42' }} />
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">
          Chat avec {name}
        </h2>
        <p className="text-sm mb-2" style={{ color: '#9da3af' }}>
          🚧 Fonctionnalité en construction
        </p>
        <p className="text-xs mb-8" style={{ color: '#555' }}>
          Le chat interactif avec l'IA sera disponible en Phase 3
        </p>

        <Link
          href="/game/training"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: 'rgba(255,140,66,0.15)', border: '1px solid rgba(255,140,66,0.4)', color: '#FF8C42' }}
        >
          <ArrowLeft size={16} />
          Retour au Training
        </Link>
      </div>
    </div>
  )
}
