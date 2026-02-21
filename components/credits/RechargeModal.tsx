'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { createCreditCheckoutSession } from '@/app/api/stripe/create-credit-checkout/actions'
import { CREDIT_PACKS } from '@/lib/credits'

interface RechargeModalProps {
  isOpen: boolean
  onClose: () => void
  currentCredits: number
}

export function RechargeModal({ isOpen, onClose, currentCredits }: RechargeModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleRecharge = async (packType: 'pack_50' | 'pack_100') => {
    setIsLoading(true)
    
    try {
      const result = await createCreditCheckoutSession(packType)
      
      if (result.error) {
        alert(`Erreur: ${result.error}`)
        setIsLoading(false)
        return
      }
      
      if (result.url) {
        window.location.href = result.url
      }
    } catch (error) {
      console.error('Recharge error:', error)
      alert('Une erreur est survenue lors de la recharge')
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl max-w-xl w-full p-4 md:p-8 relative">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-tertiary hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-8">
          <h2 className="font-montserrat font-black text-white text-2xl mb-1">
            Recharger des crédits
          </h2>
          <p className="text-text-secondary text-sm">
            Solde actuel :{' '}
            <span className="font-bold text-red-light">
              {currentCredits} crédits
            </span>
          </p>
        </div>

        {/* Packs */}
        <div className="grid grid-cols-2 gap-3 mb-6">

          {/* Pack Standard */}
          <div className="bg-bg-tertiary border-2 border-border-primary rounded-xl p-4 flex flex-col hover:border-red-primary transition-all duration-200">
            <div className="flex flex-col gap-1 mb-4">
              <span className="text-text-secondary text-xs font-semibold uppercase tracking-wide">Standard</span>
              <span className="font-montserrat font-black text-white text-xl md:text-2xl">5,00 €</span>
            </div>

            <p className="font-montserrat font-bold text-white text-base md:text-lg mb-1">50 crédits</p>

            <ul className="space-y-2 text-sm text-text-secondary mb-6 flex-1">
              <li className="flex items-start gap-2">
                <span className="text-success font-bold mt-0.5">✓</span>
                5 sets de photos IA
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success font-bold mt-0.5">✓</span>
                ou 25 bios personnalisées
              </li>
            </ul>

            <button
              onClick={() => handleRecharge('pack_50')}
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)', boxShadow: '0 4px 16px rgba(230,57,70,0.25)' }}
            >
              {isLoading ? 'Chargement...' : 'Acheter'}
            </button>
          </div>

          {/* Pack Premium */}
          <div className="bg-bg-tertiary border-2 border-red-primary/50 rounded-xl p-4 flex flex-col relative hover:border-red-primary transition-all duration-200">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide whitespace-nowrap" style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}>
              Populaire
            </div>

            <div className="flex flex-col gap-1 mb-4">
              <span className="text-red-light text-xs font-semibold uppercase tracking-wide">Premium</span>
              <span className="font-montserrat font-black text-white text-xl md:text-2xl">8,90 €</span>
            </div>

            <p className="font-montserrat font-bold text-white text-base md:text-lg mb-1">100 crédits</p>

            <ul className="space-y-2 text-sm text-text-secondary mb-6 flex-1">
              <li className="flex items-start gap-2">
                <span className="text-success font-bold mt-0.5">✓</span>
                10 sets de photos IA
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success font-bold mt-0.5">✓</span>
                ou 50 bios personnalisées
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-light font-bold mt-0.5">★</span>
                <span className="text-red-light">Économisez 10%</span>
              </li>
            </ul>

            <button
              onClick={() => handleRecharge('pack_100')}
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)', boxShadow: '0 4px 16px rgba(230,57,70,0.25)' }}
            >
              {isLoading ? 'Chargement...' : 'Acheter'}
            </button>
          </div>

        </div>

        {/* Info */}
        <p className="text-text-tertiary text-xs text-center">
          Génération d&apos;images = 10 crédits/photo · Bio personnalisée = 2 crédits
        </p>
      </div>
    </div>
  )
}
