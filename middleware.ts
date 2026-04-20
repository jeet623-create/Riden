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

  // dmc.riden.me -> rewrite to /dmc/* (or root DMC pages)
  if (hostname.startsWith('dmc.')) {
    // Already on a DMC path — let it through
    if (
      url.pathname.startsWith('/dashboard') ||
      url.pathname.startsWith('/bookings') ||
      url.pathname.startsWith('/calendar') ||
      url.pathname.startsWith('/operators') ||
      url.pathname.startsWith('/drivers') ||
      url.pathname.startsWith('/trips') ||
      url.pathname.startsWith('/payments') ||
      url.pathname.startsWith('/reports') ||
      url.pathname.startsWith('/support') ||
      url.pathname.startsWith('/login') ||
      url.pathname.startsWith('/register') ||
      url.pathname.startsWith('/privacy')
    ) {
      return NextResponse.next()
    }
    // Rewrite root to /dashboard for DMC
    if (url.pathname === '/') {
      url.pathname = '/dashboard'
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
