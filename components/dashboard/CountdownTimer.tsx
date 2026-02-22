'use client'

import { useState, useEffect } from 'react'

// Date de lancement : 4 jours à partir du 22 février 2026
const LAUNCH_DATE = new Date('2026-02-26T23:59:59+01:00')

function getTimeLeft() {
  const diff = LAUNCH_DATE.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
  return {
    total: diff,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

/**
 * variant="full"  → blocs jours/heures/min/sec (page presale)
 * variant="inline" → texte court "X j HH:MM:SS" (popup + badge)
 * variant="days"  → juste "X jours" pour les phrases
 */
export function CountdownTimer({ variant = 'full', color = '#F77F00' }: {
  variant?: 'full' | 'inline' | 'days'
  color?: string
}) {
  const [t, setT] = useState(getTimeLeft)

  useEffect(() => {
    const id = setInterval(() => setT(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  if (t.total <= 0) return <span style={{ color }}>Disponible maintenant !</span>

  if (variant === 'days') {
    const label = t.days > 0
      ? `${t.days} jour${t.days > 1 ? 's' : ''}`
      : t.hours > 0
        ? `${t.hours}h`
        : `${t.minutes} min`
    return <span style={{ color }}>{label}</span>
  }

  if (variant === 'inline') {
    return (
      <span style={{ color, fontVariantNumeric: 'tabular-nums' }}>
        {t.days > 0 ? `${t.days}j ` : ''}{pad(t.hours)}:{pad(t.minutes)}:{pad(t.seconds)}
      </span>
    )
  }

  // variant="full"
  const blocks = [
    { label: 'Jours',    value: t.days },
    { label: 'Heures',   value: t.hours },
    { label: 'Minutes',  value: t.minutes },
    { label: 'Secondes', value: t.seconds },
  ]

  return (
    <div className="flex gap-2 items-center justify-center">
      {blocks.map(({ label, value }, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <span
              className="font-montserrat font-bold text-2xl md:text-3xl tabular-nums"
              style={{ color, minWidth: '2ch', textAlign: 'center' }}
            >
              {pad(value)}
            </span>
            <span className="text-[10px] text-white/50 uppercase tracking-wider mt-0.5">{label}</span>
          </div>
          {i < blocks.length - 1 && (
            <span className="font-bold text-xl mb-3" style={{ color }}>:</span>
          )}
        </div>
      ))}
    </div>
  )
}
