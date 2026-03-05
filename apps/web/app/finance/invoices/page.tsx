'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  FileText,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  DollarSign,
  Building2,
  Calendar,
  Check,
  X,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'

interface Invoice {
  id: string
  invoiceNumber: string
  vendorName: string
  vendorId: string
  amount: number
  status: 'pending' | 'approved' | 'rejected' | 'paid'
  date: string
  dueDate: string
  description?: string
  poNumber?: string
  notes?: string
  submittedAt: string
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      // Mock data - in production, fetch from API
      setInvoices([
        { 
          id: '1', 
          invoiceNumber: 'INV-2024-001', 
          vendorName: 'City Electrical Supply',
          vendorId: 'v1',
          amount: 2500, 
          status: 'paid', 
          date: '2024-02-15',
          dueDate: '2024-03-15',
          submittedAt: '2024-02-15',
          description: 'Electrical supplies - Tower Project',
          poNumber: 'PO-2024-001'
        },
        { 
          id: '2', 
          invoiceNumber: 'INV-2024-002', 
          vendorName: 'Metro Plumbing Supply',
          vendorId: 'v2',
          amount: 1800, 
          status: 'approved', 
          date: '2024-03-01',
          dueDate: '2024-03-31',
          submittedAt: '2024-03-01',
          description: 'Plumbing fixtures',
          poNumber: 'PO-2024-002'
        },
        { 
          id: '3', 
          invoiceNumber: 'INV-2024-003', 
          vendorName: 'HVAC Solutions Pro',
          vendorId: 'v3',
          amount: 3200, 
          status: 'pending', 
          date: '2024-03-05',
          dueDate: '2024-04-04',
          submittedAt: '2024-03-05',
          description: 'HVAC equipment',
          poNumber: 'PO-2024-003'
        },
        { 
          id: '4', 
          invoiceNumber: 'INV-2024-004', 
          vendorName: 'Empire Lumber Co',
          vendorId: 'v4',
          amount: 1500, 
          status: 'pending', 
          date: '2024-03-10',
          dueDate: '2024-04-09',
          submittedAt: '2024-03-10',
          description: 'Lumber supplies',
          poNumber: 'PO-2024-004'
        },
        { 
          id: '5', 
          invoiceNumber: 'INV-2024-005', 
          vendorName: 'Precision Tools Inc',
          vendorId: 'v5',
          amount: 2800, 
          status: 'rejected', 
          date: '2024-03-08',
          dueDate: '2024-04-07',
          submittedAt: '2024-03-08',
          description: 'Tools and equipment',
          poNumber: 'PO-2024-005',
          notes: 'Missing itemized breakdown'
        }
      ])
    } catch (err) {
      console.error('Error fetching invoices:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    setProcessingId(id)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setInvoices(invoices.map(inv => 
        inv.id === id ? { ...inv, status: 'approved' } : inv
      ))
      setShowViewModal(false)
    } catch (err) {
      console.error('Error approving invoice:', err)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async () => {
    if (!selectedInvoice || !rejectReason.trim()) return
    
    setProcessingId(selectedInvoice.id)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setInvoices(invoices.map(inv => 
        inv.id === selectedInvoice.id ? { ...inv, status: 'rejected', notes: rejectReason } : inv
      ))
      setShowRejectModal(false)
      setShowViewModal(false)
      setRejectReason('')
    } catch (err) {
      console.error('Error rejecting invoice:', err)
    } finally {
      setProcessingId(null)
    }
  }

  const handleMarkAsPaid = async (id: string) => {
    setProcessingId(id)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setInvoices(invoices.map(inv => 
        inv.id === id ? { ...inv, status: 'paid' } : inv
      ))
    } catch (err) {
      console.error('Error marking invoice as paid:', err)
    } finally {
      setProcessingId(null)
    }
  }

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowViewModal(true)
  }

  const getStatusBadge = (status: string) => {
    const config = {
      paid: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      approved: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
    }
    const { bg, text, icon: Icon } = config[status as keyof typeof config] || config.pending
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 w-fit ${bg} ${text}`}>
        <Icon size={12} />
        <span className="capitalize">{status}</span>
      </span>
    )
  }

  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.poNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(inv => statusFilter === 'all' || inv.status === statusFilter)

  const stats = {
    total: invoices.reduce((sum, inv) => sum + inv.amount, 0),
    pending: invoices.filter(inv => inv.status === 'pending').length,
    approved: invoices.filter(inv => inv.status === 'approved').length,
    paid: invoices.filter(inv => inv.status === 'paid').length,
    rejected: invoices.filter(inv => inv.status === 'rejected').length,
    pendingAmount: invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0)
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoice Management</h1>
          <p className="text-gray-600 mt-1">Review and process vendor invoices</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchInvoices}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{invoices.length}</p>
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
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Amount</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">${stats.pendingAmount.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.approved}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Paid</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.paid}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by invoice number, vendor, or PO number..."
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
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="rejected">Rejected</option>
            </select>
            <button className="p-2 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{invoice.vendorName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{invoice.poNumber || '—'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar size={12} className="mr-1" />
                      {invoice.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar size={12} className="mr-1" />
                      {invoice.dueDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">${invoice.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(invoice.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleView(invoice)}
                      className="text-gray-400 hover:text-gray-600 mr-2"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    {invoice.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(invoice.id)}
                          disabled={processingId === invoice.id}
                          className="text-green-600 hover:text-green-800 mr-2 disabled:opacity-50"
                          title="Approve"
                        >
                          {processingId === invoice.id ? (
                            <div className="animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full" />
                          ) : (
                            <Check size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice)
                            setShowRejectModal(true)
                          }}
                          disabled={processingId === invoice.id}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50"
                          title="Reject"
                        >
                          <X size={16} />
                        </button>
                      </>
                    )}
                    {invoice.status === 'approved' && (
                      <button
                        onClick={() => handleMarkAsPaid(invoice.id)}
                        disabled={processingId === invoice.id}
                        className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                        title="Mark as Paid"
                      >
                        <DollarSign size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Invoice Modal */}
      {showViewModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowViewModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Invoice Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6">
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Invoice Number</p>
                      <p className="text-sm font-medium text-gray-900">{selectedInvoice.invoiceNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Vendor</p>
                      <p className="text-sm text-gray-900">{selectedInvoice.vendorName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">PO Number</p>
                      <p className="text-sm text-gray-900">{selectedInvoice.poNumber || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Submitted Date</p>
                      <p className="text-sm text-gray-900">{selectedInvoice.submittedAt}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Due Date</p>
                      <p className="text-sm text-gray-900">{selectedInvoice.dueDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="text-sm font-bold text-gray-900">${selectedInvoice.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <div className="mt-1">{getStatusBadge(selectedInvoice.status)}</div>
                    </div>
                  </div>
                </div>

                {selectedInvoice.description && (
                  <div className="mb-6">
                    <p className="text-xs text-gray-500 mb-1">Description</p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedInvoice.description}</p>
                  </div>
                )}

                {selectedInvoice.notes && (
                  <div className="mb-6">
                    <p className="text-xs text-gray-500 mb-1">Notes</p>
                    <p className="text-sm text-gray-700 bg-red-50 p-3 rounded-lg border border-red-200">
                      {selectedInvoice.notes}
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  {selectedInvoice.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          setShowViewModal(false)
                          setSelectedInvoice(selectedInvoice)
                          setShowRejectModal(true)
                        }}
                        className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(selectedInvoice.id)}
                        disabled={processingId === selectedInvoice.id}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                      >
                        {processingId === selectedInvoice.id ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            <span>Approving...</span>
                          </>
                        ) : (
                          <>
                            <Check size={16} />
                            <span>Approve</span>
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowRejectModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Reject Invoice</h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to reject invoice <span className="font-semibold">{selectedInvoice.invoiceNumber}</span> from {selectedInvoice.vendorName}?
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
                    setRejectReason('')
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || processingId === selectedInvoice.id}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {processingId === selectedInvoice.id ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      <span>Rejecting...</span>
                    </>
                  ) : (
                    <>
                      <X size={16} />
                      <span>Reject Invoice</span>
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
