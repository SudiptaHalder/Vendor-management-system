'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  ArrowLeft,
  FileSignature,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Building2,
  DollarSign,
  Calendar,
  FileText,
  MessageSquare,
  CheckSquare,
  X,
  AlertCircle,
  Download,
  Send,
  User,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'
import Link from 'next/link'

interface QuoteDetail {
  id: string
  quoteNumber: string
  rfqId: string
  rfq: {
    id: string
    rfqNumber: string
    title: string
    description: string | null
    deadline: string | null
  }
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
  status: string
  subtotal: number
  taxAmount: number
  taxRate: number | null
  discount: number
  discountType: string | null
  shippingCost: number
  total: number
  currency: string
  validUntil: string | null
  submittedAt: string
  notes: string | null
  terms: string | null
  deliveryTime: number | null
  warranty: string | null
  attachmentUrls: string[]
  lineItems: Array<{
    id: string
    lineNumber: number
    description: string
    quantity: number
    unit: string | null
    unitPrice: number
    total: number
    notes: string | null
  }>
  createdBy: {
    id: string
    name: string | null
    email: string
  } | null
}

export default function QuoteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [quote, setQuote] = useState<QuoteDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [showAcceptModal, setShowAcceptModal] = useState(false)
  const [acceptData, setAcceptData] = useState({
    createPurchaseOrder: true,
    notes: ''
  })

  useEffect(() => {
    fetchQuote()
  }, [params.id])

  const fetchQuote = async () => {
    setLoading(true)
    try {
      const response = await api.getQuote(params.id as string)
      if (response.success) {
        setQuote(response.data)
      } else {
        setError('Failed to load quote')
      }
    } catch (err) {
      setError('Failed to load quote')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptQuote = async () => {
    setProcessing(true)
    try {
      const response = await api.acceptQuote(params.id as string, {
        createPurchaseOrder: acceptData.createPurchaseOrder,
        notes: acceptData.notes
      })
      
      if (response.success) {
        setShowAcceptModal(false)
        fetchQuote() // Refresh the data
      } else {
        setError('Failed to accept quote')
      }
    } catch (err) {
      setError('Failed to accept quote')
    } finally {
      setProcessing(false)
    }
  }

  const handleRejectQuote = async () => {
    if (!confirm('Are you sure you want to reject this quote?')) {
      return
    }

    setProcessing(true)
    try {
      const response = await api.updateQuoteStatus(params.id as string, 'rejected')
      if (response.success) {
        fetchQuote()
      } else {
        setError('Failed to reject quote')
      }
    } catch (err) {
      setError('Failed to reject quote')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string, icon: any, label: string }> = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: FileSignature, label: 'Draft' },
      submitted: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Submitted' },
      under_review: { color: 'bg-yellow-100 text-yellow-800', icon: Eye, label: 'Under Review' },
      accepted: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Accepted' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
      expired: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, label: 'Expired' }
    }
    const config = statusConfig[status] || statusConfig.submitted
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
          <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
        </div>
      </MainLayout>
    )
  }

  if (error || !quote) {
    return (
      <MainLayout>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Quote</h3>
          <p className="text-gray-500 mb-6">{error || 'Quote not found'}</p>
          <Link
            href="/procurement/quotes"
            className="text-purple-600 hover:text-purple-800 font-medium flex items-center justify-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>Back to Quotes</span>
          </Link>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      {/* Accept Quote Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAcceptModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Accept Quote</h2>
                <button onClick={() => setShowAcceptModal(false)} className="p-2 text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="text-sm text-green-700">
                        You are about to accept this quote from {quote.vendor.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="createPO"
                      checked={acceptData.createPurchaseOrder}
                      onChange={(e) => setAcceptData(prev => ({ ...prev, createPurchaseOrder: e.target.checked }))}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="createPO" className="text-sm text-gray-700">
                      Automatically create Purchase Order from this quote
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (optional)
                    </label>
                    <textarea
                      rows={3}
                      value={acceptData.notes}
                      onChange={(e) => setAcceptData(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                      placeholder="Add any notes about this acceptance..."
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 px-6 py-4 border-t bg-gray-50">
                <button
                  onClick={() => setShowAcceptModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAcceptQuote}
                  disabled={processing}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  <CheckCircle size={16} />
                  <span>{processing ? 'Processing...' : 'Accept Quote'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 text-sm text-gray-500 mb-4">
          <Link href="/procurement/quotes" className="hover:text-purple-600">
            Quotes
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{quote.quoteNumber}</span>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">Quote {quote.quoteNumber}</h1>
              {getStatusBadge(quote.status)}
            </div>
            <Link 
              href={`/procurement/rfqs/${quote.rfqId}`}
              className="text-sm text-purple-600 hover:text-purple-800 flex items-center space-x-1"
            >
              <FileText size={14} />
              <span>View RFQ: {quote.rfq.rfqNumber}</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-3">
            {quote.status === 'submitted' && (
              <>
                <button
                  onClick={() => setShowAcceptModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                >
                  <CheckCircle size={16} />
                  <span>Accept</span>
                </button>
                <button
                  onClick={handleRejectQuote}
                  disabled={processing}
                  className="px-4 py-2 text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 flex items-center space-x-2"
                >
                  <XCircle size={16} />
                  <span>Reject</span>
                </button>
              </>
            )}
            {quote.status === 'accepted' && (
              <button
                onClick={() => router.push(`/procurement/purchase-orders/new?quoteId=${quote.id}`)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
              >
                <FileText size={16} />
                <span>Create Purchase Order</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Total Amount</p>
            <DollarSign className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {quote.currency} {Number(quote.total).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Subtotal: {quote.currency} {Number(quote.subtotal).toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Vendor</p>
            <Building2 className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900">{quote.vendor.name}</p>
          {quote.vendor.email && (
            <p className="text-xs text-gray-500 mt-1 flex items-center">
              <Mail size={12} className="mr-1" />
              {quote.vendor.email}
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Valid Until</p>
            <Calendar className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'Not specified'}
          </p>
          {quote.deliveryTime && (
            <p className="text-xs text-gray-500 mt-1">
              Delivery: {quote.deliveryTime} days
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Submitted</p>
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {new Date(quote.submittedAt).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(quote.submittedAt).toLocaleTimeString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Line Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Line Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {quote.lineItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.lineNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>{item.description}</div>
                        {item.notes && (
                          <div className="text-xs text-gray-500 mt-1">{item.notes}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {quote.currency} {Number(item.unitPrice).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        {quote.currency} {Number(item.total).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={4} className="px-6 py-3 text-right text-sm font-medium text-gray-700">
                      Subtotal
                    </td>
                    <td className="px-6 py-3 text-right text-sm text-gray-900">
                      {quote.currency} {Number(quote.subtotal).toLocaleString()}
                    </td>
                  </tr>
                  {quote.discount > 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-3 text-right text-sm font-medium text-gray-700">
                        Discount
                      </td>
                      <td className="px-6 py-3 text-right text-sm text-red-600">
                        -{quote.currency} {Number(quote.discount).toLocaleString()}
                      </td>
                    </tr>
                  )}
                  {quote.taxAmount > 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-3 text-right text-sm font-medium text-gray-700">
                        Tax ({quote.taxRate || 0}%)
                      </td>
                      <td className="px-6 py-3 text-right text-sm text-gray-900">
                        {quote.currency} {Number(quote.taxAmount).toLocaleString()}
                      </td>
                    </tr>
                  )}
                  {quote.shippingCost > 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-3 text-right text-sm font-medium text-gray-700">
                        Shipping
                      </td>
                      <td className="px-6 py-3 text-right text-sm text-gray-900">
                        {quote.currency} {Number(quote.shippingCost).toLocaleString()}
                      </td>
                    </tr>
                  )}
                  <tr className="border-t border-gray-200">
                    <td colSpan={4} className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                      Total
                    </td>
                    <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                      {quote.currency} {Number(quote.total).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes & Terms */}
          {quote.notes && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
            </div>
          )}

          {quote.terms && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Terms & Conditions</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{quote.terms}</p>
            </div>
          )}

          {quote.warranty && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Warranty</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{quote.warranty}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Vendor Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Vendor Information</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Building2 size={16} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{quote.vendor.name}</p>
                  </div>
                </div>
                {quote.vendor.email && (
                  <div className="flex items-start space-x-3">
                    <Mail size={16} className="text-gray-400 mt-0.5" />
                    <a href={`mailto:${quote.vendor.email}`} className="text-sm text-purple-600 hover:text-purple-800">
                      {quote.vendor.email}
                    </a>
                  </div>
                )}
                {quote.vendor.phone && (
                  <div className="flex items-start space-x-3">
                    <Phone size={16} className="text-gray-400 mt-0.5" />
                    <a href={`tel:${quote.vendor.phone}`} className="text-sm text-gray-900">
                      {quote.vendor.phone}
                    </a>
                  </div>
                )}
                {(quote.vendor.address || quote.vendor.city) && (
                  <div className="flex items-start space-x-3">
                    <MapPin size={16} className="text-gray-400 mt-0.5" />
                    <div className="text-sm text-gray-900">
                      {quote.vendor.address && <div>{quote.vendor.address}</div>}
                      {(quote.vendor.city || quote.vendor.state) && (
                        <div>
                          {quote.vendor.city}{quote.vendor.city && quote.vendor.state ? ', ' : ''}{quote.vendor.state}
                        </div>
                      )}
                      {quote.vendor.country && <div>{quote.vendor.country}</div>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RFQ Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">RFQ Information</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">RFQ Number</p>
                  <p className="text-sm font-medium text-gray-900">{quote.rfq.rfqNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Title</p>
                  <p className="text-sm text-gray-900">{quote.rfq.title}</p>
                </div>
                {quote.rfq.deadline && (
                  <div>
                    <p className="text-xs text-gray-500">Deadline</p>
                    <p className="text-sm text-gray-900">{new Date(quote.rfq.deadline).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Attachments */}
          {quote.attachmentUrls && quote.attachmentUrls.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Attachments</h2>
              </div>
              <div className="p-6">
                <div className="space-y-2">
                  {quote.attachmentUrls.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 p-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg"
                    >
                      <Download size={14} />
                      <span>Attachment {index + 1}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}