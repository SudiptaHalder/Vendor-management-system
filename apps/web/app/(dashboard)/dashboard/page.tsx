// 'use client'

// import { useState, useEffect } from 'react'
// import MainLayout from '@/components/layout/MainLayout'
// import {
//   Building2,
//   Users,
//   FileText,
//   DollarSign,
//   Clock,
//   AlertCircle,
//   CheckCircle,
//   LogOut,
//   TrendingUp,
//   ArrowUpRight,
//   ArrowDownRight
// } from 'lucide-react'

// export default function DashboardPage() {
//   const [user, setUser] = useState<any>(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     // Check auth
//     const token = localStorage.getItem('token')
//     const userStr = localStorage.getItem('user')
    
//     if (!token || !userStr) {
//       window.location.href = '/'
//       return
//     }

//     try {
//       const userData = JSON.parse(userStr)
//       if (userData.type === 'vendor') {
//         window.location.href = '/vendor/dashboard'
//         return
//       }
//       setUser(userData)
//     } catch (err) {
//       window.location.href = '/'
//     } finally {
//       setLoading(false)
//     }
//   }, [])

//   const handleLogout = () => {
//     localStorage.clear()
//     sessionStorage.clear()
//     document.cookie.split(";").forEach(function(c) {
//       document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
//     })
//     window.location.href = '/'
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     )
//   }

//   const stats = {
//     totalVendors: 45,
//     activeVendors: 32,
//     pendingApprovals: 8,
//     totalSpent: 284500,
//     pendingPayments: 45200,
//     overdueInvoices: 12300,
//     activeContracts: 23,
//     expiringContracts: 4
//   }

//   return (
//     <div className="max-w-7xl mx-auto">
//       {/* Header with Logout */}
//       <div className="flex justify-between items-center mb-8">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">
//             Welcome back, {user?.name || 'Admin'}! 👋
//           </h1>
//           <p className="text-gray-600 mt-1">Here's what's happening with your vendors today.</p>
//         </div>
//         <button
//           onClick={handleLogout}
//           className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
//         >
//           <LogOut size={18} />
//           <span>Logout</span>
//         </button>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-500">Total Vendors</p>
//               <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalVendors}</p>
//               <p className="text-sm text-green-600 mt-2 flex items-center">
//                 <ArrowUpRight size={16} className="mr-1" />
//                 +12% from last month
//               </p>
//             </div>
//             <div className="p-3 bg-blue-100 rounded-lg">
//               <Building2 className="w-6 h-6 text-blue-600" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-500">Active Vendors</p>
//               <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeVendors}</p>
//               <p className="text-sm text-green-600 mt-2 flex items-center">
//                 <CheckCircle size={16} className="mr-1" />
//                 {stats.activeVendors} currently active
//               </p>
//             </div>
//             <div className="p-3 bg-green-100 rounded-lg">
//               <Users className="w-6 h-6 text-green-600" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
//               <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingApprovals}</p>
//               <p className="text-sm text-yellow-600 mt-2 flex items-center">
//                 <Clock size={16} className="mr-1" />
//                 Awaiting review
//               </p>
//             </div>
//             <div className="p-3 bg-yellow-100 rounded-lg">
//               <AlertCircle className="w-6 h-6 text-yellow-600" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-500">Total Spent</p>
//               <p className="text-3xl font-bold text-gray-900 mt-2">${stats.totalSpent.toLocaleString()}</p>
//               <p className="text-sm text-red-600 mt-2 flex items-center">
//                 <ArrowDownRight size={16} className="mr-1" />
//                 -5% from last month
//               </p>
//             </div>
//             <div className="p-3 bg-purple-100 rounded-lg">
//               <DollarSign className="w-6 h-6 text-purple-600" />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Second Row Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//           <div className="flex items-center justify-between mb-2">
//             <p className="text-sm font-medium text-gray-500">Pending Payments</p>
//             <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
//               Due soon
//             </span>
//           </div>
//           <p className="text-2xl font-bold text-gray-900">${stats.pendingPayments.toLocaleString()}</p>
//           <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
//             <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
//           </div>
//           <p className="text-xs text-gray-500 mt-2">65% of monthly budget</p>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//           <div className="flex items-center justify-between mb-2">
//             <p className="text-sm font-medium text-gray-500">Overdue Invoices</p>
//             <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
//               Critical
//             </span>
//           </div>
//           <p className="text-2xl font-bold text-gray-900">${stats.overdueInvoices.toLocaleString()}</p>
//           <p className="text-xs text-gray-500 mt-3">3 invoices overdue</p>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//           <div className="flex items-center justify-between mb-2">
//             <p className="text-sm font-medium text-gray-500">Active Contracts</p>
//             <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
//               {stats.activeContracts} total
//             </span>
//           </div>
//           <p className="text-2xl font-bold text-gray-900">{stats.activeContracts}</p>
//           <p className="text-xs text-orange-600 mt-3">
//             {stats.expiringContracts} contracts expiring in 30 days
//           </p>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//           <div className="flex items-center justify-between mb-2">
//             <p className="text-sm font-medium text-gray-500">This Month</p>
//             <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
//               vs last month
//             </span>
//           </div>
//           <div className="flex items-baseline">
//             <p className="text-2xl font-bold text-gray-900">$45,200</p>
//             <p className="text-sm text-green-600 ml-2">+8%</p>
//           </div>
//           <p className="text-xs text-gray-500 mt-3">Projected: $52,000</p>
//         </div>
//       </div>
//     </div>
//   )
// }
'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import {
  Building2,
  Users,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  LogOut,
  TrendingUp,
  ArrowUpRight,
  Package,
  ShoppingCart,
  Calendar,
  FileSignature,
  MessageSquare,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    if (!token || !userStr) {
      window.location.href = '/'
      return
    }

    try {
      const userData = JSON.parse(userStr)
      if (userData.type === 'vendor') {
        window.location.href = '/vendor/dashboard'
        return
      }
      setUser(userData)
    } catch (err) {
      window.location.href = '/'
    } finally {
      setLoading(false)
    }
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    sessionStorage.clear()
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    })
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const stats = {
    totalVendors: 45,
    activeVendors: 32,
    pendingApprovals: 8,
    activeContracts: 23,
    expiringContracts: 4,
    totalPOs: 156,
    pendingPOs: 28,
    completedPOs: 112,
    openQuotes: 15
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || 'Admin'}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your business today.</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm w-full sm:w-auto"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

      {/* Key Metrics - First Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Vendors */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 bg-blue-50 rounded-xl">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center">
              <ArrowUpRight size={14} className="mr-0.5" />
              +12%
            </span>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Total Vendors</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalVendors}</p>
        </div>

        {/* Active Vendors */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 bg-green-50 rounded-xl">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              {stats.activeVendors} active
            </span>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Active Vendors</p>
          <p className="text-3xl font-bold text-gray-900">{stats.activeVendors}</p>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 bg-yellow-50 rounded-xl">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
              Review needed
            </span>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Pending Approvals</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pendingApprovals}</p>
        </div>

        {/* Active Contracts */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 bg-purple-50 rounded-xl">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
              {stats.expiringContracts} expiring
            </span>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Active Contracts</p>
          <p className="text-3xl font-bold text-gray-900">{stats.activeContracts}</p>
        </div>
      </div>

      {/* Purchase Order Metrics - Second Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total POs */}
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              All time
            </span>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">Total Purchase Orders</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalPOs}</p>
          <p className="text-xs text-gray-500 mt-2 flex items-center">
            <Package size={12} className="mr-1" />
            Across all vendors
          </p>
        </div>

        {/* Pending POs */}
        <div className="bg-gradient-to-br from-yellow-50 to-white rounded-2xl border border-yellow-100 p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 bg-yellow-100 rounded-xl">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
              In progress
            </span>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">Pending POs</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pendingPOs}</p>
          <p className="text-xs text-gray-500 mt-2 flex items-center">
            <Clock size={12} className="mr-1" />
            Awaiting processing
          </p>
        </div>

        {/* Completed POs */}
        <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100 p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 bg-green-100 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
              Delivered
            </span>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">Completed POs</p>
          <p className="text-3xl font-bold text-green-600">{stats.completedPOs}</p>
          <p className="text-xs text-gray-500 mt-2 flex items-center">
            <CheckCircle size={12} className="mr-1" />
            Successfully fulfilled
          </p>
        </div>

        {/* Open Quotes */}
        <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-100 p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 bg-purple-100 rounded-xl">
              <FileSignature className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
              Active
            </span>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">Open Quotes</p>
          <p className="text-3xl font-bold text-purple-600">{stats.openQuotes}</p>
          <p className="text-xs text-gray-500 mt-2 flex items-center">
            <FileSignature size={12} className="mr-1" />
            Awaiting response
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          <span className="text-xs text-gray-400">Frequently used tasks</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/vendors/upload"
            className="group relative bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-5 hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-xl"
          >
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight size={18} />
            </div>
            <Users className="w-8 h-8 mb-3 opacity-90" />
            <h3 className="font-semibold text-lg mb-1">Upload Vendors</h3>
            <p className="text-sm text-blue-100">Bulk upload vendor data</p>
          </Link>
          
          <Link
            href="/procurement/purchase-orders"
            className="group relative bg-gradient-to-br from-green-600 to-green-700 text-white rounded-xl p-5 hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-xl"
          >
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight size={18} />
            </div>
            <Package className="w-8 h-8 mb-3 opacity-90" />
            <h3 className="font-semibold text-lg mb-1">Purchase Orders</h3>
            <p className="text-sm text-green-100">Manage all POs</p>
          </Link>
          
          <Link
            href="/procurement/rfqs"
            className="group relative bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-xl p-5 hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-xl"
          >
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight size={18} />
            </div>
            <FileSignature className="w-8 h-8 mb-3 opacity-90" />
            <h3 className="font-semibold text-lg mb-1">RFQs</h3>
            <p className="text-sm text-purple-100">Requests for quotes</p>
          </Link>
          
          <Link
            href="/vendors/portal"
            className="group relative bg-gradient-to-br from-orange-600 to-orange-700 text-white rounded-xl p-5 hover:from-orange-700 hover:to-orange-800 transition-all shadow-md hover:shadow-xl"
          >
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight size={18} />
            </div>
            <MessageSquare className="w-8 h-8 mb-3 opacity-90" />
            <h3 className="font-semibold text-lg mb-1">Vendor Portal</h3>
            <p className="text-sm text-orange-100">Manage vendor access</p>
          </Link>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <Link href="/activity" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
            View all <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center p-3 bg-gray-50 rounded-xl">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">New vendor registered</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}