'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  ArrowLeft,
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Building2,
  DollarSign,
  Calendar,
  FileText,
  Users,
  Download,
  Send,
  Award,
  TrendingUp,
  AlertCircle,
  Edit,
  Trash2,
  FileSignature,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'
import Link from 'next/link'

interface BidDetail {
  id: string
  bidNumber: string
  title: string
  description: string | null
  type: string
  status: string
  openDate: string
  closeDate: string
  awardDate: string | null
  estimatedValue: number | null
  currency: string
  requirements: string | null
  evaluationCriteria: string | null
  eligibilityCriteria: string | null
  documentUrls: string[]
  createdById: string
  createdBy: {
    id: string
    name: string | null
    email: string
  } | null
  createdAt: string
  submissions: Array<{
    id: string
    submissionNumber: string
    vendorId: string
    vendor: {
      id: string
      name: string
      email: string | null
      phone: string | null
    }
    amount: number
    currency: string
    status: string
    submittedAt: string
    score: number | null
    rank: number | null
    documents: string[]
    notes: string | null
  }>
}

export default function BidDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [bid, setBid] = useState<BidDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchBid()
    }
  }, [params.id])

  const fetchBid = async () => {
    setLoading(true)
    setError('')
    try {
      console.log('Fetching bid with ID:', params.id)
      const response = await api.getBid(params.id as string)
      console.log('Bid response:', response)
      
      if (response.success) {
        setBid(response.data)
      } else {
        setError(response.error || 'Failed to load bid')
      }
    } catch (err: any) {
      console.error('Error fetching bid:', err)
      setError(err.message || 'Failed to load bid')
    } finally {
      setLoading(false)
    }
  }

  const handlePublishBid = async () => {
    if (!confirm('Are you sure you want to publish this bid? It will be visible to vendors.')) {
      return
    }

    setProcessing(true)
    try {
      const response = await api.publishBid(params.id as string)
      if (response.success) {
        fetchBid()
      } else {
        setError('Failed to publish bid')
      }
    } catch (err) {
      setError('Failed to publish bid')
    } finally {
      setProcessing(false)
    }
  }

  const handleDeleteBid = async () => {
    if (!confirm('Are you sure you want to delete this bid? This action cannot be undone.')) {
      return
    }

    try {
      const response = await api.deleteBid(params.id as string)
      if (response.success) {
        router.push('/procurement/bids')
      } else {
        setError('Failed to delete bid')
      }
    } catch (err) {
      setError('Failed to delete bid')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string, icon: any, label: string }> = {
      draft: { color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200', icon: FileText, label: 'Draft' },
      published: { color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300', icon: Clock, label: 'Published' },
      accepting_bids: { color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300', icon: TrendingUp, label: 'Accepting Bids' },
      under_review: { color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300', icon: Eye, label: 'Under Review' },
      awarded: { color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300', icon: Award, label: 'Awarded' },
      cancelled: { color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300', icon: XCircle, label: 'Cancelled' },
      closed: { color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200', icon: CheckCircle, label: 'Closed' }
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

  const getDaysRemaining = () => {
    if (!bid) return null
    const days = Math.ceil((new Date(bid.closeDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (days < 0) return 'Closed'
    if (days === 0) return 'Closes today'
    if (days === 1) return '1 day left'
    return `${days} days left`
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

  if (error || !bid) {
    return (
      <MainLayout>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Error Loading Bid</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{error || 'Bid not found'}</p>
          <Link
            href="/procurement/bids"
            className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium flex items-center justify-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>Back to Bids</span>
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
          <Link href="/procurement/bids" className="hover:text-purple-600 dark:hover:text-purple-400">
            Bids
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">{bid.bidNumber}</span>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{bid.title}</h1>
              {getStatusBadge(bid.status)}
            </div>
            <p className="text-gray-600 dark:text-gray-400">{bid.bidNumber}</p>
            {bid.status === 'published' && new Date(bid.closeDate) > new Date() && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center">
                <Clock size={14} className="mr-1" />
                {getDaysRemaining()}
              </p>
            )}
          </div>
          
          {/* Action Buttons - NOW SHOWS EDIT/DELETE FOR PUBLISHED BIDS */}
          <div className="flex items-center space-x-3">
            {/* Publish button - only for draft */}
            {bid.status === 'draft' && (
              <button
                onClick={handlePublishBid}
                disabled={processing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 disabled:opacity-50"
              >
                <Send size={16} />
                <span>{processing ? 'Publishing...' : 'Publish Bid'}</span>
              </button>
            )}

            {/* EDIT BUTTON - Shows for draft AND published */}
            {(bid.status === 'draft' || bid.status === 'published' || bid.status === 'accepting_bids') && (
              <Link
                href={`/procurement/bids/${bid.id}/edit`}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center space-x-2"
              >
                <Edit size={16} />
                <span>Edit</span>
              </Link>
            )}

            {/* DELETE BUTTON - Shows for draft AND published */}
            {(bid.status === 'draft' || bid.status === 'published') && (
              <button
                onClick={handleDeleteBid}
                className="px-4 py-2 text-red-700 dark:text-red-300 bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            )}

            {/* Status badges for other statuses */}
            {bid.status === 'under_review' && (
              <span className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-lg flex items-center space-x-2">
                <Eye size={16} />
                <span>Under Review</span>
              </span>
            )}
            
            {bid.status === 'awarded' && (
              <span className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-lg flex items-center space-x-2">
                <Award size={16} />
                <span>Awarded</span>
              </span>
            )}
            
            {bid.status === 'cancelled' && (
              <span className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg flex items-center space-x-2">
                <XCircle size={16} />
                <span>Cancelled</span>
              </span>
            )}
            
            {bid.status === 'closed' && (
              <span className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg flex items-center space-x-2">
                <CheckCircle size={16} />
                <span>Closed</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Estimated Value</p>
            <DollarSign className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {bid.currency} {Number(bid.estimatedValue || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Submissions</p>
            <Users className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{bid.submissions?.length || 0}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Bid Period</p>
            <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {new Date(bid.openDate).toLocaleDateString()} - {new Date(bid.closeDate).toLocaleDateString()}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</p>
            <ClipboardList className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">
            {bid.type.replace('_', ' ')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {bid.description && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Description</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{bid.description}</p>
            </div>
          )}

          {/* Requirements */}
          {bid.requirements && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Requirements</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{bid.requirements}</p>
            </div>
          )}

          {/* Evaluation Criteria */}
          {bid.evaluationCriteria && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Evaluation Criteria</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{bid.evaluationCriteria}</p>
            </div>
          )}

          {/* Eligibility Criteria */}
          {bid.eligibilityCriteria && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Eligibility Criteria</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{bid.eligibilityCriteria}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Bid Documents */}
          {bid.documentUrls && bid.documentUrls.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50 dark:bg-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Bid Documents</h2>
              </div>
              <div className="p-6">
                <div className="space-y-2">
                  {bid.documentUrls.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 p-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                    >
                      <FileText size={14} />
                      <span className="truncate flex-1">Document {index + 1}</span>
                      <Download size={14} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bid Information */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Bid Information</h2>
            </div>
            <div className="p-6">
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-500 dark:text-gray-400">Bid Number</dt>
                  <dd className="text-sm font-mono text-gray-900 dark:text-gray-100">{bid.bidNumber}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-500 dark:text-gray-400">Created By</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100">{bid.createdBy?.name || bid.createdBy?.email || 'Unknown'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-500 dark:text-gray-400">Created On</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100">{new Date(bid.createdAt).toLocaleDateString()}</dd>
                </div>
                {bid.awardDate && (
                  <div className="flex justify-between">
                    <dt className="text-xs text-gray-500 dark:text-gray-400">Awarded On</dt>
                    <dd className="text-sm text-gray-900 dark:text-gray-100">{new Date(bid.awardDate).toLocaleDateString()}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions Section */}
      {bid.submissions && bid.submissions.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Vendor Submissions</h2>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Submission #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Submitted</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {bid.submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono font-medium text-gray-900 dark:text-gray-100">
                          {submission.submissionNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="flex items-center">
                            <Building2 size={14} className="text-gray-400 dark:text-gray-500 mr-1" />
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {submission.vendor.name}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {submission.currency} {Number(submission.amount).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                          {submission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link
                          href={`/procurement/bids/submissions/${submission.id}`}
                          className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
                        >
                          <Eye size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center">
          <Users className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No submissions yet</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {bid.status === 'published' 
              ? 'Vendors will submit their bids here once the bid is published.'
              : 'No vendor submissions have been received for this bid.'}
          </p>
        </div>
      )}
    </MainLayout>
  )
}