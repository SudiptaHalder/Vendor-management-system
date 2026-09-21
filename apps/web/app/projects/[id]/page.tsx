'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  ArrowLeft,
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  User,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  AlertCircle,
  Users,
  FileText,
  ShoppingCart,
  FileCheck,
  MessageSquare,
  Eye
} from 'lucide-react'
import Link from 'next/link'

interface ProjectDetail {
  id: string
  projectNumber: string
  name: string
  description: string | null
  status: string
  priority: string
  startDate: string | null
  endDate: string | null
  location: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  budget: number | null
  actualCost: number | null
  currency: string
  progressPercent: number | null
  managerId: string | null
  manager?: {
    id: string
    name: string | null
    email: string
  } | null
  createdBy?: {
    id: string
    name: string | null
    email: string
  }
  createdAt: string
  _count?: {
    workOrders: number
    vendors: number
    purchaseOrders: number
    contracts: number
    rfqs: number
    invoices: number
    expenses: number
  }
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchProject()
  }, [params.id])

  const fetchProject = async () => {
    setLoading(true)
    try {
      const response = await api.getProject(params.id as string)
      if (response.success) {
        setProject(response.data)
      } else {
        setError('Failed to load project')
      }
    } catch (err) {
      setError('Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }

    try {
      const response = await api.deleteProject(params.id as string)
      if (response.success) {
        router.push('/projects')
      } else {
        setError('Failed to delete project')
      }
    } catch (err) {
      setError('Failed to delete project')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string, icon: any, label: string }> = {
      planning: { color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200', icon: Clock, label: 'Planning' },
      active: { color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300', icon: TrendingUp, label: 'Active' },
      on_hold: { color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300', icon: AlertCircle, label: 'On Hold' },
      completed: { color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300', icon: CheckCircle, label: 'Completed' },
      cancelled: { color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300', icon: XCircle, label: 'Cancelled' }
    }
    const config = statusConfig[status] || statusConfig.planning
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
      low: { color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200', label: 'Low' },
      medium: { color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300', label: 'Medium' },
      high: { color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300', label: 'High' },
      critical: { color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300', label: 'Critical' }
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
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      </MainLayout>
    )
  }

  if (error || !project) {
    return (
      <MainLayout>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Error Loading Project</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{error || 'Project not found'}</p>
          <Link
            href="/projects"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center justify-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>Back to Projects</span>
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
          <Link href="/projects" className="hover:text-blue-600 dark:hover:text-blue-400">
            Projects
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">{project.projectNumber}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start space-x-4">
            <Link
              href="/projects"
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center flex-wrap gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{project.name}</h1>
                {getStatusBadge(project.status)}
                {getPriorityBadge(project.priority)}
              </div>
              <p className="text-gray-600 dark:text-gray-400">{project.projectNumber}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link
              href={`/projects/${project.id}/edit`}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center space-x-2"
            >
              <Edit size={16} />
              <span>Edit</span>
            </Link>
            <button
              onClick={handleDeleteProject}
              className="px-4 py-2 text-red-700 dark:text-red-300 bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Project Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Budget</p>
            <DollarSign className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {project.currency} {Number(project.budget || 0).toLocaleString()}
          </p>
          {project.actualCost ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Actual: {project.currency} {Number(project.actualCost).toLocaleString()}
            </p>
          ) : null}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Progress</p>
            <TrendingUp className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="flex items-end space-x-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{project.progressPercent || 0}%</p>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${project.progressPercent || 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Timeline</p>
            <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          {project.startDate && project.endDate ? (
            <>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {new Date(project.startDate).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                to {new Date(project.endDate).toLocaleDateString()}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Not set</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Project Manager</p>
            <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {project.manager?.name || 'Unassigned'}
          </p>
          {project.manager?.email && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
              {project.manager.email}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('workorders')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'workorders'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Work Orders
            {project._count?.workOrders ? (
              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                {project._count.workOrders}
              </span>
            ) : null}
          </button>
          <button
            onClick={() => setActiveTab('vendors')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'vendors'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Vendors
            {project._count?.vendors ? (
              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                {project._count.vendors}
              </span>
            ) : null}
          </button>
          <button
            onClick={() => setActiveTab('procurement')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'procurement'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Procurement
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'documents'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Documents
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
              {project.description ? (
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Description</h2>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{project.description}</p>
                </div>
              ) : null}

              {/* Location */}
              {(project.location || project.address || project.city || project.state || project.country) ? (
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Location</h2>
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                    <div className="text-gray-700 dark:text-gray-300">
                      {project.location && <p className="font-medium">{project.location}</p>}
                      {project.address && <p>{project.address}</p>}
                      {(project.city || project.state) && (
                        <p>
                          {project.city}{project.city && project.state ? ', ' : ''}{project.state}
                        </p>
                      )}
                      {project.country && <p>{project.country}</p>}
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          )}

          {/* Work Orders Tab */}
          {activeTab === 'workorders' && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Work Orders</h2>
                <Link
                  href={`/work-orders/new?projectId=${project.id}`}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center space-x-1"
                >
                  <span>Create Work Order</span>
                </Link>
              </div>
              {project._count?.workOrders ? (
                <p className="text-gray-600 dark:text-gray-400">{project._count.workOrders} work orders</p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No work orders yet</p>
              )}
            </div>
          )}

          {/* Vendors Tab */}
          {activeTab === 'vendors' && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Vendors</h2>
                <Link
                  href={`/projects/${project.id}/vendors/add`}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center space-x-1"
                >
                  <span>Add Vendor</span>
                </Link>
              </div>
              {project._count?.vendors ? (
                <p className="text-gray-600 dark:text-gray-400">{project._count.vendors} vendors assigned</p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No vendors assigned yet</p>
              )}
            </div>
          )}

          {/* Procurement Tab */}
          {activeTab === 'procurement' && (
            <div className="space-y-6">
              {/* Purchase Orders */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Purchase Orders</h2>
                  </div>
                  {project._count?.purchaseOrders ? (
                    <span className="text-sm text-gray-600 dark:text-gray-400">{project._count.purchaseOrders} POs</span>
                  ) : null}
                </div>
                {!project._count?.purchaseOrders && (
                  <p className="text-gray-500 dark:text-gray-400">No purchase orders yet</p>
                )}
              </div>

              {/* Contracts */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <FileCheck className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Contracts</h2>
                  </div>
                  {project._count?.contracts ? (
                    <span className="text-sm text-gray-600 dark:text-gray-400">{project._count.contracts} contracts</span>
                  ) : null}
                </div>
                {!project._count?.contracts && (
                  <p className="text-gray-500 dark:text-gray-400">No contracts yet</p>
                )}
              </div>

              {/* RFQs */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">RFQs</h2>
                  </div>
                  {project._count?.rfqs ? (
                    <span className="text-sm text-gray-600 dark:text-gray-400">{project._count.rfqs} RFQs</span>
                  ) : null}
                </div>
                {!project._count?.rfqs && (
                  <p className="text-gray-500 dark:text-gray-400">No RFQs yet</p>
                )}
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Documents</h2>
              <p className="text-gray-500 dark:text-gray-400">No documents uploaded yet</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Information */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Project Information</h2>
            </div>
            <div className="p-6">
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-500 dark:text-gray-400">Project #</dt>
                  <dd className="text-sm font-mono text-gray-900 dark:text-gray-100">{project.projectNumber}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-500 dark:text-gray-400">Status</dt>
                  <dd className="text-sm">{getStatusBadge(project.status)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-500 dark:text-gray-400">Priority</dt>
                  <dd className="text-sm">{getPriorityBadge(project.priority)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-500 dark:text-gray-400">Created By</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100">{project.createdBy?.name || project.createdBy?.email || 'Unknown'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-500 dark:text-gray-400">Created On</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100">{new Date(project.createdAt).toLocaleDateString()}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                <Link
                  href={`/work-orders/new?projectId=${project.id}`}
                  className="flex items-center space-x-2 p-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg w-full"
                >
                  <FileText size={16} />
                  <span>Create Work Order</span>
                </Link>
                <Link
                  href={`/procurement/rfqs/new?projectId=${project.id}`}
                  className="flex items-center space-x-2 p-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg w-full"
                >
                  <MessageSquare size={16} />
                  <span>Create RFQ</span>
                </Link>
                <Link
                  href={`/procurement/purchase-orders/new?projectId=${project.id}`}
                  className="flex items-center space-x-2 p-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg w-full"
                >
                  <ShoppingCart size={16} />
                  <span>Create Purchase Order</span>
                </Link>
                <Link
                  href={`/projects/${project.id}/vendors/add`}
                  className="flex items-center space-x-2 p-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg w-full"
                >
                  <Users size={16} />
                  <span>Assign Vendor</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Summary</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Work Orders</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{project._count?.workOrders || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Vendors</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{project._count?.vendors || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Purchase Orders</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{project._count?.purchaseOrders || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Contracts</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{project._count?.contracts || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}