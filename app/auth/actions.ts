'use server'

import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Crée toutes les entrées nécessaires pour un nouvel utilisateur.
 * Remplace les triggers Supabase pour éviter "Database error saving new user".
 */
async function ensureUserProfiles(admin: SupabaseClient, userId: string) {
  // user_profiles (credits + role)
  try {
    await admin.from('user_profiles').upsert(
      { id: userId, credits: 0, role: 'user' },
      { onConflict: 'id', ignoreDuplicates: true }
    )
  } catch { /* non-bloquant */ }

  // user_progression
  try {
    await admin.from('user_progression').upsert(
      { user_id: userId },
      { onConflict: 'user_id', ignoreDuplicates: true }
    )
  } catch { /* non-bloquant */ }

  // crushtalk_credits (5 analyses offertes)
  try {
    await admin.from('crushtalk_credits').upsert(
      { user_id: userId, balance: 5, used_total: 0 },
      { onConflict: 'user_id', ignoreDuplicates: true }
    )
  } catch { /* non-bloquant */ }
}

export async function signInWithEmail(formData: FormData) {
  const supabase   = await createClient()
  const email      = formData.get('email') as string
  const password   = formData.get('password') as string
  const redirectTo = (formData.get('redirectTo') as string) || '/game/accroche'

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }

  redirect(redirectTo)
}

export async function signUpWithEmail(formData: FormData) {
  const supabase   = await createClient()
  const email      = formData.get('email') as string
  const password   = formData.get('password') as string
  const redirectTo = (formData.get('redirectTo') as string) || '/game/accroche'

  const admin = createServiceRoleClient()

  // Utiliser l'admin API pour créer l'user directement avec email confirmé
  // Évite l'erreur "Database error saving new user" causée par les triggers
  const { data: adminData, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (createError) {
    // Si l'user existe déjà, on tente simplement la connexion
    const alreadyExists =
      createError.message.toLowerCase().includes('already') ||
      createError.message.toLowerCase().includes('exists') ||
      createError.message.toLowerCase().includes('registered')

    if (!alreadyExists) {
      return { error: createError.message }
    }
    // Sinon on continue vers le signIn ci-dessous
  }

  const userId = adminData?.user?.id

  if (userId) {
    await ensureUserProfiles(admin, userId)
  }

  // Connecter l'utilisateur
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
  if (signInError) return { error: signInError.message }

  redirect(redirectTo)
}

export async function signInWithGoogle(redirectTo?: string) {
  const supabase = await createClient()
  const origin   = (await headers()).get('origin')

  const nextPath = redirectTo || '/game/accroche'
  const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: callbackUrl },
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
