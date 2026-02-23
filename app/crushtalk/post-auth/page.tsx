'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CrushTalkPostAuth() {
  const router = useRouter()

  useEffect(() => {
    const saveAndRedirect = async () => {
      try {
        const raw = localStorage.getItem('ct_onboarding')
        if (!raw) {
          router.replace('/ct/accroche')
          return
        }

        const data = JSON.parse(raw)

        await fetch('/api/crushtalk/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        localStorage.removeItem('ct_onboarding')
        router.replace('/ct/accroche?welcome=true')
      } catch {
        router.replace('/ct/accroche')
      }
    }

    saveAndRedirect()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0A' }}>
      <div className="text-center">
        <div
          className="w-12 h-12 border-2 rounded-full animate-spin mx-auto mb-4"
          style={{ borderColor: 'rgba(247,127,0,0.2)', borderTopColor: '#F77F00' }}
        />
        <p className="text-sm" style={{ color: '#6b7280' }}>Préparation de ton compte...</p>
      </div>
    </div>
  )
}
