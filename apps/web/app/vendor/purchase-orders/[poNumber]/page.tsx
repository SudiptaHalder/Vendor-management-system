'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import VendorLayout from '@/components/vendor/VendorLayout'
import {
  Package,
  Calendar,
  ArrowLeft,
  FileText,
  Download
} from 'lucide-react'

interface LineItem {
  id: string
  materialCode: string
  materialDesc: string
  orderUnit: string
  rate: number
  invoiceQuantity: number
  lineNumber: number
}

interface PurchaseOrder {
  poNumber: string
  poCreateDate: string | null
  poAmendDate: string | null
  status: string
  lineItems: LineItem[]
}

export default function PODetailsPage() {
  const router = useRouter()
  const params = useParams()
  const poNumber = params.poNumber as string
  const [loading, setLoading] = useState(true)
  const [poData, setPoData] = useState<PurchaseOrder | null>(null)

  useEffect(() => {
    const fetchPODetails = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/vendors/upload/po/${poNumber}`)
        const data = await response.json()
        
        if (data.success) {
          setPoData(data.data)
        }
      } catch (err) {
        console.error('Error fetching PO details:', err)
      } finally {
        setLoading(false)
      }
    }

    if (poNumber) {
      fetchPODetails()
    }
  }, [poNumber])

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

  if (!poData) {
    return (
      <VendorLayout>
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-300 mb-3" />
          <h2 className="text-xl font-semibold text-gray-900">Purchase Order Not Found</h2>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Go Back
          </button>
        </div>
      </VendorLayout>
    )
  }

  return (
    <VendorLayout>
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Purchase Order: {poData.poNumber}</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white">
          <div className="flex items-center space-x-3">
            <Package size={24} />
            <div>
              <h2 className="text-lg font-semibold">PO Details</h2>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* PO Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">PO Number</p>
              <p className="text-sm font-medium text-gray-900">{poData.poNumber}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Created Date</p>
              <p className="text-sm font-medium text-gray-900 flex items-center">
                <Calendar size={14} className="mr-1 text-gray-400" />
                {formatDate(poData.poCreateDate)}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Amended Date</p>
              <p className="text-sm font-medium text-gray-900 flex items-center">
                <Calendar size={14} className="mr-1 text-gray-400" />
                {formatDate(poData.poAmendDate)}
              </p>
            </div>
          </div>

          {/* Line Items */}
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Line Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Line</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Material Code</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Unit</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Rate</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Quantity</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {poData.lineItems.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-600">{item.lineNumber || index + 1}</td>
                    <td className="px-4 py-2 font-mono text-xs text-gray-900">{item.materialCode}</td>
                    <td className="px-4 py-2 text-gray-900">{item.materialDesc}</td>
                    <td className="px-4 py-2 text-gray-600">{item.orderUnit || 'EA'}</td>
                    <td className="px-4 py-2 text-right text-gray-900">${item.rate?.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right text-gray-900">{item.invoiceQuantity}</td>
                    <td className="px-4 py-2 text-right font-medium text-gray-900">
                      ${(item.rate * item.invoiceQuantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={6} className="px-4 py-3 text-right font-medium text-gray-700">
                    Total:
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">
                    ${poData.lineItems.reduce((sum, item) => sum + (item.rate * item.invoiceQuantity), 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end space-x-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center">
              <Download size={16} className="mr-2" />
              Download
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
              <FileText size={16} className="mr-2" />
              Export PDF
            </button>
          </div>
        </div>
      </div>
    </VendorLayout>
  )
}
