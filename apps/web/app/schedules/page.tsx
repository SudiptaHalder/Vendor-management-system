'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  Calendar,
  Plus,
  RefreshCw,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Building2,
  User,
  Loader2,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

interface Schedule {
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
  _count?: {
    items: number
  }
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchSchedules = async () => {
    setLoading(true)
    try {
      const response = await api.getSchedules()
      if (response.success) {
        setSchedules(response.data)
      } else {
        setError('Failed to load schedules')
      }
    } catch (err) {
      setError('Failed to load schedules')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedules()
  }, [])

  const handleDeleteSchedule = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this schedule?')) {
      return
    }

    try {
      const response = await api.deleteSchedule(id)
      if (response.success) {
        setSchedules(schedules.filter(s => s.id !== id))
      }
    } catch (err) {
      alert('Failed to delete schedule')
    }
  }

  const getDisplayId = (schedule: Schedule) => {
    if (schedule.scheduleNumber) {
      return schedule.scheduleNumber
    }
    return `SCH-${schedule.id.slice(-6).toUpperCase()}`
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800'
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || colors.draft}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const filteredSchedules = schedules.filter(schedule => 
    schedule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (schedule.scheduleNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.project?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: schedules.length,
    active: schedules.filter(s => s.status === 'active').length,
    completed: schedules.filter(s => s.status === 'completed').length,
    totalEvents: schedules.reduce((sum, s) => sum + (s._count?.items || 0), 0)
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedules</h1>
          <p className="text-gray-600 mt-1">Manage project timelines and events</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchSchedules}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <Link
            href="/schedules/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>New Schedule</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Schedules</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completed}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Events</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalEvents}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search schedules by name, ID, or project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
          />
        </div>
      </div>

      {/* Schedules Table */}
      {schedules.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No schedules yet</h3>
          <p className="text-gray-500 mb-6">Create your first schedule to start planning.</p>
          <Link
            href="/schedules/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Create Schedule</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Events</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSchedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono font-medium text-gray-900">
                        {getDisplayId(schedule)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{schedule.name}</div>
                      {schedule.description && (
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {schedule.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {schedule.project ? (
                        <Link 
                          href={`/projects/${schedule.project.id}`}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          {schedule.project.projectNumber}
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(schedule.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(schedule.startDate).toLocaleDateString()}
                      </div>
                      {schedule.endDate && (
                        <div className="text-xs text-gray-500">
                          to {new Date(schedule.endDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {schedule._count?.items || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User size={14} className="text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">
                          {schedule.createdBy.name || schedule.createdBy.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/schedules/${schedule.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Eye size={18} />
                        </Link>
                        <button
                          onClick={(e) => handleDeleteSchedule(schedule.id, e)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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