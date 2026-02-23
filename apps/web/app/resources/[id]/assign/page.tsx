'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  ArrowLeft,
  Calendar,
  Save,
  X,
  AlertCircle,
  Building2,
  FileText,
  User,
  Loader2,
  Clock
} from 'lucide-react'
import Link from 'next/link'

interface Project {
  id: string
  projectNumber: string
  name: string
}

interface WorkOrder {
  id: string
  workOrderNumber: string
  title: string
}

interface Resource {
  id: string
  name: string
  type: string
  status: string
}

export default function AssignResourcePage() {
  const params = useParams()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [resource, setResource] = useState<Resource | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [assignmentType, setAssignmentType] = useState<'project' | 'workorder'>('project')

  const [formData, setFormData] = useState({
    projectId: '',
    workOrderId: '',
    assignedFrom: new Date().toISOString().split('T')[0],
    assignedTo: '',
    quantity: 1,
    notes: '',
    status: 'active'
  })

  useEffect(() => {
    fetchData()
  }, [params.id])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch resource details
      const resourceRes = await api.getResource(params.id as string)
      if (resourceRes.success) {
        setResource(resourceRes.data)
      }

      // Fetch projects
      const projectsRes = await api.getProjects()
      if (projectsRes.success) {
        setProjects(projectsRes.data)
      }

      // Fetch work orders
      const workOrdersRes = await api.getWorkOrders()
      if (workOrdersRes.success) {
        setWorkOrders(workOrdersRes.data)
      }

    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (assignmentType === 'project' && !formData.projectId) {
      setError('Please select a project')
      return false
    }
    if (assignmentType === 'workorder' && !formData.workOrderId) {
      setError('Please select a work order')
      return false
    }
    if (!formData.assignedFrom) {
      setError('Start date is required')
      return false
    }
    if (formData.assignedTo && new Date(formData.assignedFrom) > new Date(formData.assignedTo)) {
      setError('End date must be after start date')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSaving(true)
    setError('')

    try {
      const assignmentData = {
        resourceId: params.id as string,
        projectId: assignmentType === 'project' ? formData.projectId : null,
        workOrderId: assignmentType === 'workorder' ? formData.workOrderId : null,
        assignedFrom: formData.assignedFrom,
        assignedTo: formData.assignedTo || null,
        quantity: formData.quantity,
        notes: formData.notes || null,
        status: 'active'
      }

      const response = await api.assignResource(assignmentData)
      
      if (response.success) {
        router.push(`/resources/${params.id}`)
      } else {
        setError(response.error || 'Failed to assign resource')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to assign resource')
    } finally {
      setSaving(false)
    }
  }

  const getDisplayId = (resource: Resource) => {
    return resource.id.slice(-6).toUpperCase()
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

  if (!resource) {
    return (
      <MainLayout>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Resource not found</h3>
          <Link
            href="/resources"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Back to Resources
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
          <Link href="/resources" className="hover:text-blue-600">
            Resources
          </Link>
          <span>/</span>
          <Link href={`/resources/${params.id}`} className="hover:text-blue-600">
            {resource.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Assign</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href={`/resources/${params.id}`}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Assign Resource</h1>
              <p className="text-sm text-gray-500 mt-1">
                {resource.name} - {getDisplayId(resource)}
              </p>
            </div>
          </div>
          <Link
            href={`/resources/${params.id}`}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <X size={16} />
            <span>Cancel</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center space-x-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Assignment Type */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Assignment Type</h2>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setAssignmentType('project')}
              className={`flex-1 p-4 border rounded-lg flex items-center justify-center space-x-2 ${
                assignmentType === 'project'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Building2 size={20} />
              <span className="font-medium">Assign to Project</span>
            </button>
            <button
              type="button"
              onClick={() => setAssignmentType('workorder')}
              className={`flex-1 p-4 border rounded-lg flex items-center justify-center space-x-2 ${
                assignmentType === 'workorder'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <FileText size={20} />
              <span className="font-medium">Assign to Work Order</span>
            </button>
          </div>
        </div>

        {/* Assignment Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Assignment Details</h2>
          <div className="space-y-4">
            {/* Project Selection */}
            {assignmentType === 'project' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Project <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <select
                    name="projectId"
                    value={formData.projectId}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required={assignmentType === 'project'}
                  >
                    <option value="">Select a project...</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.projectNumber} - {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Work Order Selection */}
            {assignmentType === 'workorder' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Work Order <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <select
                    name="workOrderId"
                    value={formData.workOrderId}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required={assignmentType === 'workorder'}
                  >
                    <option value="">Select a work order...</option>
                    {workOrders.map(wo => (
                      <option key={wo.id} value={wo.id}>
                        {wo.workOrderNumber} - {wo.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    name="assignedFrom"
                    value={formData.assignedFrom}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date (Optional)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">
                Default is 1. Increase if assigning multiple units of this resource.
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assignment Notes
              </label>
              <textarea
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
                placeholder="Add any notes about this assignment..."
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <Link
            href={`/resources/${params.id}`}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{saving ? 'Assigning...' : 'Assign Resource'}</span>
          </button>
        </div>
      </form>
    </MainLayout>
  )
}