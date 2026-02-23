'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  CreditCard,
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
  Receipt,
  Loader2,
  MoreVertical
} from 'lucide-react'
import Link from 'next/link'

interface Payment {
  id: string
  paymentNumber: string
  invoiceId: string
  invoice: {
    id: string
    invoiceNumber: string
    total: number
    balance: number
    vendor: {
      id: string
      name: string
    }
  }
  amount: number
  currency: string
  method: string
  status: string
  paymentDate: string
  reference: string | null
  transactionId: string | null
  createdBy: {
    id: string
    name: string | null
    email: string
  }
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const response = await api.getPayments()
      if (response.success) {
        setPayments(response.data)
      } else {
        setError('Failed to load payments')
      }
    } catch (err) {
      setError('Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  const handleDeletePayment = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this payment record?')) {
      return
    }

    try {
      const response = await api.deletePayment(id)
      if (response.success) {
        setPayments(payments.filter(p => p.id !== id))
      }
    } catch (err) {
      alert('Failed to delete payment')
    }
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoice.vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
    const matchesMethod = methodFilter === 'all' || payment.method === methodFilter
    
    return matchesSearch && matchesStatus && matchesMethod
  })

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string, icon: any, label: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Completed' },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Failed' },
      refunded: { color: 'bg-purple-100 text-purple-800', icon: AlertCircle, label: 'Refunded' },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Cancelled' }
    }
    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 w-fit ${config.color}`}>
        <Icon size={12} />
        <span>{config.label}</span>
      </span>
    )
  }

  const getMethodIcon = (method: string) => {
    const icons: Record<string, any> = {
      cash: DollarSign,
      check: Receipt,
      bank_transfer: CreditCard,
      credit_card: CreditCard,
      debit_card: CreditCard,
      online: CreditCard,
      other: CreditCard
    }
    return icons[method] || CreditCard
  }

  const stats = {
    total: payments.length,
    completed: payments.filter(p => p.status === 'completed').length,
    pending: payments.filter(p => p.status === 'pending').length,
    totalAmount: payments.reduce((sum, p) => sum + (p.status === 'completed' ? Number(p.amount) : 0), 0),
    pendingAmount: payments.reduce((sum, p) => sum + (p.status === 'pending' ? Number(p.amount) : 0), 0)
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
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-1">Track and manage vendor payments</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchPayments}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <Link
            href="/payments/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Record Payment</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Payments</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completed}</p>
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
              <p className="text-sm font-medium text-gray-500">Total Paid</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${stats.totalAmount.toLocaleString()}
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
              placeholder="Search by payment #, invoice #, vendor, reference..."
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
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="check">Check</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="online">Online Payment</option>
              <option value="other">Other</option>
            </select>
            <button className="p-2 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      {payments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No payments yet</h3>
          <p className="text-gray-500 mb-6">Record your first payment to start tracking.</p>
          <Link
            href="/payments/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Record Payment</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.map((payment) => {
                  const MethodIcon = getMethodIcon(payment.method)
                  return (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono font-medium text-gray-900">
                          {payment.paymentNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/invoices/${payment.invoice.id}`}
                          className="text-sm text-blue-600 hover:text-blue-800 font-mono"
                        >
                          {payment.invoice.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building2 size={14} className="text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900">
                            {payment.invoice.vendor.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {payment.currency} {Number(payment.amount).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MethodIcon size={14} className="text-gray-400 mr-1" />
                          <span className="text-sm capitalize text-gray-600">
                            {payment.method.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar size={14} className="mr-1" />
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {payment.reference || payment.transactionId || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/payments/${payment.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Eye size={16} />
                          </Link>
                          {payment.status === 'pending' && (
                            <Link
                              href={`/payments/${payment.id}/edit`}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                              <Edit size={16} />
                            </Link>
                          )}
                          <button
                            onClick={(e) => handleDeletePayment(payment.id, e)}
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
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </MainLayout>
  )
}