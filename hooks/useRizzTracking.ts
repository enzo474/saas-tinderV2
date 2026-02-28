'use client'

import { useEffect, useRef, useCallback } from 'react'

type RizzEvent =
  | 'page_view'
  | 'image_uploaded'
  | 'girl_selected'
  | 'tone_selected'
  | 'answer_clicked'
  | 'saw_result'
  | 'clicked_unlock'
  | 'saw_reveal'
  | 'copied_result'

const TRACKING_URL = '/api/tracking/rizz-event'

export function useRizzTracking(flowType: 'test-1' | 'test-2') {
  const sessionIdRef = useRef<string | null>(null)
  const initDone     = useRef(false)

  // Crée la session sur la première visite
  useEffect(() => {
    if (initDone.current) return
    initDone.current = true

    const deviceType = typeof window !== 'undefined'
      ? (window.innerWidth < 768 ? 'mobile' : 'desktop')
      : 'unknown'

    fetch(TRACKING_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'page_view', data: { flow_type: flowType, device_type: deviceType } }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.session_id) {
          sessionIdRef.current = d.session_id
          try { localStorage.setItem('rizz_session_id', d.session_id) } catch { /* ignore */ }
        }
      })
      .catch(() => { /* non-bloquant */ })
  }, [flowType])

  const track = useCallback((event: RizzEvent, data?: Record<string, unknown>) => {
    const session_id = sessionIdRef.current
    if (!session_id) return
    fetch(TRACKING_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id, event, data }),
    }).catch(() => { /* non-bloquant */ })
  }, [])

  const getSessionId = useCallback(() => sessionIdRef.current, [])

  return { track, getSessionId }
}
