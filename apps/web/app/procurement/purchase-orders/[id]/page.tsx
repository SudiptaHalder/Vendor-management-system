// 'use client'

// import { useState, useEffect } from 'react'
// import { useParams, useRouter } from 'next/navigation'
// import MainLayout from '@/components/layout/MainLayout'
// import { api } from '@/lib/api'
// import {
//   ArrowLeft,
//   ShoppingCart,
//   Building2,
//   Calendar,
//   DollarSign,
//   Clock,
//   Truck,
//   CheckCircle,
//   XCircle,
//   FileText,
//   Download,
//   Send,
//   Edit2,
//   Trash2,
//   Printer,
//   Mail,
//   AlertCircle,
//   Package
// } from 'lucide-react'
// import Link from 'next/link'

// interface PurchaseOrder {
//   id: string
//   poNumber: string
//   title: string
//   description?: string
//   status: string
//   priority: string
//   orderDate: string
//   expectedDate?: string
//   deliveredDate?: string
//   subtotal: number
//   taxAmount: number
//   discount: number
//   total: number
//   currency: string
//   notes?: string
//   terms?: string
//   vendor: {
//     id: string
//     name: string
//     email: string
//     phone?: string
//     contactPerson?: string
//   }
//   lineItems: Array<{
//     id: string
//     lineNumber: number
//     description: string
//     quantity: number
//     unitPrice: number
//     total: number
//     notes?: string
//     receivedQuantity?: number
//   }>
//   createdBy: {
//     name: string
//     email: string
//   }
//   createdAt: string
// }

// // Helper function to safely format currency
// const formatCurrency = (amount: any, currency: string = 'USD'): string => {
//   // Handle undefined, null, or non-numeric values
//   if (amount === undefined || amount === null || isNaN(Number(amount))) {
//     return `${currency} 0.00`
//   }
//   const numAmount = Number(amount)
//   return `${currency} ${numAmount.toFixed(2)}`
// }

// // Helper function to safely format numbers
// const formatNumber = (value: any): string => {
//   // Handle undefined, null, or non-numeric values
//   if (value === undefined || value === null || isNaN(Number(value))) {
//     return '0'
//   }
//   const numValue = Number(value)
//   return numValue.toFixed(2)
// }

// export default function PurchaseOrderDetailPage() {
//   const params = useParams()
//   const router = useRouter()
//   const [order, setOrder] = useState<PurchaseOrder | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')
//   const [showDeleteModal, setShowDeleteModal] = useState(false)
//   const [showStatusModal, setShowStatusModal] = useState(false)
//   const [selectedStatus, setSelectedStatus] = useState('')

//   const id = params.id as string

//   useEffect(() => {
//     fetchPurchaseOrder()
//   }, [id])

//   const fetchPurchaseOrder = async () => {
//     setLoading(true)
//     try {
//       const response = await api.getPurchaseOrder(id)
//       if (response.success) {
//         setOrder(response.data)
//       } else {
//         setError('Failed to load purchase order')
//       }
//     } catch (err) {
//       setError('Failed to load purchase order')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleStatusUpdate = async () => {
//     if (!selectedStatus) return
//     try {
//       const response = await api.updatePurchaseOrderStatus(id, selectedStatus)
//       if (response.success) {
//         setOrder(response.data)
//         setShowStatusModal(false)
//       }
//     } catch (err) {
//       console.error('Error updating status:', err)
//     }
//   }

//   const handleDelete = async () => {
//     try {
//       const response = await api.deletePurchaseOrder(id)
//       if (response.success) {
//         router.push('/procurement/purchase-orders')
//       }
//     } catch (err) {
//       console.error('Error deleting purchase order:', err)
//     }
//   }

//   const getStatusBadge = (status: string) => {
//     const statusConfig: Record<string, { color: string, icon: any, label: string }> = {
//       draft: { color: 'bg-gray-100 text-gray-800', icon: FileText, label: 'Draft' },
//       sent: { color: 'bg-blue-100 text-blue-800', icon: Send, label: 'Sent' },
//       acknowledged: { color: 'bg-purple-100 text-purple-800', icon: CheckCircle, label: 'Acknowledged' },
//       confirmed: { color: 'bg-indigo-100 text-indigo-800', icon: CheckCircle, label: 'Confirmed' },
//       shipped: { color: 'bg-yellow-100 text-yellow-800', icon: Truck, label: 'Shipped' },
//       delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Delivered' },
//       cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelled' }
//     }
//     const config = statusConfig[status] || statusConfig.draft
//     const Icon = config.icon
//     return (
//       <span className={`px-3 py-1 text-sm font-medium rounded-full flex items-center space-x-1 w-fit ${config.color}`}>
//         <Icon size={14} />
//         <span>{config.label}</span>
//       </span>
//     )
//   }

//   const getPriorityBadge = (priority: string) => {
//     const priorityConfig: Record<string, { color: string, label: string }> = {
//       low: { color: 'bg-gray-100 text-gray-800', label: 'Low' },
//       medium: { color: 'bg-blue-100 text-blue-800', label: 'Medium' },
//       high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
//       urgent: { color: 'bg-red-100 text-red-800', label: 'Urgent' }
//     }
//     const config = priorityConfig[priority] || priorityConfig.medium
//     return (
//       <span className={`px-3 py-1 text-sm font-medium rounded-full ${config.color}`}>
//         {config.label}
//       </span>
//     )
//   }

//   if (loading) {
//     return (
//       <MainLayout>
//         <div className="flex items-center justify-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//         </div>
//       </MainLayout>
//     )
//   }

//   if (error || !order) {
//     return (
//       <MainLayout>
//         <div className="text-center py-12">
//           <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">Purchase Order Not Found</h2>
//           <p className="text-gray-600 mb-6">{error || 'The purchase order you are looking for does not exist.'}</p>
//           <Link
//             href="/procurement/purchase-orders"
//             className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             <ArrowLeft size={16} className="mr-2" />
//             Back to Purchase Orders
//           </Link>
//         </div>
//       </MainLayout>
//     )
//   }

//   return (
//     <MainLayout>
//       {/* Header */}
//       <div className="mb-6">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-4">
//             <Link
//               href="/procurement/purchase-orders"
//               className="p-2 hover:bg-gray-100 rounded-lg transition"
//             >
//               <ArrowLeft size={20} className="text-gray-600" />
//             </Link>
//             <div>
//               <div className="flex items-center space-x-3 mb-1">
//                 <h1 className="text-2xl font-bold text-gray-900">{order.poNumber}</h1>
//                 {getStatusBadge(order.status)}
//                 {getPriorityBadge(order.priority)}
//               </div>
//               <p className="text-gray-600">{order.title}</p>
//             </div>
//           </div>
//           <div className="flex items-center space-x-3">
//             <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
//               <Printer size={16} />
//               <span>Print</span>
//             </button>
//             <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
//               <Download size={16} />
//               <span>Export</span>
//             </button>
//             <button className="px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 flex items-center space-x-2">
//               <Edit2 size={16} />
//               <span>Edit</span>
//             </button>
//             <button
//               onClick={() => setShowDeleteModal(true)}
//               className="px-4 py-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 flex items-center space-x-2"
//             >
//               <Trash2 size={16} />
//               <span>Delete</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="grid grid-cols-3 gap-6">
//         {/* Left Column - 2/3 width */}
//         <div className="col-span-2 space-y-6">
//           {/* Vendor Information */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//               <Building2 size={18} className="mr-2 text-gray-500" />
//               Vendor Information
//             </h2>
//             <div className="flex items-start space-x-4">
//               <div className="p-3 bg-blue-100 rounded-lg">
//                 <Building2 className="w-6 h-6 text-blue-600" />
//               </div>
//               <div className="flex-1">
//                 <h3 className="text-lg font-medium text-gray-900">{order.vendor.name}</h3>
//                 <div className="mt-2 grid grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-xs text-gray-500">Email</p>
//                     <p className="text-sm text-gray-900">{order.vendor.email || '—'}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500">Phone</p>
//                     <p className="text-sm text-gray-900">{order.vendor.phone || '—'}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500">Contact Person</p>
//                     <p className="text-sm text-gray-900">{order.vendor.contactPerson || '—'}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Line Items */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//               <Package size={18} className="mr-2 text-gray-500" />
//               Line Items
//             </h2>
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
//                     <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
//                     <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
//                     <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
//                     <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Received</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {order.lineItems?.map((item) => (
//                     <tr key={item.id}>
//                       <td className="px-4 py-3 text-sm text-gray-500">{item.lineNumber}</td>
//                       <td className="px-4 py-3">
//                         <div className="text-sm font-medium text-gray-900">{item.description}</div>
//                         {item.notes && (
//                           <div className="text-xs text-gray-500">{item.notes}</div>
//                         )}
//                       </td>
//                       <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatNumber(item.quantity)}</td>
//                       <td className="px-4 py-3 text-sm text-gray-900 text-right">
//                         {formatCurrency(item.unitPrice, order.currency)}
//                       </td>
//                       <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
//                         {formatCurrency(item.total, order.currency)}
//                       </td>
//                       <td className="px-4 py-3 text-sm text-gray-900 text-right">
//                         {formatNumber(item.receivedQuantity)}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//                 <tfoot className="bg-gray-50">
//                   <tr>
//                     <td colSpan={4} className="px-4 py-3 text-sm font-medium text-gray-900 text-right">Subtotal:</td>
//                     <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
//                       {formatCurrency(order.subtotal, order.currency)}
//                     </td>
//                     <td></td>
//                   </tr>
//                   <tr>
//                     <td colSpan={4} className="px-4 py-3 text-sm text-gray-700 text-right">Tax:</td>
//                     <td className="px-4 py-3 text-sm text-gray-700 text-right">
//                       {formatCurrency(order.taxAmount, order.currency)}
//                     </td>
//                     <td></td>
//                   </tr>
//                   <tr>
//                     <td colSpan={4} className="px-4 py-3 text-sm text-gray-700 text-right">Discount:</td>
//                     <td className="px-4 py-3 text-sm text-gray-700 text-right">
//                       -{formatCurrency(order.discount, order.currency)}
//                     </td>
//                     <td></td>
//                   </tr>
//                   <tr>
//                     <td colSpan={4} className="px-4 py-3 text-sm font-bold text-gray-900 text-right">Total:</td>
//                     <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
//                       {formatCurrency(order.total, order.currency)}
//                     </td>
//                     <td></td>
//                   </tr>
//                 </tfoot>
//               </table>
//             </div>
//           </div>

//           {/* Notes & Terms */}
//           {(order.notes || order.terms) && (
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//               <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//                 <FileText size={18} className="mr-2 text-gray-500" />
//                 Notes & Terms
//               </h2>
//               {order.notes && (
//                 <div className="mb-4">
//                   <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
//                   <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{order.notes}</p>
//                 </div>
//               )}
//               {order.terms && (
//                 <div>
//                   <h3 className="text-sm font-medium text-gray-700 mb-2">Terms & Conditions</h3>
//                   <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{order.terms}</p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Right Column - 1/3 width */}
//         <div className="space-y-6">
//           {/* Summary Card */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
//             <div className="space-y-3">
//               <div className="flex justify-between">
//                 <span className="text-sm text-gray-600">Order Date</span>
//                 <span className="text-sm font-medium text-gray-900">
//                   {new Date(order.orderDate).toLocaleDateString()}
//                 </span>
//               </div>
//               {order.expectedDate && (
//                 <div className="flex justify-between">
//                   <span className="text-sm text-gray-600">Expected Delivery</span>
//                   <span className="text-sm font-medium text-gray-900">
//                     {new Date(order.expectedDate).toLocaleDateString()}
//                   </span>
//                 </div>
//               )}
//               {order.deliveredDate && (
//                 <div className="flex justify-between">
//                   <span className="text-sm text-gray-600">Delivered Date</span>
//                   <span className="text-sm font-medium text-gray-900">
//                     {new Date(order.deliveredDate).toLocaleDateString()}
//                   </span>
//                 </div>
//               )}
//               <div className="flex justify-between pt-3 border-t">
//                 <span className="text-sm text-gray-600">Created By</span>
//                 <span className="text-sm font-medium text-gray-900">{order.createdBy.name}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-sm text-gray-600">Created At</span>
//                 <span className="text-sm font-medium text-gray-900">
//                   {new Date(order.createdAt).toLocaleDateString()}
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Status Actions */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h2>
//             <div className="space-y-2">
//               {['draft', 'sent', 'acknowledged', 'confirmed', 'shipped', 'delivered'].map((status) => (
//                 <button
//                   key={status}
//                   onClick={() => {
//                     setSelectedStatus(status)
//                     setShowStatusModal(true)
//                   }}
//                   disabled={order.status === status}
//                   className={`w-full px-4 py-2 text-sm font-medium rounded-lg flex items-center justify-between ${
//                     order.status === status
//                       ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
//                       : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
//                   }`}
//                 >
//                   <span>Mark as {status.charAt(0).toUpperCase() + status.slice(1)}</span>
//                   {order.status === status && <CheckCircle size={16} className="text-green-600" />}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
//             <div className="space-y-2">
//               <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between">
//                 <span>Send to Vendor</span>
//                 <Mail size={16} />
//               </button>
//               <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between">
//                 <span>Create RFQ</span>
//                 <FileText size={16} />
//               </button>
//               <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between">
//                 <span>Receive Goods</span>
//                 <Truck size={16} />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Delete Confirmation Modal */}
//       {showDeleteModal && (
//         <div className="fixed inset-0 z-50 overflow-y-auto">
//           <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDeleteModal(false)} />
//           <div className="flex min-h-full items-center justify-center p-4">
//             <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6">
//               <div className="text-center">
//                 <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
//                   <Trash2 className="w-6 h-6 text-red-600" />
//                 </div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Purchase Order</h3>
//                 <p className="text-sm text-gray-600 mb-6">
//                   Are you sure you want to delete <span className="font-semibold">{order.poNumber}</span>? 
//                   This action cannot be undone.
//                 </p>
//                 <div className="flex justify-center space-x-3">
//                   <button
//                     onClick={() => setShowDeleteModal(false)}
//                     className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={handleDelete}
//                     className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center space-x-2"
//                   >
//                     <Trash2 size={16} />
//                     <span>Delete</span>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Status Update Modal */}
//       {showStatusModal && (
//         <div className="fixed inset-0 z-50 overflow-y-auto">
//           <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowStatusModal(false)} />
//           <div className="flex min-h-full items-center justify-center p-4">
//             <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6">
//               <div className="text-center">
//                 <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
//                   <Clock className="w-6 h-6 text-blue-600" />
//                 </div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-2">Update Status</h3>
//                 <p className="text-sm text-gray-600 mb-6">
//                   Are you sure you want to change the status to{' '}
//                   <span className="font-semibold capitalize">{selectedStatus}</span>?
//                 </p>
//                 <div className="flex justify-center space-x-3">
//                   <button
//                     onClick={() => setShowStatusModal(false)}
//                     className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={handleStatusUpdate}
//                     className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
//                   >
//                     Update Status
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </MainLayout>
//   )
// }
'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  ArrowLeft,
  ShoppingCart,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  FileText,
  Download,
  Send,
  Edit2,
  Trash2,
  Printer,
  Mail,
  AlertCircle,
  Package
} from 'lucide-react'
import Link from 'next/link'

interface PurchaseOrder {
  id: string
  poNumber: string
  title: string
  description?: string
  status: string
  priority: string
  orderDate: string
  expectedDate?: string
  deliveredDate?: string
  subtotal: number
  taxAmount: number
  discount: number
  total: number
  currency: string
  notes?: string
  terms?: string
  vendor: {
    id: string
    name: string
    email: string
    phone?: string
    contactPerson?: string
  }
  lineItems: Array<{
    id: string
    lineNumber: number
    description: string
    quantity: number
    unitPrice: number
    total: number
    notes?: string
    receivedQuantity?: number
  }>
  createdBy: {
    name: string
    email: string
  }
  createdAt: string
}

// Helper function to safely format currency
const formatCurrency = (amount: any, currency: string = 'USD'): string => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return `${currency} 0.00`
  }
  const numAmount = Number(amount)
  return `${currency} ${numAmount.toFixed(2)}`
}

// Helper function to safely format numbers
const formatNumber = (value: any): string => {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return '0'
  }
  const numValue = Number(value)
  return numValue.toFixed(2)
}

export default function PurchaseOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<PurchaseOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')
  const printRef = useRef<HTMLDivElement>(null)

  const id = params.id as string

  useEffect(() => {
    fetchPurchaseOrder()
  }, [id])

  const fetchPurchaseOrder = async () => {
    setLoading(true)
    try {
      const response = await api.getPurchaseOrder(id)
      if (response.success) {
        setOrder(response.data)
      } else {
        setError('Failed to load purchase order')
      }
    } catch (err) {
      setError('Failed to load purchase order')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return
    try {
      const response = await api.updatePurchaseOrderStatus(id, selectedStatus)
      if (response.success) {
        setOrder(response.data)
        setShowStatusModal(false)
      }
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await api.deletePurchaseOrder(id)
      if (response.success) {
        router.push('/procurement/purchase-orders')
      }
    } catch (err) {
      console.error('Error deleting purchase order:', err)
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow || !order) return

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${order.poNumber} - Purchase Order</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; color: #2563eb; }
            .po-number { font-size: 18px; color: #374151; margin-top: 5px; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #111827; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #f3f4f6; padding: 10px; text-align: left; font-size: 12px; }
            td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
            .total { text-align: right; font-weight: bold; }
            .footer { margin-top: 50px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">VendorFlow</div>
              <div class="po-number">Purchase Order: ${order.poNumber}</div>
            </div>
            <div>
              <div>Date: ${new Date(order.orderDate).toLocaleDateString()}</div>
              <div>Status: ${order.status.toUpperCase()}</div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Vendor Information</div>
            <div><strong>${order.vendor.name}</strong></div>
            <div>${order.vendor.email || ''}</div>
            <div>${order.vendor.phone || ''}</div>
            <div>Contact: ${order.vendor.contactPerson || ''}</div>
          </div>
          
          <div class="section">
            <div class="section-title">Order Details</div>
            <div><strong>${order.title}</strong></div>
            <div>${order.description || ''}</div>
            <div style="margin-top: 10px;">
              <strong>Expected Delivery:</strong> ${order.expectedDate ? new Date(order.expectedDate).toLocaleDateString() : 'Not specified'}
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Line Items</div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.lineItems.map(item => `
                  <tr>
                    <td>${item.lineNumber}</td>
                    <td>${item.description}</td>
                    <td>${formatNumber(item.quantity)}</td>
                    <td>${formatCurrency(item.unitPrice, order.currency)}</td>
                    <td>${formatCurrency(item.total, order.currency)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" class="total">Subtotal:</td>
                  <td>${formatCurrency(order.subtotal, order.currency)}</td>
                </tr>
                <tr>
                  <td colspan="4" class="total">Tax:</td>
                  <td>${formatCurrency(order.taxAmount, order.currency)}</td>
                </tr>
                <tr>
                  <td colspan="4" class="total">Discount:</td>
                  <td>-${formatCurrency(order.discount, order.currency)}</td>
                </tr>
                <tr>
                  <td colspan="4" class="total">Total:</td>
                  <td><strong>${formatCurrency(order.total, order.currency)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          ${order.notes ? `
            <div class="section">
              <div class="section-title">Notes</div>
              <p>${order.notes}</p>
            </div>
          ` : ''}
          
          ${order.terms ? `
            <div class="section">
              <div class="section-title">Terms & Conditions</div>
              <p>${order.terms}</p>
            </div>
          ` : ''}
          
          <div class="footer">
            <p>Created by: ${order.createdBy.name} on ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p>This is a computer generated document. No signature is required.</p>
          </div>
          
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
  }

  const handleExport = () => {
    if (!order) return

    // Create CSV content
    const headers = ['PO Number', 'Title', 'Vendor', 'Status', 'Order Date', 'Total', 'Currency']
    const data = [
      order.poNumber,
      order.title,
      order.vendor.name,
      order.status,
      new Date(order.orderDate).toLocaleDateString(),
      order.total,
      order.currency
    ]

    const lineItemsHeaders = ['Line #', 'Description', 'Quantity', 'Unit Price', 'Total']
    const lineItemsData = order.lineItems.map(item => [
      item.lineNumber,
      item.description,
      item.quantity,
      item.unitPrice,
      item.total
    ])

    // Create CSV string
    let csv = headers.join(',') + '\n'
    csv += data.map(cell => `"${cell}"`).join(',') + '\n\n'
    csv += lineItemsHeaders.join(',') + '\n'
    lineItemsData.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n'
    })

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${order.poNumber}_export.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleEdit = () => {
    router.push(`/procurement/purchase-orders/${id}/edit`)
  }

  const handleSendToVendor = async () => {
    try {
      const response = await api.updatePurchaseOrderStatus(id, 'sent')
      if (response.success) {
        setOrder(response.data)
        // Here you would also trigger an email to the vendor
        alert('Purchase order sent to vendor successfully!')
      }
    } catch (err) {
      console.error('Error sending purchase order:', err)
      alert('Failed to send purchase order to vendor')
    }
  }

  const handleCreateRFQ = () => {
    router.push(`/procurement/rfqs/new?poId=${id}&vendorId=${order?.vendor.id}`)
  }

  const handleReceiveGoods = () => {
    router.push(`/procurement/goods-receipts/new?poId=${id}`)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string, icon: any, label: string }> = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: FileText, label: 'Draft' },
      sent: { color: 'bg-blue-100 text-blue-800', icon: Send, label: 'Sent' },
      acknowledged: { color: 'bg-purple-100 text-purple-800', icon: CheckCircle, label: 'Acknowledged' },
      confirmed: { color: 'bg-indigo-100 text-indigo-800', icon: CheckCircle, label: 'Confirmed' },
      shipped: { color: 'bg-yellow-100 text-yellow-800', icon: Truck, label: 'Shipped' },
      delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelled' }
    }
    const config = statusConfig[status] || statusConfig.draft
    const Icon = config.icon
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full flex items-center space-x-1 w-fit ${config.color}`}>
        <Icon size={14} />
        <span>{config.label}</span>
      </span>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, { color: string, label: string }> = {
      low: { color: 'bg-gray-100 text-gray-800', label: 'Low' },
      medium: { color: 'bg-blue-100 text-blue-800', label: 'Medium' },
      high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
      urgent: { color: 'bg-red-100 text-red-800', label: 'Urgent' }
    }
    const config = priorityConfig[priority] || priorityConfig.medium
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    )
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    )
  }

  if (error || !order) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Purchase Order Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The purchase order you are looking for does not exist.'}</p>
          <Link
            href="/procurement/purchase-orders"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Purchase Orders
          </Link>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div ref={printRef}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/procurement/purchase-orders"
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </Link>
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{order.poNumber}</h1>
                  {getStatusBadge(order.status)}
                  {getPriorityBadge(order.priority)}
                </div>
                <p className="text-gray-600">{order.title}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrint}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              >
                <Printer size={16} />
                <span>Print</span>
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              >
                <Download size={16} />
                <span>Export</span>
              </button>
              <button
                onClick={handleEdit}
                className="px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 flex items-center space-x-2"
              >
                <Edit2 size={16} />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 flex items-center space-x-2"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="col-span-2 space-y-6">
            {/* Vendor Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building2 size={18} className="mr-2 text-gray-500" />
                Vendor Information
              </h2>
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{order.vendor.name}</h3>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm text-gray-900">{order.vendor.email || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm text-gray-900">{order.vendor.phone || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Contact Person</p>
                      <p className="text-sm text-gray-900">{order.vendor.contactPerson || '—'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package size={18} className="mr-2 text-gray-500" />
                Line Items
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Received</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.lineItems?.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.lineNumber}</td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">{item.description}</div>
                          {item.notes && (
                            <div className="text-xs text-gray-500">{item.notes}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatNumber(item.quantity)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          {formatCurrency(item.unitPrice, order.currency)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                          {formatCurrency(item.total, order.currency)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          {formatNumber(item.receivedQuantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-sm font-medium text-gray-900 text-right">Subtotal:</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(order.subtotal, order.currency)}
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-sm text-gray-700 text-right">Tax:</td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">
                        {formatCurrency(order.taxAmount, order.currency)}
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-sm text-gray-700 text-right">Discount:</td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">
                        -{formatCurrency(order.discount, order.currency)}
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-sm font-bold text-gray-900 text-right">Total:</td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                        {formatCurrency(order.total, order.currency)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Notes & Terms */}
            {(order.notes || order.terms) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText size={18} className="mr-2 text-gray-500" />
                  Notes & Terms
                </h2>
                {order.notes && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{order.notes}</p>
                  </div>
                )}
                {order.terms && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Terms & Conditions</h3>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{order.terms}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Order Date</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </span>
                </div>
                {order.expectedDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Expected Delivery</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(order.expectedDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {order.deliveredDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Delivered Date</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(order.deliveredDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t">
                  <span className="text-sm text-gray-600">Created By</span>
                  <span className="text-sm font-medium text-gray-900">{order.createdBy.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created At</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h2>
              <div className="space-y-2">
                {['draft', 'sent', 'acknowledged', 'confirmed', 'shipped', 'delivered'].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setSelectedStatus(status)
                      setShowStatusModal(true)
                    }}
                    disabled={order.status === status}
                    className={`w-full px-4 py-2 text-sm font-medium rounded-lg flex items-center justify-between ${
                      order.status === status
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>Mark as {status.charAt(0).toUpperCase() + status.slice(1)}</span>
                    {order.status === status && <CheckCircle size={16} className="text-green-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={handleSendToVendor}
                  disabled={order.status !== 'draft'}
                  className={`w-full px-4 py-2 text-sm font-medium rounded-lg flex items-center justify-between ${
                    order.status === 'draft'
                      ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  }`}
                >
                  <span>Send to Vendor</span>
                  <Mail size={16} />
                </button>
                <button
                  onClick={handleCreateRFQ}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between"
                >
                  <span>Create RFQ</span>
                  <FileText size={16} />
                </button>
                <button
                  onClick={handleReceiveGoods}
                  disabled={order.status !== 'shipped'}
                  className={`w-full px-4 py-2 text-sm font-medium rounded-lg flex items-center justify-between ${
                    order.status === 'shipped'
                      ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  }`}
                >
                  <span>Receive Goods</span>
                  <Truck size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDeleteModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Purchase Order</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to delete <span className="font-semibold">{order.poNumber}</span>? 
                  This action cannot be undone.
                </p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center space-x-2"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowStatusModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Update Status</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to change the status to{' '}
                  <span className="font-semibold capitalize">{selectedStatus}</span>?
                </p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStatusUpdate}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
