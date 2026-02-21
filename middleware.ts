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
    path.startsWith('/api/nanobanana/') ||
    path.startsWith('/api/stripe/')
  ) {
    return response
  }

  // Protected routes - require authentication
  if (!user) {
    const redirectResponse = NextResponse.redirect(new URL('/auth', request.url))
    return copyCookiesToResponse(response, redirectResponse)
  }

  // Admin routes - skip all checks for admin users
  if (path.startsWith('/admin')) {
    // Vérifier si l'utilisateur est admin
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userProfile?.role === 'admin') {
      return response // Admin bypass all checks
    }
  }

  // Check analysis status for specific routes
  const { data: analysis } = await supabase
    .from('analyses')
    .select('status, paid_at, ab_variant')
    .eq('user_id', user.id)
    .single()

  // Check if user is admin (exempts from all redirects)
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  const isAdmin = userProfile?.role === 'admin'

  // Admins bypass all analysis checks
  if (isAdmin) {
    return response
  }

  // Redirect authenticated users without analysis to /start
  // Exclure /onboarding et /ob2 pour éviter la boucle : /start → /onboarding → /start → ...
  if (
    !analysis &&
    !path.startsWith('/start') &&
    !path.startsWith('/onboarding') &&
    !path.startsWith('/ob2') &&
    !path.startsWith('/analysis') &&
    path !== '/auth/callback'
  ) {
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

  // Routes ob2 - require auth (already verified above)
  if (path.startsWith('/ob2')) {
    return response
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
