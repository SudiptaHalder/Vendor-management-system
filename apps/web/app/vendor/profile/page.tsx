'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import VendorLayout from '@/components/vendor/VendorLayout'
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  Save,
  Edit2,
  Upload,
  User,
  Briefcase,
  DollarSign,
  Calendar
} from 'lucide-react'

export default function VendorProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [vendor, setVendor] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    // Check vendor auth
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    if (!token || !userStr) {
      router.push('/login')
      return
    }

    try {
      const userData = JSON.parse(userStr)
      if (userData.type !== 'vendor') {
        router.push('/dashboard')
        return
      }
      
      // Mock vendor data - replace with API call
      const vendorData = {
        name: 'City Electrical Supply',
        email: 'vendor.cityelectrical@portal.com',
        phone: '+1 (212) 555-1234',
        website: 'https://www.cityelectrical.com',
        taxId: '12-3456789',
        registrationNumber: 'VEND-ELEC-001',
        address: '123 Electric Ave',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001',
        contactPerson: 'Robert Brown',
        contactPersonRole: 'Sales Manager',
        contactPersonEmail: 'robert.brown@cityelectrical.com',
        contactPersonPhone: '+1 (212) 555-1235',
        businessType: 'corporation',
        yearEstablished: 1995,
        employeeCount: 150,
        annualRevenue: 25000000,
        paymentTerms: 'net30',
        currency: 'USD'
      }
      
      setVendor(vendorData)
      setFormData(vendorData)
    } catch (err) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // API call to update vendor profile
      await new Promise(resolve => setTimeout(resolve, 1000))
      setVendor(formData)
      setEditMode(false)
    } catch (err) {
      console.error('Error saving profile:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </VendorLayout>
    )
  }

  return (
    <VendorLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
          <p className="text-gray-600 mt-1">Manage your company information</p>
        </div>
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <Edit2 size={16} />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setFormData(vendor)
                setEditMode(false)
              }}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Profile Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Company Logo/Banner */}
        <div className="h-32 bg-gradient-to-r from-green-500 to-green-600 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 bg-white rounded-xl shadow-lg flex items-center justify-center border-4 border-white">
              <Building2 className="w-12 h-12 text-green-600" />
            </div>
          </div>
        </div>

        {/* Company Name */}
        <div className="pt-16 px-8 pb-8">
          {editMode ? (
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="text-2xl font-bold text-gray-900 border-b border-gray-300 focus:border-green-500 outline-none w-full mb-2 pb-1"
            />
          ) : (
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{vendor.name}</h2>
          )}
          <p className="text-gray-500 flex items-center">
            <Mail size={14} className="mr-1" />
            {vendor.email}
          </p>
        </div>

        {/* Details Grid */}
        <div className="px-8 pb-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building2 size={18} className="mr-2 text-gray-500" />
              Basic Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Phone</label>
                {editMode ? (
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{vendor.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Website</label>
                {editMode ? (
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{vendor.website}</p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tax ID / EIN</label>
                {editMode ? (
                  <input
                    type="text"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{vendor.taxId}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin size={18} className="mr-2 text-gray-500" />
              Address
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Street Address</label>
                {editMode ? (
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{vendor.address}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">City</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{vendor.city}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">State</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{vendor.state}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Person */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User size={18} className="mr-2 text-gray-500" />
              Contact Person
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Name</label>
                {editMode ? (
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{vendor.contactPerson}</p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Role</label>
                {editMode ? (
                  <input
                    type="text"
                    name="contactPersonRole"
                    value={formData.contactPersonRole}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{vendor.contactPersonRole}</p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email</label>
                {editMode ? (
                  <input
                    type="email"
                    name="contactPersonEmail"
                    value={formData.contactPersonEmail}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{vendor.contactPersonEmail}</p>
                )}
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Briefcase size={18} className="mr-2 text-gray-500" />
              Business Details
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Business Type</label>
                {editMode ? (
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  >
                    <option value="corporation">Corporation</option>
                    <option value="llc">LLC</option>
                    <option value="sole_proprietor">Sole Proprietor</option>
                    <option value="partnership">Partnership</option>
                  </select>
                ) : (
                  <p className="text-sm text-gray-900 capitalize">{vendor.businessType}</p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Year Established</label>
                {editMode ? (
                  <input
                    type="number"
                    name="yearEstablished"
                    value={formData.yearEstablished}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{vendor.yearEstablished}</p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Employee Count</label>
                {editMode ? (
                  <input
                    type="number"
                    name="employeeCount"
                    value={formData.employeeCount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{vendor.employeeCount}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </VendorLayout>
  )
}
