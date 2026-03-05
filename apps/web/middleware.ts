// apps/web/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public routes that don't need authentication
const publicRoutes = [
  '/',
  '/pricing',
  '/features',
  '/demo',
  '/about',
  '/blog',
  '/contact',
  '/login',
  '/signup',
  '/forgot-password'
]

// Auth routes (redirect to dashboard if logged in)
const authRoutes = ['/login', '/signup', '/forgot-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check for token in cookies
  const token = request.cookies.get('token')?.value
  const isAuthenticated = !!token

  // Allow public routes
  if (publicRoutes.includes(pathname) || pathname.startsWith('/api/')) {
    // If user is authenticated and tries to access auth routes, redirect to dashboard
    if (isAuthenticated && authRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Protect dashboard routes
  const isDashboardRoute = pathname.startsWith('/dashboard') ||
                          pathname.startsWith('/vendors') ||
                          pathname.startsWith('/procurement') ||
                          pathname.startsWith('/projects') ||
                          pathname.startsWith('/work-orders') ||
                          pathname.startsWith('/schedules') ||
                          pathname.startsWith('/resources') ||
                          pathname.startsWith('/invoices') ||
                          pathname.startsWith('/payments') ||
                          pathname.startsWith('/expenses') ||
                          pathname.startsWith('/budget') ||
                          pathname.startsWith('/documents') ||
                          pathname.startsWith('/reports') ||
                          pathname.startsWith('/settings') ||
                          pathname.startsWith('/profile') ||
                          pathname.startsWith('/calendar') ||
                          pathname.startsWith('/bids') ||
                          pathname.startsWith('/contracts') ||
                          pathname.startsWith('/quotes') ||
                          pathname.startsWith('/rfqs') ||
                          pathname.startsWith('/vendor') // Add vendor routes

  if (!isAuthenticated && isDashboardRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
