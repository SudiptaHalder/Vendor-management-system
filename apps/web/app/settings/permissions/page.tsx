'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  Shield,
  Plus,
  RefreshCw,
  Search,
  Save,
  X,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Users,
  FileText,
  DollarSign,
  FolderOpen,
  Settings,
  Home,
  Package,
  CreditCard,
  Bell,
  BarChart3,
  CheckSquare,
  Square
} from 'lucide-react'
import Link from 'next/link'

interface Permission {
  id: string
  name: string
  module: string
  action: string
  description: string | null
  isSystem: boolean
}

interface Role {
  id: string
  name: string
  description: string | null
  isSystem: boolean
  userCount?: number
  permissions: Permission[]
}

export default function PermissionsPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set())
  const [showCreateRole, setShowCreateRole] = useState(false)
  const [showCreatePermission, setShowCreatePermission] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')
  const [newRoleDescription, setNewRoleDescription] = useState('')

  const modules = [
    { name: 'Dashboard', icon: Home, color: 'blue' },
    { name: 'Vendors', icon: Users, color: 'green' },
    { name: 'Procurement', icon: Package, color: 'purple' },
    { name: 'Projects', icon: FolderOpen, color: 'orange' },
    { name: 'Finance', icon: DollarSign, color: 'red' },
    { name: 'Documents', icon: FileText, color: 'indigo' },
    { name: 'Reports', icon: BarChart3, color: 'pink' },
    { name: 'Settings', icon: Settings, color: 'gray' }
  ]

  const actions = [
    { name: 'view', label: 'View', description: 'Can view records' },
    { name: 'create', label: 'Create', description: 'Can create new records' },
    { name: 'edit', label: 'Edit', description: 'Can edit existing records' },
    { name: 'delete', label: 'Delete', description: 'Can delete records' },
    { name: 'approve', label: 'Approve', description: 'Can approve requests' },
    { name: 'export', label: 'Export', description: 'Can export data' },
    { name: 'invite', label: 'Invite', description: 'Can invite users' },
    { name: 'manage', label: 'Manage', description: 'Full management access' }
  ]

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedRole) {
      setSelectedPermissions(new Set(selectedRole.permissions.map(p => p.id)))
    } else {
      setSelectedPermissions(new Set())
    }
  }, [selectedRole])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [rolesRes, permissionsRes] = await Promise.all([
        api.getRoles(),
        api.getPermissions()
      ])

      if (rolesRes.success) {
        setRoles(rolesRes.data)
      }
      if (permissionsRes.success) {
        setPermissions(permissionsRes.data)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSavePermissions = async () => {
    if (!selectedRole) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await api.updateRolePermissions(
        selectedRole.id,
        Array.from(selectedPermissions)
      )

      if (response.success) {
        setSuccess('Permissions updated successfully!')
        fetchData() // Refresh data
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(response.error || 'Failed to update permissions')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update permissions')
    } finally {
      setSaving(false)
    }
  }

  const togglePermission = (permissionId: string) => {
    const newSet = new Set(selectedPermissions)
    if (newSet.has(permissionId)) {
      newSet.delete(permissionId)
    } else {
      newSet.add(permissionId)
    }
    setSelectedPermissions(newSet)
  }

  const toggleModulePermissions = (module: string, action?: string) => {
    const modulePermissions = permissions.filter(p => 
      p.module.toLowerCase() === module.toLowerCase() &&
      (action ? p.action === action : true)
    )

    const newSet = new Set(selectedPermissions)
    
    if (action) {
      // Toggle specific action for module
      const allSelected = modulePermissions.every(p => newSet.has(p.id))
      if (allSelected) {
        modulePermissions.forEach(p => newSet.delete(p.id))
      } else {
        modulePermissions.forEach(p => newSet.add(p.id))
      }
    } else {
      // Toggle entire module
      const allSelected = modulePermissions.every(p => newSet.has(p.id))
      if (allSelected) {
        modulePermissions.forEach(p => newSet.delete(p.id))
      } else {
        modulePermissions.forEach(p => newSet.add(p.id))
      }
    }

    setSelectedPermissions(newSet)
  }

  const isModuleFullySelected = (module: string) => {
    const modulePermissions = permissions.filter(p => p.module.toLowerCase() === module.toLowerCase())
    return modulePermissions.length > 0 && modulePermissions.every(p => selectedPermissions.has(p.id))
  }

  const isModulePartiallySelected = (module: string) => {
    const modulePermissions = permissions.filter(p => p.module.toLowerCase() === module.toLowerCase())
    const selectedCount = modulePermissions.filter(p => selectedPermissions.has(p.id)).length
    return selectedCount > 0 && selectedCount < modulePermissions.length
  }

  const isActionSelected = (module: string, action: string) => {
    return permissions.some(p => 
      p.module.toLowerCase() === module.toLowerCase() && 
      p.action === action && 
      selectedPermissions.has(p.id)
    )
  }

  const getModuleIcon = (moduleName: string) => {
    const module = modules.find(m => m.name.toLowerCase() === moduleName.toLowerCase())
    return module?.icon || Shield
  }

  const getModuleColor = (moduleName: string) => {
    const module = modules.find(m => m.name.toLowerCase() === moduleName.toLowerCase())
    return module?.color || 'gray'
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
          <Link href="/settings" className="hover:text-blue-600">
            Settings
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Permissions</span>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Role-Based Permissions</h1>
            <p className="text-gray-600 mt-1">Configure what each role can access and do</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchData}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowCreateRole(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus size={18} />
              <span>New Role</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center space-x-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center space-x-2">
          <CheckCircle size={16} />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Roles List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h2 className="font-medium text-gray-700">Roles</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                    selectedRole?.id === role.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
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
                    <div className="text-xs text-gray-500">
                      {role.userCount || 0} users
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Permissions Matrix */}
        <div className="lg:col-span-3">
          {selectedRole ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{selectedRole.name}</h2>
                    {selectedRole.description && (
                      <p className="text-sm text-gray-600 mt-1">{selectedRole.description}</p>
                    )}
                  </div>
                  {!selectedRole.isSystem && (
                    <button
                      onClick={handleSavePermissions}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                    >
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      <span>{saving ? 'Saving...' : 'Save Permissions'}</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                {/* Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search permissions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Select All / Deselect All */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => {
                        const allPermissionIds = permissions.map(p => p.id)
                        setSelectedPermissions(new Set(allPermissionIds))
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => setSelectedPermissions(new Set())}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Deselect All
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedPermissions.size} of {permissions.length} permissions selected
                  </div>
                </div>

                {/* Permissions by Module */}
                <div className="space-y-6">
                  {modules.map((module) => {
                    const modulePermissions = permissions.filter(p => 
                      p.module.toLowerCase() === module.name.toLowerCase() &&
                      (searchTerm === '' || 
                        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.description?.toLowerCase().includes(searchTerm.toLowerCase()))
                    )

                    if (modulePermissions.length === 0) return null

                    const Icon = module.icon
                    const isFullySelected = isModuleFullySelected(module.name)
                    const isPartiallySelected = isModulePartiallySelected(module.name)

                    return (
                      <div key={module.name} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => toggleModulePermissions(module.name)}
                                className="flex items-center space-x-2"
                              >
                                {isFullySelected ? (
                                  <CheckCircle size={20} className="text-blue-600" />
                                ) : isPartiallySelected ? (
                                  <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-sm" />
                                  </div>
                                ) : (
                                  <Square size={20} className="text-gray-400" />
                                )}
                                <div className={`p-1.5 rounded bg-${module.color}-100`}>
                                  <Icon size={16} className={`text-${module.color}-600`} />
                                </div>
                                <span className="font-medium text-gray-900">{module.name}</span>
                              </button>
                            </div>
                            <span className="text-xs text-gray-500">
                              {modulePermissions.filter(p => selectedPermissions.has(p.id)).length}/{modulePermissions.length}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {actions.map((action) => {
                              const actionPermissions = modulePermissions.filter(p => p.action === action.name)
                              if (actionPermissions.length === 0) return null

                              const isSelected = actionPermissions.every(p => selectedPermissions.has(p.id))

                              return (
                                <button
                                  key={action.name}
                                  onClick={() => toggleModulePermissions(module.name, action.name)}
                                  className={`p-3 rounded-lg border text-left transition-colors ${
                                    isSelected
                                      ? 'border-blue-300 bg-blue-50'
                                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                  }`}
                                >
                                  <div className="flex items-center space-x-2 mb-1">
                                    {isSelected ? (
                                      <CheckCircle size={14} className="text-blue-600" />
                                    ) : (
                                      <Square size={14} className="text-gray-400" />
                                    )}
                                    <span className="text-sm font-medium text-gray-900 capitalize">
                                      {action.label}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500">{action.description}</p>
                                </button>
                              )
                            })}
                          </div>

                          {/* Individual permissions (if needed) */}
                          {modulePermissions.length > actions.length && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {modulePermissions
                                  .filter(p => !actions.some(a => a.name === p.action))
                                  .map((permission) => (
                                    <button
                                      key={permission.id}
                                      onClick={() => togglePermission(permission.id)}
                                      className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
                                    >
                                      {selectedPermissions.has(permission.id) ? (
                                        <CheckCircle size={14} className="text-blue-600" />
                                      ) : (
                                        <Square size={14} className="text-gray-400" />
                                      )}
                                      <span className="text-xs text-gray-700">{permission.name}</span>
                                    </button>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Select a role to configure permissions</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Role Modal */}
      {showCreateRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Create New Role</h2>
              <button
                onClick={() => setShowCreateRole(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name
                </label>
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Project Manager"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the role's purpose..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateRole(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Implement create role
                  setShowCreateRole(false)
                  setNewRoleName('')
                  setNewRoleDescription('')
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