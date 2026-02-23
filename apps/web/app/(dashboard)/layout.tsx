// apps/web/app/(dashboard)/layout.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'
import { isAuthenticated, getCurrentUser } from '@/lib/dev-auth'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`)
    } else {
      setIsLoading(false)
    }
  }, [pathname, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}