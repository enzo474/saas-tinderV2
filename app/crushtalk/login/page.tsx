'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Sparkles } from 'lucide-react'

export default function CrushTalkLogin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/crushtalk/onboarding`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/crushtalk">
            <span
              className="font-montserrat font-extrabold text-2xl"
              style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
            >
              Crushmaxxing
            </span>
          </Link>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#F77F00]/30 bg-[#F77F00]/10 text-[#F77F00] text-xs font-semibold">
            <Sparkles className="w-3 h-3" />
            CrushTalk
          </div>
        </div>

        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-8">
          <h1 className="font-montserrat font-bold text-white text-2xl mb-2 text-center">
            Connexion
          </h1>
          <p className="text-[#6b7280] text-sm text-center mb-8">
            Connecte-toi pour accéder à CrushTalk
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-xl border-2 border-[#2A2A2A] hover:border-[#F77F00]/40 bg-[#0A0A0A] text-white font-semibold text-sm transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>

        <p className="text-center text-[#6b7280] text-xs mt-6">
          En continuant, tu acceptes nos{' '}
          <Link href="/terms" className="text-[#9da3af] hover:text-white transition-colors">CGU</Link>
          {' '}et notre{' '}
          <Link href="/privacy" className="text-[#9da3af] hover:text-white transition-colors">Politique de confidentialité</Link>
        </p>
      </div>
    </div>
  )
}
