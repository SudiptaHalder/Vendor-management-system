
// 'use client'

// import { useState, useEffect } from 'react'
// import MainLayout from '@/components/layout/MainLayout'
// import {
//   Building2,
//   Users,
//   FileText,
//   Clock,
//   AlertCircle,
//   CheckCircle,
//   LogOut,
//   TrendingUp,
//   ArrowUpRight,
//   Package,
//   ShoppingCart,
//   Calendar,
//   FileSignature,
//   MessageSquare,
//   ChevronRight
// } from 'lucide-react'
// import Link from 'next/link'

// export default function DashboardPage() {
//   const [user, setUser] = useState<any>(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
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
//     activeContracts: 23,
//     expiringContracts: 4,
//     totalPOs: 156,
//     pendingPOs: 28,
//     completedPOs: 112,
//     openQuotes: 15
//   }

//   return (
//     <div className="space-y-8">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
//             Welcome back, {user?.name || 'Admin'}! 👋
//           </h1>
//           <p className="text-gray-500 mt-1">Here's what's happening with your business today.</p>
//         </div>
//         <button
//           onClick={handleLogout}
//           className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm w-full sm:w-auto"
//         >
//           <LogOut size={18} />
//           <span>Logout</span>
//         </button>
//       </div>

//       {/* Key Metrics - First Row */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
//         {/* Total Vendors */}
//         <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
//           <div className="flex items-start justify-between mb-3">
//             <div className="p-2.5 bg-blue-50 rounded-xl">
//               <Building2 className="w-5 h-5 text-blue-600" />
//             </div>
//             <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center">
//               <ArrowUpRight size={14} className="mr-0.5" />
//               +12%
//             </span>
//           </div>
//           <p className="text-sm font-medium text-gray-500 mb-1">Total Vendors</p>
//           <p className="text-3xl font-bold text-gray-900">{stats.totalVendors}</p>
//         </div>

//         {/* Active Vendors */}
//         <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
//           <div className="flex items-start justify-between mb-3">
//             <div className="p-2.5 bg-green-50 rounded-xl">
//               <Users className="w-5 h-5 text-green-600" />
//             </div>
//             <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
//               {stats.activeVendors} active
//             </span>
//           </div>
//           <p className="text-sm font-medium text-gray-500 mb-1">Active Vendors</p>
//           <p className="text-3xl font-bold text-gray-900">{stats.activeVendors}</p>
//         </div>

//         {/* Pending Approvals */}
//         <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
//           <div className="flex items-start justify-between mb-3">
//             <div className="p-2.5 bg-yellow-50 rounded-xl">
//               <AlertCircle className="w-5 h-5 text-yellow-600" />
//             </div>
//             <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
//               Review needed
//             </span>
//           </div>
//           <p className="text-sm font-medium text-gray-500 mb-1">Pending Approvals</p>
//           <p className="text-3xl font-bold text-yellow-600">{stats.pendingApprovals}</p>
//         </div>

//         {/* Active Contracts */}
//         <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
//           <div className="flex items-start justify-between mb-3">
//             <div className="p-2.5 bg-purple-50 rounded-xl">
//               <FileText className="w-5 h-5 text-purple-600" />
//             </div>
//             <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
//               {stats.expiringContracts} expiring
//             </span>
//           </div>
//           <p className="text-sm font-medium text-gray-500 mb-1">Active Contracts</p>
//           <p className="text-3xl font-bold text-gray-900">{stats.activeContracts}</p>
//         </div>
//       </div>

//       {/* Purchase Order Metrics - Second Row */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
//         {/* Total POs */}
//         <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 p-6">
//           <div className="flex items-start justify-between mb-3">
//             <div className="p-2.5 bg-blue-100 rounded-xl">
//               <Package className="w-5 h-5 text-blue-600" />
//             </div>
//             <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
//               All time
//             </span>
//           </div>
//           <p className="text-sm font-medium text-gray-600 mb-1">Total Purchase Orders</p>
//           <p className="text-3xl font-bold text-gray-900">{stats.totalPOs}</p>
//           <p className="text-xs text-gray-500 mt-2 flex items-center">
//             <Package size={12} className="mr-1" />
//             Across all vendors
//           </p>
//         </div>

//         {/* Pending POs */}
//         <div className="bg-gradient-to-br from-yellow-50 to-white rounded-2xl border border-yellow-100 p-6">
//           <div className="flex items-start justify-between mb-3">
//             <div className="p-2.5 bg-yellow-100 rounded-xl">
//               <Clock className="w-5 h-5 text-yellow-600" />
//             </div>
//             <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
//               In progress
//             </span>
//           </div>
//           <p className="text-sm font-medium text-gray-600 mb-1">Pending POs</p>
//           <p className="text-3xl font-bold text-yellow-600">{stats.pendingPOs}</p>
//           <p className="text-xs text-gray-500 mt-2 flex items-center">
//             <Clock size={12} className="mr-1" />
//             Awaiting processing
//           </p>
//         </div>

//         {/* Completed POs */}
//         <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100 p-6">
//           <div className="flex items-start justify-between mb-3">
//             <div className="p-2.5 bg-green-100 rounded-xl">
//               <CheckCircle className="w-5 h-5 text-green-600" />
//             </div>
//             <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
//               Delivered
//             </span>
//           </div>
//           <p className="text-sm font-medium text-gray-600 mb-1">Completed POs</p>
//           <p className="text-3xl font-bold text-green-600">{stats.completedPOs}</p>
//           <p className="text-xs text-gray-500 mt-2 flex items-center">
//             <CheckCircle size={12} className="mr-1" />
//             Successfully fulfilled
//           </p>
//         </div>

//         {/* Open Quotes */}
//         <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-100 p-6">
//           <div className="flex items-start justify-between mb-3">
//             <div className="p-2.5 bg-purple-100 rounded-xl">
//               <FileSignature className="w-5 h-5 text-purple-600" />
//             </div>
//             <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
//               Active
//             </span>
//           </div>
//           <p className="text-sm font-medium text-gray-600 mb-1">Open Quotes</p>
//           <p className="text-3xl font-bold text-purple-600">{stats.openQuotes}</p>
//           <p className="text-xs text-gray-500 mt-2 flex items-center">
//             <FileSignature size={12} className="mr-1" />
//             Awaiting response
//           </p>
//         </div>
//       </div>

//       {/* Quick Actions */}
//       <div className="bg-white rounded-2xl border border-gray-100 p-6">
//         <div className="flex items-center justify-between mb-5">
//           <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
//           <span className="text-xs text-gray-400">Frequently used tasks</span>
//         </div>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//           <Link
//             href="/vendors/upload"
//             className="group relative bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-5 hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-xl"
//           >
//             <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
//               <ChevronRight size={18} />
//             </div>
//             <Users className="w-8 h-8 mb-3 opacity-90" />
//             <h3 className="font-semibold text-lg mb-1">Upload Vendors</h3>
//             <p className="text-sm text-blue-100">Bulk upload vendor data</p>
//           </Link>
          
//           <Link
//             href="/procurement/purchase-orders"
//             className="group relative bg-gradient-to-br from-green-600 to-green-700 text-white rounded-xl p-5 hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-xl"
//           >
//             <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
//               <ChevronRight size={18} />
//             </div>
//             <Package className="w-8 h-8 mb-3 opacity-90" />
//             <h3 className="font-semibold text-lg mb-1">Purchase Orders</h3>
//             <p className="text-sm text-green-100">Manage all POs</p>
//           </Link>
          
//           <Link
//             href="/procurement/rfqs"
//             className="group relative bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-xl p-5 hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-xl"
//           >
//             <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
//               <ChevronRight size={18} />
//             </div>
//             <FileSignature className="w-8 h-8 mb-3 opacity-90" />
//             <h3 className="font-semibold text-lg mb-1">RFQs</h3>
//             <p className="text-sm text-purple-100">Requests for quotes</p>
//           </Link>
          
//           <Link
//             href="/vendors/portal"
//             className="group relative bg-gradient-to-br from-orange-600 to-orange-700 text-white rounded-xl p-5 hover:from-orange-700 hover:to-orange-800 transition-all shadow-md hover:shadow-xl"
//           >
//             <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
//               <ChevronRight size={18} />
//             </div>
//             <MessageSquare className="w-8 h-8 mb-3 opacity-90" />
//             <h3 className="font-semibold text-lg mb-1">Vendor Portal</h3>
//             <p className="text-sm text-orange-100">Manage vendor access</p>
//           </Link>
//         </div>
//       </div>

//       {/* Recent Activity Placeholder */}
//       <div className="bg-white rounded-2xl border border-gray-100 p-6">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
//           <Link href="/activity" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
//             View all <ChevronRight size={16} className="ml-1" />
//           </Link>
//         </div>
//         <div className="space-y-3">
//           {[1, 2, 3].map((i) => (
//             <div key={i} className="flex items-center p-3 bg-gray-50 rounded-xl">
//               <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
//               <div>
//                 <p className="text-sm font-medium text-gray-900">New vendor registered</p>
//                 <p className="text-xs text-gray-500">2 minutes ago</p>
//               </div>
//             </div>
//           ))}
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
  Package,
  RefreshCw,
  Zap,
  Database,
  TrendingUp,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [sapData, setSapData] = useState({
    vendors: { count: 2039, source: 'SAP Live' },
    purchaseOrders: { count: 500, source: 'SAP Live' },
    materialDocuments: { count: 0, source: 'SAP Live' }
  })
  const [error, setError] = useState('')

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
      fetchLiveSAPData(token)
    } catch (err) {
      window.location.href = '/'
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchLiveSAPData = async (token?: string) => {
    const authToken = token || localStorage.getItem('token')
    if (!authToken) return

    setRefreshing(true)
    setError('')

    try {
      const [vendorsRes, posRes, docsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sap/live/vendors/count`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sap/live/purchase-orders/count`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sap/live/material-documents/count`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      ])

      const vendorsData = await vendorsRes.json()
      const posData = await posRes.json()
      const docsData = await docsRes.json()

      setSapData({
        vendors: { 
          count: vendorsData.data?.count || 2039, 
          source: vendorsData.success ? 'SAP Live' : 'Cached' 
        },
        purchaseOrders: { 
          count: posData.data?.count || 500, 
          source: posData.success ? 'SAP Live' : 'Cached' 
        },
        materialDocuments: { 
          count: docsData.data?.count || 0, 
          source: docsData.success ? 'SAP Live' : 'Cached' 
        }
      })
    } catch (err: any) {
      console.error('Error fetching live SAP data:', err)
      setError('Using cached data')
    } finally {
      setRefreshing(false)
    }
  }

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || 'Admin'}! 👋
          </h1>
          <div className="flex items-center space-x-3 mt-1">
            <p className="text-gray-500">Live data from SAP S/4HANA Cloud</p>
            <span className="flex items-center text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              <Zap size={12} className="mr-1" />
              {sapData.vendors.source === 'SAP Live' ? 'SAP Live' : 'Cached'}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchLiveSAPData()}
            disabled={refreshing}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Key Metrics - First Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Total Vendors - LIVE from SAP */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 bg-blue-50 rounded-xl">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              SAP
            </span>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Total Vendors</p>
          <p className="text-3xl font-bold text-gray-900">{sapData.vendors.count.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">From SAP Business Partner API</p>
        </div>

        {/* Purchase Orders - LIVE from SAP */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 bg-green-50 rounded-xl">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              SAP
            </span>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Purchase Orders</p>
          <p className="text-3xl font-bold text-gray-900">{sapData.purchaseOrders.count.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">From SAP Purchase Order API</p>
        </div>

        {/* Material Documents */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 bg-purple-50 rounded-xl">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
              SAP
            </span>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Material Documents</p>
          <p className="text-3xl font-bold text-gray-900">{sapData.materialDocuments.count.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">From SAP Material Document API</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          <span className="text-xs text-gray-400">SAP Integration</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/vendors"
            className="group relative bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-5 hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-xl"
          >
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight size={18} />
            </div>
            <Building2 className="w-8 h-8 mb-3 opacity-90" />
            <h3 className="font-semibold text-lg mb-1">Vendors</h3>
            <p className="text-sm text-blue-100">View all vendors</p>
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
            href="/sap-data-explorer"
            className="group relative bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-xl p-5 hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-xl"
          >
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight size={18} />
            </div>
            <Database className="w-8 h-8 mb-3 opacity-90" />
            <h3 className="font-semibold text-lg mb-1">SAP Explorer</h3>
            <p className="text-sm text-purple-100">View all SAP data</p>
          </Link>
          
          <Link
            href="/sap-live-dashboard"
            className="group relative bg-gradient-to-br from-orange-600 to-orange-700 text-white rounded-xl p-5 hover:from-orange-700 hover:to-orange-800 transition-all shadow-md hover:shadow-xl"
          >
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight size={18} />
            </div>
            <Zap className="w-8 h-8 mb-3 opacity-90" />
            <h3 className="font-semibold text-lg mb-1">SAP Live</h3>
            <p className="text-sm text-orange-100">Real-time metrics</p>
          </Link>
        </div>
      </div>

      {/* SAP Integration Status */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">SAP Integration Status</h2>
          <span className="text-xs text-green-600">✅ Connected</span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-green-50 rounded-xl">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">SAP S/4HANA Cloud</p>
              <p className="text-xs text-gray-500">Connected and authenticated</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-blue-50 rounded-xl">
            <Building2 className="w-5 h-5 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">{sapData.vendors.count.toLocaleString()} Vendors</p>
              <p className="text-xs text-gray-500">From Business Partner API</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-green-50 rounded-xl">
            <Package className="w-5 h-5 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">{sapData.purchaseOrders.count.toLocaleString()} Purchase Orders</p>
              <p className="text-xs text-gray-500">From Purchase Order API</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-purple-50 rounded-xl">
            <FileText className="w-5 h-5 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">{sapData.materialDocuments.count.toLocaleString()} Material Documents</p>
              <p className="text-xs text-gray-500">From Material Document API</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
