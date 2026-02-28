import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AuthForm } from './AuthForm'

export default async function AuthPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const params = await searchParams
    const context = params?.context
    const from    = params?.from
    // Si l'user arrive depuis les flows rizz, le renvoyer vers la page reveal
    if (context === 'rizz' && from === 'test-1') redirect('/onboarding-test-1/reveal')
    if (context === 'rizz' && from === 'test-2') redirect('/onboarding-test-2/reveal')
    redirect('/game/accroche')
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0A' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(230,57,70,0.2)', borderTopColor: '#E63946' }} />
      </div>
    }>
      <AuthForm />
    </Suspense>
  )
}
