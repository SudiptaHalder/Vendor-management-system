// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import VendorLayout from '@/components/vendor/VendorLayout'
// import {
//   Package,
//   Calendar,
//   RefreshCw,
//   Eye,
//   FileText,
//   X
// } from 'lucide-react'

// interface LineItem {
//   id: string
//   materialCode: string
//   materialDesc: string
//   orderUnit: string
//   rate: number | string
//   invoiceQuantity: number | string
//   lineNumber: number
// }

// interface PurchaseOrder {
//   id: string
//   poNumber: string
//   poCreateDate: string | null
//   poAmendDate: string | null
//   status: string
//   lineItems: LineItem[]
// }

// export default function VendorDashboard() {
//   const router = useRouter()
//   const [vendor, setVendor] = useState<any>(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')
//   const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
//   const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null)
//   const [showDetails, setShowDetails] = useState(false)

//   useEffect(() => {
//     // Check vendor auth
//     const token = localStorage.getItem('vendorToken')
//     const vendorStr = localStorage.getItem('vendor')
    
//     if (!token || !vendorStr) {
//       router.push('/vendor-login')
//       return
//     }

//     try {
//       const vendorData = JSON.parse(vendorStr)
//       setVendor(vendorData)
//       fetchPurchaseOrders(token)
//     } catch (err) {
//       router.push('/vendor-login')
//     }
//   }, [router])

//  const fetchPurchaseOrders = async () => {
//   setLoading(true)
//   setError('')
//   try {
//     // Get the token from localStorage
//     const token = localStorage.getItem('vendorToken')
    
//     if (!token) {
//       console.log('No vendor token found, redirecting to login')
//       router.push('/vendor-login')
//       return
//     }

//     console.log('Fetching purchase orders with token:', token.substring(0, 20) + '...')
    
//     const response = await fetch(`http://localhost:3001/api/vendor/purchase-orders`, {
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       }
//     })
    
//     if (response.status === 401) {
//       console.log('Token expired or invalid')
//       localStorage.removeItem('vendorToken')
//       localStorage.removeItem('vendor')
//       router.push('/vendor-login')
//       return
//     }
    
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`)
//     }
    
//     const data = await response.json()
//     console.log('API Response:', data)
    
//     if (data.success) {
//       setPurchaseOrders(data.data)
//       if (data.data.length > 0) {
//         setSelectedPO(data.data[0])
//       }
//     } else {
//       setError('Failed to fetch purchase orders')
//     }
//   } catch (err) {
//     console.error('Error fetching purchase orders:', err)
//     setError('Error connecting to server')
//   } finally {
//     setLoading(false)
//   }
// }

//   const formatDate = (dateStr: string | null) => {
//     if (!dateStr) return 'N/A'
//     return new Date(dateStr).toLocaleDateString()
//   }

//   // Helper function to convert rate to number
//   const parseRate = (rate: any): number => {
//     if (!rate) return 0
//     if (typeof rate === 'number') return rate
//     if (typeof rate === 'string') {
//       return parseFloat(rate.replace(/,/g, '')) || 0
//     }
//     return 0
//   }

//   // Helper function to convert quantity to number
//   const parseQuantity = (qty: any): number => {
//     if (!qty) return 0
//     if (typeof qty === 'number') return qty
//     if (typeof qty === 'string') {
//       return parseFloat(qty) || 0
//     }
//     return 0
//   }

//   const viewPODetails = (po: PurchaseOrder) => {
//     setSelectedPO(po)
//     setShowDetails(true)
//   }

//   const closeDetails = () => {
//     setShowDetails(false)
//     setSelectedPO(null)
//   }

//   if (loading) {
//     return (
//       <VendorLayout>
//         <div className="flex items-center justify-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
//         </div>
//       </VendorLayout>
//     )
//   }

//   return (
//     <VendorLayout>
//       {/* Welcome Section */}
//       <div className="mb-8">
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">
//               Welcome back, {vendor?.name}! 👋
//             </h1>
//             <p className="text-gray-600 mt-1">Supplier Code: {vendor?.code}</p>
//           </div>
//           <button
//             onClick={() => fetchPurchaseOrders(localStorage.getItem('vendorToken') || '')}
//             className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
//           >
//             <RefreshCw size={20} />
//           </button>
//         </div>
//       </div>

//       {/* Summary Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
//         <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-xs text-gray-500">Total Purchase Orders</p>
//               <p className="text-2xl font-bold text-gray-900">{purchaseOrders.length}</p>
//             </div>
//             <div className="p-3 bg-green-100 rounded-lg">
//               <Package className="w-5 h-5 text-green-600" />
//             </div>
//           </div>
//         </div>
//         <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-xs text-gray-500">Total Line Items</p>
//               <p className="text-2xl font-bold text-gray-900">
//                 {purchaseOrders.reduce((sum, po) => sum + po.lineItems.length, 0)}
//               </p>
//             </div>
//             <div className="p-3 bg-blue-100 rounded-lg">
//               <FileText className="w-5 h-5 text-blue-600" />
//             </div>
//           </div>
//         </div>
//         <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-xs text-gray-500">Last Updated</p>
//               <p className="text-2xl font-bold text-gray-900">
//                 {new Date().toLocaleDateString()}
//               </p>
//             </div>
//             <div className="p-3 bg-purple-100 rounded-lg">
//               <Calendar className="w-5 h-5 text-purple-600" />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Purchase Orders Table - Only 3 Columns */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//         <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
//           <h3 className="text-lg font-semibold text-gray-900">Purchase Orders</h3>
//           <p className="text-sm text-gray-500 mt-1">Click on any row to view complete details</p>
//         </div>
        
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">PO Number</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Created Date</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Amended Date</th>
//                 <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Action</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {purchaseOrders.map((po) => (
//                 <tr 
//                   key={po.id} 
//                   className="hover:bg-gray-50 cursor-pointer transition"
//                   onClick={() => viewPODetails(po)}
//                 >
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className="font-medium text-gray-900">{po.poNumber}</span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className="text-gray-600">{formatDate(po.poCreateDate)}</span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className="text-gray-600">{formatDate(po.poAmendDate)}</span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-center">
//                     <button 
//                       className="text-green-600 hover:text-green-800"
//                       onClick={(e) => {
//                         e.stopPropagation()
//                         viewPODetails(po)
//                       }}
//                     >
//                       <Eye size={18} />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
              
//               {purchaseOrders.length === 0 && (
//                 <tr>
//                   <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
//                     <Package size={48} className="mx-auto mb-3 text-gray-300" />
//                     <p>No purchase orders found</p>
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Modal for PO Details */}
//       {showDetails && selectedPO && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
//             <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-green-600 text-white rounded-t-xl">
//               <h3 className="text-lg font-semibold">PO Details: {selectedPO.poNumber}</h3>
//               <button 
//                 onClick={closeDetails}
//                 className="p-1 hover:bg-green-700 rounded-lg transition"
//               >
//                 <X size={20} />
//               </button>
//             </div>
            
//             <div className="p-6">
//               {/* PO Header Information */}
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <p className="text-xs text-gray-500">PO Number</p>
//                   <p className="text-sm font-semibold text-gray-900">{selectedPO.poNumber}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <p className="text-xs text-gray-500">Created Date</p>
//                   <p className="text-sm font-semibold text-gray-900">{formatDate(selectedPO.poCreateDate)}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <p className="text-xs text-gray-500">Amended Date</p>
//                   <p className="text-sm font-semibold text-gray-900">{formatDate(selectedPO.poAmendDate)}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <p className="text-xs text-gray-500">Status</p>
//                   <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
//                     selectedPO.status === 'completed' 
//                       ? 'bg-green-100 text-green-800'
//                       : 'bg-yellow-100 text-yellow-800'
//                   }`}>
//                     {selectedPO.status}
//                   </span>
//                 </div>
//               </div>

//               {/* Line Items Section */}
//               <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
//                 <FileText size={16} className="mr-2" />
//                 Line Items ({selectedPO.lineItems.length})
//               </h4>

//               {selectedPO.lineItems.length > 0 ? (
//                 <div className="overflow-x-auto border border-gray-200 rounded-lg">
//                   <table className="w-full text-sm">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Line</th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Material Code</th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Description</th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Unit</th>
//                         <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Rate</th>
//                         <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Quantity</th>
//                         <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Total</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-200">
//                       {selectedPO.lineItems.map((item, idx) => {
//                         const rate = parseRate(item.rate)
//                         const qty = parseQuantity(item.invoiceQuantity)
//                         const total = rate * qty
                        
//                         return (
//                           <tr key={item.id || idx} className="hover:bg-gray-50">
//                             <td className="px-4 py-3 text-gray-600">{item.lineNumber || idx + 1}</td>
//                             <td className="px-4 py-3 font-mono text-xs text-gray-900">{item.materialCode}</td>
//                             <td className="px-4 py-3 text-gray-900">{item.materialDesc}</td>
//                             <td className="px-4 py-3 text-gray-600">{item.orderUnit || 'EA'}</td>
//                             <td className="px-4 py-3 text-right text-gray-900">${rate.toFixed(2)}</td>
//                             <td className="px-4 py-3 text-right text-gray-900">{qty}</td>
//                             <td className="px-4 py-3 text-right font-medium text-gray-900">${total.toFixed(2)}</td>
//                           </tr>
//                         )
//                       })}
//                     </tbody>
//                   </table>
//                 </div>
//               ) : (
//                 <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
//                   No line items found for this purchase order
//                 </div>
//               )}

//               {/* PO Total */}
//               {selectedPO.lineItems.length > 0 && (
//                 <div className="mt-4 flex justify-end">
//                   <div className="bg-green-50 p-3 rounded-lg w-64">
//                     <div className="flex justify-between items-center">
//                       <span className="text-sm font-medium text-gray-700">PO Total:</span>
//                       <span className="text-lg font-bold text-green-600">
//                         ${selectedPO.lineItems.reduce((sum, item) => {
//                           const rate = parseRate(item.rate)
//                           const qty = parseQuantity(item.invoiceQuantity)
//                           return sum + (rate * qty)
//                         }, 0).toFixed(2)}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </VendorLayout>
//   )
// }
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import VendorLayout from '@/components/vendor/VendorLayout'
import Link from 'next/link'
import {
  Package,
  Calendar,
  RefreshCw,
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
  ArrowRight
} from 'lucide-react'

interface LineItem {
  id: string
  materialCode: string
  materialDesc: string
  orderUnit: string
  rate: number | string
  invoiceQuantity: number | string
  lineNumber: number
}

interface PurchaseOrder {
  id: string
  poNumber: string
  poCreateDate: string | null
  poAmendDate: string | null
  status: string
  lineItems: LineItem[]
}

export default function VendorDashboard() {
  const router = useRouter()
  const [vendor, setVendor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [stats, setStats] = useState({
    totalPOs: 0,
    pendingPOs: 0,
    completedPOs: 0,
    totalItems: 0,
    recentPOs: [] as PurchaseOrder[]
  })

 useEffect(() => {
  // Check vendor auth
  const token = localStorage.getItem('vendorToken')
  const vendorStr = localStorage.getItem('vendor')
  
  console.log('🔍 Dashboard auth check:', { 
    tokenExists: !!token, 
    vendorExists: !!vendorStr 
  })
  
  if (!token || !vendorStr) {
    console.log('No token or vendor data, staying on page for 2 seconds then redirecting')
    // Stay on page for 2 seconds so user can see something, then redirect
    const timer = setTimeout(() => {
      router.push('/vendor-login')
    }, 2000)
    return () => clearTimeout(timer)
  }

  try {
    const vendorData = JSON.parse(vendorStr)
    setVendor(vendorData)
    fetchPurchaseOrders(token)
  } catch (err) {
    console.error('Error parsing vendor data:', err)
    setTimeout(() => {
      router.push('/vendor-login')
    }, 2000)
  }
}, [router])

const fetchPurchaseOrders = async (token?: string) => {
  setLoading(true)
  setError('')
  try {
    const authToken = token || localStorage.getItem('vendorToken')
    
    if (!authToken) {
      console.log('No vendor token found')
      setLoading(false)
      return
    }

    console.log('Fetching purchase orders...')
    
    const response = await fetch(`http://localhost:3001/api/vendor/purchase-orders`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    })
    
    // If 401, don't redirect immediately - just log and set empty data
    if (response.status === 401) {
      console.log('Token expired or invalid, but staying on dashboard')
      setPurchaseOrders([])
      setStats({
        totalPOs: 0,
        pendingPOs: 0,
        completedPOs: 0,
        totalItems: 0,
        recentPOs: []
      })
      setLoading(false)
      return
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.success) {
      setPurchaseOrders(data.data)
      
      // Calculate stats
      const totalPOs = data.data.length
      const pendingPOs = data.data.filter((po: PurchaseOrder) => po.status === 'pending' || po.status === 'draft').length
      const completedPOs = data.data.filter((po: PurchaseOrder) => po.status === 'completed').length
      const totalItems = data.data.reduce((sum: number, po: PurchaseOrder) => sum + po.lineItems.length, 0)
      const recentPOs = data.data.slice(0, 5)
      
      setStats({
        totalPOs,
        pendingPOs,
        completedPOs,
        totalItems,
        recentPOs
      })
    } else {
      setError('Failed to fetch purchase orders')
    }
  } catch (err) {
    console.error('Error fetching purchase orders:', err)
    setError('Error connecting to server')
  } finally {
    setLoading(false)
  }
}

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString()
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center w-fit"><CheckCircle size={12} className="mr-1" /> Completed</span>
      case 'pending':
      case 'draft':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full flex items-center w-fit"><Clock size={12} className="mr-1" /> Pending</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">{status}</span>
    }
  }

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </VendorLayout>
    )
  }

  return (
    <VendorLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {vendor?.name}! 👋
            </h1>
            <p className="text-gray-600 mt-1">Supplier Code: {vendor?.code}</p>
          </div>
          <button
            onClick={() => {
              const token = localStorage.getItem('vendorToken')
              if (token) fetchPurchaseOrders(token)
            }}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            title="Refresh Data"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalPOs}</p>
          <p className="text-sm text-gray-500">Total Purchase Orders</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.pendingPOs}</p>
          <p className="text-sm text-gray-500">Pending Orders</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.completedPOs}</p>
          <p className="text-sm text-gray-500">Completed Orders</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
          <p className="text-sm text-gray-500">Total Line Items</p>
        </div>
      </div>

      {/* Recent Purchase Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Purchase Orders</h3>
            <p className="text-sm text-gray-500 mt-1">Your latest 5 purchase orders</p>
          </div>
          <Link 
            href="/vendor/purchase-orders" 
            className="text-green-600 hover:text-green-800 flex items-center text-sm font-medium"
          >
            View All <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amended Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.recentPOs.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">{po.poNumber}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-600">{formatDate(po.poCreateDate)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-600">{formatDate(po.poAmendDate)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(po.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-600">{po.lineItems.length}</span>
                  </td>
                </tr>
              ))}
              
              {stats.recentPOs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <Package size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>No purchase orders found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/vendor/purchase-orders"
          className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 hover:from-green-600 hover:to-green-700 transition shadow-lg"
        >
          <Package className="w-8 h-8 mb-3 opacity-90" />
          <h3 className="text-lg font-semibold mb-1">View All POs</h3>
          <p className="text-sm opacity-90">Access all your purchase orders</p>
        </Link>
        
        <Link
          href="/vendor/purchase-orders?status=pending"
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl p-6 hover:from-yellow-600 hover:to-yellow-700 transition shadow-lg"
        >
          <Clock className="w-8 h-8 mb-3 opacity-90" />
          <h3 className="text-lg font-semibold mb-1">Pending Orders</h3>
          <p className="text-sm opacity-90">{stats.pendingPOs} orders awaiting processing</p>
        </Link>
        
        <Link
          href="/vendor/documents"
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 hover:from-blue-600 hover:to-blue-700 transition shadow-lg"
        >
          <FileText className="w-8 h-8 mb-3 opacity-90" />
          <h3 className="text-lg font-semibold mb-1">Documents</h3>
          <p className="text-sm opacity-90">Manage your documents and files</p>
        </Link>
      </div>
    </VendorLayout>
  )
}