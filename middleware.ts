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

  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims
  const user = claims?.sub
    ? { id: claims.sub as string }
    : null

  const path = request.nextUrl.pathname

  // ── Redirections CrushPicture (produit désactivé) ──────────────────────────
  // /dashboard/admin reste accessible pour les admins
  if (
    path === '/crushpicture' ||
    path === '/start' ||
    path.startsWith('/onboarding') ||
    path.startsWith('/ob2') ||
    path.startsWith('/analysis') ||
    path === '/results' ||
    (path === '/pricing' && !path.startsWith('/game')) ||
    (path.startsWith('/dashboard') && !path.startsWith('/dashboard/admin'))
  ) {
    return copyCookiesToResponse(
      response,
      NextResponse.redirect(new URL('/coming-soon', request.url))
    )
  }

  // ── Redirections CrushTalk standalone (produit intégré dans /game) ─────────
  if (path === '/crushtalk' || path.startsWith('/crushtalk/')) {
    return copyCookiesToResponse(
      response,
      NextResponse.redirect(new URL('/game/accroche', request.url))
    )
  }

  // ── Redirections anciennes routes /ct/ ─────────────────────────────────────
  if (path === '/ct/accroche') {
    return NextResponse.redirect(new URL('/game/accroche', request.url))
  }
  if (path === '/ct/discussion') {
    return NextResponse.redirect(new URL('/game/discussion', request.url))
  }
  if (path === '/ct/pricing') {
    return NextResponse.redirect(new URL('/game/pricing', request.url))
  }
  if (path.startsWith('/ct/') || path === '/ct') {
    return NextResponse.redirect(new URL('/game', request.url))
  }

  // ── Routes publiques (pas d'auth requise) ──────────────────────────────────
  if (
    path === '/' ||
    path === '/coming-soon' ||
    path === '/auth' ||
    path.startsWith('/auth/callback') ||
    path === '/game/onboarding' ||
    path === '/game/accroche' ||
    path === '/game/discussion' ||
    path === '/game/pricing' ||
    path === '/privacy' ||
    path === '/terms' ||
    path.startsWith('/api/nanobanana/') ||
    path.startsWith('/api/stripe/') ||
    path.startsWith('/api/crushtalk/checkout-session') ||
    path.startsWith('/api/check-free-analysis') ||
    path.startsWith('/api/use-free-analysis')
  ) {
    return response
  }

  // ── Routes protégées : auth requise ───────────────────────────────────────
  if (!user) {
    const redirectResponse = NextResponse.redirect(new URL('/auth', request.url))
    return copyCookiesToResponse(response, redirectResponse)
  }

  // ── Routes /game/* : auth uniquement (le layout gère les droits admin) ─────
  if (path.startsWith('/game') || path.startsWith('/admin') || path.startsWith('/presale')) {
    return response
  }

  // ── Admin panel : auth gérée côté page ────────────────────────────────────
  if (path === '/success' || path === '/success/premium') {
    return response
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|admin|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
