import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AuthForm } from './AuthForm'

export default async function AuthPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Déjà connecté → accès direct au dashboard
  if (user) redirect('/game')

  return <AuthForm />
}
