"use client"

import { useState, useEffect } from 'react'
import { X, Building2, Mail, Phone, User, MapPin } from 'lucide-react'
import { api } from '@/lib/api'

interface Category {
  id: string
  name: string
  color: string
  icon: string
}

interface AddVendorModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (vendor: any) => void
}

export default function AddVendorModal({ isOpen, onClose, onSuccess }: AddVendorModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [debug, setDebug] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    categoryId: '',
    contactPerson: '',
    address: '',
    city: '',
    state: '',
    country: 'USA',
    notes: ''
  })

  // Fetch categories when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])

  const fetchCategories = async () => {
    setLoadingCategories(true)
    setDebug('Fetching categories...')
    setError('')
    
    try {
      console.log('📁 Fetching categories for dropdown...')
      const response = await api.getCategories()
      console.log('📁 Categories response:', response)
      
      if (response.success) {
        setCategories(response.data)
        setDebug(`✅ Loaded ${response.data.length} categories`)
        if (response.data.length === 0) {
          setError('No categories found. Please create categories first.')
        }
      } else {
        setDebug(`❌ Failed to load categories: ${response.error}`)
        setError('Failed to load categories')
      }
    } catch (err: any) {
      console.error('Error fetching categories:', err)
      setDebug(`❌ Error: ${err.message}`)
      setError('Failed to load categories')
    } finally {
      setLoadingCategories(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError('Company name is required')
      return
    }

    setLoading(true)
    setError('')
    setDebug('Creating vendor...')

    try {
      const vendorData = {
        name: formData.name,
        email: formData.email || '',
        phone: formData.phone || '',
        categoryId: formData.categoryId || null,
        contactPerson: formData.contactPerson || formData.name,
        address: formData.address || '',
        city: formData.city || '',
        state: formData.state || '',
        country: formData.country,
        notes: formData.notes || ''
      }

      console.log('📤 Creating vendor with data:', vendorData)
      
      const response = await api.createVendor(vendorData)
      console.log('📥 Create vendor response:', response)

      if (response.success) {
        setDebug(`✅ Vendor created successfully! Status: ${response.data.status}`)
        onSuccess(response.data)
        handleClose()
      } else {
        setDebug(`❌ Failed: ${response.error}`)
        setError(response.error || 'Failed to create vendor')
      }
    } catch (err: any) {
      console.error('❌ Error:', err)
      setDebug(`❌ Error: ${err.message}`)
      setError(err.message || 'Failed to create vendor')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '', email: '', phone: '', categoryId: '', contactPerson: '',
      address: '', city: '', state: '', country: 'USA', notes: ''
    })
    setError('')
    setDebug('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Add New Vendor</h2>
                <p className="text-sm text-gray-500">Vendor will be pending for approval</p>
              </div>
            </div>
            <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Debug Info - Remove in production */}
          {debug && (
            <div className="mx-6 mt-4 p-3 bg-gray-100 border border-gray-200 text-gray-700 rounded-lg text-xs font-mono">
              <strong>Debug:</strong> {debug}
            </div>
          )}

          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              {/* Company Name - Required */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="e.g., ABC Supplies Inc."
                  required
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">-- Select a category --</option>
                  {loadingCategories ? (
                    <option disabled>Loading categories...</option>
                  ) : (
                    categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
                {categories.length === 0 && !loadingCategories && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-700">
                      ⚠️ No categories found. Please create categories first in Vendors → Categories.
                    </p>
                    <button
                      type="button"
                      onClick={fetchCategories}
                      className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                    >
                      Refresh categories
                    </button>
                  </div>
                )}
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="contact@company.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Person */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="123 Business Ave"
                  />
                </div>
              </div>

              {/* City, State, Country */}
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="City"
                />
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="State"
                />
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="USA">USA</option>
                  <option value="Canada">Canada</option>
                  <option value="UK">UK</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 resize-none"
                  placeholder="Additional notes..."
                />
              </div>

              {/* Status Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <span className="font-semibold">Status:</span> New vendors are created with <span className="font-mono bg-blue-100 px-1 py-0.5 rounded">pending</span> status and will appear in the Approvals page.
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {loading ? 'Creating...' : 'Create Vendor'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
