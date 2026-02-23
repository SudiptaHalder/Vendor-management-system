'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  Shield,
  Plus,
  RefreshCw,
  Search,
  Eye,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  MoreVertical,
  Users,
  Settings,
  FileText,
  DollarSign,
  FolderOpen,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'

interface Role {
  id: string
  name: string
  description: string | null
  isSystem: boolean
  userCount?: number
  permissions: Permission[]
}

interface Permission {
  id: string
  name: string
  module: string
  action: string
  description: string | null
}

export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const fetchRoles = async () => {
    setLoading(true)
    try {
      // You'll need to implement these API methods
      // const response = await api.getRoles()
      // if (response.success) {
      //   setRoles(response.data)
      // }
      
      // Mock data for now
      setRoles([
        {
          id: '1',
          name: 'Super Admin',
          description: 'Full system access with all permissions',
          isSystem: true,
          userCount: 2,
          permissions: []
        },
        {
          id: '2',
          name: 'Admin',
          description: 'Administrative access with most permissions',
          isSystem: true,
          userCount: 5,
          permissions: []
        },
        {
          id: '3',
          name: 'Manager',
          description: 'Manage projects and vendors',
          isSystem: false,
          userCount: 12,
          permissions: []
        },
        {
          id: '4',
          name: 'Member',
          description: 'Basic access for team members',
          isSystem: true,
          userCount: 28,
          permissions: []
        },
        {
          id: '5',
          name: 'Finance',
          description: 'Access to financial modules only',
          isSystem: false,
          userCount: 4,
          permissions: []
        }
      ])
    } catch (err) {
      console.error('Error fetching roles:', err)
      setError('Failed to load roles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  const handleDeleteRole = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this role?')) {
      return
    }

    try {
      // Implement delete API
      alert('Delete functionality to be implemented')
    } catch (err) {
      alert('Failed to delete role')
    }
  }

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const modules = [
    { name: 'Dashboard', icon: BarChart3 },
    { name: 'Vendors', icon: Users },
    { name: 'Procurement', icon: FileText },
    { name: 'Projects', icon: FolderOpen },
    { name: 'Finance', icon: DollarSign },
    { name: 'Settings', icon: Settings }
  ]

  const actions = ['view', 'create', 'edit', 'delete', 'approve', 'export']

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
          <Link href="/settings" className="hover:text-blue-600">
            Settings
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Roles & Permissions</span>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
            <p className="text-gray-600 mt-1">Manage user roles and access permissions</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchRoles}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus size={18} />
              <span>Create Role</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <h2 className="font-medium text-gray-700">All Roles</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {filteredRoles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                    selectedRole?.id === role.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{role.name}</span>
                        {role.isSystem && (
                          <span className="px-1.5 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">
                            System
                          </span>
                        )}
                      </div>
                      {role.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{role.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className="text-xs text-gray-500">{role.userCount || 0} users</span>
                      {!role.isSystem && (
                        <button
                          onClick={(e) => handleDeleteRole(role.id, e)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Permissions Matrix */}
        <div className="lg:col-span-2">
          {selectedRole ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{selectedRole.name}</h2>
                    {selectedRole.description && (
                      <p className="text-sm text-gray-600 mt-1">{selectedRole.description}</p>
                    )}
                  </div>
                  {!selectedRole.isSystem && (
                    <button className="px-3 py-1.5 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
                      Edit Role
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left text-sm font-medium text-gray-500 pb-4">Module</th>
                        {actions.map((action) => (
                          <th key={action} className="text-center text-sm font-medium text-gray-500 pb-4 px-2 capitalize">
                            {action}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {modules.map((module) => {
                        const Icon = module.icon
                        return (
                          <tr key={module.name}>
                            <td className="py-3">
                              <div className="flex items-center space-x-2">
                                <Icon size={16} className="text-gray-400" />
                                <span className="text-sm font-medium text-gray-700">{module.name}</span>
                              </div>
                            </td>
                            {actions.map((action) => (
                              <td key={action} className="text-center py-3">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  disabled={selectedRole.isSystem}
                                  defaultChecked={action === 'view'} // Mock data
                                />
                              </td>
                            ))}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    {selectedRole.isSystem 
                      ? 'System roles cannot be modified'
                      : 'Changes to permissions will take effect immediately for all users with this role.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Select a role to view and manage permissions</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Role Modal (Placeholder) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Role</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Project Manager"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the role's purpose..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Role created!')
                  setShowCreateModal(false)
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Create Role
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}