'use client'

import { useState, useEffect } from 'react'
import VendorLayout from '@/components/vendor/VendorLayout'
import { History, RefreshCw, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'

interface AmendmentRecord {
  schedulingAgreement: string
  schedulingAgreementItem: string
  material: string | null
  materialDesc: string | null
  oldPrice: number
  newPrice: number
  percentChange: number | null
  amendmentDate: string | null
}

// SAP OData V2 dates come as "/Date(1712448000000)/", not a plain ISO string.
function parseSAPDate(value: string | null): string {
  if (!value) return '-'
  const match = /\/Date\((\d+)\)\//.exec(value)
  const ms = match ? parseInt(match[1], 10) : Date.parse(value)
  if (isNaN(ms)) return '-'
  return new Date(ms).toLocaleDateString()
}

export default function VendorAmendmentsReportPage() {
  const [amendments, setAmendments] = useState<AmendmentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const fetchAmendments = async () => {
    setRefreshing(true)
    setError('')
    try {
      const token = localStorage.getItem('vendorToken')
      if (!token) {
        window.location.href = '/vendor-login'
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/vendor/sap-purchase-orders/amendments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.status === 401) {
        localStorage.removeItem('vendorToken')
        localStorage.removeItem('vendor')
        window.location.href = '/vendor-login'
        return
      }

      const data = await response.json()
      if (data.success) {
        setAmendments(data.data || [])
      } else {
        setError(data.error || 'Failed to load amendments')
      }
    } catch (err) {
      console.error('Error fetching amendments:', err)
      setError('Error connecting to server')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAmendments()
  }, [])

  return (
    <VendorLayout>
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <History className="mr-2 h-6 w-6 text-green-600" />
              Amendments
            </h1>
            <p className="text-gray-600 mt-1">
              Price changes on your Open POs (scheduling agreements) — one-time POs don't support this
            </p>
          </div>
          <button
            onClick={fetchAmendments}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 mb-4">
            Error: {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading amendments...</div>
        ) : amendments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <AlertCircle className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <h3 className="text-base font-medium text-gray-900 mb-1">No amendments yet</h3>
            <p className="text-sm text-gray-500">
              None of your scheduling agreements have had a price change yet.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduling Agreement</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Old Price</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">New Price</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Change</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amended On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {amendments.map((a, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{a.schedulingAgreement}</td>
                      <td className="px-4 py-3 text-gray-600">{a.schedulingAgreementItem}</td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs text-gray-900">{a.material || '-'}</div>
                        <div className="text-xs text-gray-500">{a.materialDesc}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">₹{a.oldPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">₹{a.newPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">
                        {a.percentChange !== null ? (
                          <span className={`inline-flex items-center text-xs font-medium ${a.percentChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {a.percentChange >= 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                            {a.percentChange >= 0 ? '+' : ''}{a.percentChange.toFixed(1)}%
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{parseSAPDate(a.amendmentDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </VendorLayout>
  )
}
