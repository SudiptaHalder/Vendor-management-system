"use client"

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import AddPurchaseOrderModal from '@/components/procurement/AddPurchaseOrderModal'
import { api } from '@/lib/api'
import {
  ShoppingCart,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  XCircle,
  Eye,
  MoreVertical,
  FileText,
  DollarSign,
  Calendar,
  Edit2,
  Trash2,
  Send,
  Printer
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface PurchaseOrder {
  id: string
  poNumber: string
  title: string
  description?: string
  status: string
  priority: string
  total: number
  currency: string
  expectedDate?: string
  createdAt: string
  vendor: {
    id: string
    name: string
  }
}

export default function PurchaseOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await api.getPurchaseOrders()
      if (response.success) {
        setOrders(response.data)
      } else {
        setError('Failed to load purchase orders')
      }
    } catch (err) {
      setError('Failed to load purchase orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vendor.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const handleDelete = async () => {
    if (!selectedOrder) return
    try {
      const response = await api.deletePurchaseOrder(selectedOrder.id)
      if (response.success) {
        setOrders(orders.filter(o => o.id !== selectedOrder.id))
        setShowDeleteModal(false)
        setSelectedOrder(null)
        setActiveMenuId(null)
      }
    } catch (err) {
      console.error('Error deleting purchase order:', err)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string, icon: any }> = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: FileText },
      sent: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      acknowledged: { color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
      confirmed: { color: 'bg-indigo-100 text-indigo-800', icon: CheckCircle },
      shipped: { color: 'bg-yellow-100 text-yellow-800', icon: Truck },
      delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle }
    }
    const config = statusConfig[status] || statusConfig.draft
    const Icon = config.icon
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 w-fit ${config.color}`}>
        <Icon size={12} />
        <span className="capitalize">{status}</span>
      </span>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${priorityConfig[priority] || priorityConfig.medium}`}>
        {priority}
      </span>
    )
  }

  const stats = {
    total: orders.length,
    draft: orders.filter(o => o.status === 'draft').length,
    sent: orders.filter(o => o.status === 'sent').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    totalValue: orders.reduce((sum, o) => sum + (o.total || 0), 0)
  }

  return (
    <MainLayout>
      <AddPurchaseOrderModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={(newOrder) => {
          setOrders(prev => [newOrder, ...prev])
          setIsAddModalOpen(false)
        }}
      />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-600 mt-1">Create and manage purchase orders</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchOrders}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Create PO</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total POs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Draft: {stats.draft}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.sent}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Awaiting response</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Delivered</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.delivered}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Completed</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${stats.totalValue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
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
              placeholder="Search by PO number, title, or vendor..."
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
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <button className="p-2 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Purchase Orders Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading purchase orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No purchase orders yet</h3>
          <p className="text-gray-500 mb-6">Create your first purchase order to get started.</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Create Purchase Order</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono font-medium text-gray-900">
                        {order.poNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{order.title}</div>
                      {order.description && (
                        <div className="text-xs text-gray-500 truncate max-w-xs">{order.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{order.vendor.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(order.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {order.currency} {order.total?.toLocaleString() || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.expectedDate ? (
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar size={14} className="mr-1" />
                          {new Date(order.expectedDate).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/procurement/purchase-orders/${order.id}`}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </Link>
                        
                        {/* Three Dots Menu */}
                        <div className="relative">
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === order.id ? null : order.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                          >
                            <MoreVertical size={18} />
                          </button>
                          
                          {activeMenuId === order.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setActiveMenuId(null)}
                              />
                              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
                                <Link
                                  href={`/procurement/purchase-orders/${order.id}`}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                  onClick={() => setActiveMenuId(null)}
                                >
                                  <Eye size={14} />
                                  <span>View Details</span>
                                </Link>
                                <button
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                  onClick={() => {
                                    // Handle edit
                                    setActiveMenuId(null)
                                    // TODO: Implement edit functionality
                                  }}
                                >
                                  <Edit2 size={14} />
                                  <span>Edit</span>
                                </button>
                                <button
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                  onClick={() => {
                                    // Handle duplicate
                                    setActiveMenuId(null)
                                    // TODO: Implement duplicate functionality
                                  }}
                                >
                                  <FileText size={14} />
                                  <span>Duplicate</span>
                                </button>
                                <button
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                  onClick={() => {
                                    // Handle print
                                    setActiveMenuId(null)
                                    window.print()
                                  }}
                                >
                                  <Printer size={14} />
                                  <span>Print</span>
                                </button>
                                <div className="border-t border-gray-100 my-1"></div>
                                <button
                                  onClick={() => {
                                    setSelectedOrder(order)
                                    setShowDeleteModal(true)
                                    setActiveMenuId(null)
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                >
                                  <Trash2 size={14} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDeleteModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Purchase Order</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to delete <span className="font-semibold">{selectedOrder.poNumber}</span>? 
                  This action cannot be undone.
                </p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center space-x-2"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}

