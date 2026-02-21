import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/start'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Check if user has an analysis
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: analysis } = await supabase
          .from('analyses')
          .select('status')
          .eq('user_id', user.id)
          .single()

        if (analysis?.status === 'paid') {
          return NextResponse.redirect(`${origin}/success`)
        } else if (analysis?.status === 'complete') {
          return NextResponse.redirect(`${origin}/results`)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth`)
}
