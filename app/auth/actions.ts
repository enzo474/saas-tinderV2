'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function signInWithEmail(formData: FormData) {
  console.log('🔐 [AUTH] signInWithEmail - START')
  
  const supabase = await createClient()
  console.log('✅ [AUTH] Supabase client created')

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  console.log('📧 [AUTH] Email:', email)

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('❌ [AUTH] signInWithPassword error:', error.message)
    return { error: error.message }
  }

  console.log('✅ [AUTH] User signed in:', data.user?.id)

  // Check if user has an analysis
  const { data: { user } } = await supabase.auth.getUser()
  console.log('👤 [AUTH] User retrieved:', user?.id)
  
  if (user) {
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .select('status')
      .eq('user_id', user.id)
      .single()

    if (analysisError) {
      console.log('⚠️ [AUTH] No analysis found (normal for new user):', analysisError.message)
    } else {
      console.log('📊 [AUTH] Analysis found, status:', analysis?.status)
    }

    if (analysis?.status === 'paid') {
      console.log('➡️ [AUTH] Redirecting to /success')
      redirect('/success')
    } else if (analysis?.status === 'complete') {
      console.log('➡️ [AUTH] Redirecting to /results')
      redirect('/results')
    }
  }

  console.log('➡️ [AUTH] Redirecting to /onboarding/intro')
  redirect('/onboarding/intro')
}

export async function signUpWithEmail(formData: FormData) {
  console.log('🔐 [AUTH] signUpWithEmail - START')
  
  const supabase = await createClient()
  console.log('✅ [AUTH] Supabase client created')

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  console.log('📧 [AUTH] Email:', email)

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    console.error('❌ [AUTH] signUp error:', error.message)
    return { error: error.message }
  }

  console.log('✅ [AUTH] User signed up:', data.user?.id)
  console.log('➡️ [AUTH] Redirecting to /onboarding/intro')
  redirect('/onboarding/intro')
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const origin = (await headers()).get('origin')

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
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

  // Supprimer les données utilisateur
  await supabase.from('generated_bios').delete().eq('user_id', user.id)
  await supabase.from('generated_images').delete().eq('user_id', user.id)
  await supabase.from('analyses').delete().eq('user_id', user.id)

  // Supprimer le compte auth
  await supabase.auth.admin?.deleteUser(user.id)
  await supabase.auth.signOut()

  redirect('/auth')
}
