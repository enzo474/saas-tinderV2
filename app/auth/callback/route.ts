import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
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
          setAll(toSet) {
            // Stocker pour les copier manuellement dans la réponse redirect
            toSet.forEach(c => cookiesToSet.push(c))
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Créer 5 crédits pour les nouveaux utilisateurs (non-bloquant)
      try {
        const { createServiceRoleClient } = await import('@/lib/supabase/server')
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const admin = createServiceRoleClient()
          const { data: existing } = await admin
            .from('crushtalk_credits')
            .select('user_id')
            .eq('user_id', user.id)
            .single()
          if (!existing) {
            await admin.from('crushtalk_credits').insert({
              user_id: user.id,
              balance: 5,
              used_total: 0,
            })
          }
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
