'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  FileSignature,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MoreVertical,
  Building2,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

interface Quote {
  id: string
  quoteNumber: string
  rfqId: string
  rfq: {
    id: string
    rfqNumber: string
    title: string
  }
  vendorId: string
  vendor: {
    id: string
    name: string
    email: string | null
  }
  status: string
  total: number
  currency: string
  validUntil: string | null
  submittedAt: string
  notes: string | null
  lineItems: any[]
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchQuotes = async () => {
    setLoading(true)
    try {
      const response = await api.getQuotes()
      if (response.success) {
        setQuotes(response.data)
      } else {
        setError('Failed to load quotes')
      }
    } catch (err) {
      setError('Failed to load quotes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuotes()
  }, [])

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quote.rfq?.rfqNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string, icon: any, label: string }> = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: FileSignature, label: 'Draft' },
      submitted: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Submitted' },
      under_review: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Under Review' },
      accepted: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Accepted' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
      expired: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, label: 'Expired' }
    }
    const config = statusConfig[status] || statusConfig.submitted
    const Icon = config.icon
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 w-fit ${config.color}`}>
        <Icon size={12} />
        <span className="capitalize">{config.label}</span>
      </span>
    )
  }

  const stats = {
    total: quotes.length,
    submitted: quotes.filter(q => q.status === 'submitted').length,
    under_review: quotes.filter(q => q.status === 'under_review').length,
    accepted: quotes.filter(q => q.status === 'accepted').length,
    totalValue: quotes.reduce((sum, q) => sum + Number(q.total), 0)
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
          <p className="text-gray-600 mt-1">Review and manage vendor quotes</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchQuotes}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Quotes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileSignature className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Submitted</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.submitted}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Under Review</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.under_review}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Eye className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Accepted</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.accepted}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${stats.totalValue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by quote #, vendor, or RFQ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-gray-900"
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
            <button className="p-2 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Quotes Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading quotes...</p>
        </div>
      ) : quotes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <FileSignature className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No quotes yet</h3>
          <p className="text-gray-500 mb-6">Quotes will appear here once vendors respond to your RFQs.</p>
          <Link
            href="/procurement/rfqs"
            className="text-purple-600 hover:text-purple-800 font-medium flex items-center justify-center space-x-2"
          >
            <span>Go to RFQs</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quote #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RFQ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valid Until</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono font-medium text-gray-900">
                        {quote.quoteNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {quote.rfq?.rfqNumber || '—'}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">
                        {quote.rfq?.title || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 size={14} className="text-gray-400 mr-1" />
                        <span className="text-sm font-medium text-gray-900">
                          {quote.vendor.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(quote.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {quote.currency} {Number(quote.total).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {quote.validUntil ? (
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar size={14} className="mr-1" />
                          {new Date(quote.validUntil).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(quote.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        href={`/procurement/quotes/${quote.id}`}
                        className="text-purple-600 hover:text-purple-800 mr-3"
                      >
                        <Eye size={16} />
                      </Link>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </MainLayout>
  )
}