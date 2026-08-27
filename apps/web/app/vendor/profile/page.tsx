// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import VendorLayout from '@/components/vendor/VendorLayout'
// import {
//   Building2,
//   AlertCircle
// } from 'lucide-react'

// interface VendorProfile {
//   id: string
//   supplierCode: string
//   supplierName: string
//   email: string | null
//   phone: string | null
//   address: string | null
//   city: string | null
//   state: string | null
//   country: string | null
//   postalCode: string | null
//   bankName: string | null
//   bankAccount: string | null
//   gstNumber: string | null
//   panNumber: string | null
//   contactPerson: string | null
//   contactPhone: string | null
//   website: string | null
//   createdAt: string
// }

// export default function VendorProfilePage() {
//   const router = useRouter()
//   const [profile, setProfile] = useState<VendorProfile | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')

//   useEffect(() => {
//     fetchVendorProfile()
//   }, [])

//   const fetchVendorProfile = async () => {
//     setLoading(true)
//     setError('')
//     try {
//       const token = localStorage.getItem('vendorToken')
//       if (!token) {
//         router.push('/vendor-login')
//         return
//       }

//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/vendor/profile`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       })

//       if (response.status === 401) {
//         localStorage.removeItem('vendorToken')
//         localStorage.removeItem('vendor')
//         router.push('/vendor-login')
//         return
//       }

//       const data = await response.json()
      
//       if (data.success) {
//         setProfile(data.data)
//       } else {
//         setError('Failed to load profile')
//       }
//     } catch (err) {
//       console.error('Error fetching profile:', err)
//       setError('Error connecting to server')
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (loading) {
//     return (
//       <VendorLayout>
//         <div className="flex items-center justify-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
//         </div>
//       </VendorLayout>
//     )
//   }

//   return (
//     <VendorLayout>
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
//           <p className="text-gray-600 mt-1">View your company information</p>
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
//             <AlertCircle size={18} className="text-red-600" />
//             <span className="text-red-700">{error}</span>
//           </div>
//         )}

//         {/* Profile Content */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//           {/* Company Header */}
//           <div className="px-6 py-6 bg-gradient-to-r from-green-600 to-green-700 text-white">
//             <div className="flex items-center space-x-4">
//               <div className="p-3 bg-white/20 rounded-xl">
//                 <Building2 size={32} />
//               </div>
//               <div>
//                 <h2 className="text-2xl font-bold">{profile?.supplierName}</h2>
//                 <p className="text-green-100">Supplier Code: {profile?.supplierCode}</p>
//               </div>
//             </div>
//           </div>

//           {/* Profile Information */}
//           <div className="p-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* Basic Information */}
//               <div className="md:col-span-2">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Basic Information</h3>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
//                 <p className="text-gray-900">{profile?.supplierName || '-'}</p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Code</label>
//                 <p className="text-gray-900">{profile?.supplierCode || '-'}</p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//                 <p className="text-gray-900">{profile?.email || '-'}</p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
//                 <p className="text-gray-900">{profile?.phone || '-'}</p>
//               </div>

//               {/* Address */}
//               <div className="md:col-span-2 mt-4">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Address</h3>
//               </div>

//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
//                 <p className="text-gray-900">{profile?.address || '-'}</p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
//                 <p className="text-gray-900">{profile?.city || '-'}</p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
//                 <p className="text-gray-900">{profile?.state || '-'}</p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
//                 <p className="text-gray-900">{profile?.country || '-'}</p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
//                 <p className="text-gray-900">{profile?.postalCode || '-'}</p>
//               </div>

//               {/* Additional Info */}
//               <div className="md:col-span-2 mt-4">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Additional Information</h3>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
//                 <p className="text-gray-900">{profile?.gstNumber || '-'}</p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
//                 <p className="text-gray-900">{profile?.panNumber || '-'}</p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
//                 <p className="text-gray-900">{profile?.contactPerson || '-'}</p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
//                 <p className="text-gray-900">{profile?.contactPhone || '-'}</p>
//               </div>

//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
//                 <p className="text-gray-900">{profile?.website || '-'}</p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
//                 <p className="text-gray-900">
//                   {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-'}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </VendorLayout>
//   )
// }
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import VendorLayout from '@/components/vendor/VendorLayout'
import {
  Building2,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  User,
  Globe,
  Banknote,
  Hash,
  Briefcase,
  CheckCircle,
  Shield,
  Home,
  Building,
  MapPinned,
  Landmark,
  Receipt,
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/vendor/profile`, {
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

  const InfoCard = ({ icon: Icon, label, value, iconBgColor = 'bg-green-100', iconColor = 'text-green-600' }: any) => (
    <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg ${iconBgColor}`}>
          <Icon size={18} className={iconColor} />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-sm font-medium text-gray-900 mt-1 break-words">
            {value || '-'}
          </p>
        </div>
      </div>
    </div>
  )

  const SectionHeader = ({ title, icon: Icon }: any) => (
    <div className="flex items-center space-x-2 mb-4">
      <div className="p-1.5 bg-green-100 rounded-lg">
        <Icon size={18} className="text-green-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className="flex-1 border-b border-gray-200 ml-4"></div>
    </div>
  )

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
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
          <p className="text-gray-500 mt-1">View your company information and details</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2">
            <AlertCircle size={18} className="text-red-600" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {/* Profile Content */}
        <div className="space-y-6">
          {/* Company Header Card */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-8 text-white">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Building2 size={36} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{profile?.supplierName}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <Hash size={14} className="text-green-200" />
                    <p className="text-green-100">Supplier Code: {profile?.supplierCode}</p>
                    <span className="w-1 h-1 bg-green-300 rounded-full"></span>
                    <div className="flex items-center space-x-1">
                      <CheckCircle size={14} className="text-green-200" />
                      <p className="text-green-100">Verified Vendor</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              {/* Basic Information */}
              <SectionHeader title="Basic Information" icon={Building2} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <InfoCard icon={Building2} label="Supplier Name" value={profile?.supplierName} iconBgColor="bg-green-100" iconColor="text-green-600" />
                <InfoCard icon={Hash} label="Supplier Code" value={profile?.supplierCode} iconBgColor="bg-blue-100" iconColor="text-blue-600" />
                <InfoCard icon={Mail} label="Email Address" value={profile?.email} iconBgColor="bg-blue-100" iconColor="text-blue-600" />
                <InfoCard icon={Phone} label="Phone Number" value={profile?.phone} iconBgColor="bg-purple-100" iconColor="text-purple-600" />
              </div>

              {/* Address Information */}
              <SectionHeader title="Address Information" icon={MapPin} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="md:col-span-2">
                  <InfoCard icon={Home} label="Full Address" value={profile?.address} iconBgColor="bg-orange-100" iconColor="text-orange-600" />
                </div>
                <InfoCard icon={Building} label="City" value={profile?.city} iconBgColor="bg-cyan-100" iconColor="text-cyan-600" />
                <InfoCard icon={MapPinned} label="State" value={profile?.state} iconBgColor="bg-cyan-100" iconColor="text-cyan-600" />
                <InfoCard icon={Globe} label="Country" value={profile?.country} iconBgColor="bg-cyan-100" iconColor="text-cyan-600" />
                <InfoCard icon={Hash} label="Postal Code" value={profile?.postalCode} iconBgColor="bg-cyan-100" iconColor="text-cyan-600" />
              </div>

              {/* Tax & Banking Information */}
              <SectionHeader title="Tax & Banking Information" icon={Shield} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <InfoCard icon={Receipt} label="GST Number" value={profile?.gstNumber} iconBgColor="bg-orange-100" iconColor="text-orange-600" />
                <InfoCard icon={Landmark} label="Bank Name" value={profile?.bankName} iconBgColor="bg-green-100" iconColor="text-green-600" />
                <InfoCard icon={CreditCard} label="Bank Account" value={profile?.bankAccount} iconBgColor="bg-green-100" iconColor="text-green-600" />
              </div>

              {/* Contact Information */}
              <SectionHeader title="Contact Information" icon={User} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <InfoCard icon={User} label="Contact Person" value={profile?.contactPerson} iconBgColor="bg-purple-100" iconColor="text-purple-600" />
                <InfoCard icon={Phone} label="Contact Phone" value={profile?.contactPhone} iconBgColor="bg-purple-100" iconColor="text-purple-600" />
                <InfoCard icon={Globe} label="Website" value={profile?.website} iconBgColor="bg-blue-100" iconColor="text-blue-600" />
                <InfoCard icon={Calendar} label="Member Since" value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'} iconBgColor="bg-gray-100" iconColor="text-gray-600" />
              </div>

              {/* Verification Status */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-sm text-gray-600">Profile Status: <span className="font-medium text-green-600">Active</span></p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield size={14} className="text-green-600" />
                    <p className="text-xs text-gray-500">Verified Vendor • All information is secure</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </VendorLayout>
  )
}