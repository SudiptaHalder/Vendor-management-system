'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  ArrowLeft,
  ClipboardList,
  Save,
  X,
  AlertCircle,
  Calendar,
  DollarSign,
  Building2,
  User,
  FileText,
  Loader2,
  MapPin,
  Phone
} from 'lucide-react'
import Link from 'next/link'

interface Project {
  id: string
  projectNumber: string
  name: string
}

interface Vendor {
  id: string
  name: string
  email: string | null
}

interface User {
  id: string
  name: string | null
  email: string
}

interface WorkOrder {
  id: string
  workOrderNumber: string
  title: string
  description: string | null
  projectId: string | null
  vendorId: string
  assignedToId: string | null
  type: string
  priority: string
  status: string
  scheduledDate: string | null
  dueDate: string | null
  estimatedHours: number | null
  estimatedCost: number | null
  currency: string
  location: string | null
  siteContact: string | null
  sitePhone: string | null
}

export default function EditWorkOrderPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  const [projects, setProjects] = useState<Project[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    vendorId: '',
    assignedToId: '',
    type: 'maintenance',
    priority: 'medium',
    status: 'pending',
    scheduledDate: '',
    dueDate: '',
    estimatedHours: '',
    estimatedCost: '',
    currency: 'USD',
    location: '',
    siteContact: '',
    sitePhone: ''
  })

  useEffect(() => {
    fetchWorkOrder()
    fetchData()
  }, [params.id])

  const fetchWorkOrder = async () => {
    setLoading(true)
    try {
      const response = await api.getWorkOrder(params.id as string)
      if (response.success) {
        const wo = response.data
        
        // Format dates for input fields
        const formatDate = (dateString: string | null) => {
          if (!dateString) return ''
          const date = new Date(dateString)
          return date.toISOString().slice(0, 16)
        }

        setFormData({
          title: wo.title || '',
          description: wo.description || '',
          projectId: wo.projectId || '',
          vendorId: wo.vendorId || '',
          assignedToId: wo.assignedToId || '',
          type: wo.type || 'maintenance',
          priority: wo.priority || 'medium',
          status: wo.status || 'pending',
          scheduledDate: formatDate(wo.scheduledDate),
          dueDate: formatDate(wo.dueDate),
          estimatedHours: wo.estimatedHours?.toString() || '',
          estimatedCost: wo.estimatedCost?.toString() || '',
          currency: wo.currency || 'USD',
          location: wo.location || '',
          siteContact: wo.siteContact || '',
          sitePhone: wo.sitePhone || ''
        })
      } else {
        setError('Failed to load work order')
      }
    } catch (err) {
      setError('Failed to load work order')
    } finally {
      setLoading(false)
    }
  }

  const fetchData = async () => {
    setLoadingData(true)
    try {
      // Fetch projects
      const projectsRes = await api.getProjects()
      if (projectsRes.success) {
        setProjects(projectsRes.data)
      }

      // Fetch vendors
      const vendorsRes = await api.getVendors()
      if (vendorsRes.success) {
        setVendors(vendorsRes.data.filter((v: any) => v.status === 'active'))
      }

      // Fetch users
      const usersRes = await api.getUsers()
      if (usersRes.success) {
        setUsers(usersRes.data)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoadingData(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required')
      return false
    }
    if (!formData.vendorId) {
      setError('Vendor is required')
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
      const workOrderData = {
        title: formData.title,
        description: formData.description || null,
        projectId: formData.projectId || null,
        vendorId: formData.vendorId,
        assignedToId: formData.assignedToId || null,
        type: formData.type,
        priority: formData.priority,
        status: formData.status,
        scheduledDate: formData.scheduledDate || null,
        dueDate: formData.dueDate || null,
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
        estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : null,
        currency: formData.currency,
        location: formData.location || null,
        siteContact: formData.siteContact || null,
        sitePhone: formData.sitePhone || null
      }

      const response = await api.updateWorkOrder(params.id as string, workOrderData)
      
      if (response.success) {
        router.push(`/work-orders/${params.id}`)
      } else {
        setError(response.error || 'Failed to update work order')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update work order')
    } finally {
      setSaving(false)
    }
  }

  if (loading || loadingData) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
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
          <Link href={`/work-orders/${params.id}`} className="hover:text-blue-600">
            {params.id}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Edit</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href={`/work-orders/${params.id}`}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Work Order</h1>
              <p className="text-sm text-gray-500 mt-1">Update work order details</p>
            </div>
          </div>
          <Link
            href={`/work-orders/${params.id}`}
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
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
              />
            </div>

            {/* Project and Vendor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project
                </label>
                <select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">No Project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.projectNumber} - {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor <span className="text-red-500">*</span>
                </label>
                <select
                  name="vendorId"
                  value={formData.vendorId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                >
                  <option value="">Select Vendor</option>
                  {vendors.map(vendor => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Type, Priority, Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Order Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="maintenance">Maintenance</option>
                  <option value="repair">Repair</option>
                  <option value="installation">Installation</option>
                  <option value="inspection">Inspection</option>
                  <option value="service">Service</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scheduled Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="datetime-local"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="datetime-local"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Assignment */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Assignment</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign To (Internal)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <select
                  name="assignedToId"
                  value={formData.assignedToId}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">Unassigned</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="e.g., Building A, Floor 3"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site Contact
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="siteContact"
                    value={formData.siteContact}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Contact person"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="sitePhone"
                    value={formData.sitePhone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Contact phone"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Estimates */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cost Estimates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Hours
              </label>
              <input
                type="number"
                name="estimatedHours"
                value={formData.estimatedHours}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="0"
                step="0.5"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Cost
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="estimatedCost"
                  value={formData.estimatedCost}
                  onChange={handleChange}
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
                <option value="CAD">CAD</option>
                <option value="AUD">AUD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <Link
            href={`/work-orders/${params.id}`}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </MainLayout>
  )
}