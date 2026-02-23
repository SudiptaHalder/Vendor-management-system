'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  Users,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  User,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  MoreVertical,
  UserPlus,
  UserCog
} from 'lucide-react'
import Link from 'next/link'

interface TeamMember {
  id: string
  name: string | null
  email: string
  role: string
  title: string | null
  department: string | null
  phone: string | null
  avatarUrl: string | null
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  teams?: Array<{
    id: string
    name: string
  }>
}

export default function TeamMembersPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showInviteModal, setShowInviteModal] = useState(false)

  const fetchTeamMembers = async () => {
    setLoading(true)
    try {
      const response = await api.getUsers()
      if (response.success) {
        setMembers(response.data)
      } else {
        setError('Failed to load team members')
      }
    } catch (err) {
      console.error('Error fetching team members:', err)
      setError('Failed to load team members')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeamMembers()
  }, [])

  const handleDeleteMember = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to remove this team member?')) {
      return
    }

    try {
      // You'll need to implement this API method
      // const response = await api.deleteUser(id)
      // if (response.success) {
      //   setMembers(members.filter(m => m.id !== id))
      // }
      alert('Delete functionality to be implemented')
    } catch (err) {
      alert('Failed to remove team member')
    }
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || member.role === roleFilter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && member.isActive) ||
      (statusFilter === 'inactive' && !member.isActive)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: 'bg-purple-100 text-purple-800',
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      member: 'bg-gray-100 text-gray-800'
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[role] || colors.member}`}>
        {role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </span>
    )
  }

  const stats = {
    total: members.length,
    active: members.filter(m => m.isActive).length,
    admins: members.filter(m => m.role === 'admin' || m.role === 'super_admin').length,
    members: members.filter(m => m.role === 'member').length
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
          <span className="text-gray-900 font-medium">Team Members</span>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
            <p className="text-gray-600 mt-1">Manage your team members and their access</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchTeamMembers}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <UserPlus size={18} />
              <span>Invite Member</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Members</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Admins</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.admins}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Members</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.members}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <User className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, title, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="member">Member</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button className="p-2 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Team Members Grid */}
      {members.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No team members yet</h3>
          <p className="text-gray-500 mb-6">Invite your first team member to get started.</p>
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
          >
            <UserPlus size={18} />
            <span>Invite Member</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.name || ''}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-lg font-semibold text-blue-600">
                        {member.name?.charAt(0) || member.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{member.name || 'Unnamed'}</h3>
                    <p className="text-sm text-gray-500">{member.title || 'No title'}</p>
                  </div>
                </div>
                {getRoleBadge(member.role)}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail size={14} className="mr-2 text-gray-400" />
                  <a href={`mailto:${member.email}`} className="hover:text-blue-600">
                    {member.email}
                  </a>
                </div>
                {member.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone size={14} className="mr-2 text-gray-400" />
                    <a href={`tel:${member.phone}`}>{member.phone}</a>
                  </div>
                )}
                {member.department && (
                  <div className="flex items-center text-sm text-gray-600">
                    <User size={14} className="mr-2 text-gray-400" />
                    {member.department}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  {member.isActive ? (
                    <span className="flex items-center text-xs text-green-600">
                      <CheckCircle size={12} className="mr-1" />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center text-xs text-gray-400">
                      <XCircle size={12} className="mr-1" />
                      Inactive
                    </span>
                  )}
                  {member.lastLoginAt && (
                    <span className="text-xs text-gray-400">
                      Last login: {new Date(member.lastLoginAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/settings/team/${member.id}`}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </Link>
                  <Link
                    href={`/settings/team/${member.id}/edit`}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </Link>
                  <button
                    onClick={(e) => handleDeleteMember(member.id, e)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Modal (Placeholder) */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Invite Team Member</h2>
            <p className="text-gray-600 mb-4">Send an invitation email to add a new team member.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="colleague@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="member">Member</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Invitation sent!')
                  setShowInviteModal(false)
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}