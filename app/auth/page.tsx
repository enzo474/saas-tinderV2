'use client'

import { useState } from 'react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from './actions'

const passwordRules = [
  { id: 'length',  label: '8 caractères minimum',      test: (p: string) => p.length >= 8 },
  { id: 'upper',   label: '1 majuscule',                test: (p: string) => /[A-Z]/.test(p) },
  { id: 'number',  label: '1 chiffre',                  test: (p: string) => /[0-9]/.test(p) },
  { id: 'special', label: '1 caractère spécial (!@#…)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordTouched, setPasswordTouched] = useState(false)

  const allRulesPassed = passwordRules.every(r => r.test(password))

  const handleEmailAuth = async (formData: FormData) => {
    if (isSignUp && !allRulesPassed) {
      setPasswordTouched(true)
      return
    }
    setLoading(true)
    setError(null)

    const result = isSignUp
      ? await signUpWithEmail(formData)
      : await signInWithEmail(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
    // Si pas d'erreur, le redirect() dans la Server Action va gérer la navigation
  }

  const handleGoogleAuth = async () => {
    setLoading(true)
    setError(null)

    const result = await signInWithGoogle()
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
    // Si pas d'erreur, le redirect() va gérer la navigation
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-4 py-12">
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 20%, rgba(230,57,70,0.06), transparent 60%)' }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span
            className="font-montserrat font-extrabold text-2xl md:text-3xl"
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

        <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-8">
          <h1 className="font-montserrat font-bold text-white text-2xl mb-1 text-center">
            {isSignUp ? 'Crée ton compte' : 'Connexion'}
          </h1>
          <p className="text-text-secondary text-center text-sm mb-6">
            {isSignUp ? 'Pour accéder à ton analyse personnalisée' : 'Bienvenue de retour'}
          </p>

          {error && (
            <div className="bg-red-primary/10 border border-red-primary/50 rounded-xl p-3 mb-5">
              <p className="text-red-light text-sm">{error}</p>
            </div>
          )}

          <form action={handleEmailAuth} className="space-y-4 mb-4">
            <Input
              type="email"
              name="email"
              placeholder="Email"
              required
              disabled={loading}
            />
            <div className="space-y-2">
              <Input
                type="password"
                name="password"
                placeholder="Mot de passe"
                required
                disabled={loading}
                value={password}
                onChange={e => { setPassword(e.target.value); setPasswordTouched(true) }}
              />
              {isSignUp && passwordTouched && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                  {passwordRules.map(rule => {
                    const ok = rule.test(password)
                    return (
                      <div key={rule.id} className="flex items-center gap-1.5">
                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 transition-colors ${ok ? 'bg-green-500 text-white' : 'bg-bg-tertiary border border-border-primary text-text-tertiary'}`}>
                          {ok ? '✓' : ''}
                        </span>
                        <span className={`text-xs transition-colors ${ok ? 'text-green-400' : 'text-text-tertiary'}`}>
                          {rule.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            <Button
              type="submit"
              className="w-full justify-center"
              disabled={loading}
            >
              {loading ? 'Chargement...' : isSignUp ? 'Créer mon compte' : 'Continuer →'}
            </Button>
          </form>

          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-border-primary" />
            <span className="text-text-tertiary text-sm">ou</span>
            <div className="flex-1 h-px bg-border-primary" />
          </div>

          <Button
            variant="secondary"
            onClick={handleGoogleAuth}
            className="w-full justify-center"
            disabled={loading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuer avec Google
          </Button>

          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setPassword(''); setPasswordTouched(false); setError(null) }}
            className="w-full text-center text-text-secondary text-sm mt-6 hover:text-white transition-colors"
          >
            {isSignUp ? 'Déjà un compte ? Se connecter' : "Pas encore de compte ? S'inscrire"}
          </button>
        </div>
      </div>
    </div>
  )
}
