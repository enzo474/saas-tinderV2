'use client'

import Link from 'next/link'
import { Lock } from 'lucide-react'

interface Girl {
  id: number
  name: string
  personality: string
  badgeLabel: string
  badgeColor: string
  avatarBg: string
  requiredXP: number
  locked: boolean
}

const GIRLS: Girl[] = [
  {
    id: 1,
    name: 'Léa',
    personality: 'Chill & Sympa',
    badgeLabel: 'FACILE',
    badgeColor: '#4CAF50',
    avatarBg: 'rgba(76,175,80,0.15)',
    requiredXP: 0,
    locked: false,
  },
  {
    id: 2,
    name: 'Clara',
    personality: 'Sélective & Exigeante',
    badgeLabel: 'MOYEN',
    badgeColor: '#FF9800',
    avatarBg: 'rgba(255,152,0,0.15)',
    requiredXP: 100,
    locked: true,
  },
  {
    id: 3,
    name: 'Victoria',
    personality: 'Froide & Désintéressée',
    badgeLabel: 'DIFFICILE',
    badgeColor: '#F44336',
    avatarBg: 'rgba(244,67,54,0.15)',
    requiredXP: 300,
    locked: true,
  },
]

export default function TrainingPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="text-center">
        <h1 className="font-montserrat text-2xl font-bold text-white mb-2">Training Mode</h1>
        <p style={{ color: '#9da3af' }} className="text-sm">
          Entraîne-toi à obtenir des dates avec nos IA
        </p>
      </div>

      {/* Grille filles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {GIRLS.map((girl) => (
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
                background: girl.locked ? '#252525' : girl.avatarBg,
                borderBottom: `2px solid ${girl.locked ? '#2A2A2A' : girl.badgeColor}22`,
              }}
            >
              {girl.locked ? (
                <div className="text-center">
                  <Lock size={48} style={{ color: '#555', margin: '0 auto 8px' }} />
                  <p className="text-xs" style={{ color: '#555' }}>{girl.requiredXP} XP requis</p>
                </div>
              ) : (
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
                  style={{ background: girl.avatarBg, border: `3px solid ${girl.badgeColor}` }}
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
                  style={{ background: girl.badgeColor }}
                >
                  {girl.badgeLabel}
                </span>
              </div>
              <p className="text-sm mb-4" style={{ color: '#9da3af' }}>{girl.personality}</p>

              {!girl.locked && (
                <Link
                  href={`/game/training/${girl.id}/chat`}
                  className="block w-full text-center py-3 rounded-xl text-white font-semibold text-sm transition-all active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
                >
                  Démarrer 🎮
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs" style={{ color: '#555' }}>
        3 niveaux de difficulté — débloque les suivants en gagnant de l'XP
      </p>
    </div>
  )
}
