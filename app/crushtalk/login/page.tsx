'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Check } from 'lucide-react'

export default function CrushTalkAuthGate() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback/crushtalk`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#0A0A0A' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/crushtalk" className="inline-flex items-center gap-2">
            <span
              className="font-montserrat font-extrabold text-2xl"
              style={{
                background: 'linear-gradient(135deg, #F77F00, #FFAA33)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Crushmaxxing
            </span>
            <div
              className="px-2.5 py-1 rounded-full border text-xs font-bold"
              style={{ background: 'rgba(247,127,0,0.1)', borderColor: 'rgba(247,127,0,0.3)', color: '#F77F00' }}
            >
              CrushTalk
            </div>
          </Link>
        </div>

        <div className="rounded-2xl p-8 border" style={{ background: '#111111', borderColor: '#1F1F1F' }}>
          {/* Header */}
          <div className="text-center mb-7">
            <div className="text-4xl mb-3">🎁</div>
            <h1 className="font-montserrat font-bold text-white text-2xl mb-2">
              Ton analyse est prête !
            </h1>
            <p className="text-sm" style={{ color: '#9da3af' }}>
              Connecte-toi pour obtenir{' '}
              <strong className="text-white">5 crédits gratuits</strong>
            </p>
          </div>

          {error && (
            <div
              className="mb-4 p-3 rounded-xl"
              style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.3)' }}
            >
              <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
            </div>
          )}

          {/* Google button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-xl border-2 font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            style={{ borderColor: '#2A2A2A', background: '#0D0D0D' }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            {loading ? 'Connexion...' : 'Continuer avec Google'}
          </button>

          {/* Benefits */}
          <div className="space-y-3">
            {[
              'Pas de carte bancaire',
              '5 crédits offerts = 1 génération gratuite',
              'Inscription en 2 secondes',
            ].map(benefit => (
              <div key={benefit} className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(247,127,0,0.15)' }}
                >
                  <Check className="w-3 h-3" style={{ color: '#F77F00' }} />
                </div>
                <span className="text-sm" style={{ color: '#9da3af' }}>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs mt-5" style={{ color: '#6b7280' }}>
          En continuant, tu acceptes nos{' '}
          <Link href="/terms" className="hover:text-white transition-colors" style={{ color: '#9da3af' }}>
            CGU
          </Link>
          {' '}et notre{' '}
          <Link href="/privacy" className="hover:text-white transition-colors" style={{ color: '#9da3af' }}>
            Politique de confidentialité
          </Link>
        </p>
      </div>
    </div>
  )
}
