"use client"

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Eye,
  FileText,
  Building2,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Download,
  Check,
  X
} from 'lucide-react'

interface ApprovalRequest {
  id: string
  vendorName: string
  vendorEmail: string | null
  vendorPhone: string | null
  contactPerson: string | null
  category: string | null  // Keep as string, not object
  categoryName?: string    // Add this for display
  submittedAt: string
  documents?: string[]
  status: 'pending' | 'approved' | 'rejected'
  notes?: string | null
}

export default function ApprovalsPage() {
  const [requests, setRequests] = useState<ApprovalRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null)
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(false)

  // Fetch ALL vendors and filter by status
  const fetchAllVendors = async () => {
    setLoading(true)
    setError('')
    try {
      console.log('📋 Fetching all vendors...')
      
      // Get ALL vendors
      const response = await api.getVendors()
      console.log('📋 Vendors response:', response)
      
      if (response.success) {
        // Transform ALL vendors to approval request format
        const transformedData: ApprovalRequest[] = response.data.map((vendor: any) => ({
          id: vendor.id,
          vendorName: vendor.name,
          vendorEmail: vendor.email,
          vendorPhone: vendor.phone,
          contactPerson: vendor.contactPerson || vendor.name,
          // Handle category properly - if it's an object, get name, otherwise use as is
          category: vendor.category?.name || vendor.category || 'Uncategorized',
          submittedAt: vendor.createdAt,
          documents: [],
          status: vendor.status === 'active' ? 'approved' : 
                  vendor.status === 'rejected' ? 'rejected' : 'pending',
          notes: vendor.notes
        }))
        
        setRequests(transformedData)
        console.log('✅ Transformed vendors:', transformedData.length)
      } else {
        setError('Failed to load vendors')
      }
    } catch (err) {
      console.error('Error fetching vendors:', err)
      setError('Failed to load vendors')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllVendors()
  }, [])

  const filteredRequests = requests.filter(req => {
    if (activeTab === 'pending') return req.status === 'pending'
    if (activeTab === 'approved') return req.status === 'approved'
    if (activeTab === 'rejected') return req.status === 'rejected'
    return true
  })

  const handleApprove = async (id: string) => {
    setProcessingId(id)
    try {
      const response = await api.approveVendor(id, 'Approved by admin')
      if (response.success) {
        // Update local state
        setRequests(prev => prev.map(req => 
          req.id === id ? { ...req, status: 'approved' } : req
        ))
        setSelectedRequest(null)
      } else {
        alert(response.error || 'Failed to approve vendor')
      }
    } catch (err) {
      console.error('Error approving vendor:', err)
      alert('Failed to approve vendor')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest || !rejectReason.trim()) return
    
    setProcessingId(selectedRequest.id)
    try {
      const response = await api.rejectVendor(selectedRequest.id, rejectReason)
      if (response.success) {
        setRequests(prev => prev.map(req => 
          req.id === selectedRequest.id ? { ...req, status: 'rejected', notes: rejectReason } : req
        ))
        setShowRejectModal(false)
        setSelectedRequest(null)
        setRejectReason('')
      } else {
        alert(response.error || 'Failed to reject vendor')
      }
    } catch (err) {
      console.error('Error rejecting vendor:', err)
      alert('Failed to reject vendor')
    } finally {
      setProcessingId(null)
    }
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length
  const approvedCount = requests.filter(r => r.status === 'approved').length
  const rejectedCount = requests.filter(r => r.status === 'rejected').length

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <span>Vendors</span>
            <ChevronRight size={14} />
            <span className="text-gray-900">Approvals</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Approvals</h1>
          <p className="text-gray-600 mt-1">Review and approve new vendor registrations</p>
        </div>
        <button
          onClick={fetchAllVendors}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
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
              <p className="text-2xl font-bold text-green-600 mt-1">{approvedCount}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Rejected</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{rejectedCount}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{requests.length}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <Building2 className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Review
              {pendingCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'approved'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Approved
              {approvedCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                  {approvedCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'rejected'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Rejected
              {rejectedCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                  {rejectedCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Requests List */}
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading approvals...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab} requests</h3>
              <p className="text-gray-500">
                {activeTab === 'pending' 
                  ? 'All caught up! No pending approvals.' 
                  : `No ${activeTab} vendor requests.`}
              </p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{request.vendorName}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Contact</p>
                        <p className="text-sm text-gray-900">{request.contactPerson}</p>
                        <p className="text-xs text-gray-600 mt-1">{request.vendorEmail}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Category</p>
                        <p className="text-sm text-gray-900">{request.category}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Submitted</p>
                        <p className="text-sm text-gray-900">
                          {new Date(request.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Documents</p>
                        <p className="text-sm text-gray-900">{request.documents?.length || 0} files</p>
                      </div>
                    </div>

                    {request.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Notes</p>
                        <p className="text-sm text-gray-700">{request.notes}</p>
                      </div>
                    )}
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleApprove(request.id)}
                        disabled={processingId === request.id}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                        title="Approve"
                      >
                        {processingId === request.id ? (
                          <div className="animate-spin h-5 w-5 border-2 border-green-600 border-t-transparent rounded-full" />
                        ) : (
                          <Check className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRequest(request)
                          setShowRejectModal(true)
                        }}
                        disabled={processingId === request.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                        title="Reject"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  {request.status !== 'pending' && (
                    <div className="ml-4">
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowRejectModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Reject Vendor</h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to reject <span className="font-semibold">{selectedRequest.vendorName}</span>?
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                  placeholder="Please provide a reason for rejection..."
                  autoFocus
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false)
                    setSelectedRequest(null)
                    setRejectReason('')
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || processingId === selectedRequest.id}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {processingId === selectedRequest.id ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      <span>Rejecting...</span>
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      <span>Reject Vendor</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
