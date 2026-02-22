import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function copyCookiesToResponse(
  from: NextResponse,
  to: NextResponse
): NextResponse {
  from.cookies.getAll().forEach((c) => to.cookies.set(c.name, c.value))
  return to
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
          )
        },
      },
    }
  )

  // Revalider la session et rafraîchir les tokens. getSession() n'est pas fiable en Proxy.
  // getClaims() valide le JWT et met à jour les cookies (request + response).
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims
  const user = claims?.sub
    ? { id: claims.sub as string }
    : null

  const path = request.nextUrl.pathname

  // Public routes (dont les webhooks externes — pas de session utilisateur)
  if (
    path === '/' ||
    path === '/auth' ||
    path.startsWith('/auth/callback') ||
    path === '/privacy' ||
    path === '/terms' ||
    path === '/crushtalk' ||
    path === '/crushtalk/login' ||
    path.startsWith('/api/nanobanana/') ||
    path.startsWith('/api/stripe/') ||
    path.startsWith('/api/crushtalk/checkout-session')
  ) {
    return response
  }

  // Protected routes - require authentication
  if (!user) {
    const redirectResponse = NextResponse.redirect(new URL('/auth', request.url))
    return copyCookiesToResponse(response, redirectResponse)
  }

  // Routes dashboard : le layout gère lui-même auth + paiement — on évite les DB calls inutiles
  if (path.startsWith('/dashboard')) {
    return response
  }

  // Routes CrushTalk app (/ct/) : juste auth, layout gère le reste
  if (path.startsWith('/ct/') || path === '/ct') {
    return response
  }

  // Pour les routes onboarding/ob2/analysis + CrushTalk : juste auth, pas de check DB
  if (
    path.startsWith('/onboarding') ||
    path.startsWith('/ob2') ||
    path.startsWith('/analysis') ||
    path.startsWith('/start') ||
    path.startsWith('/crushtalk/')
  ) {
    return response
  }

  // Routes nécessitant un check DB : /results, /pricing, /success + redirect /start
  // On lance les deux queries en parallèle (une seule fois)
  const [{ data: analysis }, { data: userProfile }] = await Promise.all([
    supabase
      .from('analyses')
      .select('status, paid_at, ab_variant')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single(),
  ])

  // Admins bypass tout
  if (userProfile?.role === 'admin') {
    return response
  }

  // Redirect authenticated users without analysis to /start
  if (!analysis) {
    return copyCookiesToResponse(
      response,
      NextResponse.redirect(new URL('/start', request.url))
    )
  }

  // Results page - requires complete status
  if (path === '/results' && analysis?.status !== 'complete' && analysis?.status !== 'paid') {
    const onboardingRoute = analysis?.ab_variant === 'B' ? '/ob2/intro' : '/onboarding/intro'
    return copyCookiesToResponse(
      response,
      NextResponse.redirect(new URL(onboardingRoute, request.url))
    )
  }

  // Pricing page - requires complete status
  if (path === '/pricing' && analysis?.status !== 'complete' && analysis?.status !== 'paid') {
    const onboardingRoute = analysis?.ab_variant === 'B' ? '/ob2/intro' : '/onboarding/intro'
    return copyCookiesToResponse(
      response,
      NextResponse.redirect(new URL(onboardingRoute, request.url))
    )
  }

  // Success page - requires payment
  if (path === '/success' && !analysis?.paid_at) {
    return copyCookiesToResponse(
      response,
      NextResponse.redirect(new URL('/pricing', request.url))
    )
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - /admin (auth vérifiée dans la page admin côté serveur, évite session nulle en Edge)
     */
    '/((?!_next/static|_next/image|favicon.ico|admin|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
