'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Trophy, Target, Star, Dumbbell, Lock, RefreshCw } from 'lucide-react'

const LEVEL_NAMES: Record<number, string> = {
  0: 'Le Raté',
  1: 'Le Débutant',
  2: "L'Apprenti",
  3: 'Le Progressiste',
  4: 'Le Confident',
  5: 'Le Séducteur',
  6: "L'Alpha",
}

interface GirlData {
  id: string
  name: string
  personality_type: string
  difficulty_level: number
  required_xp: number
  badge_color: string
  badge_text: string
  locked: boolean
}

interface ProgressionData {
  currentLevel: number
  levelName: string
  totalXP: number
  xpToNextLevel: number
  progressPercent: number
  girls: GirlData[]
  stats: {
    totalConversations: number
    totalCompletedConversations: number
    totalDates: number
    bestScore: number
    averageRizz: number
    successRate: number
  }
}

export default function GameDashboardClient() {
  const [data, setData] = useState<ProgressionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/progression')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const level     = data?.currentLevel ?? 0
  const levelName = data?.levelName ?? LEVEL_NAMES[0]
  const xp        = data?.totalXP ?? 0
  const xpNext    = data?.xpToNextLevel ?? 50
  const xpPct     = data?.progressPercent ?? 0
  const stats     = data?.stats
  const girls     = data?.girls ?? []

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      <div>
        <h1 className="font-montserrat text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p style={{ color: '#9da3af' }} className="text-sm">Bienvenue sur Crushmaxxing Training</p>
      </div>

      <div className="rounded-2xl p-8 text-center border" style={{ background: '#1A1A1A', borderColor: '#2A2A2A' }}>
        <div
          className="w-32 h-32 mx-auto mb-5 rounded-full flex items-center justify-center text-5xl"
          style={{ background: '#252525', border: '3px solid #E63946' }}
        >
          {loading ? <RefreshCw size={28} className="animate-spin" style={{ color: '#E63946' }} /> : '🧍'}
        </div>

        <h2 className="font-montserrat text-2xl font-bold text-white mb-1">Niveau {level}</h2>
        <p className="text-lg font-semibold mb-6" style={{ color: '#E63946' }}>{levelName}</p>

        <div className="mb-7">
          <div className="flex justify-between text-xs mb-2" style={{ color: '#9da3af' }}>
            <span>XP : {xp} / {level < 6 ? xp + xpNext : '∞'}</span>
            <span>{xpPct}%</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: '#252525' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${xpPct}%`, background: 'linear-gradient(90deg, #E63946, #FF4757)' }}
            />
          </div>
          {level < 6 && (
            <p className="text-xs mt-1.5 text-right" style={{ color: '#555' }}>
              {xpNext} XP pour le prochain niveau
            </p>
          )}
        </div>

        <Link
          href="/game/training"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-white font-semibold text-base transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
        >
          <Dumbbell size={18} />
          Commence ton entraînement
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl p-5 border" style={{ background: '#1A1A1A', borderColor: '#2A2A2A' }}>
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={18} style={{ color: '#E63946' }} />
            <span className="text-xs" style={{ color: '#9da3af' }}>Conversations</span>
          </div>
          <p className="font-montserrat text-3xl font-bold text-white">
            {stats?.totalCompletedConversations ?? 0}
          </p>
        </div>

        <div className="rounded-xl p-5 border" style={{ background: '#1A1A1A', borderColor: '#2A2A2A' }}>
          <div className="flex items-center gap-2 mb-3">
            <Target size={18} style={{ color: '#E63946' }} />
            <span className="text-xs" style={{ color: '#9da3af' }}>Dates obtenus</span>
          </div>
          <p className="font-montserrat text-3xl font-bold text-white">
            {stats?.totalDates ?? 0}
            <span className="text-sm ml-1" style={{ color: '#9da3af' }}>
              ({stats?.successRate ?? 0}%)
            </span>
          </p>
        </div>

        <div className="col-span-2 rounded-xl p-5 border" style={{ background: '#1A1A1A', borderColor: '#2A2A2A' }}>
          <div className="flex items-center gap-2 mb-3">
            <Star size={18} style={{ color: '#E63946' }} />
            <span className="text-xs" style={{ color: '#9da3af' }}>Meilleur score</span>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={28}
                style={star <= (stats?.bestScore ?? 0)
                  ? { color: '#E63946', fill: '#E63946' }
                  : { color: '#333' }
                }
              />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-6 border" style={{ background: '#1A1A1A', borderColor: '#2A2A2A' }}>
        <h3 className="font-montserrat text-lg font-bold text-white mb-5">
          Meufs débloquées ({girls.filter(g => !g.locked).length}/{girls.length || 3})
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {(girls.length > 0 ? girls : [
            { id: '1', name: 'Léa',      badge_color: '#4CAF50', locked: false },
            { id: '2', name: 'Clara',    badge_color: '#FF9800', locked: true  },
            { id: '3', name: 'Victoria', badge_color: '#F44336', locked: true  },
          ] as any[]).map((girl) => (
            <div key={girl.id} style={{ opacity: girl.locked ? 0.45 : 1 }}>
              <div
                className="aspect-square rounded-xl mb-2 flex items-center justify-center text-4xl"
                style={{
                  background: girl.locked ? '#252525' : `${girl.badge_color}22`,
                  border: `2px solid ${girl.locked ? '#2A2A2A' : girl.badge_color}`,
                }}
              >
                {girl.locked ? <Lock size={28} style={{ color: '#555' }} /> : '👤'}
              </div>
              <p className="text-sm text-center" style={{ color: girl.locked ? '#555' : '#9da3af' }}>
                {girl.name}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
