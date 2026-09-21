
// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter, useSearchParams } from 'next/navigation'
// import VendorLayout from '@/components/vendor/VendorLayout'
// import Link from 'next/link'
// import {
//   Package,
//   Calendar,
//   RefreshCw,
//   FileText,
//   Clock,
//   CheckCircle,
//   XCircle,
//   Eye,
//   Download,
//   Filter,
//   Search,
//   ChevronLeft,
//   ChevronRight,
//   X,
//   ArrowUpDown,
//   Building2,
//   Tag,
//   DollarSign,
//   Percent,
//   IndianRupee,
//   Grid
// } from 'lucide-react'

// interface LineItem {
//   id: string
//   lineNumber: number
//   materialCode: string | null
//   materialDesc: string | null
//   uom: string | null
//   quantity: number | null
//   receivedQty: number | null
//   pendingQty: number | null
//   unitPrice: number | null
//   discountPercent: number | null
//   discountAmount: number | null
//   taxableValue: number | null
//   gstPercent: number | null
//   sgstPercent: number | null
//   cgstPercent: number | null
//   igstPercent: number | null
//   gstAmount: number | null
//   totalAmount: number | null
//   status: string
// }

// interface PurchaseOrder {
//   id: string
//   poNumber: string
//   poType: string | null
//   plantCode: string | null
//   poCreateDate: string | null
//   poAmendDate: string | null
//   expectedDate: string | null
//   deliveredDate: string | null
//   status: string
//   subtotal: number | null
//   taxAmount: number | null
//   totalAmount: number | null
//   currency: string | null
//   lineItems: LineItem[]
// }

// export default function VendorPurchaseOrdersPage() {
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const statusFilter = searchParams.get('status') || 'all'
  
//   const [vendor, setVendor] = useState<any>(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')
//   const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
//   const [filteredPOs, setFilteredPOs] = useState<PurchaseOrder[]>([])
//   const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null)
//   const [showDetails, setShowDetails] = useState(false)
  
//   // Filters
//   const [searchTerm, setSearchTerm] = useState('')
//   const [statusFilterLocal, setStatusFilterLocal] = useState(statusFilter)
//   const [typeFilter, setTypeFilter] = useState<string>('all') // NEW: Type filter
//   const [dateFilter, setDateFilter] = useState('all')
//   const [sortBy, setSortBy] = useState<'date' | 'number'>('date')
//   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
//   // Pagination
//   const [currentPage, setCurrentPage] = useState(1)
//   const [itemsPerPage] = useState(10)

//   // Get unique PO types for filter
//   const poTypes = Array.from(new Set(purchaseOrders.map(po => po.poType).filter(Boolean))) as string[]

//   useEffect(() => {
//     const token = localStorage.getItem('vendorToken')
//     const vendorStr = localStorage.getItem('vendor')
    
//     if (!token || !vendorStr) {
//       const timer = setTimeout(() => {
//         router.push('/vendor-login')
//       }, 2000)
//       return () => clearTimeout(timer)
//     }

//     try {
//       const vendorData = JSON.parse(vendorStr)
//       setVendor(vendorData)
//       fetchPurchaseOrders(token)
//     } catch (err) {
//       console.error('Error parsing vendor data:', err)
//     }
//   }, [router])

//   useEffect(() => {
//     if (purchaseOrders.length > 0) {
//       applyFilters()
//     }
//   }, [purchaseOrders, searchTerm, statusFilterLocal, typeFilter, dateFilter, sortBy, sortOrder])

//   const fetchPurchaseOrders = async (token?: string) => {
//     setLoading(true)
//     setError('')
//     try {
//       const authToken = token || localStorage.getItem('vendorToken')
      
//       if (!authToken) {
//         setLoading(false)
//         return
//       }

//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/vendor/purchase-orders`, {
//         headers: {
//           'Authorization': `Bearer ${authToken}`,
//           'Content-Type': 'application/json'
//         }
//       })
      
//       if (response.status === 401) {
//         console.log('Token expired or invalid, showing empty state')
//         setPurchaseOrders([])
//         setLoading(false)
//         return
//       }
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`)
//       }
      
//       const data = await response.json()
      
//       if (data.success) {
//         setPurchaseOrders(data.data)
//       } else {
//         setError('Failed to fetch purchase orders')
//       }
//     } catch (err) {
//       console.error('Error fetching purchase orders:', err)
//       setError('Error connecting to server')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const applyFilters = () => {
//     let filtered = [...purchaseOrders]
    
//     // Apply status filter
//     if (statusFilterLocal !== 'all') {
//       filtered = filtered.filter(po => po.status === statusFilterLocal)
//     }
    
//     // Apply type filter (NEW)
//     if (typeFilter !== 'all') {
//       filtered = filtered.filter(po => po.poType === typeFilter)
//     }
    
//     // Apply search filter
//     if (searchTerm) {
//       const term = searchTerm.toLowerCase()
//       filtered = filtered.filter(po => 
//         po.poNumber.toLowerCase().includes(term)
//       )
//     }
    
//     // Apply date filter
//     const now = new Date()
//     if (dateFilter === 'today') {
//       const today = new Date(now.setHours(0, 0, 0, 0))
//       filtered = filtered.filter(po => 
//         po.poCreateDate && new Date(po.poCreateDate) >= today
//       )
//     } else if (dateFilter === 'week') {
//       const weekAgo = new Date(now.setDate(now.getDate() - 7))
//       filtered = filtered.filter(po => 
//         po.poCreateDate && new Date(po.poCreateDate) >= weekAgo
//       )
//     } else if (dateFilter === 'month') {
//       const monthAgo = new Date(now.setMonth(now.getMonth() - 1))
//       filtered = filtered.filter(po => 
//         po.poCreateDate && new Date(po.poCreateDate) >= monthAgo
//       )
//     }
    
//     // Apply sorting
//     filtered.sort((a, b) => {
//       if (sortBy === 'date') {
//         const dateA = a.poCreateDate ? new Date(a.poCreateDate).getTime() : 0
//         const dateB = b.poCreateDate ? new Date(b.poCreateDate).getTime() : 0
//         return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
//       } else {
//         const numA = parseInt(a.poNumber.replace(/\D/g, '')) || 0
//         const numB = parseInt(b.poNumber.replace(/\D/g, '')) || 0
//         return sortOrder === 'asc' ? numA - numB : numB - numA
//       }
//     })
    
//     setFilteredPOs(filtered)
//     setCurrentPage(1)
//   }

//   const formatDate = (dateStr: string | null) => {
//     if (!dateStr) return '-'
//     return new Date(dateStr).toLocaleDateString()
//   }

//   const formatCurrency = (amount: number | null) => {
//     if (amount === null || amount === undefined) return '-'
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 2
//     }).format(amount)
//   }

//   const formatNumber = (num: number | null) => {
//     if (num === null || num === undefined) return '-'
//     return num.toLocaleString('en-IN')
//   }

//   const getStatusBadge = (status: string) => {
//     switch(status) {
//       case 'completed':
//         return <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded-full flex items-center w-fit"><CheckCircle size={12} className="mr-1" /> Completed</span>
//       case 'approved':
//         return <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium rounded-full flex items-center w-fit"><CheckCircle size={12} className="mr-1" /> Approved</span>
//       case 'pending':
//         return <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-medium rounded-full flex items-center w-fit"><Clock size={12} className="mr-1" /> Pending</span>
//       case 'draft':
//         return <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-medium rounded-full flex items-center w-fit"><FileText size={12} className="mr-1" /> Draft</span>
//       case 'cancelled':
//         return <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs font-medium rounded-full flex items-center w-fit"><XCircle size={12} className="mr-1" /> Cancelled</span>
//       default:
//         return <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-medium rounded-full">{status}</span>
//     }
//   }

//   const viewPODetails = (po: PurchaseOrder) => {
//     setSelectedPO(po)
//     setShowDetails(true)
//   }

//   const closeDetails = () => {
//     setShowDetails(false)
//     setSelectedPO(null)
//   }

//   const toggleSort = (field: 'date' | 'number') => {
//     if (sortBy === field) {
//       setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
//     } else {
//       setSortBy(field)
//       setSortOrder('desc')
//     }
//   }

//   // Pagination
//   const indexOfLastItem = currentPage * itemsPerPage
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage
//   const currentItems = filteredPOs.slice(indexOfFirstItem, indexOfLastItem)
//   const totalPages = Math.ceil(filteredPOs.length / itemsPerPage)

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
//       {/* Header */}
//       <div className="mb-6">
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Purchase Orders</h1>
//             <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage all your purchase orders</p>
//           </div>
//           <button
//             onClick={() => {
//               const token = localStorage.getItem('vendorToken')
//               if (token) fetchPurchaseOrders(token)
//             }}
//             className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center"
//           >
//             <RefreshCw size={18} className="mr-2" />
//             Refresh
//           </button>
//         </div>
//       </div>

//       {/* Filters - Improved UI with consistent sizing */}
// <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
//   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
//     {/* Search */}
//     <div className="relative">
//       <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
//       <input
//         type="text"
//         placeholder="Search PO number..."
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//         className="w-full h-10 pl-9 pr-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-900 shadow-sm"
//       />
//     </div>

//     {/* Status Filter */}
//     <select
//       value={statusFilterLocal}
//       onChange={(e) => setStatusFilterLocal(e.target.value)}
//       className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 shadow-sm cursor-pointer"
//     >
//       <option value="all">All Status</option>
//       <option value="draft">Draft</option>
//       <option value="pending">Pending</option>
//       <option value="approved">Approved</option>
//       <option value="completed">Completed</option>
//       <option value="cancelled">Cancelled</option>
//     </select>

//     {/* Type Filter */}
//     <select
//       value={typeFilter}
//       onChange={(e) => setTypeFilter(e.target.value)}
//       className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 shadow-sm cursor-pointer"
//     >
//       <option value="all">All Types</option>
//       {poTypes.map(type => (
//         <option key={type} value={type}>{type}</option>
//       ))}
//     </select>

//     {/* Date Filter */}
//     <select
//       value={dateFilter}
//       onChange={(e) => setDateFilter(e.target.value)}
//       className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 shadow-sm cursor-pointer"
//     >
//       <option value="all">All Time</option>
//       <option value="today">Today</option>
//       <option value="week">Last 7 Days</option>
//       <option value="month">Last 30 Days</option>
//     </select>

//     {/* Sort Button */}
//     <button
//       onClick={() => toggleSort('date')}
//       className={`w-full h-10 px-3 border rounded-lg text-sm flex items-center justify-center transition-colors shadow-sm ${
//         sortBy === 'date' 
//           ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-medium' 
//           : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
//       }`}
//     >
//       <Calendar size={14} className={`mr-2 ${sortBy === 'date' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`} />
//       <span>Sort by Date</span>
//       {sortBy === 'date' && <ArrowUpDown size={14} className="ml-2 text-green-600 dark:text-green-400" />}
//     </button>
//   </div>
// </div>

//       {/* Purchase Orders Table */}
//       <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 dark:bg-gray-800">
//               <tr>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">PO Number</th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plant Location</th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">PO Type</th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created Date</th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
//                 <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//               {currentItems.map((po) => (
//                 <tr 
//                   key={po.id} 
//                   className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
//                   onClick={() => viewPODetails(po)}
//                 >
//                   <td className="px-4 py-3 whitespace-nowrap">
//                     <span className="font-medium text-gray-900 dark:text-gray-100">{po.poNumber}</span>
//                   </td>
//                   <td className="px-4 py-3 whitespace-nowrap">
//                     <span className="text-gray-600 dark:text-gray-400">{po.plantCode || '-'}</span>
//                   </td>
//                   <td className="px-4 py-3 whitespace-nowrap">
//                     <span className="text-gray-600 dark:text-gray-400">{po.poType || 'Standard'}</span>
//                   </td>
//                   <td className="px-4 py-3 whitespace-nowrap">
//                     <span className="text-gray-600 dark:text-gray-400">{formatDate(po.poCreateDate)}</span>
//                   </td>
//                   <td className="px-4 py-3 whitespace-nowrap">
//                     {getStatusBadge(po.status)}
//                   </td>
//                   <td className="px-4 py-3 whitespace-nowrap text-right">
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation()
//                         viewPODetails(po)
//                       }}
//                       className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
//                       title="View Details"
//                     >
//                       <Eye size={18} />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
              
//               {currentItems.length === 0 && (
//                 <tr>
//                   <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
//                     <Package size={48} className="mx-auto mb-3 text-gray-300" />
//                     <p>No purchase orders found</p>
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         {filteredPOs.length > 0 && (
//           <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
//             <div className="text-sm text-gray-500 dark:text-gray-400">
//               Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredPOs.length)} of {filteredPOs.length} orders
//             </div>
//             <div className="flex space-x-2">
//               <button
//                 onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                 disabled={currentPage === 1}
//                 className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
//               >
//                 <ChevronLeft size={16} />
//               </button>
//               <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
//                 Page {currentPage} of {totalPages}
//               </span>
//               <button
//                 onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                 disabled={currentPage === totalPages}
//                 className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
//               >
//                 <ChevronRight size={16} />
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Modal for PO Details - Currency section removed */}
//       {showDetails && selectedPO && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-green-600 text-white rounded-t-xl sticky top-0">
//               <h3 className="text-lg font-semibold">PO Details: {selectedPO.poNumber}</h3>
//               <button 
//                 onClick={closeDetails}
//                 className="p-1 hover:bg-green-700 rounded-lg transition"
//               >
//                 <X size={20} />
//               </button>
//             </div>
            
//             <div className="p-6">
//               {/* PO Header Information - Currency removed */}
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//                 <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
//                   <p className="text-xs text-gray-500 dark:text-gray-400">PO Number</p>
//                   <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{selectedPO.poNumber}</p>
//                 </div>
//                 <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
//                   <p className="text-xs text-gray-500 dark:text-gray-400">Plant Location</p>
//                   <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{selectedPO.plantCode || '-'}</p>
//                 </div>
//                 <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
//                   <p className="text-xs text-gray-500 dark:text-gray-400">PO Type</p>
//                   <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{getPOTypeLabel(selectedPO.poType)}</p>
//                 </div>
//                 <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
//                   <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
//                   <div className="mt-1">
//                     {getStatusBadge(selectedPO.status)}
//                   </div>
//                 </div>
//                 <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
//                   <p className="text-xs text-gray-500 dark:text-gray-400">Created Date</p>
//                   <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatDate(selectedPO.poCreateDate)}</p>
//                 </div>
//                 <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
//                   <p className="text-xs text-gray-500 dark:text-gray-400">Expected Date</p>
//                   <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatDate(selectedPO.expectedDate)}</p>
//                 </div>
//                 <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
//                   <p className="text-xs text-gray-500 dark:text-gray-400">Delivered Date</p>
//                   <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatDate(selectedPO.deliveredDate)}</p>
//                 </div>
//                 {/* Currency section removed */}
//               </div>

//               {/* Line Items Section */}
//               <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
//                 <FileText size={16} className="mr-2" />
//                 Line Items ({selectedPO.lineItems.length})
//               </h4>

//               {selectedPO.lineItems.length > 0 ? (
//                 <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
//                   <table className="w-full text-sm">
//                     <thead className="bg-gray-50 dark:bg-gray-800">
//                       {/* Main Headers */}
//                       <tr>
//                         <th rowSpan={2} className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 border-r">Line</th>
//                         <th rowSpan={2} className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 border-r">Material Code</th>
//                         <th rowSpan={2} className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 border-r">Description</th>
//                         <th rowSpan={2} className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 border-r">UOM</th>
//                         <th rowSpan={2} className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 border-r">Qty</th>
//                         <th rowSpan={2} className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 border-r">Rate</th>
//                         {/* GST Header - spans 3 columns */}
//                         <th colSpan={3} className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 border-r bg-green-50 dark:bg-green-900/20">GST</th>
//                         <th rowSpan={2} className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Total</th>
//                       </tr>
//                       {/* Sub Headers for GST */}
//                       <tr>
//                         <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 border-r">SGST%</th>
//                         <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 border-r">CGST%</th>
//                         <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 border-r">IGST%</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                       {selectedPO.lineItems.map((item, idx) => (
//                         <tr key={item.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-800">
//                           <td className="px-3 py-2 text-gray-600 dark:text-gray-400 border-r">{item.lineNumber || idx + 1}</td>
//                           <td className="px-3 py-2 font-mono text-xs text-gray-900 dark:text-gray-100 border-r">{item.materialCode || '-'}</td>
//                           <td className="px-3 py-2 text-gray-900 dark:text-gray-100 border-r">{item.materialDesc || '-'}</td>
//                           <td className="px-3 py-2 text-gray-600 dark:text-gray-400 border-r">{item.uom || '-'}</td>
//                           <td className="px-3 py-2 text-right text-gray-900 dark:text-gray-100 border-r">{formatNumber(item.quantity)}</td>
//                           <td className="px-3 py-2 text-right text-gray-900 dark:text-gray-100 border-r">{formatCurrency(item.unitPrice)}</td>
//                           {/* GST Values */}
//                           <td className="px-3 py-2 text-center text-gray-900 dark:text-gray-100 border-r">{item.sgstPercent ? `${item.sgstPercent}%` : '-'}</td>
//                           <td className="px-3 py-2 text-center text-gray-900 dark:text-gray-100 border-r">{item.cgstPercent ? `${item.cgstPercent}%` : '-'}</td>
//                           <td className="px-3 py-2 text-center text-gray-900 dark:text-gray-100 border-r">{item.igstPercent ? `${item.igstPercent}%` : '-'}</td>
//                           <td className="px-3 py-2 text-right font-medium text-gray-900 dark:text-gray-100">{formatCurrency(item.totalAmount)}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               ) : (
//                 <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg">
//                   No line items found for this purchase order
//                 </div>
//               )}

//               {/* PO Summary */}
//               {selectedPO.lineItems.length > 0 && (
//                 <div className="mt-6 flex justify-end">
//                   <div className="w-80 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
//                     <div className="flex justify-between items-center py-1">
//                       <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal:</span>
//                       <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatCurrency(selectedPO.subtotal)}</span>
//                     </div>
//                     <div className="flex justify-between items-center py-1">
//                       <span className="text-sm text-gray-600 dark:text-gray-400">Tax Amount:</span>
//                       <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatCurrency(selectedPO.taxAmount)}</span>
//                     </div>
//                     <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
//                     <div className="flex justify-between items-center py-1">
//                       <span className="text-base font-semibold text-gray-900 dark:text-gray-100">Total:</span>
//                       <span className="text-base font-bold text-green-600 dark:text-green-400">{formatCurrency(selectedPO.totalAmount)}</span>
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
import { useRouter, useSearchParams } from 'next/navigation'
import VendorLayout from '@/components/vendor/VendorLayout'
import Link from 'next/link'
import {
  Package,
  Calendar,
  RefreshCw,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowUpDown,
  Building2,
  Tag,
  DollarSign,
  Percent,
  IndianRupee,
  Grid,
  SlidersHorizontal,
  Zap
} from 'lucide-react'

interface LineItem {
  id: string
  lineNumber: number
  materialCode: string | null
  materialDesc: string | null
  uom: string | null
  quantity: number | null
  receivedQty: number | null
  pendingQty: number | null
  unitPrice: number | null
  discountPercent: number | null
  discountAmount: number | null
  taxableValue: number | null
  gstPercent: number | null
  sgstPercent: number | null
  cgstPercent: number | null
  igstPercent: number | null
  gstAmount: number | null
  totalAmount: number | null
  status: string
}

// SAP purchase document type codes -> friendly labels. Any code not listed
// here (e.g. standard SAP types like "NB") still shows correctly - it just
// falls back to displaying the raw code instead of a translated label.
const PO_TYPE_LABELS: Record<string, string> = {
  ZBOP: 'PO: Bought Out',
  ZCAP: 'PO: Capital',
  ZCON: 'PO: Consumable',
  ZCRE: 'Customer Return',
  ZCSR: 'PO: Service Contract',
  ZFOC: 'Free of Cost P.O.',
  ZIMP: 'PO: Import',
  ZOTH: 'PO: Int. Stock Transfer',
  ZPRO: 'Development PO',
  ZPUR: 'Purchase Return',
  ZROH: 'PO: Raw Material',
  ZSER: 'PO: Service',
  ZSUB: 'PO: Subcon (Job Work)',
  ZUB: 'Stock Transport Order Del.',
  ZVRE: 'Vendor Return',
  LP: 'Scheduling Agreement',
  NB: 'Standard PO'
}

const getPOTypeLabel = (type: string | null | undefined): string => {
  if (!type) return '-'
  return PO_TYPE_LABELS[type] || type
}

// SAP OData V2 dates come as "/Date(1712448000000)/" - plain new Date() on
// that string returns Invalid Date, which silently breaks >= comparisons
// (always false), so date-range filtering never actually matched anything.
const parseSAPDateValue = (value: string | null | undefined): Date | null => {
  if (!value) return null
  const match = /\/Date\((\d+)\)\//.exec(value)
  const ms = match ? parseInt(match[1], 10) : Date.parse(value)
  return isNaN(ms) ? null : new Date(ms)
}

interface PurchaseOrder {
  id: string
  poNumber: string
  poType: string | null
  plantCode: string | null
  poCreateDate: string | null
  poAmendDate: string | null
  expectedDate: string | null
  deliveredDate: string | null
  status: string
  subtotal: number | null
  taxAmount: number | null
  totalAmount: number | null
  currency: string | null
  lineItems: LineItem[]
  category?: 'close_quantity' | 'schedule' | null
}

interface DeliveryRecord {
  deliveryDocument: string
  vehicleNo: string | null
  supplierReference: string | null
  deliveryDate: string | null
  items: Array<{
    poItemNumber: string
    materialCode: string
    quantity: string
    uom: string
  }>
}

export default function VendorPurchaseOrdersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const statusFilter = searchParams.get('status') || 'all'
  
  const [vendor, setVendor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [filteredPOs, setFilteredPOs] = useState<PurchaseOrder[]>([])
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([])
  const [loadingDeliveries, setLoadingDeliveries] = useState(false)
  
  // Main Status Toggle (default open)
  const [mainStatus, setMainStatus] = useState<'completed' | 'open'>('open')
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilterLocal, setStatusFilterLocal] = useState(statusFilter)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'date' | 'number'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    const token = localStorage.getItem('vendorToken')
    const vendorStr = localStorage.getItem('vendor')
    
    if (!token || !vendorStr) {
      router.push('/vendor-login')
      return
    }

    try {
      const vendorData = JSON.parse(vendorStr)
      setVendor(vendorData)
      fetchPurchaseOrders(token)
    } catch (err) {
      console.error('Error parsing vendor data:', err)
    }
  }, [router])

  useEffect(() => {
    if (purchaseOrders.length > 0) {
      applyFilters()
    }
  }, [purchaseOrders, searchTerm, mainStatus, statusFilterLocal, typeFilter, dateFilter, sortBy, sortOrder])

  const fetchPurchaseOrders = async (token?: string) => {
    setLoading(true)
    setError('')
    try {
      const authToken = token || localStorage.getItem('vendorToken')
      
      if (!authToken) {
        setLoading(false)
        return
      }

      // Fetch from SAP endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/vendor/sap-purchase-orders`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.status === 401) {
        console.log('Token expired or invalid')
        localStorage.removeItem('vendorToken')
        localStorage.removeItem('vendor')
        router.push('/vendor-login')
        return
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        // Add category for UI display (based on some logic)
        const ordersWithCategories = data.data.map((po: any, index: number) => ({
          ...po,
          category: po.poType === 'Schedule' ? 'schedule' : 
                   po.poType === 'Close Quantity' ? 'close_quantity' : null
        }))
        setPurchaseOrders(ordersWithCategories)
      } else {
        setError(data.error || 'Failed to fetch purchase orders')
      }
    } catch (err: any) {
      console.error('Error fetching purchase orders:', err)
      setError('Error connecting to server')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...purchaseOrders]
    
    // Apply main status toggle
    if (mainStatus === 'completed') {
      filtered = filtered.filter(po => po.status === 'completed')
    } else {
      // Open includes: draft, pending, approved
      filtered = filtered.filter(po => ['draft', 'pending', 'approved'].includes(po.status))
    }
    
    // Apply additional status filter if not 'all'
    if (statusFilterLocal !== 'all') {
      filtered = filtered.filter(po => po.status === statusFilterLocal)
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(po => po.poType === typeFilter)
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(po => 
        po.poNumber.toLowerCase().includes(term) ||
        po.plantCode?.toLowerCase().includes(term)
      )
    }
    
    // Apply date filter
    const now = new Date()
    if (dateFilter === 'today') {
      const today = new Date(now.setHours(0, 0, 0, 0))
      filtered = filtered.filter(po => {
        const d = parseSAPDateValue(po.poCreateDate)
        return d && d >= today
      })
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7))
      filtered = filtered.filter(po => {
        const d = parseSAPDateValue(po.poCreateDate)
        return d && d >= weekAgo
      })
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1))
      filtered = filtered.filter(po => {
        const d = parseSAPDateValue(po.poCreateDate)
        return d && d >= monthAgo
      })
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = a.poCreateDate ? new Date(a.poCreateDate).getTime() : 0
        const dateB = b.poCreateDate ? new Date(b.poCreateDate).getTime() : 0
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
      } else {
        const numA = parseInt(a.poNumber.replace(/\D/g, '')) || 0
        const numB = parseInt(b.poNumber.replace(/\D/g, '')) || 0
        return sortOrder === 'asc' ? numA - numB : numB - numA
      }
    })
    
    setFilteredPOs(filtered)
    setCurrentPage(1)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    // SAP OData V2 dates come as "/Date(1712448000000)/", not a plain ISO string
    const match = /\/Date\((\d+)\)\//.exec(dateStr)
    const ms = match ? parseInt(match[1], 10) : Date.parse(dateStr)
    if (isNaN(ms)) return '-'
    return new Date(ms).toLocaleDateString()
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '-'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatNumber = (num: number | null) => {
    if (num === null || num === undefined) return '-'
    return num.toLocaleString('en-IN')
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded-full flex items-center w-fit"><CheckCircle size={12} className="mr-1" /> Completed</span>
      case 'approved':
        return <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium rounded-full flex items-center w-fit"><CheckCircle size={12} className="mr-1" /> Approved</span>
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-medium rounded-full flex items-center w-fit"><Clock size={12} className="mr-1" /> Pending</span>
      case 'draft':
        return <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-medium rounded-full flex items-center w-fit"><FileText size={12} className="mr-1" /> Draft</span>
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs font-medium rounded-full flex items-center w-fit"><XCircle size={12} className="mr-1" /> Cancelled</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-medium rounded-full">{status}</span>
    }
  }

  const viewPODetails = (po: PurchaseOrder) => {
    setSelectedPO(po)
    setShowDetails(true)
    fetchDeliveries(po.poNumber)
  }

  const closeDetails = () => {
    setShowDetails(false)
    setSelectedPO(null)
    setDeliveries([])
  }

  const fetchDeliveries = async (poNumber: string) => {
    setLoadingDeliveries(true)
    try {
      const token = localStorage.getItem('vendorToken')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/vendor/sap-purchase-orders/${poNumber}/deliveries`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setDeliveries(data.success ? data.data : [])
    } catch (err) {
      console.error('Error fetching deliveries:', err)
      setDeliveries([])
    } finally {
      setLoadingDeliveries(false)
    }
  }

  const toggleSort = (field: 'date' | 'number') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredPOs.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredPOs.length / itemsPerPage)

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </VendorLayout>
    )
  }

  const poTypes = Array.from(new Set(purchaseOrders.map(po => po.poType).filter(Boolean))) as string[]

  return (
    <VendorLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Purchase Orders</h1>
            <div className="flex items-center space-x-3 mt-1">
              <p className="text-gray-600 dark:text-gray-400">Your purchase orders from SAP S/4HANA</p>
              <span className="flex items-center text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">
                <Zap size={12} className="mr-1" />
                SAP Live
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              const token = localStorage.getItem('vendorToken')
              if (token) fetchPurchaseOrders(token)
            }}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center"
          >
            <RefreshCw size={18} className="mr-2" />
            Refresh
          </button>
        </div>
        {error && (
          <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}
        {purchaseOrders.length === 0 && !error && (
          <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-700 dark:text-yellow-300">
            No purchase orders found for your vendor account.
          </div>
        )}
      </div>

      {/* Main Status Toggle */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by status:</span>
            <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <button
                onClick={() => setMainStatus('open')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                  mainStatus === 'open'
                    ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Open Orders
              </button>
              <button
                onClick={() => setMainStatus('completed')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                  mainStatus === 'completed'
                    ? 'bg-white dark:bg-gray-900 text-green-600 dark:text-green-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Completed Orders
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filteredPOs.length} orders found
          </div>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search by PO number or plant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-900 shadow-sm"
            />
          </div>

          <select
            value={statusFilterLocal}
            onChange={(e) => setStatusFilterLocal(e.target.value)}
            className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 shadow-sm cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 shadow-sm cursor-pointer"
          >
            <option value="all">All Types</option>
            {poTypes.map(type => (
              <option key={type} value={type}>{getPOTypeLabel(type)} ({type})</option>
            ))}
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 shadow-sm cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">PO Number</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plant</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {currentItems.map((po) => (
                <tr 
                  key={po.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => viewPODetails(po)}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{po.poNumber}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-gray-600 dark:text-gray-400">{po.plantCode || '-'}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-gray-600 dark:text-gray-400">{po.poType || 'Standard'}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-gray-600 dark:text-gray-400">{formatDate(po.poCreateDate)}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getStatusBadge(po.status)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        viewPODetails(po)
                      }}
                      className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <Package size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>No purchase orders found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredPOs.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredPOs.length)} of {filteredPOs.length} orders
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal for PO Details */}
      {showDetails && selectedPO && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-green-600 text-white rounded-t-xl sticky top-0">
              <h3 className="text-lg font-semibold">PO Details: {selectedPO.poNumber}</h3>
              <button 
                onClick={closeDetails}
                className="p-1 hover:bg-green-700 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {/* PO Header Information */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">PO Number</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{selectedPO.poNumber}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Plant</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{selectedPO.plantCode || '-'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">PO Type</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{getPOTypeLabel(selectedPO.poType)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedPO.status)}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Created Date</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatDate(selectedPO.poCreateDate)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Amount</p>
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">{formatCurrency(selectedPO.totalAmount)}</p>
                </div>
              </div>

              {/* Line Items */}
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                <FileText size={16} className="mr-2" />
                Line Items ({selectedPO.lineItems.length})
              </h4>

              {selectedPO.lineItems.length > 0 ? (
                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Line</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Material Code</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Description</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Qty</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Rate</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {selectedPO.lineItems.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{item.lineNumber || idx + 1}</td>
                          <td className="px-3 py-2 font-mono text-xs text-gray-900 dark:text-gray-100">{item.materialCode || '-'}</td>
                          <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{item.materialDesc || '-'}</td>
                          <td className="px-3 py-2 text-right text-gray-900 dark:text-gray-100">{formatNumber(item.quantity)} {item.uom || ''}</td>
                          <td className="px-3 py-2 text-right text-gray-900 dark:text-gray-100">{formatCurrency(item.unitPrice)}</td>
                          <td className="px-3 py-2 text-right font-medium text-gray-900 dark:text-gray-100">{formatCurrency(item.totalAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  No line items found
                </div>
              )}

              {/* Deliveries - what's actually been shipped against this PO */}
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-6 flex items-center">
                <Package size={16} className="mr-2" />
                Deliveries ({deliveries.length})
              </h4>

              {loadingDeliveries ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  Loading deliveries...
                </div>
              ) : deliveries.length > 0 ? (
                <div className="space-y-3">
                  {deliveries.map((delivery) => (
                    <div key={delivery.deliveryDocument} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 dark:bg-gray-800 px-3 py-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">Delivery {delivery.deliveryDocument}</span>
                        <span>Vehicle: {delivery.vehicleNo || '-'}</span>
                        <span>Invoice Ref: {delivery.supplierReference || '-'}</span>
                        <span>Date: {formatDate(delivery.deliveryDate)}</span>
                      </div>
                      <table className="w-full text-sm">
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {delivery.items.map((item, idx) => (
                            <tr key={idx}>
                              <td className="px-3 py-1.5 font-mono text-xs text-gray-600 dark:text-gray-400">{item.poItemNumber}</td>
                              <td className="px-3 py-1.5 font-mono text-xs text-gray-900 dark:text-gray-100">{item.materialCode}</td>
                              <td className="px-3 py-1.5 text-right text-gray-900 dark:text-gray-100">{item.quantity} {item.uom}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  No deliveries submitted yet for this order
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </VendorLayout>
  )
}
