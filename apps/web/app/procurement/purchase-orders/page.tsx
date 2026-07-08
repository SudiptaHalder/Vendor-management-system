
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
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
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Zap
} from 'lucide-react'

interface LineItem {
  PurchaseOrderItem: string
  Material: string
  MaterialName?: string
  Plant: string
  OrderQuantity: number
  OrderUnit: string
  NetPriceAmount: number
  DeliveryDate: string
  Status: string
}

interface PurchaseOrder {
  PurchaseOrder: string
  Supplier: string
  SupplierName?: string
  PurchaseOrderDate: string
  TotalAmount: number
  DocumentCurrency: string
  PurchaseOrderStatus: string
  CreatedByUser: string
  CreationDate: string
  to_PurchaseOrderItem?: {
    results: LineItem[]
  }
}

export default function AdminPurchaseOrdersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const statusFilter = searchParams.get('status') || 'all'
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [filteredPOs, setFilteredPOs] = useState<PurchaseOrder[]>([])
  
  // Main Status Toggle
  const [mainStatus, setMainStatus] = useState<'completed' | 'open'>('open')
  
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
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = '/admin-login'
      return
    }
    fetchPurchaseOrders(token)
  }, [])

  useEffect(() => {
    if (purchaseOrders.length > 0) {
      applyFilters()
    }
  }, [purchaseOrders, searchTerm, mainStatus, statusFilterLocal, dateFilter, sortBy, sortOrder])

  const fetchPurchaseOrders = async (token?: string) => {
    setLoading(true)
    setError('')
    try {
      const authToken = token || localStorage.getItem('token')
      
      if (!authToken) {
        setLoading(false)
        return
      }

      const response = await fetch(`http://localhost:3001/api/sap/purchase-orders?limit=200`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.status === 401) {
        console.log('Token expired or invalid')
        setPurchaseOrders([])
        setLoading(false)
        return
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        const mappedOrders = data.data.map((po: any) => ({
          ...po,
          id: po.PurchaseOrder,
          poNumber: po.PurchaseOrder,
          plantCode: po.Plant || '',
          poType: po.PurchaseOrderType || 'Standard',
          poCreateDate: po.PurchaseOrderDate,
          status: mapSAPStatus(po.PurchaseOrderStatus),
          totalAmount: po.TotalAmount,
          currency: po.DocumentCurrency,
          lineItems: po.to_PurchaseOrderItem?.results?.map((item: any) => ({
            id: item.PurchaseOrderItem,
            lineNumber: parseInt(item.PurchaseOrderItem) || 0,
            materialCode: item.Material,
            materialDesc: item.MaterialName || item.Material,
            uom: item.OrderUnit,
            quantity: item.OrderQuantity,
            unitPrice: item.NetPriceAmount,
            totalAmount: item.NetPriceAmount * item.OrderQuantity,
            status: item.Status
          })) || []
        }))
        setPurchaseOrders(mappedOrders)
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

  const mapSAPStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      '1': 'pending',
      '2': 'approved',
      '3': 'approved',
      '4': 'completed',
      '5': 'cancelled',
      '6': 'completed',
      'open': 'pending',
      'closed': 'completed',
      'cancelled': 'cancelled'
    }
    return statusMap[status] || 'pending'
  }

  const applyFilters = () => {
    let filtered = [...purchaseOrders]
    
    if (mainStatus === 'completed') {
      filtered = filtered.filter(po => po.status === 'completed')
    } else {
      filtered = filtered.filter(po => ['pending', 'draft', 'approved'].includes(po.status))
    }
    
    if (statusFilterLocal !== 'all') {
      filtered = filtered.filter(po => po.status === statusFilterLocal)
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(po => 
        po.poNumber.toLowerCase().includes(term) ||
        po.SupplierName?.toLowerCase().includes(term) ||
        po.Supplier?.toLowerCase().includes(term)
      )
    }
    
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

  const viewPODetails = (po: PurchaseOrder) => {
    // Navigate to the detail page instead of showing modal
    router.push(`/procurement/purchase-orders/${po.PurchaseOrder}`)
  }

  const toggleSort = (field: 'date' | 'number') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredPOs.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredPOs.length / itemsPerPage)

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
            <div className="flex items-center space-x-3 mt-1">
              <p className="text-gray-600">Live purchase orders from SAP S/4HANA</p>
              <span className="flex items-center text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                <Zap size={12} className="mr-1" />
                SAP Live
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              const token = localStorage.getItem('token')
              if (token) fetchPurchaseOrders(token)
            }}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg flex items-center"
          >
            <RefreshCw size={18} className="mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Status Toggle */}
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
          <div className="text-sm text-green-600">
            {filteredPOs.length} orders found
          </div>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by PO number or vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-gray-900 placeholder-gray-500 bg-white shadow-sm"
            />
          </div>
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

      {/* Purchase Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
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
                    <span className="text-gray-600">{po.SupplierName || po.Supplier || 'Unknown'}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-gray-600">{formatDate(po.poCreateDate)}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-gray-600">{formatCurrency(po.totalAmount)}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-gray-600">{po.lineItems?.length || 0}</span>
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
                      className="text-blue-600 hover:text-blue-800"
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
    </MainLayout>
  )
}
