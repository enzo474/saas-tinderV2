import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AuthForm } from './AuthForm'

export default async function AuthPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/game/accroche')

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
