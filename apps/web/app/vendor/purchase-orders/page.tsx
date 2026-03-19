
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

//       const response = await fetch(`http://localhost:3001/api/vendor/purchase-orders`, {
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
//         return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center w-fit"><CheckCircle size={12} className="mr-1" /> Completed</span>
//       case 'approved':
//         return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full flex items-center w-fit"><CheckCircle size={12} className="mr-1" /> Approved</span>
//       case 'pending':
//         return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full flex items-center w-fit"><Clock size={12} className="mr-1" /> Pending</span>
//       case 'draft':
//         return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full flex items-center w-fit"><FileText size={12} className="mr-1" /> Draft</span>
//       case 'cancelled':
//         return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full flex items-center w-fit"><XCircle size={12} className="mr-1" /> Cancelled</span>
//       default:
//         return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">{status}</span>
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
//             <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
//             <p className="text-gray-600 mt-1">View and manage all your purchase orders</p>
//           </div>
//           <button
//             onClick={() => {
//               const token = localStorage.getItem('vendorToken')
//               if (token) fetchPurchaseOrders(token)
//             }}
//             className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg flex items-center"
//           >
//             <RefreshCw size={18} className="mr-2" />
//             Refresh
//           </button>
//         </div>
//       </div>

//       {/* Filters - Improved UI with consistent sizing */}
// <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
//   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
//     {/* Search */}
//     <div className="relative">
//       <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//       <input
//         type="text"
//         placeholder="Search PO number..."
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//         className="w-full h-10 pl-9 pr-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-gray-900 placeholder-gray-500 bg-white shadow-sm"
//       />
//     </div>

//     {/* Status Filter */}
//     <select
//       value={statusFilterLocal}
//       onChange={(e) => setStatusFilterLocal(e.target.value)}
//       className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-gray-900 bg-white shadow-sm cursor-pointer"
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
//       className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-gray-900 bg-white shadow-sm cursor-pointer"
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
//       className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-gray-900 bg-white shadow-sm cursor-pointer"
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
//           ? 'border-green-500 bg-green-50 text-green-700 font-medium' 
//           : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
//       }`}
//     >
//       <Calendar size={14} className={`mr-2 ${sortBy === 'date' ? 'text-green-600' : 'text-gray-500'}`} />
//       <span>Sort by Date</span>
//       {sortBy === 'date' && <ArrowUpDown size={14} className="ml-2 text-green-600" />}
//     </button>
//   </div>
// </div>

//       {/* Purchase Orders Table */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plant Location</th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Type</th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                 <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {currentItems.map((po) => (
//                 <tr 
//                   key={po.id} 
//                   className="hover:bg-gray-50 cursor-pointer"
//                   onClick={() => viewPODetails(po)}
//                 >
//                   <td className="px-4 py-3 whitespace-nowrap">
//                     <span className="font-medium text-gray-900">{po.poNumber}</span>
//                   </td>
//                   <td className="px-4 py-3 whitespace-nowrap">
//                     <span className="text-gray-600">{po.plantCode || '-'}</span>
//                   </td>
//                   <td className="px-4 py-3 whitespace-nowrap">
//                     <span className="text-gray-600">{po.poType || 'Standard'}</span>
//                   </td>
//                   <td className="px-4 py-3 whitespace-nowrap">
//                     <span className="text-gray-600">{formatDate(po.poCreateDate)}</span>
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
//                       className="text-green-600 hover:text-green-800"
//                       title="View Details"
//                     >
//                       <Eye size={18} />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
              
//               {currentItems.length === 0 && (
//                 <tr>
//                   <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
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
//           <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
//             <div className="text-sm text-gray-500">
//               Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredPOs.length)} of {filteredPOs.length} orders
//             </div>
//             <div className="flex space-x-2">
//               <button
//                 onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                 disabled={currentPage === 1}
//                 className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
//               >
//                 <ChevronLeft size={16} />
//               </button>
//               <span className="px-4 py-2 text-sm text-gray-700">
//                 Page {currentPage} of {totalPages}
//               </span>
//               <button
//                 onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                 disabled={currentPage === totalPages}
//                 className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
//           <div className="bg-white rounded-xl shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-green-600 text-white rounded-t-xl sticky top-0">
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
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <p className="text-xs text-gray-500">PO Number</p>
//                   <p className="text-sm font-semibold text-gray-900">{selectedPO.poNumber}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <p className="text-xs text-gray-500">Plant Location</p>
//                   <p className="text-sm font-semibold text-gray-900">{selectedPO.plantCode || '-'}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <p className="text-xs text-gray-500">PO Type</p>
//                   <p className="text-sm font-semibold text-gray-900">{selectedPO.poType || 'Standard'}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <p className="text-xs text-gray-500">Status</p>
//                   <div className="mt-1">
//                     {getStatusBadge(selectedPO.status)}
//                   </div>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <p className="text-xs text-gray-500">Created Date</p>
//                   <p className="text-sm font-semibold text-gray-900">{formatDate(selectedPO.poCreateDate)}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <p className="text-xs text-gray-500">Expected Date</p>
//                   <p className="text-sm font-semibold text-gray-900">{formatDate(selectedPO.expectedDate)}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <p className="text-xs text-gray-500">Delivered Date</p>
//                   <p className="text-sm font-semibold text-gray-900">{formatDate(selectedPO.deliveredDate)}</p>
//                 </div>
//                 {/* Currency section removed */}
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
//                       {/* Main Headers */}
//                       <tr>
//                         <th rowSpan={2} className="px-3 py-2 text-left text-xs font-medium text-gray-500 border-r">Line</th>
//                         <th rowSpan={2} className="px-3 py-2 text-left text-xs font-medium text-gray-500 border-r">Material Code</th>
//                         <th rowSpan={2} className="px-3 py-2 text-left text-xs font-medium text-gray-500 border-r">Description</th>
//                         <th rowSpan={2} className="px-3 py-2 text-left text-xs font-medium text-gray-500 border-r">UOM</th>
//                         <th rowSpan={2} className="px-3 py-2 text-right text-xs font-medium text-gray-500 border-r">Qty</th>
//                         <th rowSpan={2} className="px-3 py-2 text-right text-xs font-medium text-gray-500 border-r">Rate</th>
//                         {/* GST Header - spans 3 columns */}
//                         <th colSpan={3} className="px-3 py-2 text-center text-xs font-medium text-gray-500 border-r bg-green-50">GST</th>
//                         <th rowSpan={2} className="px-3 py-2 text-right text-xs font-medium text-gray-500">Total</th>
//                       </tr>
//                       {/* Sub Headers for GST */}
//                       <tr>
//                         <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 border-r">SGST%</th>
//                         <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 border-r">CGST%</th>
//                         <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 border-r">IGST%</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-200">
//                       {selectedPO.lineItems.map((item, idx) => (
//                         <tr key={item.id || idx} className="hover:bg-gray-50">
//                           <td className="px-3 py-2 text-gray-600 border-r">{item.lineNumber || idx + 1}</td>
//                           <td className="px-3 py-2 font-mono text-xs text-gray-900 border-r">{item.materialCode || '-'}</td>
//                           <td className="px-3 py-2 text-gray-900 border-r">{item.materialDesc || '-'}</td>
//                           <td className="px-3 py-2 text-gray-600 border-r">{item.uom || '-'}</td>
//                           <td className="px-3 py-2 text-right text-gray-900 border-r">{formatNumber(item.quantity)}</td>
//                           <td className="px-3 py-2 text-right text-gray-900 border-r">{formatCurrency(item.unitPrice)}</td>
//                           {/* GST Values */}
//                           <td className="px-3 py-2 text-center text-gray-900 border-r">{item.sgstPercent ? `${item.sgstPercent}%` : '-'}</td>
//                           <td className="px-3 py-2 text-center text-gray-900 border-r">{item.cgstPercent ? `${item.cgstPercent}%` : '-'}</td>
//                           <td className="px-3 py-2 text-center text-gray-900 border-r">{item.igstPercent ? `${item.igstPercent}%` : '-'}</td>
//                           <td className="px-3 py-2 text-right font-medium text-gray-900">{formatCurrency(item.totalAmount)}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               ) : (
//                 <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
//                   No line items found for this purchase order
//                 </div>
//               )}

//               {/* PO Summary */}
//               {selectedPO.lineItems.length > 0 && (
//                 <div className="mt-6 flex justify-end">
//                   <div className="w-80 bg-gray-50 p-4 rounded-lg">
//                     <div className="flex justify-between items-center py-1">
//                       <span className="text-sm text-gray-600">Subtotal:</span>
//                       <span className="text-sm font-medium text-gray-900">{formatCurrency(selectedPO.subtotal)}</span>
//                     </div>
//                     <div className="flex justify-between items-center py-1">
//                       <span className="text-sm text-gray-600">Tax Amount:</span>
//                       <span className="text-sm font-medium text-gray-900">{formatCurrency(selectedPO.taxAmount)}</span>
//                     </div>
//                     <div className="border-t border-gray-200 my-2"></div>
//                     <div className="flex justify-between items-center py-1">
//                       <span className="text-base font-semibold text-gray-900">Total:</span>
//                       <span className="text-base font-bold text-green-600">{formatCurrency(selectedPO.totalAmount)}</span>
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
  SlidersHorizontal
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
  
  // Main Status Toggle (default open)
  const [mainStatus, setMainStatus] = useState<'completed' | 'open'>('open')
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilterLocal, setStatusFilterLocal] = useState(statusFilter)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'date' | 'number'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Get unique values for filters
  const poTypes = Array.from(new Set(purchaseOrders.map(po => po.poType).filter(Boolean))) as string[]
  const categories = [
    { value: 'close_quantity', label: 'Close Quantity PO' },
    { value: 'schedule', label: 'Schedule PO' }
  ]

  useEffect(() => {
    const token = localStorage.getItem('vendorToken')
    const vendorStr = localStorage.getItem('vendor')
    
    if (!token || !vendorStr) {
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
    }
  }, [router])

  useEffect(() => {
    if (purchaseOrders.length > 0) {
      applyFilters()
    }
  }, [purchaseOrders, searchTerm, mainStatus, statusFilterLocal, typeFilter, categoryFilter, dateFilter, sortBy, sortOrder])

  const fetchPurchaseOrders = async (token?: string) => {
    setLoading(true)
    setError('')
    try {
      const authToken = token || localStorage.getItem('vendorToken')
      
      if (!authToken) {
        setLoading(false)
        return
      }

      const response = await fetch(`http://localhost:3001/api/vendor/purchase-orders`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.status === 401) {
        console.log('Token expired or invalid, showing empty state')
        setPurchaseOrders([])
        setLoading(false)
        return
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        // Add mock categories for demo (replace with actual data from backend)
        const ordersWithCategories = data.data.map((po: PurchaseOrder, index: number) => ({
          ...po,
          category: index % 2 === 0 ? 'close_quantity' : 'schedule'
        }))
        setPurchaseOrders(ordersWithCategories)
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
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(po => po.category === categoryFilter)
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
      filtered = filtered.filter(po => 
        po.poCreateDate && new Date(po.poCreateDate) >= today
      )
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7))
      filtered = filtered.filter(po => 
        po.poCreateDate && new Date(po.poCreateDate) >= weekAgo
      )
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1))
      filtered = filtered.filter(po => 
        po.poCreateDate && new Date(po.poCreateDate) >= monthAgo
      )
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
    return new Date(dateStr).toLocaleDateString()
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
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center w-fit"><CheckCircle size={12} className="mr-1" /> Completed</span>
      case 'approved':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full flex items-center w-fit"><CheckCircle size={12} className="mr-1" /> Approved</span>
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full flex items-center w-fit"><Clock size={12} className="mr-1" /> Pending</span>
      case 'draft':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full flex items-center w-fit"><FileText size={12} className="mr-1" /> Draft</span>
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full flex items-center w-fit"><XCircle size={12} className="mr-1" /> Cancelled</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">{status}</span>
    }
  }

  const getCategoryBadge = (category: string | null | undefined) => {
    switch(category) {
      case 'close_quantity':
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">Close Quantity</span>
      case 'schedule':
        return <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">Schedule PO</span>
      default:
        return null
    }
  }

  const viewPODetails = (po: PurchaseOrder) => {
    setSelectedPO(po)
    setShowDetails(true)
  }

  const closeDetails = () => {
    setShowDetails(false)
    setSelectedPO(null)
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

  return (
    <VendorLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
            <p className="text-gray-600 mt-1">View and manage all your purchase orders</p>
          </div>
          <button
            onClick={() => {
              const token = localStorage.getItem('vendorToken')
              if (token) fetchPurchaseOrders(token)
            }}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg flex items-center"
          >
            <RefreshCw size={18} className="mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Status Toggle - Default Open */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            <div className="flex p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setMainStatus('open')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                  mainStatus === 'open'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Open Orders
              </button>
              <button
                onClick={() => setMainStatus('completed')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                  mainStatus === 'completed'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Completed Orders
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters - Always Visible */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <SlidersHorizontal size={16} className="mr-2" />
          Advanced Filters
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Category Filter - Only 2 options */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-gray-900 bg-white shadow-sm cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-gray-900 bg-white shadow-sm cursor-pointer"
          >
            <option value="all">All Types</option>
            {poTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* Additional Status Filter */}
          <select
            value={statusFilterLocal}
            onChange={(e) => setStatusFilterLocal(e.target.value)}
            className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-gray-900 bg-white shadow-sm cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-gray-900 bg-white shadow-sm cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by PO number or plant location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-gray-900 placeholder-gray-500 bg-white shadow-sm"
            />
          </div>

          {/* Sort by Date */}
          <button
            onClick={() => toggleSort('date')}
            className={`w-full h-10 px-3 border rounded-lg text-sm flex items-center justify-center transition-colors shadow-sm ${
              sortBy === 'date' 
                ? 'border-green-500 bg-green-50 text-green-700 font-medium' 
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Calendar size={14} className={`mr-2 ${sortBy === 'date' ? 'text-green-600' : 'text-gray-500'}`} />
            <span>Sort by Date</span>
            {sortBy === 'date' && <ArrowUpDown size={14} className="ml-2 text-green-600" />}
          </button>

          {/* Sort by PO Number */}
          <button
            onClick={() => toggleSort('number')}
            className={`w-full h-10 px-3 border rounded-lg text-sm flex items-center justify-center transition-colors shadow-sm ${
              sortBy === 'number' 
                ? 'border-green-500 bg-green-50 text-green-700 font-medium' 
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Package size={14} className={`mr-2 ${sortBy === 'number' ? 'text-green-600' : 'text-gray-500'}`} />
            <span>Sort by PO #</span>
            {sortBy === 'number' && <ArrowUpDown size={14} className="ml-2 text-green-600" />}
          </button>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm('')
              setStatusFilterLocal('all')
              setTypeFilter('all')
              setCategoryFilter('all')
              setDateFilter('all')
              setSortBy('date')
              setSortOrder('desc')
            }}
            className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plant Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentItems.map((po) => (
                <tr 
                  key={po.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => viewPODetails(po)}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-medium text-gray-900">{po.poNumber}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getCategoryBadge(po.category)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-gray-600">{po.plantCode || '-'}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-gray-600">{po.poType || 'Standard'}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-gray-600">{formatDate(po.poCreateDate)}</span>
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
                      className="text-green-600 hover:text-green-800"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
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
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredPOs.length)} of {filteredPOs.length} orders
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
          <div className="bg-white rounded-xl shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-green-600 text-white rounded-t-xl sticky top-0">
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
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">PO Number</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedPO.poNumber}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedPO.category === 'close_quantity' ? 'Close Quantity' : 
                     selectedPO.category === 'schedule' ? 'Schedule PO' : '-'}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Plant Location</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedPO.plantCode || '-'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">PO Type</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedPO.poType || 'Standard'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Status</p>
                  <div className="mt-1">
                    {getStatusBadge(selectedPO.status)}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Created Date</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(selectedPO.poCreateDate)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Expected Date</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(selectedPO.expectedDate)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Delivered Date</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(selectedPO.deliveredDate)}</p>
                </div>
              </div>

              {/* Line Items Section */}
              <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                <FileText size={16} className="mr-2" />
                Line Items ({selectedPO.lineItems.length})
              </h4>

              {selectedPO.lineItems.length > 0 ? (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th rowSpan={2} className="px-3 py-2 text-left text-xs font-medium text-gray-500 border-r">Line</th>
                        <th rowSpan={2} className="px-3 py-2 text-left text-xs font-medium text-gray-500 border-r">Material Code</th>
                        <th rowSpan={2} className="px-3 py-2 text-left text-xs font-medium text-gray-500 border-r">Description</th>
                        <th rowSpan={2} className="px-3 py-2 text-left text-xs font-medium text-gray-500 border-r">UOM</th>
                        <th rowSpan={2} className="px-3 py-2 text-right text-xs font-medium text-gray-500 border-r">Qty</th>
                        <th rowSpan={2} className="px-3 py-2 text-right text-xs font-medium text-gray-500 border-r">Rate</th>
                        <th colSpan={3} className="px-3 py-2 text-center text-xs font-medium text-gray-500 border-r bg-green-50">GST</th>
                        <th rowSpan={2} className="px-3 py-2 text-right text-xs font-medium text-gray-500">Total</th>
                      </tr>
                      <tr>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 border-r">SGST%</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 border-r">CGST%</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 border-r">IGST%</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedPO.lineItems.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-600 border-r">{item.lineNumber || idx + 1}</td>
                          <td className="px-3 py-2 font-mono text-xs text-gray-900 border-r">{item.materialCode || '-'}</td>
                          <td className="px-3 py-2 text-gray-900 border-r">{item.materialDesc || '-'}</td>
                          <td className="px-3 py-2 text-gray-600 border-r">{item.uom || '-'}</td>
                          <td className="px-3 py-2 text-right text-gray-900 border-r">{formatNumber(item.quantity)}</td>
                          <td className="px-3 py-2 text-right text-gray-900 border-r">{formatCurrency(item.unitPrice)}</td>
                          <td className="px-3 py-2 text-center text-gray-900 border-r">{item.sgstPercent ? `${item.sgstPercent}%` : '-'}</td>
                          <td className="px-3 py-2 text-center text-gray-900 border-r">{item.cgstPercent ? `${item.cgstPercent}%` : '-'}</td>
                          <td className="px-3 py-2 text-center text-gray-900 border-r">{item.igstPercent ? `${item.igstPercent}%` : '-'}</td>
                          <td className="px-3 py-2 text-right font-medium text-gray-900">{formatCurrency(item.totalAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  No line items found for this purchase order
                </div>
              )}

              {/* PO Summary */}
              {selectedPO.lineItems.length > 0 && (
                <div className="mt-6 flex justify-end">
                  <div className="w-80 bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm text-gray-600">Subtotal:</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(selectedPO.subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm text-gray-600">Tax Amount:</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(selectedPO.taxAmount)}</span>
                    </div>
                    <div className="border-t border-gray-200 my-2"></div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-base font-semibold text-gray-900">Total:</span>
                      <span className="text-base font-bold text-green-600">{formatCurrency(selectedPO.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </VendorLayout>
  )
}