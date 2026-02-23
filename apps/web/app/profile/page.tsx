'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import { getCurrentUser } from '@/lib/dev-auth'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Clock,
  Shield,
  Edit,
  Save,
  X,
  Camera,
  Loader2,
  CheckCircle,
  AlertCircle,
  Key,
  Bell,
  Globe,
  Lock
} from 'lucide-react'
import Link from 'next/link'

interface UserProfile {
  id: string
  name: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  title?: string
  department?: string
  role: string
  avatarUrl?: string
  lastLoginAt?: string
  createdAt: string
  company?: {
    id: string
    name: string
  }
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  const [formData, setFormData] = useState({
    name: '',
      email: '',
    firstName: '',
    lastName: '',
    phone: '',
    title: '',
    department: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

const fetchProfile = async () => {
  setLoading(true)
  try {
    const currentUser = getCurrentUser()
    if (currentUser?.id) {
      // Use the correct API method
      const response = await api.getUser(currentUser.id)
      if (response.success) {
        setProfile(response.data)
        setFormData({
          name: response.data.name || '',
          email: response.data.email || '', // Make sure to include email
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          phone: response.data.phone || '',
          title: response.data.title || '',
          department: response.data.department || ''
        })
      }
    }
  } catch (err) {
    console.error('Error fetching profile:', err)
    setError('Failed to load profile')
  } finally {
    setLoading(false)
  }
}

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await api.updateUser(profile?.id, formData)
      if (response.success) {
        setSuccess('Profile updated successfully!')
        setIsEditing(false)
        fetchProfile()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(response.error || 'Failed to update profile')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const getInitials = () => {
    if (profile?.name) {
      return profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return 'U'
  }

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: 'bg-purple-100 text-purple-800',
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      member: 'bg-gray-100 text-gray-800'
    }
    return colors[role] || colors.member
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
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">Manage your personal information and preferences</p>
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
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Profile Summary */}
            <div className="p-6 text-center border-b border-gray-200">
              <div className="relative inline-block">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold mx-auto shadow-lg">
                    {getInitials()}
                  </div>
                )}
                <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full border border-gray-300 shadow-sm hover:bg-gray-50">
                  <Camera size={14} className="text-gray-600" />
                </button>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mt-4">{profile?.name}</h2>
              <p className="text-sm text-gray-500 mt-1">{profile?.title || 'No title'}</p>
              <div className="mt-3">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(profile?.role || 'member')}`}>
                  {profile?.role?.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Member'}
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="p-3">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                  activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User size={18} />
                <span>Profile Information</span>
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                  activeTab === 'security' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Shield size={18} />
                <span>Security</span>
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                  activeTab === 'notifications' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Bell size={18} />
                <span>Notifications</span>
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                  activeTab === 'preferences' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Globe size={18} />
                <span>Preferences</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 flex items-center space-x-1"
                  >
                    <Edit size={14} />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-1"
                    >
                      <X size={14} />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={saving}
                      className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-1"
                    >
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      <span>Save</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Full Name</label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                            placeholder="Enter your full name"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{profile?.name || '—'}</p>
                        )}
                      </div>
                     {/* Email Field - Add placeholder */}
<div>
  <label className="block text-xs text-gray-500 mb-1">Email Address</label>
  {isEditing ? (
    <div className="relative">
      <Mail size={14} className="absolute left-3 top-3 text-gray-400" />
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
        placeholder="your.email@company.com"
      />
    </div>
  ) : (
    <div className="flex items-center space-x-2">
      <Mail size={14} className="text-gray-400" />
      <p className="text-sm text-gray-900">{profile?.email}</p>
    </div>
  )}
</div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">First Name</label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                            placeholder="Enter your first name"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{profile?.firstName || '—'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Last Name</label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                            placeholder="Enter your last name"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{profile?.lastName || '—'}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Work Info */}
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Work Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Job Title</label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                            placeholder="e.g., Project Manager"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{profile?.title || '—'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Department</label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                            placeholder="e.g., Engineering"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{profile?.department || '—'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Phone Number</label>
                        {isEditing ? (
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                            placeholder="+1 (555) 123-4567"
                          />
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Phone size={14} className="text-gray-400" />
                            <p className="text-sm text-gray-900">{profile?.phone || '—'}</p>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Company</label>
                        <div className="flex items-center space-x-2">
                          <Building2 size={14} className="text-gray-400" />
                          <p className="text-sm text-gray-900">{profile?.company?.name || '—'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account Info */}
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Member Since</label>
                        <div className="flex items-center space-x-2">
                          <Calendar size={14} className="text-gray-400" />
                          <p className="text-sm text-gray-900">
                            {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Last Login</label>
                        <div className="flex items-center space-x-2">
                          <Clock size={14} className="text-gray-400" />
                          <p className="text-sm text-gray-900">
                            {profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : '—'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">User ID</label>
                        <p className="text-sm font-mono text-gray-500">{profile?.id}</p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Role</label>
                        <p className="text-sm text-gray-900 capitalize">{profile?.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Password Change */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Change Password</h3>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Current Password</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">New Password</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                        placeholder="Confirm new password"
                      />
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                      Update Password
                    </button>
                  </div>
                </div>

                {/* Two-Factor Authentication */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Lock size={20} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Two-factor authentication</p>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">
                      Enable
                    </button>
                  </div>
                </div>

                {/* Sessions */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Active Sessions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Current Session</p>
                        <p className="text-sm text-gray-500">Chrome on macOS • Now</p>
                      </div>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive updates via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Push Notifications</p>
                    <p className="text-sm text-gray-500">Receive in-app notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Notification Types</h3>
                  <div className="space-y-3">
                    {['Vendor Updates', 'Procurement Alerts', 'Project Notifications', 'Financial Reports', 'System Announcements'].map((item) => (
                      <div key={item} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{item}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Display Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Theme</span>
                      <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-900">
                        <option>Light</option>
                        <option>Dark</option>
                        <option>System</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Language</span>
                      <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-900">
                        <option>English (US)</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Timezone</span>
                      <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-900">
                        <option>Eastern Time (ET)</option>
                        <option>Central Time (CT)</option>
                        <option>Mountain Time (MT)</option>
                        <option>Pacific Time (PT)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Date & Time Format</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Date Format</span>
                      <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-900">
                        <option>MM/DD/YYYY</option>
                        <option>DD/MM/YYYY</option>
                        <option>YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Time Format</span>
                      <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-900">
                        <option>12-hour (AM/PM)</option>
                        <option>24-hour</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">First Day of Week</span>
                      <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-900">
                        <option>Sunday</option>
                        <option>Monday</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}