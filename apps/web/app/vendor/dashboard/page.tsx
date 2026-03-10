'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import VendorLayout from '@/components/vendor/VendorLayout'
import {
  Package,
  Clock,
  CheckCircle,
  FileText,
  Eye,
  Calendar,
  Truck,
  ClipboardList,
  FileSignature,
  MessageSquare,
  ChevronRight
} from 'lucide-react'

interface PurchaseOrder {
  id: string
  poNumber: string
  poCreateDate: string | null
  poAmendDate: string | null
  vendorId: string
  status: string
  lineItems: LineItem[]
}

interface LineItem {
  id: string
  materialCode: string
  materialDesc: string
  orderUnit: string
  rate: number
  invoiceQuantity: number
  lineNumber: number
}

export default function VendorDashboard() {
  const router = useRouter()
  const [vendor, setVendor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null)
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    openQuotes: 0,
    pendingBids: 0
  })

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
      fetchPurchaseOrders(vendorData.code)
    } catch (err) {
      router.push('/vendor-login')
    }
  }, [router])

  const fetchPurchaseOrders = async (supplierCode: string) => {
    setLoading(true)
    try {
      // Fetch from your API
      const response = await fetch(`http://localhost:3001/api/vendors/upload/vendor/${supplierCode}`)
      const data = await response.json()
      
      if (data.success) {
        // Group by PO number
        const poMap = new Map()
        data.data.forEach((item: any) => {
          if (!poMap.has(item.poNumber)) {
            poMap.set(item.poNumber, {
              id: item.id,
              poNumber: item.poNumber,
              poCreateDate: item.poCreateDate,
              poAmendDate: item.poAmendDate,
              vendorId: item.vendorId,
              status: item.purchaseOrder?.status || 'pending',
              lineItems: []
            })
          }
          
          // Add line item
          if (item.materialCode) {
            poMap.get(item.poNumber).lineItems.push({
              id: item.id,
              materialCode: item.materialCode,
              materialDesc: item.materialDesc,
              orderUnit: item.orderUnit,
              rate: item.rate,
              invoiceQuantity: item.invoiceQuantity,
              lineNumber: item.lineItem
            })
          }
        })

        const orders = Array.from(poMap.values())
        setPurchaseOrders(orders)
        
        // Update stats
        setStats({
          totalOrders: orders.length,
          pendingOrders: orders.filter(o => o.status === 'pending').length,
          completedOrders: orders.filter(o => o.status === 'completed').length,
          openQuotes: 3,
          pendingBids: 2
        })
      }
    } catch (err) {
      console.error('Error fetching purchase orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString()
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
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {vendor?.name}! 👋
        </h1>
        <p className="text-gray-600 mt-1">View and manage your purchase orders</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Orders</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-xl font-bold text-yellow-600">{stats.pendingOrders}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Completed</p>
              <p className="text-xl font-bold text-green-600">{stats.completedOrders}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Open Quotes</p>
              <p className="text-xl font-bold text-purple-600">{stats.openQuotes}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileSignature className="w-4 h-4 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Pending Bids</p>
              <p className="text-xl font-bold text-orange-600">{stats.pendingBids}</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <MessageSquare className="w-4 h-4 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Purchase Orders List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-xl">
            <h3 className="font-semibold text-gray-900">Purchase Orders</h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {purchaseOrders.map((po) => (
              <button
                key={po.id}
                onClick={() => setSelectedPO(po)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition flex items-center justify-between ${
                  selectedPO?.id === po.id ? 'bg-green-50 border-l-4 border-green-500' : ''
                }`}
              >
                <div>
                  <p className="font-medium text-gray-900">PO: {po.poNumber}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Created: {formatDate(po.poCreateDate)}
                  </p>
                  {po.poAmendDate && (
                    <p className="text-xs text-gray-500">
                      Amended: {formatDate(po.poAmendDate)}
                    </p>
                  )}
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            ))}
            {purchaseOrders.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500">
                No purchase orders found
              </div>
            )}
          </div>
        </div>

        {/* Line Items Details */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-xl">
            <h3 className="font-semibold text-gray-900">
              {selectedPO ? `PO Details: ${selectedPO.poNumber}` : 'Select a Purchase Order'}
            </h3>
          </div>
          
          {selectedPO ? (
            <div className="p-4">
              {/* PO Header Info */}
              <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Created Date</p>
                  <p className="text-sm font-medium">{formatDate(selectedPO.poCreateDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Amended Date</p>
                  <p className="text-sm font-medium">{formatDate(selectedPO.poAmendDate)}</p>
                </div>
                <div>
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

              {/* Line Items Table */}
              <h4 className="font-medium text-gray-700 mb-2">Line Items</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Line</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Material Code</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Unit</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Rate</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Quantity</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedPO.lineItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-600">{item.lineNumber || '-'}</td>
                        <td className="px-3 py-2 font-mono text-xs text-gray-900">{item.materialCode}</td>
                        <td className="px-3 py-2 text-gray-900">{item.materialDesc}</td>
                        <td className="px-3 py-2 text-gray-600">{item.orderUnit || 'EA'}</td>
                        <td className="px-3 py-2 text-right text-gray-900">${item.rate?.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right text-gray-900">{item.invoiceQuantity}</td>
                        <td className="px-3 py-2 text-right font-medium text-gray-900">
                          ${(item.rate * item.invoiceQuantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    {selectedPO.lineItems.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-3 py-4 text-center text-gray-500">
                          No line items found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* PO Summary */}
              {selectedPO.lineItems.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total Items:</span>
                    <span className="text-sm font-bold text-gray-900">{selectedPO.lineItems.length}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm font-medium text-gray-700">Total Value:</span>
                    <span className="text-sm font-bold text-green-600">
                      ${selectedPO.lineItems.reduce((sum, item) => sum + (item.rate * item.invoiceQuantity), 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Package size={48} className="mx-auto mb-3 text-gray-300" />
              <p>Select a purchase order to view details</p>
            </div>
          )}
        </div>
      </div>
    </VendorLayout>
  )
}
