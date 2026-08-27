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
  TrendingUp,
  ArrowUpDown,
  MoreVertical
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
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilterLocal, setStatusFilterLocal] = useState(statusFilter)
  const [dateFilter, setDateFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'date' | 'number'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    // Check vendor auth
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
      router.push('/vendor-login')
    }
  }, [router])

  useEffect(() => {
    applyFilters()
  }, [purchaseOrders, searchTerm, statusFilterLocal, dateFilter, sortBy, sortOrder])

  const fetchPurchaseOrders = async (token?: string) => {
    setLoading(true)
    setError('')
    try {
      const authToken = token || localStorage.getItem('vendorToken')
      
      if (!authToken) {
        router.push('/vendor-login')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/vendor/purchase-orders`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.status === 401) {
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
        setPurchaseOrders(data.data)
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
    
    // Apply status filter
    if (statusFilterLocal !== 'all') {
      filtered = filtered.filter(po => po.status === statusFilterLocal)
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(po => 
        po.poNumber.toLowerCase().includes(term)
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
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full flex items-center w-fit"><XCircle size={12} className="mr-1" /> Cancelled</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">{status}</span>
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

  const parseRate = (rate: any): number => {
    if (!rate) return 0
    if (typeof rate === 'number') return rate
    if (typeof rate === 'string') {
      return parseFloat(rate.replace(/,/g, '')) || 0
    }
    return 0
  }

  const parseQuantity = (qty: any): number => {
    if (!qty) return 0
    if (typeof qty === 'number') return qty
    if (typeof qty === 'string') {
      return parseFloat(qty) || 0
    }
    return 0
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

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-xs text-gray-500">Total POs</p>
          <p className="text-xl font-bold text-gray-900">{purchaseOrders.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-xl font-bold text-yellow-600">
            {purchaseOrders.filter(po => po.status === 'pending' || po.status === 'draft').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-xs text-gray-500">Completed</p>
          <p className="text-xl font-bold text-green-600">
            {purchaseOrders.filter(po => po.status === 'completed').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-xs text-gray-500">Total Items</p>
          <p className="text-xl font-bold text-blue-600">
            {purchaseOrders.reduce((sum, po) => sum + po.lineItems.length, 0)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by PO number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilterLocal}
            onChange={(e) => setStatusFilterLocal(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="draft">Draft</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>

          {/* Sort */}
          <div className="flex space-x-2">
            <button
              onClick={() => toggleSort('date')}
              className={`flex-1 px-3 py-2 border rounded-lg text-sm flex items-center justify-center ${
                sortBy === 'date' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200'
              }`}
            >
              <Calendar size={14} className="mr-1" />
              Date
              {sortBy === 'date' && (
                <ArrowUpDown size={14} className="ml-1" />
              )}
            </button>
            <button
              onClick={() => toggleSort('number')}
              className={`flex-1 px-3 py-2 border rounded-lg text-sm flex items-center justify-center ${
                sortBy === 'number' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200'
              }`}
            >
              <Package size={14} className="mr-1" />
              PO #
              {sortBy === 'number' && (
                <ArrowUpDown size={14} className="ml-1" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amended Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentItems.map((po) => (
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
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => viewPODetails(po)}
                      className="text-green-600 hover:text-green-800 mr-3"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      className="text-gray-400 hover:text-gray-600"
                      title="Download"
                    >
                      <Download size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Package size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>No purchase orders found</p>
                    {(searchTerm || statusFilterLocal !== 'all' || dateFilter !== 'all') && (
                      <button
                        onClick={() => {
                          setSearchTerm('')
                          setStatusFilterLocal('all')
                          setDateFilter('all')
                        }}
                        className="mt-2 text-green-600 hover:text-green-800 text-sm"
                      >
                        Clear filters
                      </button>
                    )}
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
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-green-600 text-white rounded-t-xl">
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
                  <p className="text-xs text-gray-500">Created Date</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(selectedPO.poCreateDate)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Amended Date</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(selectedPO.poAmendDate)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Status</p>
                  <div className="mt-1">
                    {getStatusBadge(selectedPO.status)}
                  </div>
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Line</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Material Code</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Unit</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Rate</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Quantity</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedPO.lineItems.map((item, idx) => {
                        const rate = parseRate(item.rate)
                        const qty = parseQuantity(item.invoiceQuantity)
                        const total = rate * qty
                        
                        return (
                          <tr key={item.id || idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-600">{item.lineNumber || idx + 1}</td>
                            <td className="px-4 py-3 font-mono text-xs text-gray-900">{item.materialCode}</td>
                            <td className="px-4 py-3 text-gray-900">{item.materialDesc}</td>
                            <td className="px-4 py-3 text-gray-600">{item.orderUnit || 'EA'}</td>
                            <td className="px-4 py-3 text-right text-gray-900">${rate.toFixed(2)}</td>
                            <td className="px-4 py-3 text-right text-gray-900">{qty}</td>
                            <td className="px-4 py-3 text-right font-medium text-gray-900">${total.toFixed(2)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  No line items found for this purchase order
                </div>
              )}

              {/* PO Total */}
              {selectedPO.lineItems.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <div className="bg-green-50 p-3 rounded-lg w-64">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">PO Total:</span>
                      <span className="text-lg font-bold text-green-600">
                        ${selectedPO.lineItems.reduce((sum, item) => {
                          const rate = parseRate(item.rate)
                          const qty = parseQuantity(item.invoiceQuantity)
                          return sum + (rate * qty)
                        }, 0).toFixed(2)}
                      </span>
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