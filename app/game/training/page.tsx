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
      .then(d => {
        setGirls(d.girls ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Fallback si tables pas encore créées
  const displayGirls: Girl[] = girls.length > 0 ? girls : [
    { id: '1', name: 'Léa',      personality_type: 'Chill & Sympa',           difficulty_level: 1, required_xp: 0,   badge_color: '#4CAF50', badge_text: 'FACILE',    locked: false },
    { id: '2', name: 'Clara',    personality_type: 'Sélective & Exigeante',   difficulty_level: 2, required_xp: 100, badge_color: '#FF9800', badge_text: 'MOYEN',     locked: true  },
    { id: '3', name: 'Victoria', personality_type: 'Froide & Désintéressée',  difficulty_level: 3, required_xp: 300, badge_color: '#F44336', badge_text: 'DIFFICILE', locked: true  },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="text-center">
        <h1 className="font-montserrat text-2xl font-bold text-white mb-2">Training Mode</h1>
        <p style={{ color: '#9da3af' }} className="text-sm">
          Entraîne-toi à obtenir des dates avec nos IA
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <RefreshCw size={28} className="animate-spin" style={{ color: '#E63946' }} />
        </div>
      )}

      {/* Grille filles */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {displayGirls.map((girl) => {
            const avatarBg = `${girl.badge_color}22`
            return (
              <div
                key={girl.id}
                className="rounded-2xl border-2 overflow-hidden transition-all duration-200"
                style={{
                  background: '#1A1A1A',
                  borderColor: girl.locked ? '#2A2A2A' : '#E63946',
                  opacity: girl.locked ? 0.65 : 1,
                }}
              >
                {/* Avatar */}
                <div
                  className="flex items-center justify-center"
                  style={{
                    height: 180,
                    background: girl.locked ? '#252525' : avatarBg,
                    borderBottom: `2px solid ${girl.locked ? '#2A2A2A' : girl.badge_color}22`,
                  }}
                >
                  {girl.locked ? (
                    <div className="text-center">
                      <Lock size={48} style={{ color: '#555', margin: '0 auto 8px' }} />
                      <p className="text-xs" style={{ color: '#555' }}>{girl.required_xp} XP requis</p>
                    </div>
                  ) : (
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
                      style={{ background: avatarBg, border: `3px solid ${girl.badge_color}` }}
                    >
                      👤
                    </div>
                  )}
                </div>

                {/* Infos */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-montserrat text-xl font-bold text-white">{girl.name}</h3>
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
                      style={{ background: girl.badge_color }}
                    >
                      {girl.badge_text}
                    </span>
                  </div>
                  <p className="text-sm mb-4" style={{ color: '#9da3af' }}>{girl.personality_type}</p>

                  {!girl.locked && (
                    <Link
                      href={`/game/training/${girl.difficulty_level}/chat`}
                      className="block w-full text-center py-3 rounded-xl text-white font-semibold text-sm transition-all active:scale-95"
                      style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
                    >
                      Démarrer 🎮
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-center text-xs" style={{ color: '#555' }}>
        3 niveaux de difficulté — débloque les suivants en gagnant de l'XP
      </p>
    </div>
  )
}
