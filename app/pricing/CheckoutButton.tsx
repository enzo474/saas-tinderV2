'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { createCheckoutSession } from './actions'

interface CheckoutButtonProps {
  analysisId: string
  children: React.ReactNode
}

export function CheckoutButton({ analysisId, children }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      const result = await createCheckoutSession(analysisId)
      
      if (result?.error) {
        alert(result.error)
        setLoading(false)
        return
      }
      if (result?.url) {
        window.location.href = result.url
      }
    } catch (err) {
      console.error(err)
      alert('Une erreur est survenue')
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleClick} disabled={loading} className="w-full">
      {loading ? 'Chargement...' : children}
    </Button>
  )
}
