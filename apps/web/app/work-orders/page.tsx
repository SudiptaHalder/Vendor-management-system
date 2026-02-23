'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  ClipboardList,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Building2,
  Calendar,
  AlertCircle,
  User,
  FileText,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

interface WorkOrder {
  id: string
  workOrderNumber: string
  title: string
  description: string | null
  status: string
  priority: string
  type: string
  projectId: string | null
  project?: {
    id: string
    name: string
    projectNumber: string
  } | null
  vendorId: string
  vendor?: {
    id: string
    name: string
  }
  assignedToId: string | null
  assignedTo?: {
    id: string
    name: string | null
    email: string
  } | null
  scheduledDate: string | null
  dueDate: string | null
  completedDate: string | null
  estimatedCost: number | null
  actualCost: number | null
  currency: string
}

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')

  const fetchWorkOrders = async () => {
    setLoading(true)
    try {
      const response = await api.getWorkOrders()
      if (response.success) {
        setWorkOrders(response.data)
      } else {
        setError('Failed to load work orders')
      }
    } catch (err) {
      setError('Failed to load work orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkOrders()
  }, [])

  const handleDeleteWorkOrder = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this work order? This action cannot be undone.')) {
      return
    }

    try {
      const response = await api.deleteWorkOrder(id)
      if (response.success) {
        setWorkOrders(workOrders.filter(wo => wo.id !== id))
      }
    } catch (err) {
      alert('Failed to delete work order')
    }
  }

  const filteredWorkOrders = workOrders.filter(wo => {
    const matchesSearch = 
      wo.workOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (wo.vendor?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || wo.status === statusFilter
    const matchesProject = projectFilter === 'all' || wo.projectId === projectFilter
    
    return matchesSearch && matchesStatus && matchesProject
  })

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string, icon: any, label: string }> = {
      pending: { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Pending' },
      in_progress: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle, label: 'In Progress' },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelled' },
      on_hold: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle, label: 'On Hold' }
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

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, { color: string, label: string }> = {
      low: { color: 'bg-gray-100 text-gray-800', label: 'Low' },
      medium: { color: 'bg-blue-100 text-blue-800', label: 'Medium' },
      high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
      critical: { color: 'bg-red-100 text-red-800', label: 'Critical' }
    }
    const config = priorityConfig[priority] || priorityConfig.medium
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const stats = {
    total: workOrders.length,
    pending: workOrders.filter(wo => wo.status === 'pending').length,
    inProgress: workOrders.filter(wo => wo.status === 'in_progress').length,
    completed: workOrders.filter(wo => wo.status === 'completed').length,
    overdue: workOrders.filter(wo => {
      if (!wo.dueDate) return false
      return wo.status !== 'completed' && new Date(wo.dueDate) < new Date()
    }).length
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Work Orders</h1>
          <p className="text-gray-600 mt-1">Manage and track work orders across projects</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchWorkOrders}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <Link
            href="/work-orders/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>New Work Order</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ClipboardList className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pending}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.inProgress}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completed}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Overdue</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.overdue}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
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
              placeholder="Search by work order #, title, or vendor..."
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
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="p-2 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Work Orders Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading work orders...</p>
        </div>
      ) : workOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No work orders yet</h3>
          <p className="text-gray-500 mb-6">Create your first work order to start tracking tasks.</p>
          <Link
            href="/work-orders/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Create Work Order</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WO #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredWorkOrders.map((wo) => (
                  <tr key={wo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono font-medium text-gray-900">
                        {wo.workOrderNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{wo.title}</div>
                      {wo.description && (
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {wo.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {wo.project ? (
                        <Link 
                          href={`/projects/${wo.project.id}`}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          {wo.project.projectNumber}
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{wo.vendor?.name || '—'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(wo.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(wo.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {wo.dueDate ? (
                        <div className="flex items-center">
                          <Calendar size={14} className="text-gray-400 mr-1" />
                          <span className={`text-sm ${
                            wo.status !== 'completed' && new Date(wo.dueDate) < new Date() 
                              ? 'text-red-600 font-medium' 
                              : 'text-gray-900'
                          }`}>
                            {new Date(wo.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User size={14} className="text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">
                          {wo.assignedTo?.name || 'Unassigned'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/work-orders/${wo.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Work Order"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link
                          href={`/work-orders/${wo.id}/edit`}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit Work Order"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={(e) => handleDeleteWorkOrder(wo.id, e)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Work Order"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </MainLayout>
  )
}