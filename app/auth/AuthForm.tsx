'use client'

import { useState, useEffect, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from './actions'
import { Check, Eye, EyeOff } from 'lucide-react'

type AuthMode = 'signup' | 'login'

export function AuthForm() {
  const [mode, setMode]           = useState<AuthMode>('signup')
  const [error, setError]         = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword, setShowPassword]   = useState(false)
  const [isPending, startTransition]      = useTransition()
  const searchParams = useSearchParams()

  const context   = searchParams.get('context')  // 'rizz' ou null
  const fromFlow  = searchParams.get('from')     // 'test-1' | 'test-2' ou null
  const isRizz    = context === 'rizz'
  const redirectTo = isRizz && fromFlow
    ? `/onboarding-${fromFlow}/reveal`
    : '/game/accroche'

  useEffect(() => {
    const urlError = searchParams.get('error')
    if (urlError) setError(decodeURIComponent(urlError))
    if (searchParams.get('mode') === 'login') setMode('login')
  }, [searchParams])

  const handleGoogleAuth = async () => {
    setGoogleLoading(true)
    setError(null)
    const result = await signInWithGoogle(redirectTo)
    if (result?.error) {
      setError(result.error)
      setGoogleLoading(false)
    }
  }

  const handleEmailSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const action = mode === 'signup' ? signUpWithEmail : signInWithEmail
      const result = await action(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  const loading = googleLoading || isPending

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: '#0A0A0A' }}
    >
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 20%, rgba(230,57,70,0.07), transparent 60%)' }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span
            className="font-montserrat font-extrabold text-2xl"
            style={{
              background: 'linear-gradient(135deg, #E63946, #FF4757)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Crushmaxxing
          </span>
        </div>

        <div
          className="rounded-2xl p-8 border"
          style={{ background: '#111111', borderColor: '#1F1F1F' }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">
              {isRizz ? '🔓' : (mode === 'signup' ? '🎁' : '👋')}
            </div>
            <h1 className="font-montserrat font-bold text-white text-2xl mb-2">
              {isRizz
                ? 'DÉBLOQUE TON ACCROCHE'
                : (mode === 'signup' ? 'Crée ton compte' : 'Content de te revoir')}
            </h1>
            {isRizz ? (
              <p className="text-sm font-semibold" style={{ color: '#9da3af' }}>
                Connecte-toi pour :
              </p>
            ) : (
              <p className="text-sm" style={{ color: '#9da3af' }}>
                {mode === 'signup'
                  ? <>Inscription gratuite · <strong className="text-white">1 accroche offerte</strong></>
                  : 'Connecte-toi pour accéder à tes outils'}
              </p>
            )}
          </div>

          {/* Liste bénéfices spéciale rizz - signup */}
          {isRizz && (
            <div className="mb-5 space-y-2">
              {[
                'Voir l\'accroche optimisée',
                '1 analyse gratuite en bonus',
                'Pas de carte bancaire',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(34,197,94,0.2)' }}>
                    <Check className="w-3 h-3" style={{ color: '#22c55e' }} />
                  </div>
                  <span className="text-sm font-medium text-white">{benefit}</span>
                </div>
              ))}
            </div>
          )}

          {/* Erreur / Succès */}
          {error && (
            <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.3)' }}>
              <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
            </div>
          )}

          {/* Bouton Google */}
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl border-2 font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            style={{ borderColor: '#2A2A2A', background: '#0D0D0D' }}
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            {googleLoading ? 'Connexion...' : (isRizz ? 'Continuer avec Google' : 'Continuer avec Google')}
          </button>

          {/* Séparateur */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background: '#2A2A2A' }} />
            <span className="text-xs font-medium" style={{ color: '#6b7280' }}>ou par email</span>
            <div className="flex-1 h-px" style={{ background: '#2A2A2A' }} />
          </div>

          {/* Formulaire email + mot de passe */}
          <form onSubmit={handleEmailSubmit} className="space-y-3 mb-5">
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <input
              type="email"
              name="email"
              required
              placeholder="ton@email.com"
              className="w-full px-4 py-3 rounded-xl border text-white text-sm outline-none transition-colors"
              style={{ background: '#0D0D0D', borderColor: '#2A2A2A', color: '#fff' }}
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                minLength={6}
                placeholder={mode === 'signup' ? 'Mot de passe (min. 6 caractères)' : 'Mot de passe'}
                className="w-full px-4 py-3 pr-11 rounded-xl border text-white text-sm outline-none transition-colors"
                style={{ background: '#0D0D0D', borderColor: '#2A2A2A', color: '#fff' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: '#6b7280' }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
            >
              {isPending
                ? 'Chargement...'
                : mode === 'signup' ? "S'inscrire gratuitement" : 'Se connecter'}
            </button>
          </form>

          {/* Toggle mode */}
          <p className="text-center text-sm" style={{ color: '#6b7280' }}>
            {mode === 'signup' ? 'Déjà un compte ?' : 'Pas encore de compte ?'}{' '}
            <button
              onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(null) }}
              className="font-semibold transition-colors hover:text-white"
              style={{ color: '#9da3af' }}
            >
              {mode === 'signup' ? 'Se connecter' : "S'inscrire gratuitement"}
            </button>
          </p>

          {/* Bénéfices — signup uniquement, masqué en contexte rizz (déjà affiché en haut) */}
          {mode === 'signup' && !isRizz && (
            <div className="mt-5 pt-5 border-t space-y-2.5" style={{ borderColor: '#1F1F1F' }}>
              {[
                'Pas de carte bancaire requise',
                '1 accroche ou réponse gratuite offerte',
                'Inscription en 30 secondes',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(230,57,70,0.15)' }}>
                    <Check className="w-3 h-3" style={{ color: '#E63946' }} />
                  </div>
                  <span className="text-sm" style={{ color: '#9da3af' }}>{benefit}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-xs mt-5" style={{ color: '#6b7280' }}>
          En continuant, tu acceptes nos{' '}
          <a href="/terms" className="hover:text-white transition-colors" style={{ color: '#9da3af' }}>CGU</a>
          {' '}et notre{' '}
          <a href="/privacy" className="hover:text-white transition-colors" style={{ color: '#9da3af' }}>Politique de confidentialité</a>.
        </p>
      </div>
    </div>
  )
}
