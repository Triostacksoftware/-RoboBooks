import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check for authentication cookies
  const hasAuthCookie = request.cookies.has('rb_session')
  
  // If user is on login pages and has auth cookie, redirect to dashboard
  if ((pathname === '/signin' || pathname === '/admin/login') && hasAuthCookie) {
    console.log('🔐 User has auth cookie on login page, redirecting to dashboard')
    if (pathname === '/admin/login') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // If user is on dashboard/admin pages and has no auth cookie, redirect to login
  if ((pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) && !hasAuthCookie) {
    console.log('🔐 User has no auth cookie on protected page, redirecting to login')
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    } else {
      return NextResponse.redirect(new URL('/signin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
