// 'use client'

// import { useEffect, useState } from 'react'
// import { useRouter, usePathname } from 'next/navigation'
// import Sidebar from '@/components/layout/Sidebar'
// import Navbar from '@/components/layout/Navbar'

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   const router = useRouter()
//   const pathname = usePathname()
//   const [sidebarOpen, setSidebarOpen] = useState(true)
//   const [isLoading, setIsLoading] = useState(true)

//   useEffect(() => {
//     // Check authentication
//     const token = localStorage.getItem('token')
//     const userStr = localStorage.getItem('user')
    
//     if (!token || !userStr) {
//       console.log('No token found, redirecting to login')
//       window.location.href = `/login?callbackUrl=${encodeURIComponent(pathname)}`
//       return
//     }
    
//     try {
//       const user = JSON.parse(userStr)
      
//       // Make sure this is an admin user (not vendor)
//       if (user.type === 'vendor') {
//         console.log('Vendor trying to access admin dashboard, redirecting to vendor dashboard')
//         window.location.href = '/vendor/dashboard'
//         return
//       }
      
//       // Valid admin user
//       setIsLoading(false)
//     } catch (err) {
//       console.error('Invalid user data, clearing storage')
//       localStorage.clear()
//       window.location.href = '/login'
//     }
//   }, [pathname])

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
//       <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
//         <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
//         <main className="p-4 md:p-6">
//           {children}
//         </main>
//       </div>
//     </div>
//   )
// }
'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    if (!token || !userStr) {
      console.log('No token found, redirecting to login')
      window.location.href = `/login?callbackUrl=${encodeURIComponent(pathname)}`
      return
    }
    
    try {
      const user = JSON.parse(userStr)
      
      // Make sure this is an admin user (not vendor)
      if (user.type === 'vendor') {
        console.log('Vendor trying to access admin dashboard, redirecting to vendor dashboard')
        window.location.href = '/vendor/dashboard'
        return
      }
      
      // Valid admin user
      setIsLoading(false)
    } catch (err) {
      console.error('Invalid user data, clearing storage')
      localStorage.clear()
      window.location.href = '/login'
    }
  }, [pathname])

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className={`transition-all duration-300 ${
        sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
      }`}>
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
