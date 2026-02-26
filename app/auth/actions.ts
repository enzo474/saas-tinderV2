'use server'

import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function signInWithEmail(formData: FormData) {
  const supabase = await createClient()
  const email    = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }

  redirect('/game/accroche')
}

export async function signUpWithEmail(formData: FormData) {
  const supabase = await createClient()
  const email    = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return { error: error.message }

  // Créer les 5 crédits de bienvenue pour le nouveau compte
  if (data.user) {
    try {
      const admin = createServiceRoleClient()
      const { data: existing } = await admin
        .from('crushtalk_credits')
        .select('user_id')
        .eq('user_id', data.user.id)
        .single()

      if (!existing) {
        await admin.from('crushtalk_credits').insert({
          user_id:    data.user.id,
          balance:    5,
          used_total: 0,
        })
      }
    } catch { /* non-bloquant */ }
  }

  // Si Supabase nécessite une confirmation email, on ne redirige pas automatiquement
  // (le AuthForm affiche un message de succès)
  // Si la session est immédiatement créée (email confirmation désactivée), on redirige
  if (data.session) {
    redirect('/game/accroche')
  }

  return {}
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const origin   = (await headers()).get('origin')

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${origin}/auth/callback` },
  })

  if (error) return { error: error.message }
  if (data.url) redirect(data.url)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth')
}

export async function deleteAccount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  await supabase.from('generated_bios').delete().eq('user_id', user.id)
  await supabase.from('generated_images').delete().eq('user_id', user.id)
  await supabase.from('analyses').delete().eq('user_id', user.id)

  await supabase.auth.admin?.deleteUser(user.id)
  await supabase.auth.signOut()

  redirect('/auth')
}
