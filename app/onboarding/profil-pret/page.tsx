'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface RadarData {
  humour: number
  refs: number
  drague: number
  audace: number
  langage: number
}

function RadarChart({ data }: { data: RadarData }) {
  const size = 200
  const cx = size / 2
  const cy = size / 2
  const r = 70

  const labels = ['Humour', 'Refs', 'Drague', 'Audace', 'Langage']
  const values = [data.humour, data.refs, data.drague, data.audace, data.langage]
  const n = labels.length

  const toXY = (angle: number, radius: number) => ({
    x: cx + radius * Math.sin(angle),
    y: cy - radius * Math.cos(angle),
  })

  const gridLevels = [0.25, 0.5, 0.75, 1]

  const getPolygon = (scale: number) =>
    Array.from({ length: n }, (_, i) => {
      const angle = (2 * Math.PI * i) / n
      const p = toXY(angle, r * scale)
      return `${p.x},${p.y}`
    }).join(' ')

  const dataPolygon = values.map((v, i) => {
    const angle = (2 * Math.PI * i) / n
    const p = toXY(angle, r * (v / 100))
    return `${p.x},${p.y}`
  }).join(' ')

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid */}
      {gridLevels.map(level => (
        <polygon
          key={level}
          points={getPolygon(level)}
          fill="none"
          stroke="#EBEBEB"
          strokeWidth={1}
        />
      ))}
      {/* Axes */}
      {Array.from({ length: n }, (_, i) => {
        const angle = (2 * Math.PI * i) / n
        const p = toXY(angle, r)
        return (
          <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#E5E5E5" strokeWidth={1} />
        )
      })}
      {/* Data */}
      <polygon
        points={dataPolygon}
        fill="rgba(230, 57, 70, 0.2)"
        stroke="#E63946"
        strokeWidth={2}
      />
      {/* Labels */}
      {labels.map((label, i) => {
        const angle = (2 * Math.PI * i) / n
        const p = toXY(angle, r + 20)
        const pct = values[i]
        return (
          <g key={label}>
            <text
              x={p.x}
              y={p.y - 4}
              textAnchor="middle"
              fontSize="9"
              fontWeight="600"
              fill="#888"
              fontFamily="var(--font-inter)"
            >
              {label}
            </text>
            <text
              x={p.x}
              y={p.y + 8}
              textAnchor="middle"
              fontSize="8"
              fontWeight="700"
              fill="#E63946"
              fontFamily="var(--font-inter)"
            >
              {pct}%
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function OnboardingProfilPret() {
  const [nom, setNom] = useState('Toi')
  const [radarData, setRadarData] = useState<RadarData>({
    humour: 50,
    refs: 50,
    drague: 50,
    audace: 50,
    langage: 50,
  })

  useEffect(() => {
    const savedNom = localStorage.getItem('ob_nom')
    if (savedNom) setNom(savedNom)

    const get = (key: string) => {
      const v = localStorage.getItem(key)
      return v ? parseInt(v, 10) : 50
    }
    setRadarData({
      humour: get('ob_p_leger_sarcastique'),
      refs: get('ob_p_refs'),
      drague: get('ob_p_subtil_direct'),
      audace: get('ob_p_serieux_tchatcheur'),
      langage: get('ob_p_familier_soigne'),
    })
  }, [])

  return (
    <div className="ob-bg" style={{ minHeight: '100dvh', justifyContent: 'flex-end' }}>
      <div className="ob-card" style={{ borderRadius: '2rem 2rem 0 0', minHeight: '72dvh' }}>
        <div className="text-center mb-6">
          <h2 className="ob-title-lg">
            {nom}, ton profil<br />personnalisé est prêt
          </h2>
        </div>

        {/* Radar chart */}
        <div className="flex items-center justify-center mb-4 flex-1">
          <div
            className="rounded-2xl p-4"
            style={{ background: '#FAFAFA', border: '1px solid #EFEFEF' }}
          >
            <RadarChart data={radarData} />
          </div>
        </div>

        {/* Message */}
        <div
          className="px-4 py-3 rounded-2xl mb-6 text-center"
          style={{ background: '#FFF0F1', border: '1px solid #FECDD3' }}
        >
          <p className="font-semibold text-sm" style={{ color: '#E63946', lineHeight: 1.5 }}>
            Crushmaxxing va t&apos;aider à atteindre tes objectifs tout en s&apos;adaptant à ton profil
          </p>
        </div>

        <div className="mt-auto">
          <Link href="/onboarding/fonctionnalites" className="ob-btn">
            Voir les fonctionnalités
          </Link>
        </div>
      </div>
    </div>
  )
}
