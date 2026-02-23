"use client"

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import AddRFQModal from '@/components/procurement/AddRFQModal'
import { api } from '@/lib/api'
import {
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MoreVertical,
  Users,
  FileText,
  Calendar
} from 'lucide-react'
import Link from 'next/link'

interface RFQ {
  id: string
  rfqNumber: string
  title: string
  status: string
  deadline?: string
  createdAt: string
  recipients: any[]
  quotes: any[]
}

export default function RFQsPage() {
  const [rfqs, setRfqs] = useState<RFQ[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchRFQs = async () => {
    setLoading(true)
    try {
      const response = await api.getRFQs()
      if (response.success) {
        setRfqs(response.data)
      } else {
        setError('Failed to load RFQs')
      }
    } catch (err) {
      setError('Failed to load RFQs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRFQs()
  }, [])

  const filteredRFQs = rfqs.filter(rfq => {
    const matchesSearch = 
      rfq.rfqNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfq.title.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || rfq.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string, icon: any }> = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: FileText },
      sent: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      receiving_quotes: { color: 'bg-purple-100 text-purple-800', icon: MessageSquare },
      evaluating: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      awarded: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle }
    }
    const config = statusConfig[status] || statusConfig.draft
    const Icon = config.icon
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 w-fit ${config.color}`}>
        <Icon size={12} />
        <span className="capitalize">{status.replace('_', ' ')}</span>
      </span>
    )
  }

  const stats = {
    total: rfqs.length,
    draft: rfqs.filter(r => r.status === 'draft').length,
    sent: rfqs.filter(r => r.status === 'sent' || r.status === 'receiving_quotes').length,
    awarded: rfqs.filter(r => r.status === 'awarded').length
  }

  return (
    <MainLayout>
      <AddRFQModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={(newRFQ) => {
          setRfqs(prev => [newRFQ, ...prev])
          setIsAddModalOpen(false)
        }}
      />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Request for Quotes (RFQs)</h1>
          <p className="text-gray-600 mt-1">Create and manage RFQs, receive quotes from vendors</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchRFQs}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>New RFQ</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total RFQs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-purple-600" />
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
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.sent}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Awarded</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.awarded}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
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
              placeholder="Search by RFQ number or title..."
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
              <option value="sent">Sent</option>
              <option value="receiving_quotes">Receiving Quotes</option>
              <option value="evaluating">Evaluating</option>
              <option value="awarded">Awarded</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="p-2 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* RFQs Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading RFQs...</p>
        </div>
      ) : rfqs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No RFQs yet</h3>
          <p className="text-gray-500 mb-6">Create your first RFQ to request quotes from vendors.</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 inline-flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Create RFQ</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RFQ Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendors</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quotes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deadline</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRFQs.map((rfq) => (
                  <tr key={rfq.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono font-medium text-gray-900">
                        {rfq.rfqNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{rfq.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(rfq.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users size={14} className="text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">
                          {rfq.recipients?.length || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {rfq.quotes?.length || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {rfq.deadline ? (
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar size={14} className="mr-1" />
                          {new Date(rfq.deadline).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(rfq.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        href={`/procurement/rfqs/${rfq.id}`}
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
