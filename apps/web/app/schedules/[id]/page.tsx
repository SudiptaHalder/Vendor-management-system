'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Building2,
  User,
  FileText,
  MapPin,
  Loader2,
  AlertCircle,
  Plus
} from 'lucide-react'
import Link from 'next/link'

interface ScheduleDetail {
  id: string
  scheduleNumber: string | null
  name: string
  description: string | null
  type: string
  status: string
  startDate: string
  endDate: string | null
  projectId: string | null
  project?: {
    id: string
    name: string
    projectNumber: string
  } | null
  createdBy: {
    id: string
    name: string | null
    email: string
  }
  createdAt: string
  items: Array<{
    id: string
    title: string
    description: string | null
    startTime: string
    endTime: string
    isAllDay: boolean
    location: string | null
    status: string
    workOrderId: string | null
    workOrder?: {
      id: string
      workOrderNumber: string
      title: string
      status: string
    } | null
    assignedToId: string | null
    assignedTo?: {
      id: string
      name: string | null
      email: string
    } | null
  }>
}

export default function ScheduleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [schedule, setSchedule] = useState<ScheduleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (params.id) {
      fetchSchedule()
    }
  }, [params.id])

  const fetchSchedule = async () => {
    setLoading(true)
    setError('')
    try {
      console.log('Fetching schedule with ID:', params.id)
      const response = await api.getSchedule(params.id as string)
      
      if (response.success) {
        setSchedule(response.data)
      } else {
        setError(response.error || 'Failed to load schedule')
      }
    } catch (err: any) {
      console.error('Error fetching schedule:', err)
      setError(err.message || 'Failed to load schedule')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSchedule = async () => {
    if (!confirm('Are you sure you want to delete this schedule?')) {
      return
    }

    try {
      const response = await api.deleteSchedule(params.id as string)
      if (response.success) {
        router.push('/schedules')
      }
    } catch (err) {
      setError('Failed to delete schedule')
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return
    }

    try {
      const response = await api.deleteScheduleItem(params.id as string, itemId)
      if (response.success) {
        fetchSchedule()
      }
    } catch (err) {
      alert('Failed to delete event')
    }
  }

  const getDisplayId = (schedule: ScheduleDetail) => {
    if (schedule.scheduleNumber) {
      return schedule.scheduleNumber
    }
    return `SCH-${schedule.id.slice(-6).toUpperCase()}`
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      completed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
      draft: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
      scheduled: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
      in_progress: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || colors.draft}`}>
        {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </span>
    )
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
        </div>
      </MainLayout>
    )
  }

  if (error || !schedule) {
    return (
      <MainLayout>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Error Loading Schedule</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{error || 'Schedule not found'}</p>
          <Link
            href="/schedules"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center justify-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>Back to Schedules</span>
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
          <Link href="/schedules" className="hover:text-blue-600 dark:hover:text-blue-400">
            Schedules
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">{getDisplayId(schedule)}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start space-x-4">
            <Link
              href="/schedules"
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center flex-wrap gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{schedule.name}</h1>
                {getStatusBadge(schedule.status)}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{getDisplayId(schedule)}</p>
              {schedule.project && (
                <Link 
                  href={`/projects/${schedule.project.id}`}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center space-x-1 mt-2"
                >
                  <Building2 size={14} />
                  <span>{schedule.project.projectNumber} - {schedule.project.name}</span>
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDeleteSchedule}
              className="px-4 py-2 text-red-700 dark:text-red-300 bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</p>
            <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {new Date(schedule.startDate).toLocaleDateString()}
          </p>
          {schedule.endDate && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              to {new Date(schedule.endDate).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Events</p>
            <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{schedule.items.length}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created By</p>
            <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {schedule.createdBy.name || schedule.createdBy.email}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {new Date(schedule.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Description */}
      {schedule.description && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Description</h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{schedule.description}</p>
        </div>
      )}

      {/* Schedule Events */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Schedule Events</h2>
          <Link
            href={`/schedules/${schedule.id}/items/new`}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center space-x-1"
          >
            <Plus size={16} />
            <span>Add Event</span>
          </Link>
        </div>

        {schedule.items.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No events added yet</p>
            <Link
              href={`/schedules/${schedule.id}/items/new`}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium inline-flex items-center space-x-1 mt-2"
            >
              <Plus size={14} />
              <span>Add your first event</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {schedule.items.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{item.title}</h3>
                      {getStatusBadge(item.status)}
                    </div>
                    
                    {item.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{item.description}</p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center text-gray-500 dark:text-gray-400">
                        <Clock size={14} className="mr-1" />
                        {item.isAllDay ? (
                          'All Day'
                        ) : (
                          <>
                            {new Date(item.startTime).toLocaleDateString()} {' '}
                            {new Date(item.startTime).toLocaleTimeString()} - 
                            {new Date(item.endTime).toLocaleTimeString()}
                          </>
                        )}
                      </div>
                      
                      {item.location && (
                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                          <MapPin size={14} className="mr-1" />
                          {item.location}
                        </div>
                      )}
                      
                      {item.assignedTo && (
                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                          <User size={14} className="mr-1" />
                          {item.assignedTo.name || item.assignedTo.email}
                        </div>
                      )}
                    </div>

                    {item.workOrder && (
                      <Link
                        href={`/work-orders/${item.workOrder.id}`}
                        className="inline-flex items-center space-x-1 mt-3 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        <FileText size={12} />
                        <span>Work Order: {item.workOrder.workOrderNumber}</span>
                      </Link>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1 text-red-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}