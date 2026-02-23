'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  ArrowLeft,
  FileCheck,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Building2,
  DollarSign,
  Calendar,
  FileText,
  Shield,
  Edit,
  Trash2,
  Download,
  Send,
  User,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  AlertTriangle,
  FileSignature,
  Plus,
  History
} from 'lucide-react'
import Link from 'next/link'

interface ContractDetail {
  id: string
  contractNumber: string
  title: string
  description: string | null
  type: string
  status: string
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
  quoteId: string | null
  quote?: {
    id: string
    quoteNumber: string
    total: number
    currency: string
  } | null
  projectId: string | null
  project?: {
    id: string
    name: string
    projectNumber: string
  } | null
  startDate: string | null
  endDate: string | null
  signedDate: string | null
  effectiveDate: string | null
  terminationDate: string | null
  renewalDate: string | null
  signedByVendor: boolean
  signedByCompany: boolean
  signedByVendorAt: string | null
  signedByCompanyAt: string | null
  signedByVendorUser: string | null
  signedByCompanyUserId: string | null
  signedByCompanyUser?: {
    id: string
    name: string | null
    email: string
  } | null
  value: number | null
  currency: string
  paymentTerms: string | null
  billingCycle: string | null
  autoRenew: boolean
  renewalTerms: string | null
  documentUrl: string | null
  terms: string | null
  specialTerms: string | null
  approvalStatus: string
  approvedById: string | null
  approvedBy?: {
    id: string
    name: string | null
    email: string
  } | null
  approvedAt: string | null
  rejectionReason: string | null
  createdById: string
  createdBy: {
    id: string
    name: string | null
    email: string
  }
  createdAt: string
  updatedAt: string
  amendments: Array<{
    id: string
    amendmentNumber: string
    title: string
    description: string | null
    effectiveDate: string
    valueChange: number | null
    valueChangeType: string | null
    termsChange: string | null
    dateChange: any | null
    documentUrl: string | null
    status: string
    approvedById: string | null
    approvedAt: string | null
    createdById: string
    createdAt: string
  }>
  workOrders?: any[]
  invoices?: any[]
  purchaseOrders?: any[]
}

export default function ContractDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [contract, setContract] = useState<ContractDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchContract()
  }, [params.id])

  const fetchContract = async () => {
    setLoading(true)
    try {
      const response = await api.getContract(params.id as string)
      if (response.success) {
        setContract(response.data)
      } else {
        setError('Failed to load contract')
      }
    } catch (err) {
      setError('Failed to load contract')
    } finally {
      setLoading(false)
    }
  }

  const handleSignContract = async () => {
    if (!confirm('Are you sure you want to sign this contract?')) {
      return
    }

    setProcessing(true)
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const response = await api.signContract(params.id as string, user.name || 'Company Representative')
      
      if (response.success) {
        fetchContract()
      } else {
        setError('Failed to sign contract')
      }
    } catch (err) {
      setError('Failed to sign contract')
    } finally {
      setProcessing(false)
    }
  }

  const handleDeleteContract = async () => {
    if (!confirm('Are you sure you want to delete this contract? This action cannot be undone.')) {
      return
    }

    try {
      const response = await api.deleteContract(params.id as string)
      if (response.success) {
        router.push('/procurement/contracts')
      } else {
        setError('Failed to delete contract')
      }
    } catch (err) {
      setError('Failed to delete contract')
    }
  }

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
      <span className={`px-3 py-1.5 text-sm font-medium rounded-full flex items-center space-x-1.5 w-fit ${config.color}`}>
        <Icon size={14} />
        <span>{config.label}</span>
      </span>
    )
  }

  const getDaysRemaining = () => {
    if (!contract?.endDate || contract.status !== 'active') return null
    const days = Math.ceil((new Date(contract.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (days < 0) return 'Expired'
    if (days === 0) return 'Expires today'
    if (days === 1) return '1 day remaining'
    return `${days} days remaining`
  }

  const getDaysRemainingColor = () => {
    if (!contract?.endDate || contract.status !== 'active') return 'text-gray-600'
    const days = Math.ceil((new Date(contract.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (days <= 7) return 'text-red-600'
    if (days <= 30) return 'text-amber-600'
    return 'text-green-600'
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

  if (error || !contract) {
    return (
      <MainLayout>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Contract</h3>
          <p className="text-gray-500 mb-6">{error || 'Contract not found'}</p>
          <Link
            href="/procurement/contracts"
            className="text-purple-600 hover:text-purple-800 font-medium flex items-center justify-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>Back to Contracts</span>
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
          <Link href="/procurement/contracts" className="hover:text-purple-600">
            Contracts
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{contract.contractNumber}</span>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{contract.title}</h1>
              {getStatusBadge(contract.status)}
            </div>
            <p className="text-gray-600">{contract.contractNumber}</p>
            {contract.project && (
              <Link 
                href={`/projects/${contract.projectId}`}
                className="text-sm text-purple-600 hover:text-purple-800 flex items-center space-x-1 mt-2"
              >
                <FileText size={14} />
                <span>Project: {contract.project.name}</span>
              </Link>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {contract.status === 'pending_signature' && !contract.signedByCompany && (
              <button
                onClick={handleSignContract}
                disabled={processing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 disabled:opacity-50"
              >
                <FileSignature size={16} />
                <span>{processing ? 'Signing...' : 'Sign Contract'}</span>
              </button>
            )}
            {contract.status === 'draft' && (
              <>
                <Link
                  href={`/procurement/contracts/${contract.id}/edit`}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Edit size={16} />
                  <span>Edit</span>
                </Link>
                <button
                  onClick={handleDeleteContract}
                  className="px-4 py-2 text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </>
            )}
            {contract.status === 'active' && (
              <Link
                href={`/procurement/contracts/${contract.id}/amendments/new`}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Create Amendment</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Contract Value</p>
            <DollarSign className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {contract.currency} {Number(contract.value || 0).toLocaleString()}
          </p>
          {contract.quote && (
            <p className="text-xs text-gray-500 mt-1">
              From Quote: {contract.quote.quoteNumber}
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Vendor</p>
            <Building2 className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900">{contract.vendor.name}</p>
          {contract.vendor.email && (
            <p className="text-xs text-gray-500 mt-1 flex items-center">
              <Mail size={12} className="mr-1" />
              {contract.vendor.email}
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Contract Period</p>
            <Calendar className="w-4 h-4 text-gray-400" />
          </div>
          {contract.startDate && contract.endDate ? (
            <>
              <p className="text-sm font-medium text-gray-900">
                {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
              </p>
              {contract.status === 'active' && (
                <p className={`text-xs font-medium mt-1 ${getDaysRemainingColor()}`}>
                  {getDaysRemaining()}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500">Not specified</p>
          )}
          {contract.autoRenew && (
            <p className="text-xs text-blue-600 mt-1 flex items-center">
              <Clock size={12} className="mr-1" />
              Auto-renews
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Signature Status</p>
            <FileSignature className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Company:</span>
              {contract.signedByCompany ? (
                <span className="text-xs text-green-600 flex items-center">
                  <CheckCircle size={12} className="mr-1" />
                  Signed
                </span>
              ) : (
                <span className="text-xs text-amber-600 flex items-center">
                  <Clock size={12} className="mr-1" />
                  Pending
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Vendor:</span>
              {contract.signedByVendor ? (
                <span className="text-xs text-green-600 flex items-center">
                  <CheckCircle size={12} className="mr-1" />
                  Signed
                </span>
              ) : (
                <span className="text-xs text-amber-600 flex items-center">
                  <Clock size={12} className="mr-1" />
                  Pending
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'terms'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Terms & Conditions
          </button>
          <button
            onClick={() => setActiveTab('amendments')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'amendments'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Amendments
            {contract.amendments.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full">
                {contract.amendments.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('related')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'related'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Related Documents
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Description */}
              {contract.description && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{contract.description}</p>
                </div>
              )}

              {/* Payment Terms */}
              {contract.paymentTerms && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Terms</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{contract.paymentTerms}</p>
                  {contract.billingCycle && (
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="font-medium">Billing Cycle:</span> {contract.billingCycle}
                    </p>
                  )}
                </div>
              )}

              {/* Renewal Information */}
              {contract.autoRenew && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Renewal Information</h2>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Auto-renewal:</span> Enabled
                    </p>
                    {contract.renewalDate && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Next Renewal Date:</span> {new Date(contract.renewalDate).toLocaleDateString()}
                      </p>
                    )}
                    {contract.renewalTerms && (
                      <p className="text-sm text-gray-700 mt-2">
                        <span className="font-medium">Renewal Terms:</span><br />
                        {contract.renewalTerms}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Terms Tab */}
          {activeTab === 'terms' && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Terms & Conditions</h2>
              {contract.terms ? (
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{contract.terms}</p>
                </div>
              ) : (
                <p className="text-gray-500">No terms and conditions specified.</p>
              )}

              {contract.specialTerms && (
                <>
                  <h3 className="text-md font-semibold text-gray-900 mt-6 mb-3">Special Terms</h3>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{contract.specialTerms}</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Amendments Tab */}
          {activeTab === 'amendments' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Contract Amendments</h2>
                {contract.status === 'active' && (
                  <Link
                    href={`/procurement/contracts/${contract.id}/amendments/new`}
                    className="text-sm text-purple-600 hover:text-purple-800 flex items-center space-x-1"
                  >
                    <Plus size={16} />
                    <span>New Amendment</span>
                  </Link>
                )}
              </div>
              {contract.amendments.length === 0 ? (
                <div className="p-12 text-center">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No amendments yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {contract.amendments.map((amendment) => (
                    <div key={amendment.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">{amendment.title}</h3>
                          <p className="text-xs text-gray-500 mt-1">{amendment.amendmentNumber}</p>
                        </div>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {amendment.status}
                        </span>
                      </div>
                      {amendment.description && (
                        <p className="text-sm text-gray-600 mt-2">{amendment.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                        {amendment.valueChange && (
                          <span>
                            Value Change: {amendment.valueChangeType === 'increase' ? '+' : '-'}
                            {contract.currency} {amendment.valueChange.toLocaleString()}
                          </span>
                        )}
                        <span>Effective: {new Date(amendment.effectiveDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Related Documents Tab */}
          {activeTab === 'related' && (
            <div className="space-y-6">
              {/* Purchase Orders */}
              {contract.purchaseOrders && contract.purchaseOrders.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900">Purchase Orders</h2>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {contract.purchaseOrders.map((po: any) => (
                      <Link
                        key={po.id}
                        href={`/procurement/purchase-orders/${po.id}`}
                        className="block p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{po.poNumber}</p>
                            <p className="text-sm text-gray-500">{po.title}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {po.currency} {Number(po.total).toLocaleString()}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              po.status === 'completed' ? 'bg-green-100 text-green-800' :
                              po.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {po.status}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Orders */}
              {contract.workOrders && contract.workOrders.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900">Work Orders</h2>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {contract.workOrders.map((wo: any) => (
                      <Link
                        key={wo.id}
                        href={`/work-orders/${wo.id}`}
                        className="block p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{wo.workOrderNumber}</p>
                            <p className="text-sm text-gray-500">{wo.title}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            wo.status === 'completed' ? 'bg-green-100 text-green-800' :
                            wo.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {wo.status}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoices */}
              {contract.invoices && contract.invoices.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900">Invoices</h2>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {contract.invoices.map((invoice: any) => (
                      <Link
                        key={invoice.id}
                        href={`/invoices/${invoice.id}`}
                        className="block p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                            <p className="text-sm text-gray-500">{new Date(invoice.issueDate).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {invoice.currency} {Number(invoice.total).toLocaleString()}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                              invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {invoice.status}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
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
                    <p className="text-sm font-medium text-gray-900">{contract.vendor.name}</p>
                  </div>
                </div>
                {contract.vendor.email && (
                  <div className="flex items-start space-x-3">
                    <Mail size={16} className="text-gray-400 mt-0.5" />
                    <a href={`mailto:${contract.vendor.email}`} className="text-sm text-purple-600 hover:text-purple-800">
                      {contract.vendor.email}
                    </a>
                  </div>
                )}
                {contract.vendor.phone && (
                  <div className="flex items-start space-x-3">
                    <Phone size={16} className="text-gray-400 mt-0.5" />
                    <a href={`tel:${contract.vendor.phone}`} className="text-sm text-gray-900">
                      {contract.vendor.phone}
                    </a>
                  </div>
                )}
                {(contract.vendor.address || contract.vendor.city) && (
                  <div className="flex items-start space-x-3">
                    <MapPin size={16} className="text-gray-400 mt-0.5" />
                    <div className="text-sm text-gray-900">
                      {contract.vendor.address && <div>{contract.vendor.address}</div>}
                      {(contract.vendor.city || contract.vendor.state) && (
                        <div>
                          {contract.vendor.city}{contract.vendor.city && contract.vendor.state ? ', ' : ''}{contract.vendor.state}
                        </div>
                      )}
                      {contract.vendor.country && <div>{contract.vendor.country}</div>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contract Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Contract Details</h2>
            </div>
            <div className="p-6">
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-500">Type</dt>
                  <dd className="text-sm font-medium text-gray-900 capitalize">{contract.type.replace('_', ' ')}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-500">Created By</dt>
                  <dd className="text-sm text-gray-900">{contract.createdBy.name || contract.createdBy.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-500">Created On</dt>
                  <dd className="text-sm text-gray-900">{new Date(contract.createdAt).toLocaleDateString()}</dd>
                </div>
                {contract.approvedBy && (
                  <div className="flex justify-between">
                    <dt className="text-xs text-gray-500">Approved By</dt>
                    <dd className="text-sm text-gray-900">{contract.approvedBy.name || contract.approvedBy.email}</dd>
                  </div>
                )}
                {contract.approvedAt && (
                  <div className="flex justify-between">
                    <dt className="text-xs text-gray-500">Approved On</dt>
                    <dd className="text-sm text-gray-900">{new Date(contract.approvedAt).toLocaleDateString()}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Document */}
          {contract.documentUrl && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Contract Document</h2>
              </div>
              <div className="p-6">
                <a
                  href={contract.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 p-3 text-sm text-purple-600 hover:bg-purple-50 rounded-lg border border-purple-200"
                >
                  <FileText size={16} />
                  <span>View Contract Document</span>
                  <Download size={14} className="ml-auto" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}