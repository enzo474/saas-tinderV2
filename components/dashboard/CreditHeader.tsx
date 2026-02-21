'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { RechargeModal } from '@/components/credits/RechargeModal'

interface CreditHeaderProps {
  initialCredits: number
  userId: string
  isAdmin?: boolean
}

export function CreditHeader({ initialCredits, userId, isAdmin = false }: CreditHeaderProps) {
  const [credits, setCredits] = useState(initialCredits)
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false)

  useEffect(() => {
    if (isAdmin) return

    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/user/credits')
        if (response.ok) {
          const data = await response.json()
          setCredits(data.credits)
        }
      } catch (error) {
        console.error('Failed to fetch credits:', error)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [isAdmin])

  return (
    <>
      <header className="bg-bg-secondary border-b border-border-primary px-6 md:px-8 py-4">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-3">
            {/* Badge crédits */}
            <div
              onClick={() => setIsRechargeModalOpen(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setIsRechargeModalOpen(true)
                }
              }}
              className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-full transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #F77F00, #FFAA33)',
              }}
            >
              {isAdmin ? (
                <>
                  <span className="font-montserrat font-bold text-black text-base">∞</span>
                  <span className="font-semibold text-black text-sm">Illimités</span>
                </>
              ) : (
                <>
                  <span className="font-montserrat font-bold text-black text-base">{credits}</span>
                  <span className="font-semibold text-black text-sm">crédits</span>
                </>
              )}
            </div>

            {!isAdmin && (
              <button
                onClick={() => setIsRechargeModalOpen(true)}
                className="bg-red-primary hover:bg-red-light text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all duration-200 hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                Recharger
              </button>
            )}
          </div>
        </div>
      </header>

      <RechargeModal
        isOpen={isRechargeModalOpen}
        onClose={() => setIsRechargeModalOpen(false)}
        currentCredits={credits}
      />
    </>
  )
}
