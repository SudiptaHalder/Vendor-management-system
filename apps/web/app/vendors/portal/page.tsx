// 'use client'

// import { useState, useEffect } from 'react'
// import MainLayout from '@/components/layout/MainLayout'
// import { apiClient } from '@/lib/api-client'
// import { API_CONFIG } from '@/lib/config'
// import {
//   Users,
//   Mail,
//   CheckCircle,
//   XCircle,
//   Clock,
//   RefreshCw,
//   Send,
//   Search,
//   Filter,
//   UserCheck,
//   UserX,
//   ExternalLink,
//   ChevronRight,
//   Globe
// } from 'lucide-react'
// import Link from 'next/link'

// interface Vendor {
//   id: string
//   supplierCode: string
//   supplierName: string
//   email: string | null
//   status: string
//   createdAt: string
// }

// interface Invitation {
//   id: string
//   status: string
//   sentAt: string | null
//   acceptedAt: string | null
//   expiresAt: string
// }

// interface Credentials {
//   id: string
//   lastLoginAt: string | null
// }

// interface VendorWithStatus extends Vendor {
//   invitationStatus: string | null
//   invitationSentAt: string | null
//   invitationAcceptedAt: string | null
//   lastLoginAt: string | null
//   hasCredentials: boolean
// }

// export default function VendorPortalManagementPage() {
//   const [vendors, setVendors] = useState<VendorWithStatus[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')
//   const [searchTerm, setSearchTerm] = useState('')
//   const [filterStatus, setFilterStatus] = useState<string>('all')
//   const [selectedVendors, setSelectedVendors] = useState<string[]>([])
//   const [selectAll, setSelectAll] = useState(false)
//   const [sendingInvites, setSendingInvites] = useState(false)
//   const [portalEnabled, setPortalEnabled] = useState(true)
//   const [stats, setStats] = useState({
//     totalVendors: 0,
//     activeUsers: 0,
//     pendingInvitations: 0,
//     notInvited: 0
//   })

//   useEffect(() => {
//     fetchVendorsWithPortalStatus()
//     fetchPortalStats()
//   }, [])

// const fetchVendorsWithPortalStatus = async () => {
//   setLoading(true)
//   try {
//     // Single API call that returns all vendors with their status
//     const response = await apiClient.get<{ data: VendorWithStatus[] }>(
//       API_CONFIG.endpoints.vendors.management.listWithStatus,
//       true
//     )
    
//     setVendors(response.data)
//   } catch (err) {
//     console.error('Error fetching vendors:', err)
//     setError('Failed to load vendor data')
//   } finally {
//     setLoading(false)
//   }
// }

//   const fetchPortalStats = async () => {
//     try {
//       const response = await apiClient.get<typeof stats>(
//         API_CONFIG.endpoints.vendors.management.portalStats,
//         true
//       )
//       setStats(response.data)
//     } catch (err) {
//       console.error('Error fetching stats:', err)
//     }
//   }

//   const handleSendInvitations = async () => {
//     setSendingInvites(true)
//     try {
//       const vendorsToInvite = selectedVendors.length > 0 
//         ? vendors.filter(v => selectedVendors.includes(v.id))
//         : vendors.filter(v => !v.invitationStatus)

//       const response = await apiClient.post<{ message: string }>(
//         API_CONFIG.endpoints.vendors.management.bulkInvite,
//         { vendorIds: vendorsToInvite.map(v => v.id) },
//         true
//       )

//       alert(response.message || 'Invitations sent successfully')
      
//       // Refresh data
//       await fetchVendorsWithPortalStatus()
//       await fetchPortalStats()
//       setSelectedVendors([])
//       setSelectAll(false)
//     } catch (err: any) {
//       console.error('Error sending invitations:', err)
//       alert(err.message || 'Failed to send invitations')
//     } finally {
//       setSendingInvites(false)
//     }
//   }

//   const handleResendInvitation = async (vendorId: string) => {
//     try {
//       await apiClient.post(
//         API_CONFIG.endpoints.vendors.management.resendInvitation(vendorId),
//         {},
//         true
//       )
//       await fetchVendorsWithPortalStatus()
//     } catch (err) {
//       console.error('Error resending invitation:', err)
//     }
//   }

//   const getPortalStatus = (vendor: VendorWithStatus) => {
//     if (vendor.hasCredentials && vendor.lastLoginAt) {
//       return {
//         label: 'Active',
//         badge: <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center w-fit">
//           <UserCheck size={12} className="mr-1" /> Active
//         </span>
//       }
//     }
//     if (vendor.invitationStatus === 'accepted') {
//       return {
//         label: 'Accepted',
//         badge: <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full flex items-center w-fit">
//           <CheckCircle size={12} className="mr-1" /> Accepted
//         </span>
//       }
//     }
//     if (vendor.invitationStatus === 'sent') {
//       return {
//         label: 'Invited',
//         badge: <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full flex items-center w-fit">
//           <Clock size={12} className="mr-1" /> Invited
//         </span>
//       }
//     }
//     return {
//       label: 'Not Invited',
//       badge: <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full flex items-center w-fit">
//         <UserX size={12} className="mr-1" /> Not Invited
//       </span>
//     }
//   }

//   const filteredVendors = vendors.filter(vendor => {
//     const matchesSearch = 
//       vendor.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       vendor.supplierCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       (vendor.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    
//     const status = getPortalStatus(vendor).label.toLowerCase()
//     const matchesFilter = filterStatus === 'all' || status.includes(filterStatus)
    
//     return matchesSearch && matchesFilter
//   })

//   const toggleSelectAll = () => {
//     if (selectAll) {
//       setSelectedVendors([])
//     } else {
//       setSelectedVendors(filteredVendors.map(v => v.id))
//     }
//     setSelectAll(!selectAll)
//   }

//   const toggleSelectVendor = (vendorId: string) => {
//     if (selectedVendors.includes(vendorId)) {
//       setSelectedVendors(selectedVendors.filter(id => id !== vendorId))
//       setSelectAll(false)
//     } else {
//       setSelectedVendors([...selectedVendors, vendorId])
//     }
//   }

//   if (loading) {
//     return (
//       <MainLayout>
//         <div className="flex items-center justify-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//         </div>
//       </MainLayout>
//     )
//   }

//   return (
//     <MainLayout>
//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
//             <span>Vendors</span>
//             <ChevronRight size={14} />
//             <span className="text-gray-900">Vendor Portal</span>
//           </div>
//           <h1 className="text-2xl font-bold text-gray-900">Vendor Portal Management</h1>
//           <p className="text-gray-600 mt-1">Manage vendor access and invitations</p>
//         </div>
//       </div>

//       {/* Portal Status Card */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-4">
//             <div className={`p-3 rounded-lg ${portalEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
//               <Globe className={`w-6 h-6 ${portalEnabled ? 'text-green-600' : 'text-gray-600'}`} />
//             </div>
//             <div>
//               <h2 className="text-lg font-semibold text-gray-900">Portal Status</h2>
//               <p className="text-sm text-gray-600">
//                 {portalEnabled 
//                   ? 'Your vendor portal is active and accessible' 
//                   : 'Your vendor portal is currently disabled'}
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={() => setPortalEnabled(!portalEnabled)}
//             className={`px-4 py-2 rounded-lg font-medium ${
//               portalEnabled 
//                 ? 'bg-red-100 text-red-700 hover:bg-red-200' 
//                 : 'bg-green-100 text-green-700 hover:bg-green-200'
//             }`}
//           >
//             {portalEnabled ? 'Disable Portal' : 'Enable Portal'}
//           </button>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//         <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
//           <p className="text-xs text-gray-500">Total Vendors</p>
//           <p className="text-xl font-bold text-gray-900">{stats.totalVendors}</p>
//         </div>
//         <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
//           <p className="text-xs text-gray-500">Active Portal Users</p>
//           <p className="text-xl font-bold text-green-600">{stats.activeUsers}</p>
//         </div>
//         <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
//           <p className="text-xs text-gray-500">Pending Invitations</p>
//           <p className="text-xl font-bold text-yellow-600">{stats.pendingInvitations}</p>
//         </div>
//         <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
//           <p className="text-xs text-gray-500">Not Invited</p>
//           <p className="text-xl font-bold text-gray-600">{stats.notInvited}</p>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
//         <div className="flex flex-col md:flex-row gap-4">
//           <div className="flex-1 relative">
//             <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search vendors by name, code, or email..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//             />
//           </div>
//           <select
//             value={filterStatus}
//             onChange={(e) => setFilterStatus(e.target.value)}
//             className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
//           >
//             <option value="all">All Status</option>
//             <option value="active">Active</option>
//             <option value="accepted">Accepted</option>
//             <option value="invited">Invited</option>
//             <option value="not invited">Not Invited</option>
//           </select>
//         </div>
//       </div>

//       {/* Bulk Actions */}
//       {selectedVendors.length > 0 && (
//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
//           <span className="text-sm text-blue-800">{selectedVendors.length} vendor(s) selected</span>
//           <button
//             onClick={handleSendInvitations}
//             disabled={sendingInvites}
//             className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
//           >
//             {sendingInvites ? (
//               <>
//                 <RefreshCw size={14} className="mr-1 animate-spin" />
//                 Sending...
//               </>
//             ) : (
//               <>
//                 <Send size={14} className="mr-1" />
//                 Send Invitations
//               </>
//             )}
//           </button>
//         </div>
//       )}

//       {/* Vendors Table */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-4 py-3 text-left">
//                   <input
//                     type="checkbox"
//                     checked={selectAll}
//                     onChange={toggleSelectAll}
//                     className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                   />
//                 </th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Portal Status</th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invited On</th>
//                 <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {filteredVendors.map((vendor) => {
//                 const status = getPortalStatus(vendor)
//                 return (
//                   <tr key={vendor.id} className="hover:bg-gray-50">
//                     <td className="px-4 py-3">
//                       <input
//                         type="checkbox"
//                         checked={selectedVendors.includes(vendor.id)}
//                         onChange={() => toggleSelectVendor(vendor.id)}
//                         className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                       />
//                     </td>
//                     <td className="px-4 py-3">
//                       <span className="font-medium text-gray-900">{vendor.supplierName}</span>
//                     </td>
//                     <td className="px-4 py-3">
//                       <span className="text-sm text-gray-600">{vendor.supplierCode}</span>
//                     </td>
//                     <td className="px-4 py-3">
//                       <span className="text-sm text-gray-600">{vendor.email || '-'}</span>
//                     </td>
//                     <td className="px-4 py-3">
//                       {status.badge}
//                     </td>
//                     <td className="px-4 py-3 text-sm text-gray-600">
//                       {vendor.lastLoginAt ? new Date(vendor.lastLoginAt).toLocaleDateString() : '-'}
//                     </td>
//                     <td className="px-4 py-3 text-sm text-gray-600">
//                       {vendor.invitationSentAt ? new Date(vendor.invitationSentAt).toLocaleDateString() : '-'}
//                     </td>
//                     <td className="px-4 py-3 text-right">
//                       {!vendor.invitationStatus && (
//                         <button
//                           onClick={() => {
//                             setSelectedVendors([vendor.id])
//                             handleSendInvitations()
//                           }}
//                           className="p-1 text-gray-400 hover:text-green-600 mr-2"
//                           title="Send Invitation"
//                         >
//                           <Send size={16} />
//                         </button>
//                       )}
//                       {vendor.invitationStatus === 'sent' && (
//                         <button
//                           onClick={() => handleResendInvitation(vendor.id)}
//                           className="p-1 text-gray-400 hover:text-blue-600 mr-2"
//                           title="Resend Invitation"
//                         >
//                           <RefreshCw size={16} />
//                         </button>
//                       )}
//                       <Link
//                         href={`/vendors/${vendor.id}`}
//                         className="p-1 text-gray-400 hover:text-gray-600"
//                       >
//                         <ExternalLink size={16} />
//                       </Link>
//                     </td>
//                   </tr>
//                 )
//               })}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </MainLayout>
//   )
// }
// apps/web/app/vendors/portal/page.tsx
'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { apiClient } from '@/lib/api-client'
import { API_CONFIG } from '@/lib/config'
import {
  CheckCircle,
  Clock,
  RefreshCw,
  Send,
  Search,
  UserCheck,
  UserX,
  ExternalLink,
  ChevronRight,
  Globe,
  Trash2,
  Ban,
  Eye,
  Mail,
  AlertCircle,
  MoreVertical,
  Download,
  Filter,
  XCircle
} from 'lucide-react'
import Link from 'next/link'

interface VendorWithStatus {
  id: string
  supplierCode: string
  supplierName: string
  email: string | null
  status: string
  createdAt: string
  invitationStatus: string | null
  invitationSentAt: string | null
  invitationAcceptedAt: string | null
  lastLoginAt: string | null
  hasCredentials: boolean
  isActive: boolean
}

interface PortalStats {
  totalVendors: number
  activeUsers: number
  pendingInvitations: number
  notInvited: number
  frozenVendors: number
  deletedVendors: number
}

export default function VendorPortalManagementPage() {
  const [vendors, setVendors] = useState<VendorWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedVendors, setSelectedVendors] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [sendingInvites, setSendingInvites] = useState(false)
  const [portalEnabled, setPortalEnabled] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [showFreezeConfirm, setShowFreezeConfirm] = useState<string | null>(null)
  const [showBulkActionConfirm, setShowBulkActionConfirm] = useState<'delete' | 'freeze' | null>(null)
  const [stats, setStats] = useState<PortalStats>({
    totalVendors: 0,
    activeUsers: 0,
    pendingInvitations: 0,
    notInvited: 0,
    frozenVendors: 0,
    deletedVendors: 0
  })

  useEffect(() => {
    fetchVendorsWithPortalStatus()
    fetchPortalStats()
  }, [])

  const fetchVendorsWithPortalStatus = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get<{ data: VendorWithStatus[] }>(
        API_CONFIG.endpoints.vendors.management.listWithStatus,
        true
      )
      // Add isActive property based on status
      const vendorsWithActive = response.data.map(v => ({
        ...v,
        isActive: v.status !== 'frozen' && v.status !== 'deleted'
      }))
      setVendors(vendorsWithActive)
    } catch (err) {
      console.error('Error fetching vendors:', err)
      setError('Failed to load vendor data')
    } finally {
      setLoading(false)
    }
  }

  const fetchPortalStats = async () => {
    try {
      const response = await apiClient.get<{ data: PortalStats }>(
        API_CONFIG.endpoints.vendors.management.portalStats,
        true
      )
      setStats(response.data)
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

const handleSendInvitations = async () => {
  console.log('=== SENDING INVITATIONS ===')
  console.log('Selected vendors array:', selectedVendors)
  
  if (selectedVendors.length === 0) {
    alert('Please select at least one vendor to invite')
    return
  }

  // Make sure we have valid IDs
  const validVendorIds = selectedVendors.filter(id => id && id.length > 0)
  console.log('Valid vendor IDs:', validVendorIds)

  setSendingInvites(true)
  try {
    const response = await apiClient.post<{ data: any; message: string }>(
      API_CONFIG.endpoints.vendors.management.bulkInvite,
      { vendorIds: validVendorIds },
      true
    )

    console.log('Response:', response)
    alert(response.data?.message || response.message || 'Invitations sent successfully')
    
    await fetchVendorsWithPortalStatus()
    await fetchPortalStats()
    setSelectedVendors([])
    setSelectAll(false)
  } catch (err: any) {
    console.error('Error sending invitations:', err)
    alert(err.message || 'Failed to send invitations')
  } finally {
    setSendingInvites(false)
  }
}

  const handleSingleInvite = async (vendorId: string) => {
    setSendingInvites(true)
    try {
      const response = await apiClient.post<{ data: any; message: string }>(
        API_CONFIG.endpoints.vendors.management.bulkInvite,
        { vendorIds: [vendorId] },
        true
      )

      alert(response.data?.message || response.message || 'Invitation sent successfully')
      
      await fetchVendorsWithPortalStatus()
      await fetchPortalStats()
    } catch (err: any) {
      console.error('Error sending invitation:', err)
      alert(err.message || 'Failed to send invitation')
    } finally {
      setSendingInvites(false)
    }
  }

  const handleResendInvitation = async (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId)
    if (!vendor) return

    try {
      await apiClient.post(
        API_CONFIG.endpoints.vendors.management.resendInvitation(vendor.supplierCode),
        {},
        true
      )
      alert('Invitation resent successfully')
      await fetchVendorsWithPortalStatus()
    } catch (err) {
      console.error('Error resending invitation:', err)
      alert('Failed to resend invitation')
    }
  }

  const handleFreezeVendor = async (vendorId: string) => {
    try {
      await apiClient.put(
        `/api/vendor-management/vendors/${vendorId}/freeze`,
        {},
        true
      )
      alert('Vendor frozen successfully')
      await fetchVendorsWithPortalStatus()
      await fetchPortalStats()
      setShowFreezeConfirm(null)
    } catch (err) {
      console.error('Error freezing vendor:', err)
      alert('Failed to freeze vendor')
    }
  }

  const handleDeleteVendor = async (vendorId: string) => {
    try {
      await apiClient.delete(
        `/api/vendor-management/vendors/${vendorId}`,
        true
      )
      alert('Vendor deleted successfully')
      await fetchVendorsWithPortalStatus()
      await fetchPortalStats()
      setShowDeleteConfirm(null)
    } catch (err) {
      console.error('Error deleting vendor:', err)
      alert('Failed to delete vendor')
    }
  }

  const handleActivateVendor = async (vendorId: string) => {
    try {
      await apiClient.put(
        `/api/vendor-management/vendors/${vendorId}/activate`,
        {},
        true
      )
      alert('Vendor activated successfully')
      await fetchVendorsWithPortalStatus()
      await fetchPortalStats()
    } catch (err) {
      console.error('Error activating vendor:', err)
      alert('Failed to activate vendor')
    }
  }

  const handleBulkAction = async (action: 'delete' | 'freeze') => {
    if (selectedVendors.length === 0) return

    try {
      await apiClient.post(
        `/api/vendor-management/vendors/bulk-${action}`,
        { vendorIds: selectedVendors },
        true
      )
      alert(`${selectedVendors.length} vendor(s) ${action === 'delete' ? 'deleted' : 'frozen'} successfully`)
      await fetchVendorsWithPortalStatus()
      await fetchPortalStats()
      setSelectedVendors([])
      setSelectAll(false)
      setShowBulkActionConfirm(null)
    } catch (err) {
      console.error(`Error bulk ${action}:`, err)
      alert(`Failed to ${action} vendors`)
    }
  }

  const getPortalStatus = (vendor: VendorWithStatus) => {
    if (vendor.status === 'frozen') {
      return {
        label: 'Frozen',
        badge: (
          <span className="px-2 py-1 bg-gray-500 text-white text-xs font-medium rounded-full flex items-center w-fit">
            <Ban size={12} className="mr-1" /> Frozen
          </span>
        )
      }
    }
    if (vendor.status === 'deleted') {
      return {
        label: 'Deleted',
        badge: (
          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full flex items-center w-fit">
            <XCircle size={12} className="mr-1" /> Deleted
          </span>
        )
      }
    }
    if (vendor.hasCredentials && vendor.lastLoginAt) {
      return {
        label: 'Active',
        badge: (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center w-fit">
            <UserCheck size={12} className="mr-1" /> Active
          </span>
        )
      }
    }
    if (vendor.invitationStatus === 'accepted') {
      return {
        label: 'Accepted',
        badge: (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full flex items-center w-fit">
            <CheckCircle size={12} className="mr-1" /> Accepted
          </span>
        )
      }
    }
    if (vendor.invitationStatus === 'sent') {
      return {
        label: 'Invited',
        badge: (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full flex items-center w-fit">
            <Clock size={12} className="mr-1" /> Invited
          </span>
        )
      }
    }
    return {
      label: 'Not Invited',
      badge: (
        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full flex items-center w-fit">
          <UserX size={12} className="mr-1" /> Not Invited
        </span>
      )
    }
  }

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = 
      vendor.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.supplierCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vendor.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    
    const status = getPortalStatus(vendor).label.toLowerCase()
    const matchesFilter = filterStatus === 'all' || status.includes(filterStatus)
    
    return matchesSearch && matchesFilter
  })

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedVendors([])
      setSelectAll(false)
    } else {
      const allIds = filteredVendors.map(v => v.id)
      setSelectedVendors(allIds)
      setSelectAll(true)
    }
  }

  const toggleSelectVendor = (vendorId: string) => {
    setSelectedVendors(prev => {
      if (prev.includes(vendorId)) {
        const newSelected = prev.filter(id => id !== vendorId)
        setSelectAll(false)
        return newSelected
      } else {
        const newSelected = [...prev, vendorId]
        if (newSelected.length === filteredVendors.length) {
          setSelectAll(true)
        } else {
          setSelectAll(false)
        }
        return newSelected
      }
    })
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
              <span>Vendors</span>
              <ChevronRight size={14} />
              <span className="text-gray-900">Vendor Portal</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Vendor Portal Management</h1>
            <p className="text-gray-600 mt-1">Manage vendor access, invitations, and portal settings</p>
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
              <Download size={16} />
              <span>Export</span>
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <Mail size={16} />
              <span>Bulk Email</span>
            </button>
          </div>
        </div>

        {/* Portal Status Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${portalEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Globe className={`w-6 h-6 ${portalEnabled ? 'text-green-600' : 'text-gray-600'}`} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Portal Status</h2>
                <p className="text-sm text-gray-600">
                  {portalEnabled 
                    ? 'Your vendor portal is active and accessible' 
                    : 'Your vendor portal is currently disabled'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setPortalEnabled(!portalEnabled)}
              className={`px-4 py-2 rounded-lg font-medium ${
                portalEnabled 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {portalEnabled ? 'Disable Portal' : 'Enable Portal'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-xs text-gray-500">Total Vendors</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalVendors}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-xs text-gray-500">Active Portal Users</p>
            <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-xs text-gray-500">Pending Invitations</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingInvitations}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-xs text-gray-500">Not Invited</p>
            <p className="text-2xl font-bold text-gray-600">{stats.notInvited}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-xs text-gray-500">Frozen</p>
            <p className="text-2xl font-bold text-gray-600">{stats.frozenVendors || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-xs text-gray-500">Deleted</p>
            <p className="text-2xl font-bold text-red-600">{stats.deletedVendors || 0}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendors by name, code, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="accepted">Accepted</option>
              <option value="invited">Invited</option>
              <option value="not invited">Not Invited</option>
              <option value="frozen">Frozen</option>
              <option value="deleted">Deleted</option>
            </select>
            <button className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedVendors.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <span className="text-sm text-blue-800">{selectedVendors.length} vendor(s) selected</span>
            <div className="flex space-x-2">
              <button
                onClick={handleSendInvitations}
                disabled={sendingInvites}
                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                <Send size={14} className="mr-1" />
                Send Invitations
              </button>
              <button
                onClick={() => setShowBulkActionConfirm('freeze')}
                className="px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 flex items-center"
              >
                <Ban size={14} className="mr-1" />
                Freeze Selected
              </button>
              <button
                onClick={() => setShowBulkActionConfirm('delete')}
                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 flex items-center"
              >
                <Trash2 size={14} className="mr-1" />
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedVendors([])}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Vendors Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left w-10">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Portal Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invited On</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredVendors.map((vendor) => {
                  const status = getPortalStatus(vendor)
                  const isActive = vendor.status !== 'frozen' && vendor.status !== 'deleted'
                  return (
                    <tr key={vendor.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedVendors.includes(vendor.id)}
                          onChange={() => toggleSelectVendor(vendor.id)}
                          disabled={!isActive}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{vendor.supplierName}</div>
                        {!isActive && (
                          <span className="text-xs text-gray-400">Account {vendor.status}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{vendor.supplierCode}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{vendor.email || '-'}</span>
                      </td>
                      <td className="px-4 py-3">
                        {status.badge}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {vendor.lastLoginAt ? new Date(vendor.lastLoginAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {vendor.invitationSentAt ? new Date(vendor.invitationSentAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {!vendor.invitationStatus && isActive && (
                            <button
                              onClick={() => handleSingleInvite(vendor.id)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Send Invitation"
                            >
                              <Send size={16} />
                            </button>
                          )}
                          {vendor.invitationStatus === 'sent' && isActive && (
                            <button
                              onClick={() => handleResendInvitation(vendor.id)}
                              className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                              title="Resend Invitation"
                            >
                              <RefreshCw size={16} />
                            </button>
                          )}
                          {isActive && (
                            <>
                              <button
                                onClick={() => setShowFreezeConfirm(vendor.id)}
                                className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                                title="Freeze Vendor"
                              >
                                <Ban size={16} />
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(vendor.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Delete Vendor"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                          {vendor.status === 'frozen' && (
                            <button
                              onClick={() => handleActivateVendor(vendor.id)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Activate Vendor"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          <Link
                            href={`/vendors/${vendor.id}`}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </Link>
                        </div>
                       </td>
                     </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Delete Vendor</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete this vendor? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteVendor(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Freeze Confirmation Modal */}
      {showFreezeConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Ban className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Freeze Vendor</h3>
            <p className="text-gray-600 text-center mb-6">
              Freezing this vendor will prevent them from accessing the portal. You can unfreeze them later.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowFreezeConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleFreezeVendor(showFreezeConfirm)}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Freeze
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Confirmation Modal */}
      {showBulkActionConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${showBulkActionConfirm === 'delete' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                {showBulkActionConfirm === 'delete' ? (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                ) : (
                  <Ban className="w-6 h-6 text-yellow-600" />
                )}
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              {showBulkActionConfirm === 'delete' ? 'Delete Vendors' : 'Freeze Vendors'}
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to {showBulkActionConfirm} {selectedVendors.length} vendor(s)?
              {showBulkActionConfirm === 'delete' && ' This action cannot be undone.'}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBulkActionConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBulkAction(showBulkActionConfirm)}
                className={`flex-1 px-4 py-2 rounded-lg text-white ${showBulkActionConfirm === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}
              >
                {showBulkActionConfirm === 'delete' ? 'Delete' : 'Freeze'}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}