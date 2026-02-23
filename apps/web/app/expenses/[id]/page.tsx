'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  ArrowLeft,
  FileText,
  Building2,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Download,
  Receipt,
  Tag,
  FolderOpen,
  User,
  Mail,
  Phone,
  MapPin,
  Link2,
  Loader2,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'
import Link from 'next/link'

interface ExpenseDetail {
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
    phone: string | null
    address: string | null
    city: string | null
    state: string | null
    country: string | null
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
  receiptUrl: string | null
  receiptNumber: string | null
  isBillable: boolean
  billableClient: string | null
  status: string
  notes: string | null
  rejectionReason: string | null
  createdBy: {
    id: string
    name: string | null
    email: string
  }
  approvedBy?: {
    id: string
    name: string | null
    email: string
  } | null
  approvedAt: string | null
  createdAt: string
}

export default function ExpenseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [expense, setExpense] = useState<ExpenseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [approving, setApproving] = useState(false)

  useEffect(() => {
    fetchExpense()
  }, [params.id])

  const fetchExpense = async () => {
    setLoading(true)
    try {
      const response = await api.getExpense(params.id as string)
      if (response.success) {
        setExpense(response.data)
      } else {
        setError('Failed to load expense')
      }
    } catch (err) {
      console.error('Error fetching expense:', err)
      setError('Failed to load expense')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteExpense = async () => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return
    }

    try {
      const response = await api.deleteExpense(params.id as string)
      if (response.success) {
        router.push('/expenses')
      }
    } catch (err) {
      setError('Failed to delete expense')
    }
  }

  const handleApproveExpense = async () => {
    setApproving(true)
    try {
      const response = await api.updateExpense(params.id as string, { 
        status: 'approved' 
      })
      if (response.success) {
        fetchExpense()
      }
    } catch (err) {
      setError('Failed to approve expense')
    } finally {
      setApproving(false)
    }
  }

  const handleRejectExpense = async () => {
    const reason = prompt('Please enter rejection reason:')
    if (!reason) return

    setApproving(true)
    try {
      const response = await api.updateExpense(params.id as string, { 
        status: 'rejected',
        rejectionReason: reason 
      })
      if (response.success) {
        fetchExpense()
      }
    } catch (err) {
      setError('Failed to reject expense')
    } finally {
      setApproving(false)
    }
  }

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
      <span className={`px-3 py-1.5 text-sm font-medium rounded-full flex items-center space-x-1.5 w-fit ${config.color}`}>
        <Icon size={14} />
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

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </MainLayout>
    )
  }

  if (error || !expense) {
    return (
      <MainLayout>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Expense</h3>
          <p className="text-gray-500 mb-6">{error || 'Expense not found'}</p>
          <Link
            href="/expenses"
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>Back to Expenses</span>
          </Link>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 text-sm text-gray-500 mb-4">
          <Link href="/expenses" className="hover:text-blue-600">
            Expenses
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{expense.expenseNumber}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start space-x-4">
            <Link
              href="/expenses"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center flex-wrap gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{expense.description}</h1>
                {getStatusBadge(expense.status)}
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">{expense.expenseNumber}</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(expense.category)}`}>
                  {expense.category}
                </span>
                {expense.isBillable && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    Billable
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {expense.status === 'pending' && (
              <>
                <button
                  onClick={handleApproveExpense}
                  disabled={approving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 disabled:opacity-50"
                >
                  <ThumbsUp size={16} />
                  <span>{approving ? 'Processing...' : 'Approve'}</span>
                </button>
                <button
                  onClick={handleRejectExpense}
                  disabled={approving}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2 disabled:opacity-50"
                >
                  <ThumbsDown size={16} />
                  <span>Reject</span>
                </button>
              </>
            )}
            {expense.status === 'draft' && (
              <Link
                href={`/expenses/${expense.id}/edit`}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              >
                <Edit size={16} />
                <span>Edit</span>
              </Link>
            )}
            {expense.receiptUrl && (
              <a
                href={expense.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              >
                <Download size={16} />
                <span>Receipt</span>
              </a>
            )}
            <button
              onClick={handleDeleteExpense}
              className="px-4 py-2 text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 flex items-center space-x-2"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Amount</p>
            <DollarSign className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {expense.currency} {Number(expense.amount).toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Expense Date</p>
            <Calendar className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {new Date(expense.expenseDate).toLocaleDateString()}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Category</p>
            <Tag className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-lg font-semibold capitalize text-gray-900">
            {expense.category}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Receipt #</p>
            <Receipt className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {expense.receiptNumber || '—'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{expense.description}</p>
          </div>

          {/* Notes */}
          {expense.notes && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Notes</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{expense.notes}</p>
            </div>
          )}

          {/* Rejection Reason */}
          {expense.status === 'rejected' && expense.rejectionReason && (
            <div className="bg-red-50 rounded-xl p-6 border border-red-200">
              <div className="flex items-start space-x-3">
                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h2 className="text-lg font-semibold text-red-800 mb-1">Rejection Reason</h2>
                  <p className="text-red-700">{expense.rejectionReason}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Vendor Information */}
          {expense.vendor && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Vendor Information</h2>
              </div>
              <div className="p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{expense.vendor.name}</p>
                    {expense.vendor.email && (
                      <a href={`mailto:${expense.vendor.email}`} className="text-sm text-blue-600 hover:text-blue-800 flex items-center mt-1">
                        <Mail size={14} className="mr-1" />
                        {expense.vendor.email}
                      </a>
                    )}
                    {expense.vendor.phone && (
                      <a href={`tel:${expense.vendor.phone}`} className="text-sm text-gray-600 flex items-center mt-1">
                        <Phone size={14} className="mr-1" />
                        {expense.vendor.phone}
                      </a>
                    )}
                  </div>
                </div>
                {(expense.vendor.address || expense.vendor.city) && (
                  <div className="flex items-start space-x-3 text-sm text-gray-600">
                    <MapPin size={14} className="text-gray-400 mt-0.5" />
                    <div>
                      {expense.vendor.address && <div>{expense.vendor.address}</div>}
                      {(expense.vendor.city || expense.vendor.state) && (
                        <div>
                          {expense.vendor.city}{expense.vendor.city && expense.vendor.state ? ', ' : ''}{expense.vendor.state}
                        </div>
                      )}
                      {expense.vendor.country && <div>{expense.vendor.country}</div>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Project Information */}
          {expense.project && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Project Information</h2>
              </div>
              <div className="p-6">
                <Link
                  href={`/projects/${expense.project.id}`}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                >
                  <FolderOpen size={16} />
                  <span className="font-medium">{expense.project.projectNumber}</span>
                </Link>
                <p className="text-sm text-gray-600 mt-1">{expense.project.name}</p>
              </div>
            </div>
          )}

          {/* Work Order Information */}
          {expense.workOrder && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Work Order Information</h2>
              </div>
              <div className="p-6">
                <Link
                  href={`/work-orders/${expense.workOrder.id}`}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                >
                  <FileText size={16} />
                  <span className="font-medium">{expense.workOrder.workOrderNumber}</span>
                </Link>
                <p className="text-sm text-gray-600 mt-1">{expense.workOrder.title}</p>
              </div>
            </div>
          )}

          {/* Billable Information */}
          {expense.isBillable && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Billable Information</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle size={16} />
                  <span className="font-medium">Billable Expense</span>
                </div>
                {expense.billableClient && (
                  <p className="text-sm text-gray-600 mt-2">
                    Client: {expense.billableClient}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Expense Information</h2>
            </div>
            <div className="p-6">
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-500">Created By</dt>
                  <dd className="text-sm text-gray-900">{expense.createdBy.name || expense.createdBy.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-500">Created On</dt>
                  <dd className="text-sm text-gray-900">{new Date(expense.createdAt).toLocaleDateString()}</dd>
                </div>
                {expense.approvedBy && (
                  <div className="flex justify-between">
                    <dt className="text-xs text-gray-500">Approved By</dt>
                    <dd className="text-sm text-gray-900">{expense.approvedBy.name || expense.approvedBy.email}</dd>
                  </div>
                )}
                {expense.approvedAt && (
                  <div className="flex justify-between">
                    <dt className="text-xs text-gray-500">Approved On</dt>
                    <dd className="text-sm text-gray-900">{new Date(expense.approvedAt).toLocaleDateString()}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}