'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  ArrowLeft,
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
  Plus,
  FileText,
  CreditCard,
  Loader2,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'
import Link from 'next/link'

interface InvoiceDetail {
  id: string
  invoiceNumber: string
  vendorId: string
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
  contractId: string | null
  contract?: {
    id: string
    contractNumber: string
    title: string
  } | null
  purchaseOrderId: string | null
  purchaseOrder?: {
    id: string
    poNumber: string
    title: string
  } | null
  reference: string | null
  type: string
  status: string
  issueDate: string
  dueDate: string | null
  subtotal: number
  taxAmount: number
  taxRate: number | null
  discount: number
  discountType: string | null
  shippingCost: number
  total: number
  balance: number
  currency: string
  paymentTerms: string | null
  notes: string | null
  lineItems: Array<{
    id: string
    lineNumber: number
    description: string
    quantity: number
    unit: string | null
    unitPrice: number
    discountPercent: number
    discountAmount: number
    taxRate: number
    taxAmount: number
    total: number
  }>
  payments: Array<{
    id: string
    paymentNumber: string
    amount: number
    currency: string
    method: string
    status: string
    paymentDate: string
    reference: string | null
  }>
  createdBy: {
    id: string
    name: string | null
    email: string
  }
  createdAt: string
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchInvoice()
  }, [params.id])

  const fetchInvoice = async () => {
    setLoading(true)
    try {
      const response = await api.getInvoice(params.id as string)
      if (response.success) {
        setInvoice(response.data)
      } else {
        setError('Failed to load invoice')
      }
    } catch (err) {
      setError('Failed to load invoice')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteInvoice = async () => {
    if (!confirm('Are you sure you want to delete this invoice?')) {
      return
    }

    try {
      const response = await api.deleteInvoice(params.id as string)
      if (response.success) {
        router.push('/invoices')
      }
    } catch (err) {
      setError('Failed to delete invoice')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string, icon: any, label: string }> = {
      draft: { color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200', icon: Clock, label: 'Draft' },
      sent: { color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300', icon: Clock, label: 'Sent' },
      pending: { color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300', icon: AlertCircle, label: 'Pending' },
      partially_paid: { color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300', icon: Clock, label: 'Partially Paid' },
      paid: { color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300', icon: CheckCircle, label: 'Paid' },
      overdue: { color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300', icon: XCircle, label: 'Overdue' },
      cancelled: { color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200', icon: XCircle, label: 'Cancelled' }
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

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
        </div>
      </MainLayout>
    )
  }

  if (error || !invoice) {
    return (
      <MainLayout>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Error Loading Invoice</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{error || 'Invoice not found'}</p>
          <Link
            href="/invoices"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center justify-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>Back to Invoices</span>
          </Link>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Link href="/invoices" className="hover:text-blue-600 dark:hover:text-blue-400">
            Invoices
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">{invoice.invoiceNumber}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start space-x-4">
            <Link
              href="/invoices"
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center flex-wrap gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Invoice {invoice.invoiceNumber}</h1>
                {getStatusBadge(invoice.status)}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Issued: {new Date(invoice.issueDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {invoice.status === 'draft' && (
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2">
                <CheckCircle size={16} />
                <span>Mark as Sent</span>
              </button>
            )}
            {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
              <Link
                href={`/payments/new?invoiceId=${invoice.id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <CreditCard size={16} />
                <span>Record Payment</span>
              </Link>
            )}
            <Link
              href={`/invoices/${invoice.id}/edit`}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center space-x-2"
            >
              <Edit size={16} />
              <span>Edit</span>
            </Link>
            <button
              onClick={handleDeleteInvoice}
              className="px-4 py-2 text-red-700 dark:text-red-300 bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Amount</p>
            <DollarSign className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {invoice.currency} {Number(invoice.total).toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Balance Due</p>
            <AlertCircle className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          <p className={`text-2xl font-bold ${
            Number(invoice.balance) > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
          }`}>
            {invoice.currency} {Number(invoice.balance).toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Due Date</p>
            <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          {invoice.dueDate ? (
            <>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
              {invoice.status !== 'paid' && new Date(invoice.dueDate) < new Date() && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">Overdue</p>
              )}
            </>
          ) : (
            <p className="text-lg text-gray-500 dark:text-gray-400">Not set</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Payments</p>
            <CreditCard className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{invoice.payments.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Total paid: {invoice.currency} {(Number(invoice.total) - Number(invoice.balance)).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Line Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Line Items */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Line Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Qty</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Unit Price</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Discount</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tax</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {invoice.lineItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {item.lineNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        <div>{item.description}</div>
                        {item.unit && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">Unit: {item.unit}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right">
                        {invoice.currency} {Number(item.unitPrice).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right">
                        {item.discountPercent > 0 ? `${item.discountPercent}%` : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right">
                        {item.taxRate > 0 ? `${item.taxRate}%` : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 text-right">
                        {invoice.currency} {Number(item.total).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <td colSpan={6} className="px-6 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                      Subtotal
                    </td>
                    <td className="px-6 py-3 text-right text-sm text-gray-900 dark:text-gray-100">
                      {invoice.currency} {Number(invoice.subtotal).toLocaleString()}
                    </td>
                  </tr>
                  {invoice.discount > 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                        Discount
                      </td>
                      <td className="px-6 py-3 text-right text-sm text-red-600 dark:text-red-400">
                        -{invoice.currency} {Number(invoice.discount).toLocaleString()}
                      </td>
                    </tr>
                  )}
                  {invoice.taxAmount > 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tax ({invoice.taxRate || 0}%)
                      </td>
                      <td className="px-6 py-3 text-right text-sm text-gray-900 dark:text-gray-100">
                        {invoice.currency} {Number(invoice.taxAmount).toLocaleString()}
                      </td>
                    </tr>
                  )}
                  {invoice.shippingCost > 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                        Shipping
                      </td>
                      <td className="px-6 py-3 text-right text-sm text-gray-900 dark:text-gray-100">
                        {invoice.currency} {Number(invoice.shippingCost).toLocaleString()}
                      </td>
                    </tr>
                  )}
                  <tr className="border-t border-gray-200 dark:border-gray-700">
                    <td colSpan={6} className="px-6 py-3 text-right text-sm font-bold text-gray-900 dark:text-gray-100">
                      Total
                    </td>
                    <td className="px-6 py-3 text-right text-sm font-bold text-gray-900 dark:text-gray-100">
                      {invoice.currency} {Number(invoice.total).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Notes</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Vendor Information */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Vendor Information</h2>
            </div>
            <div className="p-6">
              <div className="flex items-start space-x-3 mb-4">
                <Building2 className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{invoice.vendor.name}</p>
                  {invoice.vendor.email && (
                    <a href={`mailto:${invoice.vendor.email}`} className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center mt-1">
                      <Mail size={14} className="mr-1" />
                      {invoice.vendor.email}
                    </a>
                  )}
                  {invoice.vendor.phone && (
                    <a href={`tel:${invoice.vendor.phone}`} className="text-sm text-gray-600 dark:text-gray-400 flex items-center mt-1">
                      <Phone size={14} className="mr-1" />
                      {invoice.vendor.phone}
                    </a>
                  )}
                </div>
              </div>
              {(invoice.vendor.address || invoice.vendor.city) && (
                <div className="flex items-start space-x-3 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin size={14} className="text-gray-400 dark:text-gray-500 mt-0.5" />
                  <div>
                    {invoice.vendor.address && <div>{invoice.vendor.address}</div>}
                    {(invoice.vendor.city || invoice.vendor.state) && (
                      <div>
                        {invoice.vendor.city}{invoice.vendor.city && invoice.vendor.state ? ', ' : ''}{invoice.vendor.state}
                      </div>
                    )}
                    {invoice.vendor.country && <div>{invoice.vendor.country}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Documents */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Related Documents</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {invoice.purchaseOrder && (
                  <Link
                    href={`/procurement/purchase-orders/${invoice.purchaseOrder.id}`}
                    className="flex items-center space-x-2 p-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                  >
                    <FileText size={14} />
                    <span>PO: {invoice.purchaseOrder.poNumber}</span>
                  </Link>
                )}
                {invoice.contract && (
                  <Link
                    href={`/procurement/contracts/${invoice.contract.id}`}
                    className="flex items-center space-x-2 p-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                  >
                    <FileText size={14} />
                    <span>Contract: {invoice.contract.contractNumber}</span>
                  </Link>
                )}
                {invoice.workOrder && (
                  <Link
                    href={`/work-orders/${invoice.workOrder.id}`}
                    className="flex items-center space-x-2 p-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                  >
                    <FileText size={14} />
                    <span>Work Order: {invoice.workOrder.workOrderNumber}</span>
                  </Link>
                )}
                {invoice.project && (
                  <Link
                    href={`/projects/${invoice.project.id}`}
                    className="flex items-center space-x-2 p-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                  >
                    <FileText size={14} />
                    <span>Project: {invoice.project.projectNumber}</span>
                  </Link>
                )}
                {!invoice.purchaseOrder && !invoice.contract && !invoice.workOrder && !invoice.project && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No related documents</p>
                )}
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Payment History</h2>
              {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                <Link
                  href={`/payments/new?invoiceId=${invoice.id}`}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center space-x-1"
                >
                  <Plus size={14} />
                  <span>Add Payment</span>
                </Link>
              )}
            </div>
            <div className="p-6">
              {invoice.payments.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No payments recorded</p>
              ) : (
                <div className="space-y-4">
                  {invoice.payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{payment.paymentNumber}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{payment.method}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                          {payment.currency} {Number(payment.amount).toLocaleString()}
                        </p>
                        <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Invoice Metadata */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Invoice Information</h2>
            </div>
            <div className="p-6">
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-500 dark:text-gray-400">Type</dt>
                  <dd className="text-sm capitalize text-gray-900 dark:text-gray-100">{invoice.type}</dd>
                </div>
                {invoice.reference && (
                  <div className="flex justify-between">
                    <dt className="text-xs text-gray-500 dark:text-gray-400">Reference</dt>
                    <dd className="text-sm text-gray-900 dark:text-gray-100">{invoice.reference}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-500 dark:text-gray-400">Created By</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100">{invoice.createdBy.name || invoice.createdBy.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-500 dark:text-gray-400">Created On</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100">{new Date(invoice.createdAt).toLocaleDateString()}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}