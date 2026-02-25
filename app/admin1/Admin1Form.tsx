'use client'

import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { signInWithGoogle } from '@/app/auth/actions'

export function Admin1Form() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)
    const result = await signInWithGoogle()
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div
          className="p-3 rounded-xl text-sm text-center"
          style={{ background: 'rgba(230,57,70,0.1)', color: '#FF4757', border: '1px solid rgba(230,57,70,0.2)' }}
        >
          {error}
        </div>
      )}

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-semibold text-sm transition-all disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)', color: '#fff' }}
      >
        {loading ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <ShieldCheck className="w-5 h-5" />
        )}
        {loading ? 'Connexion...' : 'Connexion Admin Google'}
      </button>

      <p className="text-xs text-center" style={{ color: '#555' }}>
        Accès réservé aux administrateurs
      </p>
    </div>
  )
}
