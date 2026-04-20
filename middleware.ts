import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || ''
  const url = req.nextUrl.clone()

  // admin.riden.me -> rewrite to /admin/*
  if (hostname.startsWith('admin.')) {
    // Already on an /admin path — let it through
    if (url.pathname.startsWith('/admin')) {
      return NextResponse.next()
    }
    // Rewrite root to /admin
    url.pathname = '/admin' + (url.pathname === '/' ? '' : url.pathname)
    return NextResponse.rewrite(url)
  }

  // dmc.riden.me -> rewrite flat paths to /dmc/*
  if (hostname.startsWith('dmc.')) {
    if (url.pathname === '/') {
      url.pathname = '/dmc/dashboard'
      return NextResponse.rewrite(url)
    }
    if (!url.pathname.startsWith('/dmc')) {
      url.pathname = '/dmc' + url.pathname
      return NextResponse.rewrite(url)
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
