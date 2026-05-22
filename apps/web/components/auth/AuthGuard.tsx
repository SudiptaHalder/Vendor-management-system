'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')

    console.log('AuthGuard - Pathname:', pathname)
    console.log('AuthGuard - Token exists:', !!token)
    console.log('AuthGuard - User exists:', !!userStr)

    // Public routes that don't require authentication
    const publicRoutes = ['/admin-login', '/vendor-login', '/vendor/public']
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

    if (isPublicRoute) {
      setIsLoading(false)
      return
    }

    if (!token || !userStr) {
      console.log('AuthGuard - No auth, redirecting to admin-login')
      router.push('/admin-login')
      setIsLoading(false)
      return
    }

    try {
      const user = JSON.parse(userStr)
      console.log('AuthGuard - User type:', user.type, 'Role:', user.role)

      // Check if user is trying to access admin routes with vendor account
      const isAdminRoute = pathname.startsWith('/vendors') || 
                          pathname.startsWith('/dashboard') || 
                          pathname.startsWith('/admin') ||
                          pathname === '/' ||
                          pathname.startsWith('/reports') ||
                          pathname.startsWith('/settings')

      const isVendorRoute = pathname.startsWith('/vendor')

      if (isAdminRoute && (user.type === 'vendor' || user.role === 'vendor')) {
        console.log('AuthGuard - Vendor trying to access admin route, redirecting to vendor dashboard')
        router.push('/vendor/dashboard')
        setIsLoading(false)
        return
      }

      if (isVendorRoute && (user.type === 'admin' || user.role === 'super_admin')) {
        console.log('AuthGuard - Admin trying to access vendor route, redirecting to admin dashboard')
        router.push('/vendors')
        setIsLoading(false)
        return
      }

      // Valid user for this route
      setIsLoading(false)
    } catch (err) {
      console.error('AuthGuard - Error parsing user:', err)
      router.push('/admin-login')
      setIsLoading(false)
    }
  }, [pathname, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return <>{children}</>
}
