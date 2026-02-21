'use client'

import { useState, useEffect } from 'react'
import { RechargeModal } from '@/components/credits/RechargeModal'

interface CreditsBadgeProps {
  initialCredits: number
  isAdmin?: boolean
}

export function CreditsBadge({ initialCredits, isAdmin = false }: CreditsBadgeProps) {
  const [credits, setCredits] = useState(initialCredits)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (isAdmin) return
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/user/credits')
        if (res.ok) {
          const data = await res.json()
          setCredits(data.credits)
        }
      } catch {}
    }, 10000)
    return () => clearInterval(interval)
  }, [isAdmin])

  return (
    <>
    <div
      role="button"
      tabIndex={0}
      onClick={() => setModalOpen(true)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setModalOpen(true) }}
      className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer hover:scale-105 transition-all duration-200"
      style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)', boxShadow: '0 4px 16px rgba(230,57,70,0.3)' }}
    >
      {isAdmin ? (
        <>
          <span className="font-montserrat font-black text-white text-base">∞</span>
          <span className="font-montserrat font-semibold text-white text-sm">Illimités</span>
        </>
      ) : (
        <>
          <span className="font-montserrat font-black text-white text-base">{credits}</span>
          <span className="font-montserrat font-semibold text-white text-sm">crédits</span>
        </>
      )}
    </div>

      <RechargeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        currentCredits={credits}
      />
    </>
  )
}
