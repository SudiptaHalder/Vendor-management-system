'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  ArrowLeft,
  Database,
  Edit,
  Trash2,
  Wrench,
  Tool,
  Truck,
  HardHat,
  Zap,
  Calendar,
  DollarSign,
  MapPin,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Plus,
  FileText,
  Building2
} from 'lucide-react'
import Link from 'next/link'

interface ResourceDetail {
  id: string
  name: string
  type: string
  category: string | null
  description: string | null
  status: string
  location: string | null
  model: string | null
  serialNumber: string | null
  capacity: string | null
  lastMaintenance: string | null
  nextMaintenance: string | null
  maintenanceInterval: number | null
  hourlyRate: number | null
  dailyRate: number | null
  purchaseCost: number | null
  createdBy: {
    id: string
    name: string | null
    email: string
  }
  createdAt: string
  assignments: Array<{
    id: string
    resourceId: string
    projectId: string | null
    project?: {
      id: string
      name: string
      projectNumber: string
    } | null
    workOrderId: string | null
    workOrder?: {
      id: string
      workOrderNumber: string
      title: string
    } | null
    assignedFrom: string
    assignedTo: string | null
    quantity: number
    status: string
    notes: string | null
    assignedBy: {
      id: string
      name: string | null
      email: string
    }
    assignedAt: string
  }>
}

export default function ResourceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [resource, setResource] = useState<ResourceDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAssignModal, setShowAssignModal] = useState(false)

  useEffect(() => {
    fetchResource()
  }, [params.id])

  const fetchResource = async () => {
    setLoading(true)
    try {
      const response = await api.getResource(params.id as string)
      if (response.success) {
        setResource(response.data)
      } else {
        setError('Failed to load resource')
      }
    } catch (err) {
      setError('Failed to load resource')
    } finally {
      setLoading(false)
    }
  }

 const handleDeleteResource = async () => {
  if (!confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
    return
  }

  try {
    const response = await api.deleteResource(params.id as string)
    if (response.success) {
      router.push('/resources')
    } else {
      setError('Failed to delete resource')
    }
  } catch (err) {
    setError('Failed to delete resource')
  }
}

  const getResourceIcon = (type: string) => {
    const icons: Record<string, any> = {
      equipment: Wrench,
      vehicle: Truck,
      tool: Tool,
      personnel: HardHat,
      machinery: Zap,
      other: Database
    }
    return icons[type] || Database
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-green-100 text-green-800',
      in_use: 'bg-blue-100 text-blue-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      damaged: 'bg-red-100 text-red-800',
      retired: 'bg-gray-100 text-gray-800'
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || colors.available}`}>
        {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </span>
    )
  }

  const getAssignmentStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      ended: 'bg-gray-100 text-gray-800'
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || colors.active}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
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

  if (error || !resource) {
    return (
      <MainLayout>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Resource</h3>
          <p className="text-gray-500 mb-6">{error || 'Resource not found'}</p>
          <Link
            href="/resources"
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>Back to Resources</span>
          </Link>
        </div>
      </MainLayout>
    )
  }

  const Icon = getResourceIcon(resource.type)

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 text-sm text-gray-500 mb-4">
          <Link href="/resources" className="hover:text-blue-600">
            Resources
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{resource.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start space-x-4">
            <Link
              href="/resources"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Icon className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center flex-wrap gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{resource.name}</h1>
                  {getStatusBadge(resource.status)}
                </div>
                <p className="text-sm text-gray-500 font-mono">
                  {resource.serialNumber || resource.id.slice(-6).toUpperCase()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link
              href={`/resources/${resource.id}/assign`}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Assign</span>
            </Link>
            <Link
              href={`/resources/${resource.id}/edit`}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <Edit size={16} />
              <span>Edit</span>
            </Link>
            <button
              onClick={handleDeleteResource}
              className="px-4 py-2 text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 flex items-center space-x-2"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Resource Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {resource.description && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{resource.description}</p>
            </div>
          )}

          {/* Specifications */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h2>
            <div className="grid grid-cols-2 gap-4">
              {resource.type && (
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{resource.type}</p>
                </div>
              )}
              {resource.category && (
                <div>
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="text-sm font-medium text-gray-900">{resource.category}</p>
                </div>
              )}
              {resource.model && (
                <div>
                  <p className="text-xs text-gray-500">Model</p>
                  <p className="text-sm font-medium text-gray-900">{resource.model}</p>
                </div>
              )}
              {resource.serialNumber && (
                <div>
                  <p className="text-xs text-gray-500">Serial Number</p>
                  <p className="text-sm font-medium text-gray-900">{resource.serialNumber}</p>
                </div>
              )}
              {resource.capacity && (
                <div>
                  <p className="text-xs text-gray-500">Capacity</p>
                  <p className="text-sm font-medium text-gray-900">{resource.capacity}</p>
                </div>
              )}
              {resource.location && (
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-sm font-medium text-gray-900">{resource.location}</p>
                </div>
              )}
            </div>
          </div>

          {/* Current Assignments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Current Assignments</h2>
              <Link
                href={`/resources/${resource.id}/assign`}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <Plus size={14} />
                <span>New Assignment</span>
              </Link>
            </div>
            {resource.assignments.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">No active assignments</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {resource.assignments.filter(a => a.status === 'active').map((assignment) => (
                  <div key={assignment.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          {assignment.project && (
                            <Link
                              href={`/projects/${assignment.project.id}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
                            >
                              <Building2 size={14} className="mr-1" />
                              {assignment.project.projectNumber}
                            </Link>
                          )}
                          {assignment.workOrder && (
                            <Link
                              href={`/work-orders/${assignment.workOrder.id}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
                            >
                              <FileText size={14} className="mr-1" />
                              {assignment.workOrder.workOrderNumber}
                            </Link>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            From: {new Date(assignment.assignedFrom).toLocaleDateString()}
                          </span>
                          {assignment.assignedTo && (
                            <span className="flex items-center">
                              <Calendar size={14} className="mr-1" />
                              To: {new Date(assignment.assignedTo).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {assignment.notes && (
                          <p className="text-sm text-gray-500 mt-2">{assignment.notes}</p>
                        )}
                      </div>
                      {getAssignmentStatusBadge(assignment.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status & Availability</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Status</span>
                {getStatusBadge(resource.status)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Assignments</span>
                <span className="text-sm font-medium text-gray-900">{resource.assignments.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Assignments</span>
                <span className="text-sm font-medium text-gray-900">
                  {resource.assignments.filter(a => a.status === 'active').length}
                </span>
              </div>
            </div>
          </div>

          {/* Cost Information */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Cost Information</h2>
            <div className="space-y-3">
              {resource.hourlyRate && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Hourly Rate</span>
                  <span className="text-sm font-medium text-gray-900">${resource.hourlyRate}/hr</span>
                </div>
              )}
              {resource.dailyRate && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Daily Rate</span>
                  <span className="text-sm font-medium text-gray-900">${resource.dailyRate}/day</span>
                </div>
              )}
              {resource.purchaseCost && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Purchase Cost</span>
                  <span className="text-sm font-medium text-gray-900">${resource.purchaseCost.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Maintenance Schedule */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Maintenance</h2>
            <div className="space-y-3">
              {resource.lastMaintenance && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Maintenance</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(resource.lastMaintenance).toLocaleDateString()}
                  </span>
                </div>
              )}
              {resource.nextMaintenance && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Next Maintenance</span>
                  <span className={`text-sm font-medium ${
                    new Date(resource.nextMaintenance) < new Date() 
                      ? 'text-red-600' 
                      : 'text-gray-900'
                  }`}>
                    {new Date(resource.nextMaintenance).toLocaleDateString()}
                  </span>
                </div>
              )}
              {resource.maintenanceInterval && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Interval</span>
                  <span className="text-sm font-medium text-gray-900">{resource.maintenanceInterval} days</span>
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resource Info</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Created By</span>
                <span className="text-sm text-gray-900">{resource.createdBy.name || resource.createdBy.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Created On</span>
                <span className="text-sm text-gray-900">{new Date(resource.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}