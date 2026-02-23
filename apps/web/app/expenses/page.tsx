'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  FileText,
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
  MoreVertical,
  Tag,
  FolderOpen,
  Download
} from 'lucide-react'
import Link from 'next/link'

interface Expense {
  id: string
  expenseNumber: string
  category: string
  description: string
  amount: number
  currency: string
  expenseDate: string
  vendorId: string | null
  vendor?: {
    id: string
    name: string
    email: string | null
  } | null
  projectId: string | null
  project?: {
    id: string
    name: string
    projectNumber: string
  } | null
  workOrderId: string | null
  workOrder?: {
    id: string
    workOrderNumber: string
    title: string
  } | null
  status: string
  isBillable: boolean
  receiptUrl: string | null
  receiptNumber: string | null
  createdBy: {
    id: string
    name: string | null
    email: string
  }
  createdAt: string
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [billableFilter, setBillableFilter] = useState('all')

  const fetchExpenses = async () => {
    setLoading(true)
    try {
      const response = await api.getExpenses()
      if (response.success) {
        setExpenses(response.data)
      } else {
        setError('Failed to load expenses')
      }
    } catch (err) {
      console.error('Error fetching expenses:', err)
      setError('Failed to load expenses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  const handleDeleteExpense = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this expense?')) {
      return
    }

    try {
      const response = await api.deleteExpense(id)
      if (response.success) {
        setExpenses(expenses.filter(e => e.id !== id))
      }
    } catch (err) {
      alert('Failed to delete expense')
    }
  }

  const handleApproveExpense = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('Approve this expense?')) {
      return
    }

    try {
      const response = await api.updateExpense(id, { status: 'approved' })
      if (response.success) {
        fetchExpenses()
      }
    } catch (err) {
      alert('Failed to approve expense')
    }
  }

  const handleRejectExpense = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const reason = prompt('Please enter rejection reason:')
    if (!reason) return

    try {
      const response = await api.updateExpense(id, { 
        status: 'rejected',
        rejectionReason: reason 
      })
      if (response.success) {
        fetchExpenses()
      }
    } catch (err) {
      alert('Failed to reject expense')
    }
  }

  const getUniqueCategories = () => {
    const categories = expenses.map(e => e.category)
    return ['all', ...new Set(categories)]
  }

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = 
      expense.expenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.vendor?.name?.toLowerCase().includes(searchTerm.toLowerCase() || '') ||
      expense.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase() || '')
    
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter
    const matchesBillable = billableFilter === 'all' || 
      (billableFilter === 'billable' && expense.isBillable) ||
      (billableFilter === 'non_billable' && !expense.isBillable)
    
    return matchesSearch && matchesStatus && matchesCategory && matchesBillable
  })

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string, icon: any, label: string }> = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Draft' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
      paid: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Paid' }
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'travel': 'bg-blue-100 text-blue-800',
      'meals': 'bg-green-100 text-green-800',
      'office': 'bg-purple-100 text-purple-800',
      'equipment': 'bg-orange-100 text-orange-800',
      'supplies': 'bg-yellow-100 text-yellow-800',
      'utilities': 'bg-red-100 text-red-800',
      'rent': 'bg-indigo-100 text-indigo-800',
      'maintenance': 'bg-pink-100 text-pink-800',
      'training': 'bg-cyan-100 text-cyan-800',
      'other': 'bg-gray-100 text-gray-800'
    }
    return colors[category.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  const stats = {
    total: expenses.length,
    pending: expenses.filter(e => e.status === 'pending').length,
    approved: expenses.filter(e => e.status === 'approved').length,
    rejected: expenses.filter(e => e.status === 'rejected').length,
    totalAmount: expenses.reduce((sum, e) => sum + Number(e.amount), 0),
    pendingAmount: expenses.reduce((sum, e) => 
      e.status === 'pending' ? sum + Number(e.amount) : sum, 0
    ),
    approvedAmount: expenses.reduce((sum, e) => 
      e.status === 'approved' ? sum + Number(e.amount) : sum, 0
    )
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
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600 mt-1">Track and manage company expenses</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchExpenses}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <Link
            href="/expenses/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>New Expense</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
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
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.approved}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Amount</p>
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

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Amount</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                ${stats.pendingAmount.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Approved Amount</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                ${stats.approvedAmount.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Rejected</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.rejected}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
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
              placeholder="Search by expense #, description, vendor, receipt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
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
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="paid">Paid</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
            >
              {getUniqueCategories().map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
            <select
              value={billableFilter}
              onChange={(e) => setBillableFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All Expenses</option>
              <option value="billable">Billable</option>
              <option value="non_billable">Non-Billable</option>
            </select>
            <button className="p-2 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      {expenses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No expenses yet</h3>
          <p className="text-gray-500 mb-6">Create your first expense to start tracking.</p>
          <Link
            href="/expenses/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Create Expense</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expense #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor/Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Billable</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono font-medium text-gray-900">
                        {expense.expenseNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar size={14} className="mr-1" />
                        {new Date(expense.expenseDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(expense.category)}`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{expense.description}</div>
                      {expense.receiptNumber && (
                        <div className="text-xs text-gray-500 mt-1">
                          Receipt: {expense.receiptNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {expense.vendor && (
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <Building2 size={12} className="mr-1" />
                          {expense.vendor.name}
                        </div>
                      )}
                      {expense.project && (
                        <div className="flex items-center text-xs text-gray-500">
                          <FolderOpen size={12} className="mr-1" />
                          {expense.project.projectNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {expense.currency} {Number(expense.amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(expense.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {expense.isBillable ? (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Billable
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                          Non-Billable
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {expense.receiptUrl && (
                          <a
                            href={expense.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Download size={16} />
                          </a>
                        )}
                        <Link
                          href={`/expenses/${expense.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Eye size={16} />
                        </Link>
                        {expense.status === 'pending' && (
                          <>
                            <button
                              onClick={(e) => handleApproveExpense(expense.id, e)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                              title="Approve"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={(e) => handleRejectExpense(expense.id, e)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Reject"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        {expense.status === 'draft' && (
                          <Link
                            href={`/expenses/${expense.id}/edit`}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            <Edit size={16} />
                          </Link>
                        )}
                        <button
                          onClick={(e) => handleDeleteExpense(expense.id, e)}
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