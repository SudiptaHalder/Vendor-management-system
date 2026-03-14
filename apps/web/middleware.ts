// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'

// export function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl
  
//   // Check for tokens in cookies
//   const adminToken = request.cookies.get('token')?.value
//   const vendorToken = request.cookies.get('vendorToken')?.value

//   // Public routes that don't need authentication
//   const publicRoutes = [
//     '/',
//     '/pricing',
//     '/features',
//     '/demo',
//     '/about',
//     '/blog',
//     '/contact',
//     '/admin-login',     // Changed from '/login'
//     '/vendor-login',    // Vendor login
//     '/signup',
//     '/forgot-password'
//   ]

//   // Allow public routes
//   if (publicRoutes.includes(pathname)) {
//     return NextResponse.next()
//   }

//   // Handle vendor routes
//   if (pathname.startsWith('/vendor')) {
//     if (!vendorToken) {
//       const loginUrl = new URL('/vendor-login', request.url)
//       return NextResponse.redirect(loginUrl)
//     }
//     return NextResponse.next()
//   }

//   // Handle admin routes
//   const isAdminRoute = pathname.startsWith('/dashboard') ||
//                       pathname.startsWith('/vendors') ||
//                       pathname.startsWith('/procurement') ||
//                       pathname.startsWith('/projects') ||
//                       pathname.startsWith('/work-orders') ||
//                       pathname.startsWith('/schedules') ||
//                       pathname.startsWith('/resources') ||
//                       pathname.startsWith('/invoices') ||
//                       pathname.startsWith('/payments') ||
//                       pathname.startsWith('/expenses') ||
//                       pathname.startsWith('/budget') ||
//                       pathname.startsWith('/documents') ||
//                       pathname.startsWith('/reports') ||
//                       pathname.startsWith('/settings') ||
//                       pathname.startsWith('/profile') ||
//                       pathname.startsWith('/calendar') ||
//                       pathname.startsWith('/bids') ||
//                       pathname.startsWith('/contracts') ||
//                       pathname.startsWith('/quotes') ||
//                       pathname.startsWith('/rfqs')

//   if (!adminToken && isAdminRoute) {
//     const loginUrl = new URL('/admin-login', request.url)  // Changed from '/login'
//     return NextResponse.redirect(loginUrl)
//   }

//   return NextResponse.next()
// }

// export const config = {
//   matcher: [
//     '/((?!_next/static|_next/image|favicon.ico).*)',
//   ],
// }
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  const adminToken = request.cookies.get('token')?.value
  const vendorToken = request.cookies.get('vendorToken')?.value

  // Public routes (no auth needed)
  const publicRoutes = [
    '/',
    '/pricing',
    '/features',
    '/demo',
    '/about',
    '/blog',
    '/contact',
    '/admin-login',
    '/vendor-login',
    '/signup',
    '/forgot-password'
  ]

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Handle vendor routes
  if (pathname.startsWith('/vendor')) {
    if (!vendorToken) {
      return NextResponse.redirect(new URL('/vendor-login', request.url))
    }
    return NextResponse.next()
  }

  // Handle admin routes
  const isAdminRoute = pathname.startsWith('/dashboard') ||
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
                      pathname.startsWith('/rfqs')

  if (!adminToken && isAdminRoute) {
    return NextResponse.redirect(new URL('/admin-login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}