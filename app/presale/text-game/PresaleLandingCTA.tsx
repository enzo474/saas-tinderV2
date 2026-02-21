'use client'

import { useState } from 'react'
import { createPresaleCheckoutSession } from '@/app/api/stripe/create-presale-checkout/actions'

interface PresaleLandingCTAProps {
  label?: string
  packType?: 'pack_1' | 'pack_2' | 'text_game'
  className?: string
  style?: React.CSSProperties
}

export function PresaleLandingCTA({
  label = 'Réserver mon accès',
  packType = 'text_game',
  className = '',
  style,
}: PresaleLandingCTAProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      const result = await createPresaleCheckoutSession(packType)
      if (result.error) {
        alert(result.error)
        setLoading(false)
      } else if (result.url) {
        window.location.href = result.url
      }
    } catch {
      alert('Une erreur est survenue')
      setLoading(false)
    }
  }

  return (
    <button onClick={handleClick} disabled={loading} className={className} style={style}>
      {loading ? 'Chargement...' : label}
    </button>
  )
}
