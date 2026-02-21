'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Lock, X, Sparkles } from 'lucide-react'
import { createPresaleCheckoutSession } from '@/app/api/stripe/create-presale-checkout/actions'

const DISPLAY_SLOTS = 50
const REAL_SLOTS = 200
const RATIO = REAL_SLOTS / DISPLAY_SLOTS // 4

interface PresaleContentProps {
  title: string
  presaleCount: number
}

export function PresaleContent({ title, presaleCount }: PresaleContentProps) {
  const searchParams = useSearchParams()
  const [showThankYou, setShowThankYou] = useState(false)
  const [loadingPack, setLoadingPack] = useState<'pack_1' | 'pack_2' | null>(null)

  const displayCount = Math.min(Math.floor(presaleCount / RATIO), DISPLAY_SLOTS)

  useEffect(() => {
    if (searchParams.get('purchase') === 'presale_success') {
      setShowThankYou(true)
    }
  }, [searchParams])

  const closeThankYou = () => {
    setShowThankYou(false)
    window.history.replaceState({}, '', '/dashboard/hooks')
  }

  const handleCheckout = async (packType: 'pack_1' | 'pack_2') => {
    setLoadingPack(packType)
    try {
      const result = await createPresaleCheckoutSession(packType)
      if (result.error) {
        alert(result.error)
      } else if (result.url) {
        window.location.href = result.url
      }
    } catch (err) {
      alert('Une erreur est survenue')
    } finally {
      setLoadingPack(null)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-[#1f2128] border border-[#2a2d36] rounded-lg p-12 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-full flex items-center justify-center mx-auto mb-6 relative">
          <Sparkles className="w-10 h-10 text-white" />
          <div className="absolute -bottom-1 -right-1 bg-[#fbbf24] rounded-full p-1.5">
            <Lock className="w-4 h-4 text-black" />
          </div>
        </div>

        <h1 className="font-sora font-bold text-white text-3xl mb-3">{title}</h1>
        <p className="font-inter text-[#9da3af] text-lg mb-6">
          En cours de développement — sortie prévue dans 2 semaines
        </p>

        <div className="bg-[#13151a] border border-[#2a2d36] rounded-lg p-6 mb-6 text-left">
          <h3 className="font-sora font-bold text-white text-lg mb-2">Prévente — 50 places</h3>
          <p className="font-inter text-[#9da3af] text-sm mb-4">
            Pour bénéficier de <span className="text-green-500 font-semibold">-50% à vie</span> tant que vous restez abonné, prenez le pack de votre choix en prévente.
          </p>

          {/* Barre de progression */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-inter text-[#9da3af]">
                {displayCount} / {DISPLAY_SLOTS} places
              </span>
            </div>
            <div className="w-full h-3 bg-[#1f2128] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#6366f1] transition-all duration-300"
                style={{ width: `${(displayCount / DISPLAY_SLOTS) * 100}%` }}
              />
            </div>
          </div>

          {/* Cartes pricing */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-[#1f2128] rounded-lg p-6 border border-[#2a2d36] flex flex-col">
              <p className="font-sora font-bold text-white text-lg mb-1">Pack 1</p>
              <p className="font-inter text-[#9da3af] text-sm mb-3">100 messages et accroches générés au choix — les deux compris</p>
              <div className="mt-auto space-y-2">
                <p className="font-inter text-[#9da3af] text-sm">
                  <span className="line-through">9,90 €</span>
                </p>
                <p className="font-inter text-[#6366f1] font-bold text-xl">4,95 €</p>
                <button
                  onClick={() => handleCheckout('pack_1')}
                  disabled={!!loadingPack}
                  className="w-full bg-[#6366f1] hover:bg-[#5558e3] text-white py-3 rounded-lg font-inter font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {loadingPack === 'pack_1' ? 'Chargement...' : 'Choisir ce pack'}
                </button>
              </div>
            </div>

            <div className="bg-[#1f2128] rounded-lg p-6 border border-[#2a2d36] flex flex-col">
              <p className="font-sora font-bold text-white text-lg mb-1">Pack 2</p>
              <p className="font-inter text-[#9da3af] text-sm mb-3">300 messages et accroches générés au choix — les deux compris</p>
              <div className="mt-auto space-y-2">
                <p className="font-inter text-[#9da3af] text-sm">
                  <span className="line-through">19,90 €</span>
                </p>
                <p className="font-inter text-[#6366f1] font-bold text-xl">9,95 €</p>
                <button
                  onClick={() => handleCheckout('pack_2')}
                  disabled={!!loadingPack}
                  className="w-full bg-[#6366f1] hover:bg-[#5558e3] text-white py-3 rounded-lg font-inter font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {loadingPack === 'pack_2' ? 'Chargement...' : 'Choisir ce pack'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popup merci */}
      {showThankYou && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#13151a] rounded-xl max-w-md w-full p-6 relative border border-[#2a2d36]">
            <button
              onClick={closeThankYou}
              className="absolute top-4 right-4 text-[#9da3af] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-sora font-bold text-white text-xl mb-3">Merci pour votre confiance</h3>
            <p className="font-inter text-[#9da3af] text-sm">
              On vous préviendra par mail le jour de la sortie.
            </p>
            <button
              onClick={closeThankYou}
              className="mt-6 w-full bg-[#6366f1] hover:bg-[#5558e3] text-white py-3 rounded-lg font-inter font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
