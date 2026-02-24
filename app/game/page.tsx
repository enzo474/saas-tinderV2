'use client'

import Link from 'next/link'
import { Trophy, Target, Star, Dumbbell, Lock } from 'lucide-react'

const LEVEL_NAMES: Record<number, string> = {
  0: 'Le Raté',
  1: 'Le Débutant',
  2: "L'Apprenti",
  3: 'Le Progressiste',
  4: 'Le Confident',
  5: 'Le Séducteur',
  6: "L'Alpha",
}

const GIRLS = [
  { name: 'Léa',      color: '#4CAF50', locked: false },
  { name: 'Clara',    color: '#FF9800', locked: true  },
  { name: 'Victoria', color: '#F44336', locked: true  },
]

export default function GameDashboard() {
  const level      = 0
  const xp         = 0
  const xpNext     = 50
  const convos     = 0
  const dates      = 0
  const bestScore  = 0
  const xpPct      = Math.min((xp / xpNext) * 100, 100)

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p style={{ color: '#9da3af' }} className="text-sm">Bienvenue sur Crushmaxxing Training</p>
      </div>

      {/* Mascotte + XP */}
      <div
        className="rounded-2xl p-8 text-center border"
        style={{ background: '#1A1A1A', borderColor: '#2A2A2A' }}
      >
        {/* Mascotte placeholder */}
        <div
          className="w-32 h-32 mx-auto mb-5 rounded-full flex items-center justify-center text-5xl"
          style={{ background: '#252525', border: '3px solid #FF8C42' }}
        >
          🧍
        </div>

        <h2 className="text-2xl font-bold text-white mb-1">Niveau {level}</h2>
        <p className="text-lg font-semibold mb-6" style={{ color: '#FF8C42' }}>
          {LEVEL_NAMES[level]}
        </p>

        {/* Barre XP */}
        <div className="mb-7">
          <div className="flex justify-between text-xs mb-2" style={{ color: '#9da3af' }}>
            <span>XP : {xp} / {xpNext}</span>
            <span>{Math.round(xpPct)}%</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: '#252525' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${xpPct}%`,
                background: 'linear-gradient(90deg, #FF8C42, #FFA366)',
              }}
            />
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/game/training"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-white font-semibold text-base transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #FF8C42, #E67A35)' }}
        >
          <Dumbbell size={18} />
          Commence ton entraînement
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div
          className="rounded-xl p-5 border"
          style={{ background: '#1A1A1A', borderColor: '#2A2A2A' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={18} style={{ color: '#FF8C42' }} />
            <span className="text-xs" style={{ color: '#9da3af' }}>Conversations</span>
          </div>
          <p className="text-3xl font-bold text-white">{convos}</p>
        </div>

        <div
          className="rounded-xl p-5 border"
          style={{ background: '#1A1A1A', borderColor: '#2A2A2A' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Target size={18} style={{ color: '#FF8C42' }} />
            <span className="text-xs" style={{ color: '#9da3af' }}>Dates obtenus</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {dates}
            <span className="text-sm ml-1" style={{ color: '#9da3af' }}>
              ({convos > 0 ? Math.round((dates / convos) * 100) : 0}%)
            </span>
          </p>
        </div>

        <div
          className="col-span-2 rounded-xl p-5 border"
          style={{ background: '#1A1A1A', borderColor: '#2A2A2A' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Star size={18} style={{ color: '#FF8C42' }} />
            <span className="text-xs" style={{ color: '#9da3af' }}>Meilleur score</span>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={28}
                style={star <= bestScore
                  ? { color: '#FF8C42', fill: '#FF8C42' }
                  : { color: '#333' }
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* Meufs débloquées */}
      <div
        className="rounded-2xl p-6 border"
        style={{ background: '#1A1A1A', borderColor: '#2A2A2A' }}
      >
        <h3 className="text-lg font-bold text-white mb-5">
          Meufs débloquées (1/{GIRLS.length})
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {GIRLS.map(({ name, color, locked }) => (
            <div key={name} style={{ opacity: locked ? 0.45 : 1 }}>
              <div
                className="aspect-square rounded-xl mb-2 flex items-center justify-center text-4xl"
                style={{ background: locked ? '#252525' : `${color}22`, border: `2px solid ${locked ? '#2A2A2A' : color}` }}
              >
                {locked ? <Lock size={28} style={{ color: '#555' }} /> : '👤'}
              </div>
              <p className="text-sm text-center" style={{ color: locked ? '#555' : '#9da3af' }}>
                {name}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
