'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Trophy, Target, Star, Dumbbell, Lock, RefreshCw } from 'lucide-react'

const LEVEL_NAMES: Record<number, string> = {
  0: 'Le Raté', 1: 'Le Débutant', 2: "L'Apprenti",
  3: 'Le Progressiste', 4: 'Le Confident', 5: 'Le Séducteur', 6: "L'Alpha",
}

interface GirlData {
  id: string; name: string; personality_type: string
  difficulty_level: number; required_xp: number
  badge_color: string; badge_text: string; locked: boolean
}

interface ProgressionData {
  currentLevel: number; levelName: string; totalXP: number
  xpToNextLevel: number; progressPercent: number; girls: GirlData[]
  stats: {
    totalConversations: number; totalCompletedConversations: number
    totalDates: number; bestScore: number; averageRizz: number; successRate: number
  }
}

export default function GameDashboard() {
  const [data, setData] = useState<ProgressionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/progression').then(r => r.json()).then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const level = data?.currentLevel ?? 0
  const levelName = data?.levelName ?? LEVEL_NAMES[0]
  const xp = data?.totalXP ?? 0
  const xpNext = data?.xpToNextLevel ?? 50
  const xpPct = data?.progressPercent ?? 0
  const stats = data?.stats
  const girls = data?.girls ?? []

  return (
    <div className="px-5 pb-4 space-y-4">
      {/* Hero card */}
      <div
        className="rounded-3xl p-6 text-center"
        style={{ background: '#1C1C1E' }}
      >
        {/* Mascotte placeholder */}
        <div
          className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{
            background: '#252525',
            border: '3px dashed #333',
          }}
        >
          {loading
            ? <RefreshCw size={24} className="animate-spin" style={{ color: '#E63946' }} />
            : <span className="text-3xl">🧍</span>
          }
        </div>

        <h2
          className="text-white font-black text-xl mb-0.5"
          style={{ fontFamily: 'var(--font-montserrat)' }}
        >
          Niveau {level}
        </h2>
        <p className="font-bold mb-5" style={{ color: '#E63946' }}>{levelName}</p>

        {/* Barre XP */}
        <div className="mb-5">
          <div className="flex justify-between text-xs mb-1.5" style={{ color: '#666' }}>
            <span>XP : {xp}</span>
            <span>{xpPct}%</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#2A2A2A' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${xpPct}%`, background: 'linear-gradient(90deg, #E63946, #FF4757)' }}
            />
          </div>
          {level < 6 && (
            <p className="text-xs mt-1 text-right" style={{ color: '#444' }}>
              {xpNext} XP pour le prochain niveau
            </p>
          )}
        </div>

        <Link
          href="/game/training"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-white font-bold text-base transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
        >
          <Dumbbell size={18} />
          Commence ton entraînement
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4" style={{ background: '#1C1C1E' }}>
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={16} style={{ color: '#E63946' }} />
            <span className="text-xs font-medium" style={{ color: '#888' }}>Conversations</span>
          </div>
          <p className="font-montserrat text-3xl font-bold text-white">{stats?.totalCompletedConversations ?? 0}</p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: '#1C1C1E' }}>
          <div className="flex items-center gap-2 mb-2">
            <Target size={16} style={{ color: '#E63946' }} />
            <span className="text-xs font-medium" style={{ color: '#888' }}>Dates obtenus</span>
          </div>
          <p className="font-montserrat text-3xl font-bold text-white">
            {stats?.totalDates ?? 0}
            <span className="text-sm ml-1" style={{ color: '#888' }}>({stats?.successRate ?? 0}%)</span>
          </p>
        </div>
        <div className="col-span-2 rounded-2xl p-4" style={{ background: '#1C1C1E' }}>
          <div className="flex items-center gap-2 mb-2">
            <Star size={16} style={{ color: '#E63946' }} />
            <span className="text-xs font-medium" style={{ color: '#888' }}>Meilleur score</span>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} size={26} style={s <= (stats?.bestScore ?? 0) ? { color: '#E63946', fill: '#E63946' } : { color: '#333' }} />
            ))}
          </div>
        </div>
      </div>

      {/* Filles débloquées */}
      <div className="rounded-3xl p-5" style={{ background: '#1C1C1E' }}>
        <h3 className="font-montserrat text-base font-bold text-white mb-4">
          Filles débloquées ({girls.filter(g => !g.locked).length}/{girls.length || 3})
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {(girls.length > 0 ? girls : [
            { id: '1', name: 'Léa', badge_color: '#22C55E', locked: false },
            { id: '2', name: 'Clara', badge_color: '#F59E0B', locked: true },
            { id: '3', name: 'Victoria', badge_color: '#EF4444', locked: true },
          ] as any[]).map(g => (
            <div key={g.id} style={{ opacity: g.locked ? 0.4 : 1 }}>
              <div
                className="aspect-square rounded-2xl mb-1.5 flex items-center justify-center text-3xl"
                style={{
                  background: g.locked ? '#252525' : `${g.badge_color}20`,
                  border: `2px solid ${g.locked ? '#2A2A2A' : g.badge_color}`,
                }}
              >
                {g.locked ? <Lock size={22} style={{ color: '#444' }} /> : '👤'}
              </div>
              <p className="text-xs text-center font-medium" style={{ color: g.locked ? '#444' : '#999' }}>
                {g.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
