'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle,
  Package,
  Zap,
  RefreshCw,
  List,
  Receipt,
  Clock,
  Truck,
  DollarSign,
  MapPin,
  Tag,
  Layers,
  Printer,
  Download,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2
} from 'lucide-react'
import Link from 'next/link'

interface LineItem {
  PurchaseOrderItem: string;
  PurchaseOrderItemCategory: string;
  Material: string;
  MaterialGroup: string;
  Plant: string;
  StorageLocation: string;
  OrderQuantity: number;
  PurchaseOrderQuantityUnit: string;
  NetPriceAmount: number;
  DocumentCurrency: string;
  PurchaseOrderItemText: string;
  SupplierMaterialNumber: string;
  TaxCode: string;
  GoodsReceiptIsExpected: boolean;
  InvoiceIsExpected: boolean;
  IsCompletelyDelivered: boolean;
  IsFinallyInvoiced: boolean;
  DeliveryAddressCityName: string;
  DeliveryAddressCountry: string;
  DeliveryAddressName: string;
  PlantName?: string;
  MaterialName?: string;
  MaterialGroupName?: string;
  Status?: string;
  RevisionLevel?: string;
  PriceUnit?: number;
  NetOrderValue?: number;
  MaterialDescription?: string;
}

interface PurchaseOrder {
  PurchaseOrder: string;
  Supplier: string;
  SupplierName?: string;
  PurchaseOrderDate: string;
  TotalAmount: number;
  DocumentCurrency: string;
  PurchaseOrderStatus: string;
  CreatedByUser: string;
  CreationDate: string;
  CompanyCode?: string;
  PurchasingOrganization?: string;
  PurchasingGroup?: string;
  PaymentTerms?: string;
  PurchaseOrderType?: string;
  SupplierAddress?: string;
  SupplierCity?: string;
  SupplierCountry?: string;
  DeliveryAddress?: string;
  DeliveryCity?: string;
  DeliveryCountry?: string;
  to_PurchaseOrderItem?: {
    results: LineItem[];
  };
}

export default function PurchaseOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<PurchaseOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(new Set())

  const id = params.id as string

  useEffect(() => {
    fetchPurchaseOrder()
  }, [id])

  const fetchPurchaseOrder = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.href = '/admin-login'
        return
      }

      setRefreshing(true)
      setError('')

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sap/purchase-orders/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      const data = await response.json()
      
      if (data.success && data.data) {
        const processedOrder = {
          ...data.data,
          to_PurchaseOrderItem: {
            results: data.data.to_PurchaseOrderItem?.results?.map((item: any) => ({
              ...item,
              NetOrderValue: (item.OrderQuantity || 0) * (item.NetPriceAmount || 0),
              PriceUnit: item.PriceUnit || 1,
              RevisionLevel: item.RevisionLevel || '',
              Status: item.Status || determineItemStatus(item),
              MaterialDescription: item.PurchaseOrderItemText || item.MaterialName || item.Material || ''
            })) || []
          }
        }
        setOrder(processedOrder)
      } else {
        setError(data.error || 'Purchase order not found')
      }
    } catch (err: any) {
      console.error('Error fetching purchase order:', err)
      setError(err.message || 'Failed to fetch purchase order')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const toggleRowExpansion = (rowId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(rowId)) {
        newSet.delete(rowId)
      } else {
        newSet.add(rowId)
      }
      return newSet
    })
  }

  const toggleColumnExpansion = (colId: string) => {
    setExpandedColumns(prev => {
      const newSet = new Set(prev)
      if (newSet.has(colId)) {
        newSet.delete(colId)
      } else {
        newSet.add(colId)
      }
      return newSet
    })
  }

  const determineItemStatus = (item: any): string => {
    if (item.IsCompletelyDelivered) return 'Delivered'
    if (item.IsFinallyInvoiced) return 'Invoiced'
    if (item.GoodsReceiptIsExpected) return 'In Progress'
    return 'Open'
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string, label: string }> = {
      '1': { color: 'bg-green-100 text-green-800', label: 'Open' },
      '2': { color: 'bg-blue-100 text-blue-800', label: 'In Review' },
      '3': { color: 'bg-purple-100 text-purple-800', label: 'Approved' },
      '4': { color: 'bg-gray-100 text-gray-800', label: 'Closed' },
      '5': { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
      '6': { color: 'bg-teal-100 text-teal-800', label: 'Completed' },
    }
    const config = statusMap[status] || { color: 'bg-gray-100 text-gray-800', label: status }
    return <span className={`px-3 py-1 text-sm font-medium rounded-full ${config.color}`}>{config.label}</span>
  }

  const getItemCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      '0': 'Standard',
      '1': 'Consignment',
      '2': 'Subcontracting',
      '3': 'Stock Transfer',
      '4': 'Service',
      '5': 'Non-Stock'
    }
    return categories[category] || category || 'Standard'
  }

  const getItemStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string, label: string }> = {
      'Open': { color: 'bg-yellow-100 text-yellow-800', label: 'Open' },
      'In Progress': { color: 'bg-blue-100 text-blue-800', label: 'In Progress' },
      'Delivered': { color: 'bg-green-100 text-green-800', label: 'Delivered' },
      'Invoiced': { color: 'bg-purple-100 text-purple-800', label: 'Invoiced' },
      'Cancelled': { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
    }
    const config = statusMap[status] || { color: 'bg-gray-100 text-gray-800', label: status }
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>{config.label}</span>
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    try {
      const date = new Date(dateStr)
      return isNaN(date.getTime()) ? '-' : date.toLocaleDateString()
    } catch {
      return '-'
    }
  }

  const formatCurrency = (amount: number | null, currency: string = 'INR') => {
    if (amount === null || amount === undefined || isNaN(amount)) return '-'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined || isNaN(num)) return '-'
    return new Intl.NumberFormat('en-IN').format(num)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    alert('Export functionality coming soon!')
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

  const lineItems = order.to_PurchaseOrderItem?.results || []
  const isDescriptionExpanded = expandedColumns.has('description')

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/procurement/purchase-orders"
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </Link>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900">PO #{order.PurchaseOrder}</h1>
                {getStatusBadge(order.PurchaseOrderStatus)}
                <span className="flex items-center text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  <Zap size={12} className="mr-1" />
                  SAP Live
                </span>
              </div>
              <p className="text-gray-600">Vendor: {order.SupplierName || order.Supplier || 'Unknown'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-gray-600 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
            >
              <Printer size={16} />
              <span>Print</span>
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 text-gray-600 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
            >
              <Download size={16} />
              <span>Export</span>
            </button>
            <button
              onClick={fetchPurchaseOrder}
              disabled={refreshing}
              className="px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* PO Header Information */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-xs text-gray-500">PO Number</p>
            <p className="text-sm font-semibold text-gray-900">{order.PurchaseOrder}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-xs text-gray-500">PO Type</p>
            <p className="text-sm text-gray-900">{order.PurchaseOrderType || 'Standard'}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Order Date</p>
            <p className="text-sm text-gray-900">{formatDate(order.PurchaseOrderDate)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Total Amount</p>
            <p className="text-sm font-bold text-blue-600">{formatCurrency(order.TotalAmount, order.DocumentCurrency)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Company Code</p>
            <p className="text-sm text-gray-900">{order.CompanyCode || '-'}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Purchasing Org</p>
            <p className="text-sm text-gray-900">{order.PurchasingOrganization || '-'}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Purchasing Group</p>
            <p className="text-sm text-gray-900">{order.PurchasingGroup || '-'}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Payment Terms</p>
            <p className="text-sm text-gray-900">{order.PaymentTerms || '-'}</p>
          </div>
        </div>

        {/* Vendor Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Building2 size={16} className="mr-2" />
              Vendor Information
            </h2>
            <div>
              <p className="font-medium text-gray-900">{order.SupplierName || order.Supplier || 'Unknown'}</p>
              <p className="text-sm text-gray-500">Supplier Code: {order.Supplier || 'N/A'}</p>
              {order.SupplierAddress && (
                <p className="text-sm text-gray-500 mt-1">{order.SupplierAddress}</p>
              )}
              {(order.SupplierCity || order.SupplierCountry) && (
                <p className="text-sm text-gray-500">
                  {[order.SupplierCity, order.SupplierCountry].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <MapPin size={16} className="mr-2" />
              Delivery Address
            </h2>
            <div>
              {order.DeliveryAddress ? (
                <>
                  <p className="text-sm text-gray-900">{order.DeliveryAddress}</p>
                  {order.DeliveryCity && (
                    <p className="text-sm text-gray-500">{order.DeliveryCity}</p>
                  )}
                  {order.DeliveryCountry && (
                    <p className="text-sm text-gray-500">{order.DeliveryCountry}</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500">No delivery address specified</p>
              )}
            </div>
          </div>
        </div>

        {/* Column Expansion Toggle */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleColumnExpansion('description')}
              className={`px-3 py-1.5 text-sm rounded-lg border flex items-center space-x-1 transition ${
                isDescriptionExpanded 
                  ? 'bg-blue-50 text-blue-700 border-blue-300' 
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {isDescriptionExpanded ? (
                <>
                  <Minimize2 size={14} />
                  <span>Collapse Description</span>
                </>
              ) : (
                <>
                  <Maximize2 size={14} />
                  <span>Expand Descriptions</span>
                </>
              )}
            </button>
            <span className="text-xs text-gray-500">
              {isDescriptionExpanded ? 'Showing full descriptions' : 'Showing truncated descriptions'}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {lineItems.length} items
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center">
              <List size={16} className="mr-2" />
              Line Items ({lineItems.length})
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Total: {formatCurrency(order.TotalAmount, order.DocumentCurrency)}
              </span>
            </div>
          </div>
          
          {lineItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Item</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Item Category</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Material Code</th>
                    <th className={`px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      isDescriptionExpanded ? 'min-w-[400px]' : 'min-w-[200px]'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span>Material Description</span>
                        <button
                          onClick={() => toggleColumnExpansion('description')}
                          className="ml-2 p-0.5 hover:bg-gray-200 rounded transition"
                          title={isDescriptionExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isDescriptionExpanded ? (
                            <Minimize2 size={12} className="text-gray-500" />
                          ) : (
                            <Maximize2 size={12} className="text-gray-500" />
                          )}
                        </button>
                      </div>
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Material Group</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Plant</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Order Qty</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Net Price</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Price Unit</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Net Value</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Revision</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Supplier Material</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {lineItems.map((item, idx) => {
                    const rowId = item.PurchaseOrderItem || `row-${idx}`
                    const isExpanded = expandedRows.has(rowId)
                    const description = item.MaterialDescription || item.PurchaseOrderItemText || item.MaterialName || '-'
                    
                    return (
                      <tr key={rowId} className={`hover:bg-gray-50 ${isExpanded ? 'bg-blue-50' : ''}`}>
                        <td className="px-3 py-3 text-gray-600 font-medium text-center whitespace-nowrap">
                          {item.PurchaseOrderItem || idx + 1}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-700 whitespace-nowrap">
                            {getItemCategoryLabel(item.PurchaseOrderItemCategory)}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-mono text-xs text-gray-900 whitespace-nowrap" title={item.Material}>
                          {item.Material || '-'}
                        </td>
                        <td className={`px-3 py-3 ${
                          isDescriptionExpanded ? 'min-w-[400px]' : 'max-w-[250px]'
                        }`}>
                          <div className="flex items-start space-x-2">
                            <div className="flex-1">
                              {isDescriptionExpanded ? (
                                <div className="text-gray-900 whitespace-pre-wrap break-words leading-relaxed">
                                  {description}
                                </div>
                              ) : (
                                <div className="relative">
                                  <div className="text-gray-900 truncate" title={description}>
                                    {description}
                                  </div>
                                  {description.length > 40 && (
                                    <button
                                      onClick={() => toggleRowExpansion(rowId)}
                                      className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-0.5 focus:outline-none"
                                    >
                                      {isExpanded ? 'Show less' : 'Show more...'}
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                            {isDescriptionExpanded && description.length > 60 && (
                              <button
                                onClick={() => toggleRowExpansion(rowId)}
                                className="flex-shrink-0 text-blue-600 hover:text-blue-800 focus:outline-none mt-1"
                              >
                                {isExpanded ? (
                                  <ChevronUp size={16} />
                                ) : (
                                  <ChevronDown size={16} />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-gray-600 max-w-[150px] truncate" title={item.MaterialGroup || item.MaterialGroupName}>
                          {item.MaterialGroupName || item.MaterialGroup || '-'}
                        </td>
                        <td className="px-3 py-3 text-gray-600 max-w-[120px] truncate" title={item.PlantName || item.Plant}>
                          {item.PlantName || item.Plant || '-'}
                        </td>
                        <td className="px-3 py-3 text-right text-gray-900 whitespace-nowrap">
                          {formatNumber(item.OrderQuantity)} {item.PurchaseOrderQuantityUnit || 'EA'}
                        </td>
                        <td className="px-3 py-3 text-right font-medium text-gray-900 whitespace-nowrap">
                          {formatCurrency(item.NetPriceAmount, order.DocumentCurrency)}
                        </td>
                        <td className="px-3 py-3 text-right text-gray-600 whitespace-nowrap">
                          {item.PriceUnit || 1} {item.PurchaseOrderQuantityUnit || 'EA'}
                        </td>
                        <td className="px-3 py-3 text-right font-medium text-gray-900 whitespace-nowrap">
                          {formatCurrency(item.NetOrderValue || (item.OrderQuantity * item.NetPriceAmount), order.DocumentCurrency)}
                        </td>
                        <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                          {item.RevisionLevel || '-'}
                        </td>
                        <td className="px-3 py-3 font-mono text-xs text-gray-600 max-w-[120px] truncate" title={item.SupplierMaterialNumber}>
                          {item.SupplierMaterialNumber || '-'}
                        </td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          {getItemStatusBadge(item.Status || determineItemStatus(item))}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              <Package size={48} className="mx-auto mb-3 text-gray-300" />
              <p>No line items found for this purchase order</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-between items-center text-xs text-gray-500 border-t border-gray-200 pt-4">
          <div>
            <span>Created by: {order.CreatedByUser || 'N/A'}</span>
            <span className="mx-2">|</span>
            <span>Created on: {formatDate(order.CreationDate)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
              {order.PurchaseOrderStatus === '1' ? 'Live' : 'Archived'}
            </span>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}