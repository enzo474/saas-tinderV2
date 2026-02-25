import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/game'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Créer 5 crédits pour les nouveaux utilisateurs (si pas encore créés)
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

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth`)
}
