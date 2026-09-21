
// // apps/web/app/vendors/portal/page.tsx
// 'use client'

// import { useState, useEffect } from 'react'
// import MainLayout from '@/components/layout/MainLayout'
// import { apiClient } from '@/lib/api-client'
// import { API_CONFIG } from '@/lib/config'
// import {
//   CheckCircle,
//   Clock,
//   RefreshCw,
//   Send,
//   Search,
//   UserCheck,
//   UserX,
//   ExternalLink,
//   ChevronRight,
//   Globe,
//   Trash2,
//   Ban,
//   Eye,
//   Mail,
//   AlertCircle,
//   MoreVertical,
//   Download,
//   Filter,
//   XCircle
// } from 'lucide-react'
// import Link from 'next/link'

// interface VendorWithStatus {
//   id: string
//   supplierCode: string
//   supplierName: string
//   email: string | null
//   status: string
//   createdAt: string
//   invitationStatus: string | null
//   invitationSentAt: string | null
//   invitationAcceptedAt: string | null
//   lastLoginAt: string | null
//   hasCredentials: boolean
//   isActive: boolean
// }

// interface PortalStats {
//   totalVendors: number
//   activeUsers: number
//   pendingInvitations: number
//   notInvited: number
//   frozenVendors: number
//   deletedVendors: number
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
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
//   const [showFreezeConfirm, setShowFreezeConfirm] = useState<string | null>(null)
//   const [showBulkActionConfirm, setShowBulkActionConfirm] = useState<'delete' | 'freeze' | null>(null)
//   const [stats, setStats] = useState<PortalStats>({
//     totalVendors: 0,
//     activeUsers: 0,
//     pendingInvitations: 0,
//     notInvited: 0,
//     frozenVendors: 0,
//     deletedVendors: 0
//   })

//   useEffect(() => {
//     fetchVendorsWithPortalStatus()
//     fetchPortalStats()
//   }, [])

//   const fetchVendorsWithPortalStatus = async () => {
//     setLoading(true)
//     try {
//       const response = await apiClient.get<{ data: VendorWithStatus[] }>(
//         API_CONFIG.endpoints.vendors.management.listWithStatus,
//         true
//       )
//       // Add isActive property based on status
//       const vendorsWithActive = response.data.map(v => ({
//         ...v,
//         isActive: v.status !== 'frozen' && v.status !== 'deleted'
//       }))
//       setVendors(vendorsWithActive)
//     } catch (err) {
//       console.error('Error fetching vendors:', err)
//       setError('Failed to load vendor data')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const fetchPortalStats = async () => {
//     try {
//       const response = await apiClient.get<{ data: PortalStats }>(
//         API_CONFIG.endpoints.vendors.management.portalStats,
//         true
//       )
//       setStats(response.data)
//     } catch (err) {
//       console.error('Error fetching stats:', err)
//     }
//   }

// const handleSendInvitations = async () => {
//   console.log('=== SENDING INVITATIONS ===')
//   console.log('Selected vendors array:', selectedVendors)
  
//   if (selectedVendors.length === 0) {
//     alert('Please select at least one vendor to invite')
//     return
//   }

//   // Make sure we have valid IDs
//   const validVendorIds = selectedVendors.filter(id => id && id.length > 0)
//   console.log('Valid vendor IDs:', validVendorIds)

//   setSendingInvites(true)
//   try {
//     const response = await apiClient.post<{ data: any; message: string }>(
//       API_CONFIG.endpoints.vendors.management.bulkInvite,
//       { vendorIds: validVendorIds },
//       true
//     )

//     console.log('Response:', response)
//     alert(response.data?.message || response.message || 'Invitations sent successfully')
    
//     await fetchVendorsWithPortalStatus()
//     await fetchPortalStats()
//     setSelectedVendors([])
//     setSelectAll(false)
//   } catch (err: any) {
//     console.error('Error sending invitations:', err)
//     alert(err.message || 'Failed to send invitations')
//   } finally {
//     setSendingInvites(false)
//   }
// }

//   const handleSingleInvite = async (vendorId: string) => {
//     setSendingInvites(true)
//     try {
//       const response = await apiClient.post<{ data: any; message: string }>(
//         API_CONFIG.endpoints.vendors.management.bulkInvite,
//         { vendorIds: [vendorId] },
//         true
//       )

//       alert(response.data?.message || response.message || 'Invitation sent successfully')
      
//       await fetchVendorsWithPortalStatus()
//       await fetchPortalStats()
//     } catch (err: any) {
//       console.error('Error sending invitation:', err)
//       alert(err.message || 'Failed to send invitation')
//     } finally {
//       setSendingInvites(false)
//     }
//   }

//   const handleResendInvitation = async (vendorId: string) => {
//     const vendor = vendors.find(v => v.id === vendorId)
//     if (!vendor) return

//     try {
//       await apiClient.post(
//         API_CONFIG.endpoints.vendors.management.resendInvitation(vendor.supplierCode),
//         {},
//         true
//       )
//       alert('Invitation resent successfully')
//       await fetchVendorsWithPortalStatus()
//     } catch (err) {
//       console.error('Error resending invitation:', err)
//       alert('Failed to resend invitation')
//     }
//   }

//   const handleFreezeVendor = async (vendorId: string) => {
//     try {
//       await apiClient.put(
//         `/api/vendor-management/vendors/${vendorId}/freeze`,
//         {},
//         true
//       )
//       alert('Vendor frozen successfully')
//       await fetchVendorsWithPortalStatus()
//       await fetchPortalStats()
//       setShowFreezeConfirm(null)
//     } catch (err) {
//       console.error('Error freezing vendor:', err)
//       alert('Failed to freeze vendor')
//     }
//   }

//   const handleDeleteVendor = async (vendorId: string) => {
//     try {
//       await apiClient.delete(
//         `/api/vendor-management/vendors/${vendorId}`,
//         true
//       )
//       alert('Vendor deleted successfully')
//       await fetchVendorsWithPortalStatus()
//       await fetchPortalStats()
//       setShowDeleteConfirm(null)
//     } catch (err) {
//       console.error('Error deleting vendor:', err)
//       alert('Failed to delete vendor')
//     }
//   }

//   const handleActivateVendor = async (vendorId: string) => {
//     try {
//       await apiClient.put(
//         `/api/vendor-management/vendors/${vendorId}/activate`,
//         {},
//         true
//       )
//       alert('Vendor activated successfully')
//       await fetchVendorsWithPortalStatus()
//       await fetchPortalStats()
//     } catch (err) {
//       console.error('Error activating vendor:', err)
//       alert('Failed to activate vendor')
//     }
//   }

//   const handleBulkAction = async (action: 'delete' | 'freeze') => {
//     if (selectedVendors.length === 0) return

//     try {
//       await apiClient.post(
//         `/api/vendor-management/vendors/bulk-${action}`,
//         { vendorIds: selectedVendors },
//         true
//       )
//       alert(`${selectedVendors.length} vendor(s) ${action === 'delete' ? 'deleted' : 'frozen'} successfully`)
//       await fetchVendorsWithPortalStatus()
//       await fetchPortalStats()
//       setSelectedVendors([])
//       setSelectAll(false)
//       setShowBulkActionConfirm(null)
//     } catch (err) {
//       console.error(`Error bulk ${action}:`, err)
//       alert(`Failed to ${action} vendors`)
//     }
//   }

//   const getPortalStatus = (vendor: VendorWithStatus) => {
//     if (vendor.status === 'frozen') {
//       return {
//         label: 'Frozen',
//         badge: (
//           <span className="px-2 py-1 bg-gray-500 text-white text-xs font-medium rounded-full flex items-center w-fit">
//             <Ban size={12} className="mr-1" /> Frozen
//           </span>
//         )
//       }
//     }
//     if (vendor.status === 'deleted') {
//       return {
//         label: 'Deleted',
//         badge: (
//           <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs font-medium rounded-full flex items-center w-fit">
//             <XCircle size={12} className="mr-1" /> Deleted
//           </span>
//         )
//       }
//     }
//     if (vendor.hasCredentials && vendor.lastLoginAt) {
//       return {
//         label: 'Active',
//         badge: (
//           <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded-full flex items-center w-fit">
//             <UserCheck size={12} className="mr-1" /> Active
//           </span>
//         )
//       }
//     }
//     if (vendor.invitationStatus === 'accepted') {
//       return {
//         label: 'Accepted',
//         badge: (
//           <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium rounded-full flex items-center w-fit">
//             <CheckCircle size={12} className="mr-1" /> Accepted
//           </span>
//         )
//       }
//     }
//     if (vendor.invitationStatus === 'sent') {
//       return {
//         label: 'Invited',
//         badge: (
//           <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-medium rounded-full flex items-center w-fit">
//             <Clock size={12} className="mr-1" /> Invited
//           </span>
//         )
//       }
//     }
//     return {
//       label: 'Not Invited',
//       badge: (
//         <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-medium rounded-full flex items-center w-fit">
//           <UserX size={12} className="mr-1" /> Not Invited
//         </span>
//       )
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
//       setSelectAll(false)
//     } else {
//       const allIds = filteredVendors.map(v => v.id)
//       setSelectedVendors(allIds)
//       setSelectAll(true)
//     }
//   }

//   const toggleSelectVendor = (vendorId: string) => {
//     setSelectedVendors(prev => {
//       if (prev.includes(vendorId)) {
//         const newSelected = prev.filter(id => id !== vendorId)
//         setSelectAll(false)
//         return newSelected
//       } else {
//         const newSelected = [...prev, vendorId]
//         if (newSelected.length === filteredVendors.length) {
//           setSelectAll(true)
//         } else {
//           setSelectAll(false)
//         }
//         return newSelected
//       }
//     })
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
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-6">
//           <div>
//             <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
//               <span>Vendors</span>
//               <ChevronRight size={14} />
//               <span className="text-gray-900 dark:text-gray-100">Vendor Portal</span>
//             </div>
//             <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Vendor Portal Management</h1>
//             <p className="text-gray-600 dark:text-gray-400 mt-1">Manage vendor access, invitations, and portal settings</p>
//           </div>
//           <div className="flex space-x-2">
//             <button className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center space-x-2">
//               <Download size={16} />
//               <span>Export</span>
//             </button>
//             <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
//               <Mail size={16} />
//               <span>Bulk Email</span>
//             </button>
//           </div>
//         </div>

//         {/* Portal Status Card */}
//         <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <div className={`p-3 rounded-lg ${portalEnabled ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
//                 <Globe className={`w-6 h-6 ${portalEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`} />
//               </div>
//               <div>
//                 <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Portal Status</h2>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">
//                   {portalEnabled 
//                     ? 'Your vendor portal is active and accessible' 
//                     : 'Your vendor portal is currently disabled'}
//                 </p>
//               </div>
//             </div>
//             <button
//               onClick={() => setPortalEnabled(!portalEnabled)}
//               className={`px-4 py-2 rounded-lg font-medium ${
//                 portalEnabled 
//                   ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200' 
//                   : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200'
//               }`}
//             >
//               {portalEnabled ? 'Disable Portal' : 'Enable Portal'}
//             </button>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
//           <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-800">
//             <p className="text-xs text-gray-500 dark:text-gray-400">Total Vendors</p>
//             <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalVendors}</p>
//           </div>
//           <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-800">
//             <p className="text-xs text-gray-500 dark:text-gray-400">Active Portal Users</p>
//             <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.activeUsers}</p>
//           </div>
//           <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-800">
//             <p className="text-xs text-gray-500 dark:text-gray-400">Pending Invitations</p>
//             <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingInvitations}</p>
//           </div>
//           <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-800">
//             <p className="text-xs text-gray-500 dark:text-gray-400">Not Invited</p>
//             <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.notInvited}</p>
//           </div>
//           <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-800">
//             <p className="text-xs text-gray-500 dark:text-gray-400">Frozen</p>
//             <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.frozenVendors || 0}</p>
//           </div>
//           <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-800">
//             <p className="text-xs text-gray-500 dark:text-gray-400">Deleted</p>
//             <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.deletedVendors || 0}</p>
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
//           <div className="flex flex-col md:flex-row gap-4">
//             <div className="flex-1 relative">
//               <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
//               <input
//                 type="text"
//                 placeholder="Search vendors by name, code, or email..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//               />
//             </div>
//             <select
//               value={filterStatus}
//               onChange={(e) => setFilterStatus(e.target.value)}
//               className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
//             >
//               <option value="all">All Status</option>
//               <option value="active">Active</option>
//               <option value="accepted">Accepted</option>
//               <option value="invited">Invited</option>
//               <option value="not invited">Not Invited</option>
//               <option value="frozen">Frozen</option>
//               <option value="deleted">Deleted</option>
//             </select>
//             <button className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
//               <Filter size={18} className="text-gray-600 dark:text-gray-400" />
//             </button>
//           </div>
//         </div>

//         {/* Bulk Actions */}
//         {selectedVendors.length > 0 && (
//           <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 flex items-center justify-between">
//             <span className="text-sm text-blue-800 dark:text-blue-300">{selectedVendors.length} vendor(s) selected</span>
//             <div className="flex space-x-2">
//               <button
//                 onClick={handleSendInvitations}
//                 disabled={sendingInvites}
//                 className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
//               >
//                 <Send size={14} className="mr-1" />
//                 Send Invitations
//               </button>
//               <button
//                 onClick={() => setShowBulkActionConfirm('freeze')}
//                 className="px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 flex items-center"
//               >
//                 <Ban size={14} className="mr-1" />
//                 Freeze Selected
//               </button>
//               <button
//                 onClick={() => setShowBulkActionConfirm('delete')}
//                 className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 flex items-center"
//               >
//                 <Trash2 size={14} className="mr-1" />
//                 Delete Selected
//               </button>
//               <button
//                 onClick={() => setSelectedVendors([])}
//                 className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-300"
//               >
//                 Clear
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Vendors Table */}
//         <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50 dark:bg-gray-800">
//                 <tr>
//                   <th className="px-4 py-3 text-left w-10">
//                     <input
//                       type="checkbox"
//                       checked={selectAll}
//                       onChange={toggleSelectAll}
//                       className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500"
//                     />
//                   </th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Vendor</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Code</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Portal Status</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Last Login</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Invited On</th>
//                   <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                 {filteredVendors.map((vendor) => {
//                   const status = getPortalStatus(vendor)
//                   const isActive = vendor.status !== 'frozen' && vendor.status !== 'deleted'
//                   return (
//                     <tr key={vendor.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
//                       <td className="px-4 py-3">
//                         <input
//                           type="checkbox"
//                           checked={selectedVendors.includes(vendor.id)}
//                           onChange={() => toggleSelectVendor(vendor.id)}
//                           disabled={!isActive}
//                           className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 disabled:opacity-50"
//                         />
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="font-medium text-gray-900 dark:text-gray-100">{vendor.supplierName}</div>
//                         {!isActive && (
//                           <span className="text-xs text-gray-400 dark:text-gray-500">Account {vendor.status}</span>
//                         )}
//                       </td>
//                       <td className="px-4 py-3">
//                         <span className="text-sm text-gray-600 dark:text-gray-400">{vendor.supplierCode}</span>
//                       </td>
//                       <td className="px-4 py-3">
//                         <span className="text-sm text-gray-600 dark:text-gray-400">{vendor.email || '-'}</span>
//                       </td>
//                       <td className="px-4 py-3">
//                         {status.badge}
//                       </td>
//                       <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
//                         {vendor.lastLoginAt ? new Date(vendor.lastLoginAt).toLocaleDateString() : '-'}
//                       </td>
//                       <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
//                         {vendor.invitationSentAt ? new Date(vendor.invitationSentAt).toLocaleDateString() : '-'}
//                       </td>
//                       <td className="px-4 py-3 text-center">
//                         <div className="flex items-center justify-center space-x-1">
//                           {!vendor.invitationStatus && isActive && (
//                             <button
//                               onClick={() => handleSingleInvite(vendor.id)}
//                               className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
//                               title="Send Invitation"
//                             >
//                               <Send size={16} />
//                             </button>
//                           )}
//                           {vendor.invitationStatus === 'sent' && isActive && (
//                             <button
//                               onClick={() => handleResendInvitation(vendor.id)}
//                               className="p-1.5 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition"
//                               title="Resend Invitation"
//                             >
//                               <RefreshCw size={16} />
//                             </button>
//                           )}
//                           {isActive && (
//                             <>
//                               <button
//                                 onClick={() => setShowFreezeConfirm(vendor.id)}
//                                 className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition"
//                                 title="Freeze Vendor"
//                               >
//                                 <Ban size={16} />
//                               </button>
//                               <button
//                                 onClick={() => setShowDeleteConfirm(vendor.id)}
//                                 className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
//                                 title="Delete Vendor"
//                               >
//                                 <Trash2 size={16} />
//                               </button>
//                             </>
//                           )}
//                           {vendor.status === 'frozen' && (
//                             <button
//                               onClick={() => handleActivateVendor(vendor.id)}
//                               className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
//                               title="Activate Vendor"
//                             >
//                               <CheckCircle size={16} />
//                             </button>
//                           )}
//                           <Link
//                             href={`/vendors/${vendor.id}`}
//                             className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
//                             title="View Details"
//                           >
//                             <Eye size={16} />
//                           </Link>
//                         </div>
//                        </td>
//                      </tr>
//                   )
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* Delete Confirmation Modal */}
//       {showDeleteConfirm && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6">
//             <div className="flex items-center justify-center mb-4">
//               <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
//                 <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
//               </div>
//             </div>
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center mb-2">Delete Vendor</h3>
//             <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
//               Are you sure you want to delete this vendor? This action cannot be undone.
//             </p>
//             <div className="flex space-x-3">
//               <button
//                 onClick={() => setShowDeleteConfirm(null)}
//                 className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => handleDeleteVendor(showDeleteConfirm)}
//                 className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Freeze Confirmation Modal */}
//       {showFreezeConfirm && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6">
//             <div className="flex items-center justify-center mb-4">
//               <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
//                 <Ban className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
//               </div>
//             </div>
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center mb-2">Freeze Vendor</h3>
//             <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
//               Freezing this vendor will prevent them from accessing the portal. You can unfreeze them later.
//             </p>
//             <div className="flex space-x-3">
//               <button
//                 onClick={() => setShowFreezeConfirm(null)}
//                 className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => handleFreezeVendor(showFreezeConfirm)}
//                 className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
//               >
//                 Freeze
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Bulk Action Confirmation Modal */}
//       {showBulkActionConfirm && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6">
//             <div className="flex items-center justify-center mb-4">
//               <div className={`w-12 h-12 rounded-full flex items-center justify-center ${showBulkActionConfirm === 'delete' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
//                 {showBulkActionConfirm === 'delete' ? (
//                   <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
//                 ) : (
//                   <Ban className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
//                 )}
//               </div>
//             </div>
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center mb-2">
//               {showBulkActionConfirm === 'delete' ? 'Delete Vendors' : 'Freeze Vendors'}
//             </h3>
//             <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
//               Are you sure you want to {showBulkActionConfirm} {selectedVendors.length} vendor(s)?
//               {showBulkActionConfirm === 'delete' && ' This action cannot be undone.'}
//             </p>
//             <div className="flex space-x-3">
//               <button
//                 onClick={() => setShowBulkActionConfirm(null)}
//                 className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => handleBulkAction(showBulkActionConfirm)}
//                 className={`flex-1 px-4 py-2 rounded-lg text-white ${showBulkActionConfirm === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}
//               >
//                 {showBulkActionConfirm === 'delete' ? 'Delete' : 'Freeze'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </MainLayout>
//   )
// }



'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import {
  CheckCircle,
  Clock,
  RefreshCw,
  Send,
  Search,
  UserCheck,
  UserX,
  ChevronRight,
  Globe,
  Trash2,
  Ban,
  Eye,
  Mail,
  AlertCircle,
  Download,
  Filter,
  XCircle,
  Zap
} from 'lucide-react'
import Link from 'next/link'

interface VendorWithStatus {
  id: string
  supplierCode: string
  supplierName: string
  email: string | null
  status: string
  city: string | null
  country: string | null
  taxNumber: string | null
  createdAt: string
  isActive: boolean
  source: 'SAP'
}

interface PortalStats {
  totalVendors: number
  activeVendors: number
  vendorsWithGSTN: number
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
  const [stats, setStats] = useState<PortalStats>({
    totalVendors: 0,
    activeVendors: 0,
    vendorsWithGSTN: 0
  })

  useEffect(() => {
    fetchVendorsFromSAP()
  }, [])

  const fetchVendorsFromSAP = async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.href = '/admin-login'
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sap/vendors?limit=200`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success && data.data) {
        const transformedVendors = data.data.map((vendor: any) => {
          const email = vendor.EmailAddress || null

          return {
            id: vendor.BusinessPartner,
            supplierCode: vendor.BusinessPartner,
            supplierName: vendor.BusinessPartnerName || 'Unknown',
            email: email,
            status: 'active',
            city: vendor.CityName || null,
            country: vendor.Country || null,
            taxNumber: vendor.TaxNumber || null,
            createdAt: vendor.CreationDate || new Date().toISOString(),
            isActive: true,
            source: 'SAP' as const
          }
        })

        setVendors(transformedVendors)

        setStats({
          totalVendors: transformedVendors.length,
          activeVendors: transformedVendors.length,
          vendorsWithGSTN: transformedVendors.filter(v => v.taxNumber).length
        })
      } else {
        setError(data.error || 'Failed to fetch vendors from SAP')
      }
    } catch (err: any) {
      console.error('Error fetching vendors from SAP:', err)
      setError(err.message || 'Failed to connect to SAP')
    } finally {
      setLoading(false)
    }
  }

  const getPortalStatus = (vendor: VendorWithStatus) => {
    return {
      label: 'Active',
      badge: (
        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded-full flex items-center w-fit">
          <UserCheck size={12} className="mr-1" /> Active
        </span>
      )
    }
  }

  // Send invitation using the new SAP invitation endpoint
  const handleSendInvitations = async () => {
    if (selectedVendors.length === 0) {
      alert('Please select at least one vendor to invite')
      return
    }

    setSendingInvites(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Please login again')
        return
      }

      console.log('📤 Sending invitations for vendors:', selectedVendors)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sap/invitations/bulk-invite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vendorIds: selectedVendors })
      })

      const data = await response.json()
      console.log('📥 Response:', data)

      if (response.ok && data.success) {
        const { successCount, failCount, errors } = data.data || {}
        
        if (successCount > 0 && failCount === 0) {
          alert(`✅ Invitations sent to ${successCount} vendor(s)`)
        } else if (successCount > 0 && failCount > 0) {
          alert(`✅ ${successCount} invitations sent, ${failCount} failed\n\nErrors:\n${errors?.join('\n') || 'Check logs for details'}`)
        } else {
          alert(`❌ Failed to send invitations:\n${errors?.join('\n') || 'Unknown error'}`)
        }
        
        setSelectedVendors([])
        setSelectAll(false)
      } else {
        alert(`❌ Failed: ${data.error || 'Unknown error'}`)
      }
    } catch (err: any) {
      console.error('Error sending invitations:', err)
      alert(`❌ Error: ${err.message || 'Failed to send invitations'}`)
    } finally {
      setSendingInvites(false)
    }
  }

  // Send single invitation
  const handleSingleInvite = async (vendorId: string) => {
    setSendingInvites(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Please login again')
        return
      }

      console.log('📤 Sending invitation to vendor:', vendorId)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sap/invitations/invite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vendorId: vendorId })
      })

      const data = await response.json()
      console.log('📥 Response:', data)

      if (response.ok && data.success) {
        alert(`✅ Invitation sent to ${data.data?.vendorName || vendorId}`)
        // Refresh vendors to update status
        await fetchVendorsFromSAP()
      } else {
        alert(`❌ Failed: ${data.error || 'Unknown error'}`)
      }
    } catch (err: any) {
      console.error('Error sending invitation:', err)
      alert(`❌ Error: ${err.message || 'Failed to send invitation'}`)
    } finally {
      setSendingInvites(false)
    }
  }

  const vendorHasEmail = (vendor: VendorWithStatus): boolean => {
    return !!(vendor.email && vendor.email !== 'null')
  }

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = 
      vendor.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.supplierCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vendor.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (vendor.city?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (vendor.country?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    
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
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
              <span>Vendors</span>
              <ChevronRight size={14} />
              <span className="text-gray-900 dark:text-gray-100">Vendor Portal</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Vendor Portal Management</h1>
            <div className="flex items-center space-x-3 mt-1">
              <p className="text-gray-600 dark:text-gray-400">Live Vendor Master Data from SAP S/4HANA</p>
              <span className="flex items-center text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">
                <Zap size={12} className="mr-1" />
                SAP Live
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={fetchVendorsFromSAP}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center space-x-2"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Refresh from SAP</span>
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <Mail size={16} />
              <span>Bulk Email</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">SAP Connection Error</p>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              <button 
                onClick={fetchVendorsFromSAP}
                className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Portal Status Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${portalEnabled ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                <Globe className={`w-6 h-6 ${portalEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Portal Status</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {portalEnabled 
                    ? 'Your vendor portal is active and accessible' 
                    : 'Your vendor portal is currently disabled'}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Data from SAP S/4HANA</p>
              </div>
            </div>
            <button
              onClick={() => setPortalEnabled(!portalEnabled)}
              className={`px-4 py-2 rounded-lg font-medium ${
                portalEnabled 
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200' 
                  : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200'
              }`}
            >
              {portalEnabled ? 'Disable Portal' : 'Enable Portal'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Vendors (SAP)</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalVendors.toLocaleString()}</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Live from SAP</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">Active Vendors</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.activeVendors.toLocaleString()}</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Live from SAP</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">Vendors with GSTN</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.vendorsWithGSTN}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">From SAP data</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search vendors by name, code, email, city, or country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
            </select>
            <button className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <Filter size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedVendors.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 flex items-center justify-between">
            <span className="text-sm text-blue-800 dark:text-blue-300">{selectedVendors.length} vendor(s) selected</span>
            <div className="flex space-x-2">
              <button
                onClick={handleSendInvitations}
                disabled={sendingInvites}
                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                <Send size={14} className="mr-1" />
                {sendingInvites ? 'Sending...' : 'Send Invitations'}
              </button>
              <button
                onClick={() => setSelectedVendors([])}
                className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-300"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Vendors Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left w-10">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Vendor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">GSTN</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredVendors.map((vendor) => {
                  const status = getPortalStatus(vendor)
                  const hasEmail = vendorHasEmail(vendor)
                  return (
                    <tr key={vendor.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedVendors.includes(vendor.id)}
                          onChange={() => toggleSelectVendor(vendor.id)}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500"
                          disabled={!hasEmail}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{vendor.supplierName}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">Source: SAP</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm text-gray-600 dark:text-gray-400">{vendor.supplierCode}</span>
                      </td>
                      <td className="px-4 py-3">
                        {hasEmail ? (
                          <span className="text-sm text-gray-600 dark:text-gray-400">{vendor.email}</span>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500 italic">No email</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {vendor.city || '-'}
                          {vendor.country && <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">({vendor.country})</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{vendor.taxNumber || '-'}</span>
                      </td>
                      <td className="px-4 py-3">
                        {status.badge}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => handleSingleInvite(vendor.id)}
                            disabled={sendingInvites || !hasEmail}
                            className={`p-1.5 rounded-lg transition ${
                              hasEmail 
                                ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20' 
                                : 'text-gray-300 cursor-not-allowed'
                            }`}
                            title={hasEmail ? 'Send Invitation' : 'No email address found in SAP'}
                          >
                            <Send size={16} />
                          </button>
                          <Link
                            href={`/vendors/${vendor.id}`}
                            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
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

        {/* SAP Connection Status */}
        <div className="mt-6 rounded-lg p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-300">Connected to SAP S/4HANA Cloud</p>
              <p className="text-xs text-green-700 dark:text-green-300">
                Showing {vendors.length} vendors from SAP Business Partner API
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {vendors.length > 0 ? `${vendors.length.toLocaleString()} vendors loaded` : 'No vendors loaded'}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
