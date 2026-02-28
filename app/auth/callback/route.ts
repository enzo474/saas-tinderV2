import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const googleError = searchParams.get('error')
  const next = searchParams.get('next') ?? '/game/accroche'

  // Google a renvoyé une erreur (ex: accès refusé, compte non autorisé)
  if (googleError) {
    const desc = searchParams.get('error_description') ?? googleError
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent(desc)}`
    )
  }

  if (code) {
    // Collecter les cookies que Supabase veut définir
    const cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }> = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(toSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
            toSet.forEach(c => cookiesToSet.push(c))
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Créer toutes les entrées nécessaires pour un nouveau user (non-bloquant)
      try {
        const { createServiceRoleClient } = await import('@/lib/supabase/server')
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const admin = createServiceRoleClient()

          // user_profiles
          await admin.from('user_profiles').upsert(
            { id: user.id, credits: 0, role: 'user' },
            { onConflict: 'id', ignoreDuplicates: true }
          )

          // user_progression
          await admin.from('user_progression').upsert(
            { user_id: user.id },
            { onConflict: 'user_id', ignoreDuplicates: true }
          )

          // crushtalk_credits
          await admin.from('crushtalk_credits').upsert(
            { user_id: user.id, balance: 5, used_total: 0 },
            { onConflict: 'user_id', ignoreDuplicates: true }
          )
        }
      } catch { /* non-bloquant */ }

      // ✅ Copier les cookies Supabase dans la réponse redirect
      const redirectResponse = NextResponse.redirect(`${origin}${next}`)
      cookiesToSet.forEach(({ name, value, options }) => {
        redirectResponse.cookies.set(
          name,
          value,
          options as Parameters<typeof redirectResponse.cookies.set>[2]
        )
      })
      return redirectResponse
    }
  }

  return NextResponse.redirect(`${origin}/auth`)
}
