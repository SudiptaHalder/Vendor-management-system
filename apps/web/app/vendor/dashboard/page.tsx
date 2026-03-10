'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import VendorLayout from '@/components/vendor/VendorLayout'
import {
  Package,
  Calendar,
  RefreshCw,
  Eye,
  FileText,
  X
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
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null)
  const [showDetails, setShowDetails] = useState(false)

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

  const fetchPurchaseOrders = async (token: string) => {
    setLoading(true)
    setError('')
    try {
      console.log('Fetching purchase orders...')
      
      const response = await fetch(`http://localhost:3001/api/vendor/purchase-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('API Response:', data)
      
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

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString()
  }

  // Helper function to convert rate to number
  const parseRate = (rate: any): number => {
    if (!rate) return 0
    if (typeof rate === 'number') return rate
    if (typeof rate === 'string') {
      return parseFloat(rate.replace(/,/g, '')) || 0
    }
    return 0
  }

  // Helper function to convert quantity to number
  const parseQuantity = (qty: any): number => {
    if (!qty) return 0
    if (typeof qty === 'number') return qty
    if (typeof qty === 'string') {
      return parseFloat(qty) || 0
    }
    return 0
  }

  const viewPODetails = (po: PurchaseOrder) => {
    setSelectedPO(po)
    setShowDetails(true)
  }

  const closeDetails = () => {
    setShowDetails(false)
    setSelectedPO(null)
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
            onClick={() => fetchPurchaseOrders(localStorage.getItem('vendorToken') || '')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Purchase Orders</p>
              <p className="text-2xl font-bold text-gray-900">{purchaseOrders.length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Package className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Line Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {purchaseOrders.reduce((sum, po) => sum + po.lineItems.length, 0)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Last Updated</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Orders Table - Only 3 Columns */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Purchase Orders</h3>
          <p className="text-sm text-gray-500 mt-1">Click on any row to view complete details</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">PO Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Created Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Amended Date</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {purchaseOrders.map((po) => (
                <tr 
                  key={po.id} 
                  className="hover:bg-gray-50 cursor-pointer transition"
                  onClick={() => viewPODetails(po)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">{po.poNumber}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-600">{formatDate(po.poCreateDate)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-600">{formatDate(po.poAmendDate)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button 
                      className="text-green-600 hover:text-green-800"
                      onClick={(e) => {
                        e.stopPropagation()
                        viewPODetails(po)
                      }}
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              
              {purchaseOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <Package size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>No purchase orders found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                    selectedPO.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedPO.status}
                  </span>
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
