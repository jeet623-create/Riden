import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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

  // 2. Hostname-based rewrites (admin.*, dmc.*)
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl.clone()
  let newPath: string | null = null

  if (hostname.startsWith('admin.')) {
    if (!url.pathname.startsWith('/admin')) {
      newPath = '/admin' + (url.pathname === '/' ? '' : url.pathname)
    }
  } else if (hostname.startsWith('dmc.')) {
    if (url.pathname === '/') newPath = '/dmc/dashboard'
    else if (!url.pathname.startsWith('/dmc')) newPath = '/dmc' + url.pathname
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
    return rewriteResponse
  }

  response.headers.set('x-pathname', finalPathname)
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
