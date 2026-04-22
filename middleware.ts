import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { countryToLang, SUPPORTED_LANGS, type Lang } from '@/lib/marketing-i18n'

// Public routes that never require an auth cookie refresh in middleware.
// Skipping the Supabase getUser() roundtrip keeps these pages fast.
const PUBLIC_ROUTES = new Set([
  '/dmc/login',
  '/dmc/register',
  '/dmc/forgot-password',
  '/dmc/reset-password',
])

export async function middleware(request: NextRequest) {
  // 1. Hostname-based rewrites (admin.*, dmc.*, apex marketing) — compute first
  //    so we know the effective route before deciding whether to touch Supabase.
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl.clone()
  let newPath: string | null = null
  const isStaticAsset = /\.[a-z0-9]{1,6}$/i.test(url.pathname)

  if (!isStaticAsset) {
    if (hostname.startsWith('admin.')) {
      if (url.pathname === '/') newPath = '/admin/dashboard'
      else if (!url.pathname.startsWith('/admin')) newPath = '/admin' + url.pathname
    } else if (hostname.startsWith('dmc.')) {
      if (url.pathname === '/') newPath = '/dmc/dashboard'
      else if (!url.pathname.startsWith('/dmc')) newPath = '/dmc' + url.pathname
    }
    // Apex / www / any other hostname → marketing site (app/(marketing)/page.tsx).
    // All marketing paths are handled by the (marketing) route group; no rewrite needed.
  }

  const finalPathname = newPath || url.pathname

  // 2. Session refresh via @supabase/ssr (keeps auth cookies fresh) — skipped
  //    for known-public routes so the login/register pages don't block on a
  //    Supabase network call.
  let response = NextResponse.next({ request })
  let user: { id: string } | null = null

  if (!PUBLIC_ROUTES.has(finalPathname)) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            response = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )
    // Must call getUser() for session refresh; do NOT remove for protected routes
    const { data } = await supabase.auth.getUser()
    user = data.user
  }

  // 2.5. Admin auth gate — unauthenticated hits to /admin/* (except login) go to /admin/login
  const isAdminProtected =
    !isStaticAsset &&
    finalPathname.startsWith('/admin') &&
    finalPathname !== '/admin/login'

  if (isAdminProtected && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = hostname.startsWith('admin.') ? '/login' : '/admin/login'
    loginUrl.search = `?next=${encodeURIComponent(finalPathname)}`
    const redirectResponse = NextResponse.redirect(loginUrl)
    for (const cookie of response.cookies.getAll()) {
      redirectResponse.cookies.set(cookie)
    }
    return redirectResponse
  }

  // 3. If rewrite needed, build rewrite response and copy auth cookies
  if (newPath) {
    url.pathname = newPath
    const rewriteResponse = NextResponse.rewrite(url, { request })
    for (const cookie of response.cookies.getAll()) {
      rewriteResponse.cookies.set(cookie)
    }
    rewriteResponse.headers.set('x-pathname', finalPathname)
    setLangCookieIfMissing(request, rewriteResponse)
    return rewriteResponse
  }

  response.headers.set('x-pathname', finalPathname)
  setLangCookieIfMissing(request, response)
  return response
}

function setLangCookieIfMissing(request: NextRequest, response: NextResponse) {
  const existing = request.cookies.get('riden_lang')?.value
  if (existing && SUPPORTED_LANGS.includes(existing as Lang)) return
  const country = request.headers.get('x-vercel-ip-country') || null
  const lang = countryToLang(country)
  response.cookies.set('riden_lang', lang, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
