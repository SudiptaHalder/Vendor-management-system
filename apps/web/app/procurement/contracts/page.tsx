'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  FileCheck,
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
  AlertCircle,
  FileText,
  Shield,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

interface Contract {
  id: string
  contractNumber: string
  title: string
  vendorId: string
  vendor: {
    id: string
    name: string
    email: string | null
  }
  status: string
  type: string
  value: number | null
  currency: string
  startDate: string | null
  endDate: string | null
  signedByVendor: boolean
  signedByCompany: boolean
  createdAt: string
  projectId: string | null
  project?: {
    id: string
    name: string
  } | null
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchContracts = async () => {
    setLoading(true)
    try {
      const response = await api.getContracts()
      if (response.success) {
        setContracts(response.data)
      } else {
        setError('Failed to load contracts')
      }
    } catch (err) {
      setError('Failed to load contracts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContracts()
  }, [])

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = 
      contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.vendor.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string, icon: any, label: string }> = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: FileText, label: 'Draft' },
      pending_approval: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending Approval' },
      pending_signature: { color: 'bg-blue-100 text-blue-800', icon: FileCheck, label: 'Pending Signature' },
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Active' },
      expired: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, label: 'Expired' },
      terminated: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Terminated' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelled' }
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

  const getSignatureStatus = (contract: Contract) => {
    if (contract.signedByCompany && contract.signedByVendor) {
      return <span className="text-xs text-green-600 flex items-center"><CheckCircle size={12} className="mr-1" />Fully Signed</span>
    } else if (contract.signedByCompany) {
      return <span className="text-xs text-blue-600 flex items-center"><Clock size={12} className="mr-1" />Awaiting Vendor</span>
    } else if (contract.signedByVendor) {
      return <span className="text-xs text-blue-600 flex items-center"><Clock size={12} className="mr-1" />Awaiting Company</span>
    } else {
      return <span className="text-xs text-gray-500 flex items-center"><FileCheck size={12} className="mr-1" />Not Signed</span>
    }
  }

  const stats = {
    total: contracts.length,
    draft: contracts.filter(c => c.status === 'draft').length,
    pending_approval: contracts.filter(c => c.status === 'pending_approval').length,
    pending_signature: contracts.filter(c => c.status === 'pending_signature').length,
    active: contracts.filter(c => c.status === 'active').length,
    expiringSoon: contracts.filter(c => {
      if (!c.endDate) return false
      const daysUntilExpiry = Math.ceil((new Date(c.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      return c.status === 'active' && daysUntilExpiry > 0 && daysUntilExpiry <= 30
    }).length,
    totalValue: contracts.reduce((sum, c) => sum + (Number(c.value) || 0), 0)
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
          <p className="text-gray-600 mt-1">Manage vendor contracts and agreements</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchContracts}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <Link
            href="/procurement/contracts/new"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>New Contract</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Contracts</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileCheck className="w-5 h-5 text-purple-600" />
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
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pending_approval + stats.pending_signature}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Expiring Soon</p>
              <p className="text-2xl font-bold text-amber-900 mt-1">{stats.expiringSoon}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
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
              placeholder="Search by contract #, title, or vendor..."
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
              <option value="pending_approval">Pending Approval</option>
              <option value="pending_signature">Pending Signature</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="terminated">Terminated</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="p-2 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Contracts Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading contracts...</p>
        </div>
      ) : contracts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <FileCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No contracts yet</h3>
          <p className="text-gray-500 mb-6">Create your first contract to formalize agreements with vendors.</p>
          <Link
            href="/procurement/contracts/new"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 inline-flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Create Contract</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contract #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Signature</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredContracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono font-medium text-gray-900">
                        {contract.contractNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{contract.title}</div>
                      {contract.project && (
                        <div className="text-xs text-gray-500 mt-1">
                          Project: {contract.project.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 size={14} className="text-gray-400 mr-1" />
                        <span className="text-sm font-medium text-gray-900">
                          {contract.vendor.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(contract.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {contract.currency} {Number(contract.value || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSignatureStatus(contract)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {contract.startDate && contract.endDate ? (
                        <div className="text-sm text-gray-900">
                          <div>{new Date(contract.startDate).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">
                            to {new Date(contract.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        href={`/procurement/contracts/${contract.id}`}
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