'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  Building2,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  CreditCard,
  Upload
} from 'lucide-react'
import Link from 'next/link'

interface Company {
  id: string
  name: string
  subdomain: string | null
  logo: string | null
  website: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  postalCode: string | null
  taxId: string | null
  registrationNumber: string | null
  plan: string
  planStatus: string
  trialEndsAt: string | null
}

interface User {
  id: string
  companyId: string
  name: string
  email: string
}

export default function CompanyProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [company, setCompany] = useState<Company | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    website: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    taxId: '',
    registrationNumber: ''
  })

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const response = await api.getCurrentUser()
      if (response.success) {
        setCurrentUser(response.data)
        if (response.data.companyId) {
          fetchCompany(response.data.companyId)
        } else {
          setError('No company associated with this user')
          setLoading(false)
        }
      } else {
        setError('Failed to load user data')
        setLoading(false)
      }
    } catch (err) {
      console.error('Error fetching user:', err)
      setError('Failed to load user data')
      setLoading(false)
    }
  }

  const fetchCompany = async (companyId: string) => {
    try {
      const response = await api.getCompany(companyId)
      if (response.success) {
        setCompany(response.data)
        setFormData({
          name: response.data.name || '',
          subdomain: response.data.subdomain || '',
          website: response.data.website || '',
          phone: response.data.phone || '',
          email: response.data.email || '',
          address: response.data.address || '',
          city: response.data.city || '',
          state: response.data.state || '',
          country: response.data.country || '',
          postalCode: response.data.postalCode || '',
          taxId: response.data.taxId || '',
          registrationNumber: response.data.registrationNumber || ''
        })
        if (response.data.logo) {
          setLogoPreview(response.data.logo)
        }
      } else {
        setError('Failed to load company data')
      }
    } catch (err) {
      console.error('Error fetching company:', err)
      setError('Failed to load company data')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && currentUser?.companyId) {
      // Show preview
      const reader = new FileReader()
      reader.onload = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload logo
      setUploadingLogo(true)
      try {
        const formData = new FormData()
        formData.append('logo', file)
        
        const response = await api.uploadCompanyLogo(currentUser.companyId, formData)
        if (response.success) {
          setSuccess('Logo uploaded successfully!')
          setTimeout(() => setSuccess(''), 3000)
        }
      } catch (err) {
        console.error('Error uploading logo:', err)
        setError('Failed to upload logo')
      } finally {
        setUploadingLogo(false)
      }
    }
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Company name is required')
      return false
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    if (!currentUser?.companyId) {
      setError('No company ID found')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await api.updateCompany(currentUser.companyId, formData)
      if (response.success) {
        setSuccess('Company profile updated successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(response.error || 'Failed to update company')
      }
    } catch (err: any) {
      console.error('Error updating company:', err)
      setError(err.message || 'Failed to update company')
    } finally {
      setSaving(false)
    }
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
          <span className="text-gray-900 font-medium">Company Profile</span>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
            <p className="text-gray-600 mt-1">Manage your company information and branding</p>
          </div>
          <button
            onClick={() => currentUser?.companyId && fetchCompany(currentUser.companyId)}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Logo */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Logo</h2>
          <div className="flex items-center space-x-6">
            <div className="relative">
              {logoPreview ? (
                <img
                  src={logoPreview.startsWith('data:') ? logoPreview : `http://localhost:3001${logoPreview}`}
                  alt="Company logo"
                  className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
              )}
              {uploadingLogo && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Upload a company logo (recommended size: 200x200px)</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                disabled={uploadingLogo}
                className="mt-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Acme Corporation"
                  required
                />
              </div>
            </div>

            {/* Subdomain */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subdomain
              </label>
              <div className="flex items-center">
                <div className="relative flex-1">
                  <Globe className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="subdomain"
                    value={formData.subdomain}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="acme"
                  />
                </div>
                <span className="px-3 py-2 bg-gray-50 border border-l-0 border-gray-300 rounded-r-lg text-gray-500">
                  .vendorflow.com
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Your company's unique URL</p>
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="info@company.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="https://www.company.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Address</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="123 Business St"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="San Francisco"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State / Province
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="CA"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="United States"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="94105"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Business Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax ID / VAT Number
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="12-3456789"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Number
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="12345678"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Plan Information (Read-only) */}
        {company && (
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">Current Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-blue-700">Plan</p>
                <p className="text-lg font-semibold text-blue-900 capitalize">{company.plan}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Status</p>
                <p className="text-lg font-semibold capitalize text-blue-900">{company.planStatus}</p>
              </div>
              {company.trialEndsAt && (
                <div>
                  <p className="text-sm text-blue-700">Trial Ends</p>
                  <p className="text-lg font-semibold text-blue-900">
                    {new Date(company.trialEndsAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-4">
              <Link
                href="/settings/billing"
                className="text-sm text-blue-700 hover:text-blue-800 font-medium inline-flex items-center"
              >
                Manage billing and subscription
                <span className="ml-1">→</span>
              </Link>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => currentUser?.companyId && fetchCompany(currentUser.companyId)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !currentUser?.companyId}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </MainLayout>
  )
}