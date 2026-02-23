'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  ArrowLeft,
  Calendar,
  Save,
  X,
  AlertCircle,
  Building2,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

interface Project {
  id: string
  projectNumber: string
  name: string
}

export default function NewSchedulePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    projectId: '',
    type: 'project',
    status: 'active',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  })

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setLoadingProjects(true)
    try {
      const response = await api.getProjects()
      if (response.success) {
        setProjects(response.data)
      }
    } catch (err) {
      console.error('Error fetching projects:', err)
    } finally {
      setLoadingProjects(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Schedule name is required')
      return false
    }
    if (!formData.startDate) {
      setError('Start date is required')
      return false
    }
    if (formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
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
      const scheduleData = {
        name: formData.name,
        description: formData.description || null,
        projectId: formData.projectId || null,
        type: formData.type,
        status: formData.status,
        startDate: formData.startDate,
        endDate: formData.endDate || null
      }

      const response = await api.createSchedule(scheduleData)
      
      if (response.success) {
        router.push(`/schedules/${response.data.id}`)
      } else {
        setError(response.error || 'Failed to create schedule')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create schedule')
    } finally {
      setSaving(false)
    }
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 text-sm text-gray-500 mb-4">
          <Link href="/schedules" className="hover:text-blue-600">
            Schedules
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">New Schedule</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/schedules"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Schedule</h1>
              <p className="text-sm text-gray-500 mt-1">Plan and organize project timelines</p>
            </div>
          </div>
          <Link
            href="/schedules"
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule Information</h2>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schedule Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="e.g., Construction Phase 1"
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
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
                placeholder="Describe the schedule purpose..."
              />
            </div>

            {/* Project */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">No Project</option>
                  {loadingProjects ? (
                    <option disabled>Loading projects...</option>
                  ) : (
                    projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.projectNumber} - {project.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Type and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Schedule Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="project">Project Schedule</option>
                  <option value="milestone">Milestone</option>
                  <option value="task">Task List</option>
                  <option value="resource">Resource Schedule</option>
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
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule Timeline</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <Link
            href="/schedules"
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
            <span>{saving ? 'Creating...' : 'Create Schedule'}</span>
          </button>
        </div>
      </form>
    </MainLayout>
  )
}