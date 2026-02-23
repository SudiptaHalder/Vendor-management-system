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
  Clock,
  MapPin,
  User,
  FileText,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

interface WorkOrder {
  id: string
  workOrderNumber: string
  title: string
}

interface User {
  id: string
  name: string | null
  email: string
}

interface Schedule {
  id: string
  name: string
  scheduleNumber: string | null
}

export default function NewScheduleItemPage() {
  const params = useParams()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    workOrderId: '',
    assignedToId: '',
    startTime: '',
    endTime: '',
    isAllDay: false,
    location: '',
    status: 'scheduled'
  })

  useEffect(() => {
    fetchData()
  }, [params.id])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch schedule details
      const scheduleRes = await api.getSchedule(params.id as string)
      if (scheduleRes.success) {
        setSchedule(scheduleRes.data)
      }

      // Fetch work orders
      const workOrdersRes = await api.getWorkOrders()
      if (workOrdersRes.success) {
        setWorkOrders(workOrdersRes.data)
      }

      // Fetch users for assignment
      const usersRes = await api.getUsers()
      if (usersRes.success) {
        setUsers(usersRes.data)
      }

      // Set default start time to now, end time to +1 hour
      const now = new Date()
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
      
      setFormData(prev => ({
        ...prev,
        startTime: now.toISOString().slice(0, 16),
        endTime: oneHourLater.toISOString().slice(0, 16)
      }))

    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required')
      return false
    }
    if (!formData.startTime) {
      setError('Start time is required')
      return false
    }
    if (!formData.endTime) {
      setError('End time is required')
      return false
    }
    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      setError('End time must be after start time')
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
      const itemData = {
        title: formData.title,
        description: formData.description || null,
        workOrderId: formData.workOrderId || null,
        assignedToId: formData.assignedToId || null,
        startTime: formData.startTime,
        endTime: formData.endTime,
        isAllDay: formData.isAllDay,
        location: formData.location || null,
        status: formData.status
      }

      const response = await api.createScheduleItem(params.id as string, itemData)
      
      if (response.success) {
        router.push(`/schedules/${params.id}`)
      } else {
        setError(response.error || 'Failed to create event')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create event')
    } finally {
      setSaving(false)
    }
  }

  const getDisplayId = (schedule: Schedule) => {
    if (schedule.scheduleNumber) {
      return schedule.scheduleNumber
    }
    return `SCH-${schedule.id.slice(-6).toUpperCase()}`
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

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 text-sm text-gray-500 mb-4">
          <Link href="/schedules" className="hover:text-blue-600">
            Schedules
          </Link>
          <span>/</span>
          <Link href={`/schedules/${params.id}`} className="hover:text-blue-600">
            {schedule ? getDisplayId(schedule) : params.id}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Add Event</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href={`/schedules/${params.id}`}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add Schedule Event</h1>
              <p className="text-sm text-gray-500 mt-1">
                {schedule?.name} - {schedule ? getDisplayId(schedule) : ''}
              </p>
            </div>
          </div>
          <Link
            href={`/schedules/${params.id}`}
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h2>
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="e.g., Site Inspection, Meeting, Task"
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
                placeholder="Detailed description of the event..."
              />
            </div>

            {/* All Day Toggle */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="isAllDay"
                id="isAllDay"
                checked={formData.isAllDay}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isAllDay" className="text-sm text-gray-700">
                All day event
              </label>
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Date & Time</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                  disabled={formData.isAllDay}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                  disabled={formData.isAllDay}
                />
              </div>
            </div>
          </div>
          {formData.isAllDay && (
            <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
              <Calendar size={16} className="inline mr-1" />
              All day event - time will be shown as "All Day"
            </div>
          )}
        </div>

        {/* Location & Assignment */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Location & Assignment</h2>
          <div className="space-y-4">
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
                  placeholder="e.g., Meeting Room A, Site Location"
                />
              </div>
            </div>

            {/* Assign To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign To
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

            {/* Link to Work Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link to Work Order
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <select
                  name="workOrderId"
                  value={formData.workOrderId}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">No Work Order</option>
                  {workOrders.map(wo => (
                    <option key={wo.id} value={wo.id}>
                      {wo.workOrderNumber} - {wo.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status */}
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
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <Link
            href={`/schedules/${params.id}`}
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
            <span>{saving ? 'Creating...' : 'Create Event'}</span>
          </button>
        </div>
      </form>
    </MainLayout>
  )
}