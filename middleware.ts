import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { countryToLang, SUPPORTED_LANGS, type Lang } from '@/lib/marketing-i18n'

export async function middleware(request: NextRequest) {
  // 1. Session refresh via @supabase/ssr (keeps auth cookies fresh)
  let response = NextResponse.next({ request })

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
  // Must call getUser() for session refresh; do NOT remove
  await supabase.auth.getUser()

  // 2. Hostname-based rewrites (admin.*, dmc.*, apex marketing)
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
    } else {
      // Apex / www / any other hostname → marketing site
      // Root / is the 3D cinematic landing (static HTML in public/)
      if (url.pathname === '/') newPath = '/landing-3d.html'
      // All other marketing paths are handled by the (marketing) route group
    }
  }

  const finalPathname = newPath || url.pathname

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
