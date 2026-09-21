'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  Database,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Eye,
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
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import Link from 'next/link'

interface Resource {
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
  hourlyRate: number | null
  dailyRate: number | null
  purchaseCost: number | null
  createdBy: {
    id: string
    name: string | null
    email: string
  }
  _count?: {
    assignments: number
  }
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchResources = async () => {
    setLoading(true)
    try {
      const response = await api.getResources()
      if (response.success) {
        setResources(response.data)
      } else {
        setError('Failed to load resources')
      }
    } catch (err) {
      setError('Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResources()
  }, [])

  const handleDeleteResource = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this resource?')) {
      return
    }

    try {
      const response = await api.deleteResource(id)
      if (response.success) {
        setResources(resources.filter(r => r.id !== id))
      }
    } catch (err) {
      alert('Failed to delete resource')
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
      available: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      in_use: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      maintenance: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
      damaged: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
      retired: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || colors.available}`}>
        {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </span>
    )
  }

  const getResourceTypes = () => {
    const types = resources.map(r => r.type)
    return ['all', ...new Set(types)]
  }

  const filteredResources = resources.filter(resource => {
    const matchesSearch = 
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.location?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === 'all' || resource.type === typeFilter
    const matchesStatus = statusFilter === 'all' || resource.status === statusFilter
    
    return matchesSearch && matchesType && matchesStatus
  })

  const stats = {
    total: resources.length,
    available: resources.filter(r => r.status === 'available').length,
    inUse: resources.filter(r => r.status === 'in_use').length,
    maintenance: resources.filter(r => r.status === 'maintenance').length,
    totalValue: resources.reduce((sum, r) => sum + (r.purchaseCost || 0), 0)
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

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Resources</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage equipment, tools, vehicles and personnel</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchResources}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <Link
            href="/resources/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Add Resource</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Resources</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Available</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.available}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">In Use</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.inUse}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Maintenance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.maintenance}</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Wrench className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                ${stats.totalValue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search by name, serial #, model, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Types</option>
              <option value="equipment">Equipment</option>
              <option value="vehicle">Vehicle</option>
              <option value="tool">Tool</option>
              <option value="personnel">Personnel</option>
              <option value="machinery">Machinery</option>
              <option value="other">Other</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="in_use">In Use</option>
              <option value="maintenance">Maintenance</option>
              <option value="damaged">Damaged</option>
              <option value="retired">Retired</option>
            </select>
            <button className="p-2 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <Filter size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      {resources.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center">
          <Database className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No resources yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Add your first resource to start tracking.</p>
          <Link
            href="/resources/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Add Resource</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => {
            const Icon = getResourceIcon(resource.type)
            return (
              <Link
                key={resource.id}
                href={`/resources/${resource.id}`}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{resource.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {resource.serialNumber || resource.model || resource.id.slice(-6).toUpperCase()}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(resource.status)}
                </div>

                <div className="space-y-2 mb-4">
                  {resource.type && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="capitalize">{resource.type}</span>
                      {resource.category && <span className="mx-1">•</span>}
                      {resource.category && <span className="capitalize">{resource.category}</span>}
                    </div>
                  )}
                  
                  {resource.location && (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <MapPin size={14} className="mr-1" />
                      {resource.location}
                    </div>
                  )}

                  {resource.nextMaintenance && (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Calendar size={14} className="mr-1" />
                      Next: {new Date(resource.nextMaintenance).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Assignments:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {resource._count?.assignments || 0}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {resource.hourlyRate && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ${resource.hourlyRate}/hr
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 mt-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <Link
                    href={`/resources/${resource.id}`}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Eye size={16} />
                  </Link>
                  <Link
                    href={`/resources/${resource.id}/edit`}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Edit size={16} />
                  </Link>
                  <button
                    onClick={(e) => handleDeleteResource(resource.id, e)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </MainLayout>
  )
}