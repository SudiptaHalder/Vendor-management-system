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
    const user = localStorage.getItem('user')

    if (!token || !user) {
      // Redirect to login if not on login page
      if (pathname !== '/login') {
        router.push('/login')
      }
    }
    setIsLoading(false)
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
