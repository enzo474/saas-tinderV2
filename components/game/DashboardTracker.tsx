'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'

export function DashboardTracker() {
  const searchParams = useSearchParams()
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true
    const source = searchParams.get('source') ?? 'direct'
    fetch('/api/tracking/dashboard-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source }),
    }).catch(() => {/* non-bloquant */})
  }, [searchParams])

  return null
}
