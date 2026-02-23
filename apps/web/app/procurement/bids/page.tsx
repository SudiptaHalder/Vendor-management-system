'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  ClipboardList,
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
  Users,
  FileText,
  AlertCircle,
  TrendingUp,
  Award
} from 'lucide-react'
import Link from 'next/link'

interface Bid {
  id: string
  bidNumber: string
  title: string
  description: string | null
  type: string
  status: string
  openDate: string
  closeDate: string
  awardDate: string | null
  estimatedValue: number | null
  currency: string
  submissions: any[]
  _count?: {
    submissions: number
  }
}

export default function BidsPage() {
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchBids = async () => {
    setLoading(true)
    try {
      const response = await api.getBids()
      if (response.success) {
        setBids(response.data)
      } else {
        setError('Failed to load bids')
      }
    } catch (err) {
      setError('Failed to load bids')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBids()
  }, [])

  const filteredBids = bids.filter(bid => {
    const matchesSearch = 
      bid.bidNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bid.title.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || bid.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string, icon: any, label: string }> = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: FileText, label: 'Draft' },
      published: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Published' },
      accepting_bids: { color: 'bg-green-100 text-green-800', icon: TrendingUp, label: 'Accepting Bids' },
      under_review: { color: 'bg-yellow-100 text-yellow-800', icon: Eye, label: 'Under Review' },
      awarded: { color: 'bg-purple-100 text-purple-800', icon: Award, label: 'Awarded' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelled' },
      closed: { color: 'bg-gray-100 text-gray-800', icon: CheckCircle, label: 'Closed' }
    }
    const config = statusConfig[status] || statusConfig.draft
    const Icon = config.icon
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 w-fit ${config.color}`}>
        <Icon size={12} />
        <span className="capitalize">{config.label}</span>
      </span>
    )
  }

  const getDaysRemaining = (closeDate: string) => {
    const days = Math.ceil((new Date(closeDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (days < 0) return 'Closed'
    if (days === 0) return 'Closes today'
    if (days === 1) return '1 day left'
    return `${days} days left`
  }

  const stats = {
    total: bids.length,
    draft: bids.filter(b => b.status === 'draft').length,
    published: bids.filter(b => ['published', 'accepting_bids'].includes(b.status)).length,
    under_review: bids.filter(b => b.status === 'under_review').length,
    awarded: bids.filter(b => b.status === 'awarded').length,
    totalValue: bids.reduce((sum, b) => sum + (Number(b.estimatedValue) || 0), 0)
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bids & Tenders</h1>
          <p className="text-gray-600 mt-1">Manage competitive bidding and vendor submissions</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchBids}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <Link
            href="/procurement/bids/new"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>New Bid</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Bids</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <ClipboardList className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Draft</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.draft}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.published}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
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
              placeholder="Search by bid # or title..."
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
              <option value="published">Published</option>
              <option value="accepting_bids">Accepting Bids</option>
              <option value="under_review">Under Review</option>
              <option value="awarded">Awarded</option>
              <option value="closed">Closed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="p-2 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Bids Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading bids...</p>
        </div>
      ) : bids.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No bids yet</h3>
          <p className="text-gray-500 mb-6">Create your first bid to start the competitive bidding process.</p>
          <Link
            href="/procurement/bids/new"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 inline-flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Create Bid</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bid #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est. Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submissions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Closing</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBids.map((bid) => (
                  <tr key={bid.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono font-medium text-gray-900">
                        {bid.bidNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{bid.title}</div>
                      {bid.description && (
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {bid.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs capitalize text-gray-600">
                        {bid.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(bid.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {bid.currency} {Number(bid.estimatedValue || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users size={14} className="text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">
                          {bid._count?.submissions || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm">
                        <Calendar size={14} className="text-gray-400 mr-1" />
                        <span className={new Date(bid.closeDate) < new Date() ? 'text-red-600' : 'text-gray-900'}>
                          {new Date(bid.closeDate).toLocaleDateString()}
                        </span>
                      </div>
                      {new Date(bid.closeDate) > new Date() && bid.status === 'accepting_bids' && (
                        <span className="text-xs text-green-600 block mt-1">
                          {getDaysRemaining(bid.closeDate)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        href={`/procurement/bids/${bid.id}`}
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