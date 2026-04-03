'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import VendorLayout from '@/components/vendor/VendorLayout'
import {
  Building2,
  AlertCircle
} from 'lucide-react'

interface VendorProfile {
  id: string
  supplierCode: string
  supplierName: string
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  postalCode: string | null
  bankName: string | null
  bankAccount: string | null
  gstNumber: string | null
  panNumber: string | null
  contactPerson: string | null
  contactPhone: string | null
  website: string | null
  createdAt: string
}

export default function VendorProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<VendorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchVendorProfile()
  }, [])

  const fetchVendorProfile = async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('vendorToken')
      if (!token) {
        router.push('/vendor-login')
        return
      }

      const response = await fetch('http://localhost:3001/api/vendor/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 401) {
        localStorage.removeItem('vendorToken')
        localStorage.removeItem('vendor')
        router.push('/vendor-login')
        return
      }

      const data = await response.json()
      
      if (data.success) {
        setProfile(data.data)
      } else {
        setError('Failed to load profile')
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError('Error connecting to server')
    } finally {
      setLoading(false)
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
          <p className="text-gray-600 mt-1">View your company information</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle size={18} className="text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Profile Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Company Header */}
          <div className="px-6 py-6 bg-gradient-to-r from-green-600 to-green-700 text-white">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Building2 size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{profile?.supplierName}</h2>
                <p className="text-green-100">Supplier Code: {profile?.supplierCode}</p>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Basic Information</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
                <p className="text-gray-900">{profile?.supplierName || '-'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Code</label>
                <p className="text-gray-900">{profile?.supplierCode || '-'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{profile?.email || '-'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <p className="text-gray-900">{profile?.phone || '-'}</p>
              </div>

              {/* Address */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Address</h3>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <p className="text-gray-900">{profile?.address || '-'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <p className="text-gray-900">{profile?.city || '-'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <p className="text-gray-900">{profile?.state || '-'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <p className="text-gray-900">{profile?.country || '-'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                <p className="text-gray-900">{profile?.postalCode || '-'}</p>
              </div>

              {/* Additional Info */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Additional Information</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                <p className="text-gray-900">{profile?.gstNumber || '-'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                <p className="text-gray-900">{profile?.panNumber || '-'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <p className="text-gray-900">{profile?.contactPerson || '-'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                <p className="text-gray-900">{profile?.contactPhone || '-'}</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <p className="text-gray-900">{profile?.website || '-'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                <p className="text-gray-900">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </VendorLayout>
  )
}