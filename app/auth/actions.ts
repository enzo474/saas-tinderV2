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

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/228ef050-cfb7-4157-ae07-e20cb469c801',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:signUpWithEmail:entry',message:'signup attempt',data:{email,redirectTo},timestamp:Date.now(),hypothesisId:'A-B-C-D'})}).catch(()=>{});
  // #endregion

  const { data: adminData, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/228ef050-cfb7-4157-ae07-e20cb469c801',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:signUpWithEmail:afterCreate',message:'admin.createUser result',data:{userId:adminData?.user?.id,errorMsg:createError?.message??null,errorCode:(createError as {code?:string}|null)?.code??null},timestamp:Date.now(),hypothesisId:'A-B-C'})}).catch(()=>{});
  // #endregion

  if (createError) {
    const msg = createError.message.toLowerCase()
    const alreadyExists =
      msg.includes('already') ||
      msg.includes('exists') ||
      msg.includes('registered')
    // Hypothesis A: "database error" should also be treated as potentially recoverable
    const isDbTriggerError =
      msg.includes('database error') ||
      msg.includes('db error')

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/228ef050-cfb7-4157-ae07-e20cb469c801',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:signUpWithEmail:errorBranch',message:'error classification',data:{alreadyExists,isDbTriggerError,fullMsg:createError.message},timestamp:Date.now(),hypothesisId:'A-C'})}).catch(()=>{});
    // #endregion

    if (!alreadyExists && !isDbTriggerError) {
      return { error: createError.message }
    }
    // Pour "database error" (trigger) ou "already exists" → on essaie quand même le sign-in
  }

  const userId = adminData?.user?.id

  if (userId) {
    await ensureUserProfiles(admin, userId)
  }

  // Connecter l'utilisateur
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/228ef050-cfb7-4157-ae07-e20cb469c801',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:signUpWithEmail:afterSignIn',message:'signIn result',data:{signInError:signInError?.message??null},timestamp:Date.now(),hypothesisId:'B-D'})}).catch(()=>{});
  // #endregion

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
