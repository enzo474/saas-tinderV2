'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Lock, RefreshCw } from 'lucide-react'

interface Girl {
  id: string
  name: string
  personality_type: string
  difficulty_level: number
  required_xp: number
  badge_color: string
  badge_text: string
  locked: boolean
}

export default function TrainingPage() {
  const [girls, setGirls] = useState<Girl[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/progression')
      .then(r => r.json())
      .then(d => { setGirls(d.girls ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const displayGirls: Girl[] = girls.length > 0 ? girls : [
    { id: '1', name: 'Léa', personality_type: 'Chill & Sympa', difficulty_level: 1, required_xp: 0, badge_color: '#22C55E', badge_text: 'FACILE', locked: false },
    { id: '2', name: 'Clara', personality_type: 'Sélective & Exigeante', difficulty_level: 2, required_xp: 100, badge_color: '#F59E0B', badge_text: 'MOYEN', locked: true },
    { id: '3', name: 'Victoria', personality_type: 'Froide & Désintéressée', difficulty_level: 3, required_xp: 300, badge_color: '#EF4444', badge_text: 'DIFFICILE', locked: true },
  ]

  return (
    <div className="px-5 pt-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h2
          className="text-white font-black text-2xl mb-1"
          style={{ fontFamily: 'var(--font-montserrat)', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
        >
          Entraîne ton football
        </h2>
        <p className="text-white/70 text-sm font-medium">
          Essaie d&apos;obtenir un date avec nos IA entraînées
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <RefreshCw size={28} className="animate-spin text-white" />
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-2 gap-4">
          {displayGirls.map(girl => (
            <GirlCard key={girl.id} girl={girl} />
          ))}
        </div>
      )}

      <p className="text-center text-xs mt-4 mb-2 text-white/40">
        3 niveaux de difficulté — débloque les suivants en gagnant de l&apos;XP
      </p>
    </div>
  )
}

function GirlCard({ girl }: { girl: Girl }) {
  return (
    <div
      className="rounded-3xl overflow-hidden flex flex-col"
      style={{ background: '#1C1C1E' }}
    >
      {/* Avatar */}
      <div
        className="flex items-center justify-center py-6"
        style={{ background: girl.locked ? '#252525' : '#2A2A2A' }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: girl.locked ? '#333' : `${girl.badge_color}25`,
            border: `3px solid ${girl.locked ? '#333' : girl.badge_color}`,
          }}
        >
          {girl.locked ? (
            <Lock size={28} color="#555" />
          ) : (
            <span className="text-4xl">👤</span>
          )}
        </div>
      </div>

      {/* Infos */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-1">
          <h3
            className="font-bold text-white text-base"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            {girl.name}
          </h3>
          <span
            className="text-[10px] font-black px-2 py-0.5 rounded-full"
            style={{ background: girl.badge_color, color: 'white' }}
          >
            {girl.badge_text}
          </span>
        </div>

        <p className="text-xs mb-3" style={{ color: '#888' }}>
          {girl.personality_type}
        </p>

        {girl.locked ? (
          <div
            className="w-full py-2 rounded-xl text-center text-xs font-semibold"
            style={{ background: '#2A2A2A', color: '#555' }}
          >
            🔒 {girl.required_xp} XP requis
          </div>
        ) : (
          <Link
            href={`/game/training/${girl.difficulty_level}/chat`}
            className="w-full py-2.5 rounded-xl text-center text-sm font-bold text-white transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
          >
            Démarrer 🎮
          </Link>
        )}
      </div>
    </div>
  )
}
