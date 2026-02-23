'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  ArrowLeft,
  CreditCard,
  Receipt,
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
  FileText,
  Mail,
  Phone,
  Loader2,
  Printer
} from 'lucide-react'
import Link from 'next/link'

interface PaymentDetail {
  id: string
  paymentNumber: string
  invoiceId: string
  invoice: {
    id: string
    invoiceNumber: string
    total: number
    balance: number
    currency: string
    issueDate: string
    dueDate: string | null
    vendor: {
      id: string
      name: string
      email: string | null
      phone: string | null
      address: string | null
      city: string | null
      state: string | null
      country: string | null
    }
  }
  amount: number
  currency: string
  method: string
  status: string
  paymentDate: string
  reference: string | null
  transactionId: string | null
  notes: string | null
  bankName: string | null
  accountNumber: string | null
  checkNumber: string | null
  cardLast4: string | null
  cardBrand: string | null
  authorizationCode: string | null
  createdBy: {
    id: string
    name: string | null
    email: string
  }
  createdAt: string
}

export default function PaymentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [payment, setPayment] = useState<PaymentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPayment()
  }, [params.id])

  const fetchPayment = async () => {
    setLoading(true)
    try {
      const response = await api.getPayment(params.id as string)
      if (response.success) {
        setPayment(response.data)
      } else {
        setError('Failed to load payment')
      }
    } catch (err) {
      setError('Failed to load payment')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePayment = async () => {
    if (!confirm('Are you sure you want to delete this payment record?')) {
      return
    }

    try {
      const response = await api.deletePayment(params.id as string)
      if (response.success) {
        router.push('/payments')
      }
    } catch (err) {
      setError('Failed to delete payment')
    }
  }

  const handleVoidPayment = async () => {
    if (!confirm('Are you sure you want to void this payment? This will reverse the payment and update the invoice balance.')) {
      return
    }

    try {
      const response = await api.updatePayment(params.id as string, {
        status: 'cancelled'
      })
      if (response.success) {
        fetchPayment()
      }
    } catch (err) {
      setError('Failed to void payment')
    }
  }

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
      <span className={`px-3 py-1.5 text-sm font-medium rounded-full flex items-center space-x-1.5 w-fit ${config.color}`}>
        <Icon size={14} />
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
      online: CreditCard
    }
    return icons[method] || CreditCard
  }

  const formatMethod = (method: string) => {
    return method.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
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

  if (error || !payment) {
    return (
      <MainLayout>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Payment</h3>
          <p className="text-gray-500 mb-6">{error || 'Payment not found'}</p>
          <Link
            href="/payments"
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>Back to Payments</span>
          </Link>
        </div>
      </MainLayout>
    )
  }

  const MethodIcon = getMethodIcon(payment.method)

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 text-sm text-gray-500 mb-4">
          <Link href="/payments" className="hover:text-blue-600">
            Payments
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{payment.paymentNumber}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start space-x-4">
            <Link
              href="/payments"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center flex-wrap gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">Payment {payment.paymentNumber}</h1>
                {getStatusBadge(payment.status)}
              </div>
              <p className="text-sm text-gray-500">
                {new Date(payment.paymentDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {payment.status === 'pending' && (
              <>
                <Link
                  href={`/payments/${payment.id}/edit`}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Edit size={16} />
                  <span>Edit</span>
                </Link>
                <button
                  onClick={handleVoidPayment}
                  className="px-4 py-2 text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 flex items-center space-x-2"
                >
                  <XCircle size={16} />
                  <span>Void</span>
                </button>
              </>
            )}
            {payment.status === 'completed' && (
              <button className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                <Printer size={16} />
                <span>Receipt</span>
              </button>
            )}
            <button
              onClick={handleDeletePayment}
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
            <p className="text-sm font-medium text-gray-500">Payment Amount</p>
            <DollarSign className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {payment.currency} {Number(payment.amount).toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Payment Method</p>
            <MethodIcon className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900 capitalize">
            {formatMethod(payment.method)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Invoice</p>
            <Receipt className="w-4 h-4 text-gray-400" />
          </div>
          <Link
            href={`/invoices/${payment.invoice.id}`}
            className="text-lg font-semibold text-blue-600 hover:text-blue-800"
          >
            {payment.invoice.invoiceNumber}
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Invoice Balance</p>
            <DollarSign className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {payment.invoice.currency} {Number(payment.invoice.balance).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Payment Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Payment Information</h2>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-2 gap-6">
                <div>
                  <dt className="text-xs text-gray-500 mb-1">Payment Number</dt>
                  <dd className="text-sm font-mono text-gray-900">{payment.paymentNumber}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 mb-1">Payment Date</dt>
                  <dd className="text-sm text-gray-900">{new Date(payment.paymentDate).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 mb-1">Reference / Check #</dt>
                  <dd className="text-sm text-gray-900">{payment.reference || payment.checkNumber || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 mb-1">Transaction ID</dt>
                  <dd className="text-sm text-gray-900">{payment.transactionId || payment.authorizationCode || '—'}</dd>
                </div>
                {payment.bankName && (
                  <div>
                    <dt className="text-xs text-gray-500 mb-1">Bank Name</dt>
                    <dd className="text-sm text-gray-900">{payment.bankName}</dd>
                  </div>
                )}
                {payment.accountNumber && (
                  <div>
                    <dt className="text-xs text-gray-500 mb-1">Account #</dt>
                    <dd className="text-sm text-gray-900">••••{payment.accountNumber.slice(-4)}</dd>
                  </div>
                )}
                {payment.cardBrand && payment.cardLast4 && (
                  <div>
                    <dt className="text-xs text-gray-500 mb-1">Card</dt>
                    <dd className="text-sm capitalize text-gray-900">
                      {payment.cardBrand} •••• {payment.cardLast4}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Notes */}
          {payment.notes && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Notes</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{payment.notes}</p>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Vendor Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Vendor Information</h2>
            </div>
            <div className="p-6">
              <div className="flex items-start space-x-3 mb-4">
                <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">{payment.invoice.vendor.name}</p>
                  {payment.invoice.vendor.email && (
                    <a href={`mailto:${payment.invoice.vendor.email}`} className="text-sm text-blue-600 hover:text-blue-800 flex items-center mt-1">
                      <Mail size={14} className="mr-1" />
                      {payment.invoice.vendor.email}
                    </a>
                  )}
                  {payment.invoice.vendor.phone && (
                    <a href={`tel:${payment.invoice.vendor.phone}`} className="text-sm text-gray-600 flex items-center mt-1">
                      <Phone size={14} className="mr-1" />
                      {payment.invoice.vendor.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Invoice Summary</h2>
            </div>
            <div className="p-6">
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-500">Invoice #</dt>
                  <dd className="text-sm font-mono text-gray-900">{payment.invoice.invoiceNumber}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-500">Issue Date</dt>
                  <dd className="text-sm text-gray-900">{new Date(payment.invoice.issueDate).toLocaleDateString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-500">Due Date</dt>
                  <dd className="text-sm text-gray-900">
                    {payment.invoice.dueDate ? new Date(payment.invoice.dueDate).toLocaleDateString() : '—'}
                  </dd>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <dt className="text-xs font-medium text-gray-700">Invoice Total</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {payment.invoice.currency} {Number(payment.invoice.total).toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-xs font-medium text-gray-700">This Payment</dt>
                  <dd className="text-sm font-medium text-green-600">
                    -{payment.currency} {Number(payment.amount).toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <dt className="text-xs font-medium text-gray-700">Remaining Balance</dt>
                  <dd className="text-sm font-bold text-blue-600">
                    {payment.invoice.currency} {Number(payment.invoice.balance).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Payment Information</h2>
            </div>
            <div className="p-6">
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-500">Created By</dt>
                  <dd className="text-sm text-gray-900">{payment.createdBy.name || payment.createdBy.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-500">Created On</dt>
                  <dd className="text-sm text-gray-900">{new Date(payment.createdAt).toLocaleDateString()}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}