'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { History, RefreshCw, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'

interface AmendmentRecord {
  schedulingAgreement: string
  schedulingAgreementItem: string
  supplier: string | null
  material: string | null
  materialDesc: string | null
  oldPrice: number
  newPrice: number
  percentChange: number | null
  amendmentDate: string | null
  oldDate: string | null
}

// SAP OData V2 dates come as "/Date(1712448000000)/", not a plain ISO string.
function parseSAPDate(value: string | null): string {
  if (!value) return '-'
  const match = /\/Date\((\d+)\)\//.exec(value)
  const ms = match ? parseInt(match[1], 10) : Date.parse(value)
  if (isNaN(ms)) return '-'
  return new Date(ms).toLocaleDateString()
}

export default function AmendmentsPage() {
  const [amendments, setAmendments] = useState<AmendmentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const fetchAmendments = async () => {
    setRefreshing(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.href = '/admin-login'
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/procurement/amendments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
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
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <History className="mr-2 h-6 w-6 text-blue-600 dark:text-blue-400" />
              Amendments
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Price changes on scheduling agreements (open POs) — close-quantity POs don't support this
            </p>
          </div>
          <button
            onClick={fetchAmendments}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400 mb-4">
            Error: {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading amendments...</div>
        ) : amendments.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <AlertCircle className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">No amendments yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No scheduling agreement has had its price changed yet. Records will show up here once one is amended in SAP.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Scheduling Agreement</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Supplier</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Material</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Old Price</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">New Price</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Change</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amended On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {amendments.map((a, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{a.schedulingAgreement}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{a.schedulingAgreementItem}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{a.supplier || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs text-gray-900 dark:text-gray-100">{a.material || '-'}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{a.materialDesc}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">₹{a.oldPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-gray-100">₹{a.newPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">
                        {a.percentChange !== null ? (
                          <span className={`inline-flex items-center text-xs font-medium ${a.percentChange >= 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                            {a.percentChange >= 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                            {a.percentChange >= 0 ? '+' : ''}{a.percentChange.toFixed(1)}%
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{parseSAPDate(a.amendmentDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
