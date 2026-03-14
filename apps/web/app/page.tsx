// 'use client'

// import { useEffect } from 'react'
// import { useRouter } from 'next/navigation'

// export default function LoginRedirectPage() {
//   const router = useRouter()

//   useEffect(() => {
//     // Check if there's a vendor token
//     const vendorToken = localStorage.getItem('vendorToken')
//     const adminToken = localStorage.getItem('token')
    
//     if (vendorToken) {
//       // If vendor token exists, go to vendor dashboard
//       router.push('/vendor/dashboard')
//     } else if (adminToken) {
//       // If admin token exists, go to admin dashboard
//       router.push('/dashboard')
//     } else {
//       // No token, go to admin login (you can change this to vendor-login if preferred)
//       router.push('/admin-login')
//     }
//   }, [router])

//   return (
//     <div className="min-h-screen flex items-center justify-center">
//       <div className="text-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//         <p className="text-gray-600">Redirecting to login...</p>
//       </div>
//     </div>
//   )
// }
// apps/web/app/page.tsx
import Link from 'next/link'
import { Building2, Users, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-white font-bold text-3xl">VF</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Vendor Management System
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Choose your portal to continue
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Admin Portal Card */}
            <Link
              href="/admin-login"
              className="group bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition border border-gray-700"
            >
              <div className="bg-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Admin Portal</h2>
              <p className="text-gray-300 mb-4">
                Manage vendors, purchase orders, and procurement
              </p>
              <span className="text-blue-400 group-hover:text-blue-300 flex items-center justify-center">
                Go to Admin Login <ArrowRight className="w-4 h-4 ml-1" />
              </span>
            </Link>

            {/* Vendor Portal Card */}
            <Link
              href="/vendor-login"
              className="group bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition border border-gray-700"
            >
              <div className="bg-green-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Vendor Portal</h2>
              <p className="text-gray-300 mb-4">
                Submit invoices, track orders, and manage profile
              </p>
              <span className="text-green-400 group-hover:text-green-300 flex items-center justify-center">
                Go to Vendor Login <ArrowRight className="w-4 h-4 ml-1" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}