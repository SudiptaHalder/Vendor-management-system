'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  ArrowLeft,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Users,
  Calendar,
  Send,
  Download,
  Edit,
  Trash2,
  Plus,
  DollarSign,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  FileCheck,
  AlertCircle,
  Eye 
} from 'lucide-react'
import Link from 'next/link'

interface RFQDetail {
  id: string
  rfqNumber: string
  title: string
  description: string | null
  status: string
  deadline: string | null
  expectedDeliveryDate: string | null
  notes: string | null
  deliveryTerms: string | null
  createdAt: string
  lineItems: Array<{
    id: string
    lineNumber: number
    description: string
    quantity: number
    unit: string | null
    notes: string | null
  }>
  recipients: Array<{
    id: string
    status: string
    sentAt: string | null
    viewedAt: string | null
    respondedAt: string | null
    vendor: {
      id: string
      name: string
      email: string | null
      phone: string | null
    }
  }>
  quotes: Array<{
    id: string
    quoteNumber: string
    total: number
    currency: string
    status: string
    submittedAt: string
    vendor: {
      id: string
      name: string
    }
  }>
  createdBy: {
    id: string
    name: string | null
    email: string
  }
}

export default function RFQDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [rfq, setRfq] = useState<RFQDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchRFQ()
  }, [params.id])

  const fetchRFQ = async () => {
    setLoading(true)
    try {
      const response = await api.getRFQ(params.id as string)
      if (response.success) {
        setRfq(response.data)
      } else {
        setError('Failed to load RFQ')
      }
    } catch (err) {
      setError('Failed to load RFQ')
    } finally {
      setLoading(false)
    }
  }

  const handleSendRFQ = async () => {
    if (!confirm('Are you sure you want to send this RFQ to all vendors?')) {
      return
    }

    setSending(true)
    try {
      const response = await api.sendRFQ(params.id as string)
      if (response.success) {
        await fetchRFQ() // Refresh the data
      } else {
        setError('Failed to send RFQ')
      }
    } catch (err) {
      setError('Failed to send RFQ')
    } finally {
      setSending(false)
    }
  }

  const handleDeleteRFQ = async () => {
    if (!confirm('Are you sure you want to delete this RFQ? This action cannot be undone.')) {
      return
    }

    try {
      const response = await api.deleteRFQ(params.id as string)
      if (response.success) {
        router.push('/procurement/rfqs')
      } else {
        setError('Failed to delete RFQ')
      }
    } catch (err) {
      setError('Failed to delete RFQ')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string, icon: any, label: string }> = {
      draft: { color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200', icon: FileText, label: 'Draft' },
      sent: { color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300', icon: Clock, label: 'Sent' },
      receiving_quotes: { color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300', icon: MessageSquare, label: 'Receiving Quotes' },
      evaluating: { color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300', icon: Clock, label: 'Evaluating' },
      awarded: { color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300', icon: CheckCircle, label: 'Awarded' },
      cancelled: { color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300', icon: XCircle, label: 'Cancelled' }
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

  const getRecipientStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string, icon: any, label: string }> = {
      pending: { color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200', icon: Clock, label: 'Pending' },
      sent: { color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300', icon: Send, label: 'Sent' },
      viewed: { color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300', icon: Eye, label: 'Viewed' },
      responded: { color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300', icon: CheckCircle, label: 'Responded' },
      declined: { color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300', icon: XCircle, label: 'Declined' }
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

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
        </div>
      </MainLayout>
    )
  }

  if (error || !rfq) {
    return (
      <MainLayout>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Error Loading RFQ</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{error || 'RFQ not found'}</p>
          <Link
            href="/procurement/rfqs"
            className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium flex items-center justify-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>Back to RFQs</span>
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
          <Link href="/procurement/rfqs" className="hover:text-purple-600 dark:hover:text-purple-400">
            RFQs
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">{rfq.rfqNumber}</span>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{rfq.title}</h1>
              {getStatusBadge(rfq.status)}
            </div>
            <p className="text-gray-600 dark:text-gray-400">{rfq.rfqNumber}</p>
          </div>
          
          <div className="flex items-center space-x-3">
            {rfq.status === 'draft' && (
              <button
                onClick={handleSendRFQ}
                disabled={sending}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2 disabled:opacity-50"
              >
                <Send size={16} />
                <span>{sending ? 'Sending...' : 'Send RFQ'}</span>
              </button>
            )}
           // In the header section, replace the Edit button with a Link
<Link
  href={`/procurement/rfqs/${rfq.id}/edit`}
  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center space-x-2"
>
  <Edit size={16} />
  <span>Edit</span>
</Link>
            <button
              onClick={handleDeleteRFQ}
              className="px-4 py-2 text-red-700 dark:text-red-300 bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Deadline</p>
            <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {rfq.deadline ? new Date(rfq.deadline).toLocaleDateString() : 'No deadline'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Vendors</p>
            <Users className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{rfq.recipients.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {rfq.recipients.filter(r => r.status === 'responded').length} responded
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Quotes</p>
            <DollarSign className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{rfq.quotes.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {rfq.quotes.filter(q => q.status === 'submitted').length} submitted
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created By</p>
            <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{rfq.createdBy.name || 'Unknown'}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {new Date(rfq.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {rfq.description && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Description</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{rfq.description}</p>
            </div>
          )}

          {/* Line Items */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Items / Services</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Unit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {rfq.lineItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {item.lineNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {item.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {item.unit || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {item.notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          {rfq.notes && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Notes to Vendors</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{rfq.notes}</p>
            </div>
          )}

          {/* Delivery Terms */}
          {rfq.deliveryTerms && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Delivery Terms</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{rfq.deliveryTerms}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Vendors */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Vendors</h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {rfq.recipients.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  No vendors added
                </div>
              ) : (
                rfq.recipients.map((recipient) => (
                  <div key={recipient.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{recipient.vendor.name}</p>
                        {recipient.vendor.email && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                            <Mail size={12} className="mr-1" />
                            {recipient.vendor.email}
                          </p>
                        )}
                      </div>
                      {getRecipientStatusBadge(recipient.status)}
                    </div>
                    {recipient.sentAt && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        Sent: {new Date(recipient.sentAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quotes */}
          {rfq.quotes.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quotes Received</h2>
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs font-medium rounded-full">
                  {rfq.quotes.length}
                </span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {rfq.quotes.map((quote) => (
                  <Link
                    key={quote.id}
                    href={`/procurement/quotes/${quote.id}`}
                    className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{quote.vendor.name}</p>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {quote.currency} {quote.total.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{quote.quoteNumber}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      Submitted: {new Date(quote.submittedAt).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}