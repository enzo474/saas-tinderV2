'use client'

import { useEffect } from 'react'

export default function PseudoSync() {
  useEffect(() => {
    // Sauvegarder le pseudo en base si présent
    const pseudo = localStorage.getItem('crushmaxxing_pseudo')
    if (pseudo) {
      fetch('/api/save-pseudo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pseudo }),
      }).catch(() => {})
    }

    // Tracker la visite du dashboard
    fetch('/api/tracking/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'dashboard_visited' }),
    }).catch(() => {})
  }, [])

  return null
}
