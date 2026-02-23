'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  Receipt,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Building2,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  MoreVertical,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

interface Invoice {
  id: string
  invoiceNumber: string
  vendorId: string
  vendor: {
    id: string
    name: string
    email: string | null
  }
  projectId: string | null
  project?: {
    id: string
    name: string
    projectNumber: string
  } | null
  status: string
  issueDate: string
  dueDate: string | null
  subtotal: number
  taxAmount: number
  discount: number
  total: number
  balance: number
  currency: string
  _count?: {
    payments: number
  }
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const response = await api.getInvoices()
      if (response.success) {
        setInvoices(response.data)
      } else {
        setError('Failed to load invoices')
      }
    } catch (err) {
      setError('Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  const handleDeleteInvoice = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this invoice?')) {
      return
    }

    try {
      const response = await api.deleteInvoice(id)
      if (response.success) {
        setInvoices(invoices.filter(inv => inv.id !== id))
      }
    } catch (err) {
      alert('Failed to delete invoice')
    }
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.project?.name.toLowerCase().includes(searchTerm.toLowerCase() || '')
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    
    // Date filtering
    let matchesDate = true
    if (dateFilter === 'overdue') {
      matchesDate = invoice.status !== 'paid' && 
                    invoice.dueDate && 
                    new Date(invoice.dueDate) < new Date()
    } else if (dateFilter === 'due_this_week') {
      const today = new Date()
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      matchesDate = invoice.dueDate && 
                    new Date(invoice.dueDate) >= today && 
                    new Date(invoice.dueDate) <= nextWeek
    } else if (dateFilter === 'due_next_month') {
      const today = new Date()
      const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
      matchesDate = invoice.dueDate && 
                    new Date(invoice.dueDate) >= today && 
                    new Date(invoice.dueDate) <= nextMonth
    }
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string, icon: any, label: string }> = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Draft' },
      sent: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Sent' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, label: 'Pending' },
      partially_paid: { color: 'bg-purple-100 text-purple-800', icon: Clock, label: 'Partially Paid' },
      paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Paid' },
      overdue: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Overdue' },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Cancelled' }
    }
    const config = statusConfig[status] || statusConfig.draft
    const Icon = config.icon
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 w-fit ${config.color}`}>
        <Icon size={12} />
        <span>{config.label}</span>
      </span>
    )
  }

  const stats = {
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'paid').length,
    pending: invoices.filter(i => i.status === 'pending' || i.status === 'sent').length,
    overdue: invoices.filter(i => i.status === 'overdue' || (i.dueDate && new Date(i.dueDate) < new Date() && i.status !== 'paid')).length,
    totalAmount: invoices.reduce((sum, i) => sum + Number(i.total), 0),
    outstanding: invoices.reduce((sum, i) => sum + Number(i.balance), 0)
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1">Manage and track vendor invoices</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchInvoices}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <Link
            href="/invoices/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>New Invoice</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Paid</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.paid}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Overdue</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.overdue}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Outstanding</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${stats.outstanding.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
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
              placeholder="Search by invoice #, vendor, or project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="pending">Pending</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All Dates</option>
              <option value="overdue">Overdue</option>
              <option value="due_this_week">Due This Week</option>
              <option value="due_next_month">Due Next Month</option>
            </select>
            <button className="p-2 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      {invoices.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No invoices yet</h3>
          <p className="text-gray-500 mb-6">Create your first invoice to start tracking payments.</p>
          <Link
            href="/invoices/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Create Invoice</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 size={14} className="text-gray-400 mr-1" />
                        <span className="text-sm font-medium text-gray-900">
                          {invoice.vendor.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {invoice.project?.projectNumber || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {invoice.currency} {Number(invoice.total).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        Number(invoice.balance) > 0 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {invoice.currency} {Number(invoice.balance).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invoice.issueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {invoice.dueDate ? (
                        <span className={`text-sm ${
                          invoice.status !== 'paid' && new Date(invoice.dueDate) < new Date()
                            ? 'text-red-600 font-medium'
                            : 'text-gray-500'
                        }`}>
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          href={`/invoices/${invoice.id}/edit`}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={(e) => handleDeleteInvoice(invoice.id, e)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                          <MoreVertical size={16} />
                        </button>
                      </div>
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