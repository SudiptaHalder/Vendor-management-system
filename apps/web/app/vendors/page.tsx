"use client"

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import AddVendorModal from '@/components/vendors/AddVendorModal'
import { api } from '@/lib/api'
import {
  Plus,
  Building2,
  RefreshCw,
  Mail,
  Phone,
  MoreVertical,
  Search,
  Filter,
  CheckCircle,
  Clock,
  DollarSign,
  Users
} from 'lucide-react'

interface Vendor {
  id: string
  name: string
  email: string | null
  phone: string | null
  category: any | null  // Can be object or string
  categoryName?: string // For display
  status: string
  contactPerson: string | null
  totalSpent?: number
  lastOrder?: string
  createdAt: string
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const fetchVendors = async () => {
    setLoading(true)
    try {
      const response = await api.getVendors()
      if (response.success) {
        // Process vendors to extract category name safely
        const processedVendors = response.data.map((vendor: any) => ({
          ...vendor,
          // Safely get category name whether it's object, string, or null
          categoryName: vendor.category?.name || vendor.category || null
        }))
        setVendors(processedVendors)
      } else {
        setError('Failed to load vendors')
      }
    } catch (err) {
      setError('Failed to load vendors')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVendors()
  }, [])

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = 
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || vendor.categoryName === categoryFilter
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  const categories = Array.from(new Set(vendors.map(v => v.categoryName).filter(Boolean))) as string[]

  return (
    <MainLayout>
      <AddVendorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={(newVendor) => {
          setVendors(prev => [{
            ...newVendor,
            categoryName: newVendor.category?.name || newVendor.category || null
          }, ...prev])
          setIsAddModalOpen(false)
        }}
      />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
          <p className="text-gray-600 mt-1">Manage your vendor relationships</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchVendors}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Vendors</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{vendors.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {vendors.filter(v => v.status === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {vendors.filter(v => v.status === 'pending').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">$0</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {vendors.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendors by name, email, or contact person..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
              <button className="p-2 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
                <Filter size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vendors Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading vendors...</p>
        </div>
      ) : vendors.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No vendors yet</h3>
          <p className="text-gray-500 mb-6">Get started by adding your first vendor.</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Add Your First Vendor</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vendor.contactPerson || vendor.name}</div>
                      {vendor.email && (
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          <Mail size={12} className="mr-1" />
                          {vendor.email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {vendor.categoryName || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(vendor.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical size={16} />
                      </button>
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
