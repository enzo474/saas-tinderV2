import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/game/accroche'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Crédits offerts : créés de façon non-bloquante (erreur ignorée)
      try {
        const { createServiceRoleClient } = await import('@/lib/supabase/server')
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const supabaseAdmin = createServiceRoleClient()
          const { data: existing } = await supabaseAdmin
            .from('crushtalk_credits')
            .select('user_id')
            .eq('user_id', user.id)
            .single()
          if (!existing) {
            await supabaseAdmin.from('crushtalk_credits').insert({
              user_id: user.id,
              balance: 5,
              used_total: 0,
            })
          }
        }
      } catch { /* non-bloquant */ }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth`)
}
