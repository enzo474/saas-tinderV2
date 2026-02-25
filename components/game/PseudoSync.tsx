'use client'

import { useEffect } from 'react'

export default function PseudoSync() {
  useEffect(() => {
    const pseudo = localStorage.getItem('crushmaxxing_pseudo')
    if (!pseudo) return
    fetch('/api/save-pseudo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pseudo }),
    }).catch(() => {})
  }, [])

  return null
}
