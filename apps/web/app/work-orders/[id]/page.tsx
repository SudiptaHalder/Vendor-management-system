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
  User,
  Edit,
  Trash2,
  AlertCircle,
  AlertTriangle,
  MapPin,
  Phone,
  Mail,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

interface WorkOrderDetail {
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
  vendor: {
    id: string
    name: string
    email: string | null
    phone: string | null
  }
  assignedToId: string | null
  assignedTo?: {
    id: string
    name: string | null
    email: string
  } | null
  assignedById: string | null
  assignedBy?: {
    id: string
    name: string | null
    email: string
  } | null
  requestedDate: string
  scheduledDate: string | null
  startDate: string | null
  completedDate: string | null
  dueDate: string | null
  estimatedHours: number | null
  actualHours: number | null
  location: string | null
  siteContact: string | null
  sitePhone: string | null
  estimatedCost: number | null
  actualCost: number | null
  currency: string
  completionNotes: string | null
  completedBy: string | null
  approvalStatus: string
  approvedById: string | null
  approvedAt: string | null
  createdAt: string
}

export default function WorkOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [workOrder, setWorkOrder] = useState<WorkOrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchWorkOrder()
  }, [params.id])

  const fetchWorkOrder = async () => {
    setLoading(true)
    try {
      const response = await api.getWorkOrder(params.id as string)
      if (response.success) {
        setWorkOrder(response.data)
      } else {
        setError('Failed to load work order')
      }
    } catch (err) {
      setError('Failed to load work order')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteWorkOrder = async () => {
    if (!confirm('Are you sure you want to delete this work order? This action cannot be undone.')) {
      return
    }

    try {
      const response = await api.deleteWorkOrder(params.id as string)
      if (response.success) {
        router.push('/work-orders')
      } else {
        setError('Failed to delete work order')
      }
    } catch (err) {
      setError('Failed to delete work order')
    }
  }

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
      <span className={`px-3 py-1.5 text-sm font-medium rounded-full flex items-center space-x-1.5 w-fit ${config.color}`}>
        <Icon size={14} />
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

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </MainLayout>
    )
  }

  if (error || !workOrder) {
    return (
      <MainLayout>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Work Order</h3>
          <p className="text-gray-500 mb-6">{error || 'Work order not found'}</p>
          <Link
            href="/work-orders"
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>Back to Work Orders</span>
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
          <Link href="/work-orders" className="hover:text-blue-600">
            Work Orders
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{workOrder.workOrderNumber}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start space-x-4">
            <Link
              href="/work-orders"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center flex-wrap gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{workOrder.title}</h1>
                {getStatusBadge(workOrder.status)}
                {getPriorityBadge(workOrder.priority)}
              </div>
              <p className="text-gray-600">{workOrder.workOrderNumber}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link
              href={`/work-orders/${workOrder.id}/edit`}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <Edit size={16} />
              <span>Edit</span>
            </Link>
            <button
              onClick={handleDeleteWorkOrder}
              className="px-4 py-2 text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 flex items-center space-x-2"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Vendor</p>
            <Building2 className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900">{workOrder.vendor.name}</p>
          {workOrder.vendor.email && (
            <p className="text-xs text-gray-500 mt-1 truncate">{workOrder.vendor.email}</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Project</p>
            <FileText className="w-4 h-4 text-gray-400" />
          </div>
          {workOrder.project ? (
            <Link 
              href={`/projects/${workOrder.project.id}`}
              className="text-lg font-semibold text-blue-600 hover:text-blue-800"
            >
              {workOrder.project.projectNumber}
            </Link>
          ) : (
            <p className="text-lg text-gray-500">No Project</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Due Date</p>
            <Calendar className="w-4 h-4 text-gray-400" />
          </div>
          {workOrder.dueDate ? (
            <>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(workOrder.dueDate).toLocaleDateString()}
              </p>
              {workOrder.status !== 'completed' && new Date(workOrder.dueDate) < new Date() && (
                <p className="text-xs text-red-600 mt-1">Overdue</p>
              )}
            </>
          ) : (
            <p className="text-lg text-gray-500">Not set</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Assigned To</p>
            <User className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {workOrder.assignedTo?.name || 'Unassigned'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {workOrder.description && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{workOrder.description}</p>
            </div>
          )}

          {/* Location & Contact */}
          {(workOrder.location || workOrder.siteContact || workOrder.sitePhone) && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Location & Contact</h2>
              <div className="space-y-3">
                {workOrder.location && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <span className="text-gray-700">{workOrder.location}</span>
                  </div>
                )}
                {workOrder.siteContact && (
                  <div className="flex items-start space-x-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <span className="text-gray-700">{workOrder.siteContact}</span>
                  </div>
                )}
                {workOrder.sitePhone && (
                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <span className="text-gray-700">{workOrder.sitePhone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Completion Notes */}
          {workOrder.completionNotes && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Completion Notes</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{workOrder.completionNotes}</p>
              {workOrder.completedBy && (
                <p className="text-xs text-gray-500 mt-2">
                  Completed by: {workOrder.completedBy} on {new Date(workOrder.completedDate!).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Cost Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Cost Information</h2>
            </div>
            <div className="p-6">
              <dl className="space-y-3">
                {workOrder.estimatedCost && (
                  <div className="flex justify-between">
                    <dt className="text-xs text-gray-500">Estimated Cost</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {workOrder.currency} {workOrder.estimatedCost.toLocaleString()}
                    </dd>
                  </div>
                )}
                {workOrder.actualCost && (
                  <div className="flex justify-between">
                    <dt className="text-xs text-gray-500">Actual Cost</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {workOrder.currency} {workOrder.actualCost.toLocaleString()}
                    </dd>
                  </div>
                )}
                {workOrder.estimatedHours && (
                  <div className="flex justify-between">
                    <dt className="text-xs text-gray-500">Estimated Hours</dt>
                    <dd className="text-sm text-gray-900">{workOrder.estimatedHours} hrs</dd>
                  </div>
                )}
                {workOrder.actualHours && (
                  <div className="flex justify-between">
                    <dt className="text-xs text-gray-500">Actual Hours</dt>
                    <dd className="text-sm text-gray-900">{workOrder.actualHours} hrs</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Timeline</h2>
            </div>
            <div className="p-6">
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-500">Requested</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(workOrder.requestedDate).toLocaleDateString()}
                  </dd>
                </div>
                {workOrder.scheduledDate && (
                  <div className="flex justify-between">
                    <dt className="text-xs text-gray-500">Scheduled</dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(workOrder.scheduledDate).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                {workOrder.startDate && (
                  <div className="flex justify-between">
                    <dt className="text-xs text-gray-500">Started</dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(workOrder.startDate).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                {workOrder.completedDate && (
                  <div className="flex justify-between">
                    <dt className="text-xs text-gray-500">Completed</dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(workOrder.completedDate).toLocaleDateString()}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Work Order Info - FIXED: Use assignedBy instead of createdBy */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Work Order Info</h2>
            </div>
            <div className="p-6">
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-500">Type</dt>
                  <dd className="text-sm capitalize text-gray-900">{workOrder.type}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-500">Created By</dt>
                  <dd className="text-sm text-gray-900">
                    {workOrder.assignedBy?.name || workOrder.assignedBy?.email || 'System'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-500">Created On</dt>
                  <dd className="text-sm text-gray-900">{new Date(workOrder.createdAt).toLocaleDateString()}</dd>
                </div>
                {workOrder.approvalStatus !== 'pending' && (
                  <div className="flex justify-between">
                    <dt className="text-xs text-gray-500">Approval</dt>
                    <dd className="text-sm capitalize text-gray-900">{workOrder.approvalStatus}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}