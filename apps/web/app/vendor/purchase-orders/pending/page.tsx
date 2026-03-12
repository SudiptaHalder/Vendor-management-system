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
  XCircle,
  Eye,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowUpDown,
  AlertCircle
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
  sgstPercent: number | null
  cgstPercent: number | null
  igstPercent: number | null
  totalAmount: number | null
}

interface PurchaseOrder {
  id: string
  poNumber: string
  poType: string | null
  plantCode: string | null
  poCreateDate: string | null
  expectedDate: string | null
  status: string
  lineItems: LineItem[]
  subtotal: number | null
  taxAmount: number | null
  totalAmount: number | null
}

export default function PendingPurchaseOrdersPage() {
  const router = useRouter()
  const [vendor, setVendor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [filteredPOs, setFilteredPOs] = useState<PurchaseOrder[]>([])
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
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
  }, [purchaseOrders, searchTerm, sortBy, sortOrder])

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
        // Filter only pending orders
        const pendingOrders = data.data.filter((po: PurchaseOrder) => 
          po.status === 'pending' || po.status === 'draft'
        )
        setPurchaseOrders(pendingOrders)
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
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(po => 
        po.poNumber.toLowerCase().includes(term)
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
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
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="w-5 h-5 text-yellow-600" />
              <h1 className="text-2xl font-bold text-gray-900">Pending Purchase Orders</h1>
            </div>
            <p className="text-gray-600 mt-1">Orders awaiting approval or processing</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/vendor/purchase-orders"
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <Package size={16} />
              <span>All Orders</span>
            </Link>
            <button
              onClick={() => fetchPurchaseOrders(localStorage.getItem('vendorToken') || '')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg flex items-center"
            >
              <RefreshCw size={18} className="mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-xs text-gray-500">Total Pending</p>
          <p className="text-xl font-bold text-yellow-600">{purchaseOrders.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-xs text-gray-500">Total Value</p>
          <p className="text-xl font-bold text-gray-900">
            {formatCurrency(purchaseOrders.reduce((sum, po) => sum + (po.totalAmount || 0), 0))}
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
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search PO number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
            />
          </div>

          {/* Sort Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => toggleSort('date')}
              className={`h-10 px-3 border rounded-lg text-sm flex items-center justify-center ${
                sortBy === 'date' 
                  ? 'border-yellow-500 bg-yellow-50 text-yellow-700' 
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Calendar size={14} className="mr-1" />
              Date
              {sortBy === 'date' && <ArrowUpDown size={14} className="ml-1" />}
            </button>
            <button
              onClick={() => toggleSort('number')}
              className={`h-10 px-3 border rounded-lg text-sm flex items-center justify-center ${
                sortBy === 'number' 
                  ? 'border-yellow-500 bg-yellow-50 text-yellow-700' 
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Package size={14} className="mr-1" />
              PO #
              {sortBy === 'number' && <ArrowUpDown size={14} className="ml-1" />}
            </button>
          </div>
        </div>
      </div>

      {/* Pending Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO Number</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plant</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Value</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentItems.map((po) => (
                <tr 
                  key={po.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => viewPODetails(po)}
                >
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{po.poNumber}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">{po.poType || 'Standard'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">{po.plantCode || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">{formatDate(po.poCreateDate)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">{formatDate(po.expectedDate)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full flex items-center w-fit">
                      <Clock size={12} className="mr-1" /> Pending
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-gray-900">
                    {formatCurrency(po.totalAmount)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        viewPODetails(po)
                      }}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <Clock size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>No pending purchase orders found</p>
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
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredPOs.length)} of {filteredPOs.length}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-4 py-2 text-sm">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedPO && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-yellow-600 text-white rounded-t-xl sticky top-0">
              <h3 className="text-lg font-semibold">PO Details: {selectedPO.poNumber}</h3>
              <button onClick={closeDetails} className="p-1 hover:bg-yellow-700 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {/* PO Header */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">PO Number</p>
                  <p className="text-sm font-semibold">{selectedPO.poNumber}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="text-sm font-semibold">{selectedPO.poType || 'Standard'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Plant</p>
                  <p className="text-sm font-semibold">{selectedPO.plantCode || '-'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-sm font-semibold">{formatDate(selectedPO.poCreateDate)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Expected</p>
                  <p className="text-sm font-semibold">{formatDate(selectedPO.expectedDate)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Status</p>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">Pending</span>
                </div>
              </div>

              {/* Line Items */}
              <h4 className="font-semibold mb-3">Line Items ({selectedPO.lineItems.length})</h4>
              {selectedPO.lineItems.length > 0 ? (
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">Line</th>
                        <th className="px-3 py-2 text-left">Material</th>
                        <th className="px-3 py-2 text-left">Description</th>
                        <th className="px-3 py-2 text-left">UOM</th>
                        <th className="px-3 py-2 text-right">Qty</th>
                        <th className="px-3 py-2 text-right">Rate</th>
                        <th className="px-3 py-2 text-center" colSpan={3}>GST</th>
                        <th className="px-3 py-2 text-right">Total</th>
                      </tr>
                      <tr className="bg-gray-50">
                        <th colSpan={6}></th>
                        <th className="px-3 py-1 text-center text-xs">SGST%</th>
                        <th className="px-3 py-1 text-center text-xs">CGST%</th>
                        <th className="px-3 py-1 text-center text-xs">IGST%</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPO.lineItems.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-gray-50">
                          <td className="px-3 py-2">{item.lineNumber || idx + 1}</td>
                          <td className="px-3 py-2 font-mono text-xs">{item.materialCode || '-'}</td>
                          <td className="px-3 py-2">{item.materialDesc || '-'}</td>
                          <td className="px-3 py-2">{item.uom || '-'}</td>
                          <td className="px-3 py-2 text-right">{item.quantity || '-'}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                          <td className="px-3 py-2 text-center">{item.sgstPercent ? `${item.sgstPercent}%` : '-'}</td>
                          <td className="px-3 py-2 text-center">{item.cgstPercent ? `${item.cgstPercent}%` : '-'}</td>
                          <td className="px-3 py-2 text-center">{item.igstPercent ? `${item.igstPercent}%` : '-'}</td>
                          <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.totalAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No line items</div>
              )}
            </div>
          </div>
        </div>
      )}
    </VendorLayout>
  )
}