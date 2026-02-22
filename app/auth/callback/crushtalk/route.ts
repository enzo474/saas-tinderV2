import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Si l'onboarding CrushTalk est déjà fait → dashboard hooks directement
        const { data: onboarding } = await supabase
          .from('crushtalk_onboarding')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (onboarding) {
          return NextResponse.redirect(`${origin}/dashboard/hooks`)
        }
      }

      // Sinon → onboarding CrushTalk
      return NextResponse.redirect(`${origin}/crushtalk/onboarding`)
    }
  }

  return NextResponse.redirect(`${origin}/crushtalk/login`)
}
