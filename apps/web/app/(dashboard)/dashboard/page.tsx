"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AddVendorModal from '@/components/vendors/AddVendorModal'
import { api } from '@/lib/api'
import {
  Building2,
  Users,
  DollarSign,
  Clock,
  Plus
} from 'lucide-react'

interface Vendor {
  id: string
  name: string
  email: string | null
  phone: string | null
  status: string
  createdAt: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    if (!token || !userStr) {
      router.push('/login')
      return
    }

    try {
      const userData = JSON.parse(userStr)
      setUser(userData)
      fetchVendors()
    } catch (err) {
      console.error('Error parsing user:', err)
      router.push('/login')
    }
  }, [router])

  const fetchVendors = async () => {
    try {
      const response = await api.getVendors()
      if (response.success) {
        setVendors(response.data)
      }
    } catch (err) {
      console.error('Error fetching vendors:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleVendorAdded = (newVendor: Vendor) => {
    setVendors(prev => [newVendor, ...prev])
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <>
      <AddVendorModal
        isOpen={isAddVendorModalOpen}
        onClose={() => setIsAddVendorModalOpen(false)}
        onSuccess={handleVendorAdded}
      />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name || 'Admin'}! 👋
        </h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your vendors today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Vendors</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{vendors.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Vendors</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {vendors.filter(v => v.status === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {vendors.filter(v => v.status === 'pending').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Spent</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">$0</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setIsAddVendorModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* Recent Vendors */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Vendors</h2>
        {vendors.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No vendors yet</p>
            <button
              onClick={() => setIsAddVendorModalOpen(true)}
              className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              Add your first vendor →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vendors.slice(0, 5).map((vendor) => (
                  <tr key={vendor.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{vendor.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{vendor.email || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{vendor.phone || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        vendor.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : vendor.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {vendor.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
