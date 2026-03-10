'use client'

import { useState, useEffect } from 'react'
import VendorLayout from '@/components/vendor/VendorLayout'
import { User, Building2, Mail, Phone, MapPin, Save } from 'lucide-react'

export default function VendorProfilePage() {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [profile, setProfile] = useState({
    companyName: 'METALMAN AUTO LTD',
    supplierCode: '100089',
    email: 'Sudiptah2090@gmail.com',
    phone: '+91 98765 43210',
    address: '123 Industrial Area',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pincode: '400001',
    gst: '27ABCDE1234F1Z5',
    pan: 'ABCDE1234F',
    contactPerson: 'John Doe',
    contactPhone: '+91 98765 43210',
    bankName: 'State Bank of India',
    accountNumber: '12345678901',
    ifscCode: 'SBIN0001234'
  })

  const handleSave = () => {
    setLoading(true)
    // Mock API call
    setTimeout(() => {
      setLoading(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }, 1000)
  }

  return (
    <VendorLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
          <p className="text-gray-600 mt-1">Manage your company information</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Building2 size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{profile.companyName}</h2>
                <p className="text-sm text-green-100">Supplier Code: {profile.supplierCode}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="md:col-span-2">
                <h3 className="text-md font-semibold text-gray-900 mb-4 pb-2 border-b">Basic Information</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={profile.companyName}
                  onChange={(e) => setProfile({...profile, companyName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="pl-9 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    className="pl-9 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                <input
                  type="text"
                  value={profile.gst}
                  onChange={(e) => setProfile({...profile, gst: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-md font-semibold text-gray-900 mb-4 pb-2 border-b">Address</h3>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={profile.address}
                    onChange={(e) => setProfile({...profile, address: e.target.value})}
                    className="pl-9 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) => setProfile({...profile, city: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={profile.state}
                  onChange={(e) => setProfile({...profile, state: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  value={profile.country}
                  onChange={(e) => setProfile({...profile, country: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                <input
                  type="text"
                  value={profile.pincode}
                  onChange={(e) => setProfile({...profile, pincode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Bank Details */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-md font-semibold text-gray-900 mb-4 pb-2 border-b">Bank Details</h3>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={profile.bankName}
                  onChange={(e) => setProfile({...profile, bankName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input
                  type="text"
                  value={profile.accountNumber}
                  onChange={(e) => setProfile({...profile, accountNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={profile.ifscCode}
                  onChange={(e) => setProfile({...profile, ifscCode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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

            {saved && (
              <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                Profile updated successfully!
              </div>
            )}
          </div>
        </div>
      </div>
    </VendorLayout>
  )
}
