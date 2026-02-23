'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  Building2,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Clock,
  CheckCircle,
  Eye,
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface Project {
  id: string
  projectNumber: string
  name: string
  status: string
  priority: string
  startDate: string | null
  endDate: string | null
  progressPercent: number | null
  manager?: {
    name: string | null
  } | null
}

export default function ActiveProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchActiveProjects = async () => {
    setLoading(true)
    try {
      const response = await api.getProjects({ status: 'active' })
      if (response.success) {
        setProjects(response.data)
      }
    } catch (err) {
      console.error('Failed to load active projects:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActiveProjects()
  }, [])

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.projectNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[priority as keyof typeof colors] || colors.medium}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    )
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 text-sm text-gray-500 mb-4">
          <Link href="/projects" className="hover:text-blue-600">
            Projects
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Active Projects</span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Link
              href="/projects"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Active Projects</h1>
              <p className="text-gray-600 mt-1">{projects.length} projects currently in progress</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchActiveProjects}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
            <Link
              href="/projects/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus size={18} />
              <span>New Project</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search active projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading active projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No active projects</h3>
          <p className="text-gray-500 mb-6">There are no active projects at the moment.</p>
          <Link
            href="/projects/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Create Project</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-mono text-gray-500">{project.projectNumber}</p>
                  <h3 className="text-lg font-semibold text-gray-900 mt-1">{project.name}</h3>
                </div>
                {getPriorityBadge(project.priority)}
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium text-gray-900">{project.progressPercent || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${project.progressPercent || 0}%` }}
                  />
                </div>
              </div>

              {/* Timeline */}
              {project.startDate && project.endDate && (
                <div className="flex items-center text-xs text-gray-500 mb-3">
                  <Calendar size={12} className="mr-1" />
                  {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                </div>
              )}

              {/* Manager */}
              <div className="flex items-center text-xs text-gray-500">
                <Users size={12} className="mr-1" />
                {project.manager?.name || 'Unassigned'}
              </div>
            </Link>
          ))}
        </div>
      )}
    </MainLayout>
  )
}