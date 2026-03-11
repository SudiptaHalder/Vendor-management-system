
// 'use client'

// import { useState, useRef } from 'react'
// import MainLayout from '@/components/layout/MainLayout'
// import { api } from '@/lib/api'
// import * as XLSX from 'xlsx'
// import {
//   Upload,
//   FileText,
//   Download,
//   CheckCircle,
//   AlertCircle,
//   XCircle,
//   Loader2,
//   Eye,
//   Users,
//   Database,
//   FileSpreadsheet
// } from 'lucide-react'
// import Link from 'next/link'

// interface UploadSummary {
//   totalRows: number
//   vendorsCreated: number
//   vendorsUpdated: number
//   purchaseOrders: number
//   lineItems: number
//   invitationsSent: number
//   errors: string[]
// }

// export default function VendorUploadPage() {
//   const [file, setFile] = useState<File | null>(null)
//   const [uploading, setUploading] = useState(false)
//   const [processing, setProcessing] = useState(false)
//   const [summary, setSummary] = useState<UploadSummary | null>(null)
//   const [error, setError] = useState('')
//   const [previewData, setPreviewData] = useState<any[]>([])
//   const [previewHeaders, setPreviewHeaders] = useState<string[]>([])
//   const [showPreview, setShowPreview] = useState(false)
//   const [fileType, setFileType] = useState<'excel' | 'text' | null>(null)
//   const fileInputRef = useRef<HTMLInputElement>(null)

//   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       const selectedFile = e.target.files[0]
//       setFile(selectedFile)
//       setError('')
//       previewFile(selectedFile)
//     }
//   }

//   const previewFile = async (file: File) => {
//     const reader = new FileReader()
//     const ext = file.name.split('.').pop()?.toLowerCase()

//     if (ext === 'xlsx' || ext === 'xls') {
//       // Handle Excel files
//       setFileType('excel')
//       reader.onload = (e) => {
//         const data = new Uint8Array(e.target?.result as ArrayBuffer)
//         const workbook = XLSX.read(data, { type: 'array' })
//         const firstSheet = workbook.SheetNames[0]
//         const worksheet = workbook.Sheets[firstSheet]
//         const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        
//         // Get headers from first row
//         const headers = jsonData[0] as string[]
//         setPreviewHeaders(headers)
        
//         // Get next 5 rows for preview
//         const rows = jsonData.slice(1, 6) as any[][]
//         const previewRows = rows.map(row => {
//           const rowData: any = {}
//           headers.forEach((header, index) => {
//             rowData[header] = row[index]?.toString() || ''
//           })
//           return rowData
//         })
//         setPreviewData(previewRows)
//         setShowPreview(true)
//       }
//       reader.readAsArrayBuffer(file)
//     } else {
//       // Handle text files (TSV/CSV)
//       setFileType('text')
//       reader.onload = (e) => {
//         const text = e.target?.result as string
//         const lines = text.split('\n').filter(line => line.trim())
//         const headers = lines[0].split('\t')
//         setPreviewHeaders(headers)
        
//         const previewRows = lines.slice(1, 6).map(line => {
//           const values = line.split('\t')
//           const row: any = {}
//           headers.forEach((header, index) => {
//             row[header.trim()] = values[index]?.trim() || ''
//           })
//           return row
//         })
//         setPreviewData(previewRows)
//         setShowPreview(true)
//       }
//       reader.readAsText(file)
//     }
//   }

// const handleUpload = async () => {
//   if (!file) return

//   setUploading(true)
//   setError('')
  
//   const formData = new FormData()
//   formData.append('file', file)

//   try {
//     // Use full URL with port 3001
//     const uploadResponse = await fetch('http://localhost:3001/api/vendors/upload', {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${localStorage.getItem('token')}`
//       },
//       body: formData
//     })

//     if (!uploadResponse.ok) {
//       const error = await uploadResponse.json()
//       throw new Error(error.error || 'Upload failed')
//     }

//     const data = await uploadResponse.json()
//     console.log('Upload response:', data)
    
//     // Then process the data
//     setProcessing(true)
//     const processResponse = await api.processVendorUpload(data.fileId, file.name)
    
//     if (processResponse.success) {
//       setSummary(processResponse.data)
//     } else {
//       setError(processResponse.error || 'Processing failed')
//     }
//   } catch (err: any) {
//     console.error('Upload error:', err)
//     setError(err.message || 'Failed to upload file')
//   } finally {
//     setUploading(false)
//     setProcessing(false)
//   }
// }

//   const downloadTemplate = () => {
//     const headers = [
//       'Supplier Code',
//       'Supplier Name',
//       'Plant code',
//       'PO Nor',
//       'PO Creat. Date',
//       'PO Amendt. Date',
//       'Material Code',
//       'Material Description',
//       'Line Item',
//       'Order Unit',
//       'Rate 1',
//       'Rate 2',
//       'Invoice Quantity'
//     ].join('\t')

//     const sampleRow = [
//       'SUP001',
//       'ABC Construction Supplies',
//       'PLANT01',
//       'PO-2024-001',
//       '2024-01-15',
//       '2024-01-20',
//       'MAT001',
//       'Electrical Wire 14 AWG',
//       '1',
//       'ROLL',
//       '85.50',
//       '82.00',
//       '10'
//     ].join('\t')

//     const csv = headers + '\n' + sampleRow
//     const blob = new Blob([csv], { type: 'text/tab-separated-values' })
//     const url = window.URL.createObjectURL(blob)
//     const a = document.createElement('a')
//     a.href = url
//     a.download = 'vendor_upload_template.tsv'
//     a.click()
//     window.URL.revokeObjectURL(url)
//   }

//   const downloadExcelTemplate = () => {
//     const headers = [
//       'Supplier Code',
//       'Supplier Name',
//       'Plant code',
//       'PO Nor',
//       'PO Creat. Date',
//       'PO Amendt. Date',
//       'Material Code',
//       'Material Description',
//       'Line Item',
//       'Order Unit',
//       'Rate 1',
//       'Rate 2',
//       'Invoice Quantity'
//     ]

//     const data = [
//       [
//         'SUP001',
//         'ABC Construction Supplies',
//         'PLANT01',
//         'PO-2024-001',
//         '2024-01-15',
//         '2024-01-20',
//         'MAT001',
//         'Electrical Wire 14 AWG',
//         '1',
//         'ROLL',
//         '85.50',
//         '82.00',
//         '10'
//       ]
//     ]

//     const wb = XLSX.utils.book_new()
//     const ws = XLSX.utils.aoa_to_sheet([headers, ...data])
//     XLSX.utils.book_append_sheet(wb, ws, 'Template')
//     XLSX.writeFile(wb, 'vendor_upload_template.xlsx')
//   }

//   return (
//     <MainLayout>
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-6">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">Vendor Data Upload</h1>
//             <p className="text-gray-600 mt-1">Upload vendor data to create accounts and purchase orders</p>
//           </div>
//           <Link
//             href="/vendors"
//             className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
//           >
//             <Users size={16} />
//             <span>View Vendors</span>
//           </Link>
//         </div>

//         {/* Template Download */}
//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center space-x-3">
//               <FileSpreadsheet className="w-5 h-5 text-blue-600" />
//               <div>
//                 <p className="text-sm font-medium text-blue-800">Download Templates</p>
//                 <p className="text-xs text-blue-600">Choose your preferred format</p>
//               </div>
//             </div>
//           </div>
//           <div className="flex space-x-3">
//             <button
//               onClick={downloadTemplate}
//               className="px-4 py-2 bg-white text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 flex items-center space-x-2 text-sm"
//             >
//               <FileText size={16} />
//               <span>TSV Template</span>
//             </button>
//             <button
//               onClick={downloadExcelTemplate}
//               className="px-4 py-2 bg-white text-green-600 border border-green-300 rounded-lg hover:bg-green-50 flex items-center space-x-2 text-sm"
//             >
//               <FileSpreadsheet size={16} />
//               <span>Excel Template (.xlsx)</span>
//             </button>
//           </div>
//         </div>

//         {/* Upload Area */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
//           <div
//             className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
//               file ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'
//             }`}
//             onClick={() => fileInputRef.current?.click()}
//           >
//             <Upload className={`w-12 h-12 mx-auto mb-3 ${file ? 'text-green-500' : 'text-gray-400'}`} />
//             <p className="text-sm text-gray-600 mb-1">
//               {file ? file.name : 'Click to select or drag and drop'}
//             </p>
//             <p className="text-xs text-gray-500">
//               Supported formats: Excel (.xlsx, .xls), TSV (.tsv, .txt), CSV (.csv) - Max 10MB
//             </p>
//             <input
//               ref={fileInputRef}
//               type="file"
//               className="hidden"
//               accept=".tsv,.txt,.csv,.xlsx,.xls"
//               onChange={handleFileSelect}
//             />
//           </div>

//           {file && (
//             <div className="mt-4 flex justify-end">
//               <button
//                 onClick={handleUpload}
//                 disabled={uploading || processing}
//                 className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
//               >
//                 {(uploading || processing) ? (
//                   <>
//                     <Loader2 className="animate-spin h-4 w-4" />
//                     <span>{uploading ? 'Uploading...' : 'Processing...'}</span>
//                   </>
//                 ) : (
//                   <>
//                     <Upload size={16} />
//                     <span>Upload & Process</span>
//                   </>
//                 )}
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Preview Section */}
//         {showPreview && previewHeaders.length > 0 && previewData.length > 0 && (
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//               <Eye className="w-5 h-5 mr-2 text-gray-500" />
//               Preview (First 5 rows) - {fileType === 'excel' ? 'Excel' : 'TSV'} format
//             </h3>
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     {previewHeaders.map((header, idx) => (
//                       <th key={idx} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
//                         {header}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {previewData.map((row, rowIdx) => (
//                     <tr key={rowIdx}>
//                       {previewHeaders.map((header, colIdx) => (
//                         <td key={colIdx} className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
//                           {row[header] || '—'}
//                         </td>
//                       ))}
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {/* Error Message */}
//         {error && (
//           <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6 flex items-center space-x-2">
//             <XCircle size={18} />
//             <span>{error}</span>
//           </div>
//         )}

//         {/* Summary Report - UPDATED with Vendors Updated */}
//         {summary && (
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//               <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
//               Upload Summary
//             </h3>
            
//             <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
//               <div className="bg-blue-50 p-4 rounded-lg">
//                 <p className="text-2xl font-bold text-blue-600">{summary.totalRows}</p>
//                 <p className="text-sm text-gray-600">Total Rows</p>
//               </div>
//               <div className="bg-green-50 p-4 rounded-lg">
//                 <p className="text-2xl font-bold text-green-600">{summary.vendorsCreated}</p>
//                 <p className="text-sm text-gray-600">New Vendors</p>
//               </div>
//               {/* NEW CARD for Vendors Updated */}
//               <div className="bg-yellow-50 p-4 rounded-lg">
//                 <p className="text-2xl font-bold text-yellow-600">{summary.vendorsUpdated || 0}</p>
//                 <p className="text-sm text-gray-600">Vendors Updated</p>
//               </div>
//               <div className="bg-purple-50 p-4 rounded-lg">
//                 <p className="text-2xl font-bold text-purple-600">{summary.purchaseOrders}</p>
//                 <p className="text-sm text-gray-600">Purchase Orders</p>
//               </div>
//               <div className="bg-orange-50 p-4 rounded-lg">
//                 <p className="text-2xl font-bold text-orange-600">{summary.invitationsSent}</p>
//                 <p className="text-sm text-gray-600">Invitations</p>
//               </div>
//             </div>

//             {/* Show update details when vendors are updated */}
//             {summary.vendorsUpdated > 0 && (
//               <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
//                 <p className="font-medium text-green-800 mb-2 flex items-center">
//                   <CheckCircle size={18} className="mr-2" />
//                   Updates Successful
//                 </p>
//                 <p className="text-sm text-green-700">
//                   ✅ {summary.vendorsUpdated} vendor(s) were updated with new information
//                 </p>
//               </div>
//             )}

//             {summary.errors.length > 0 && (
//               <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//                 <p className="font-medium text-yellow-800 mb-2">Warnings:</p>
//                 <ul className="list-disc list-inside text-sm text-yellow-700">
//                   {summary.errors.map((err, idx) => (
//                     <li key={idx}>{err}</li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             <div className="mt-6 flex justify-end space-x-3">
//               <Link
//                 href="/vendors"
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
//               >
//                 <Users size={16} />
//                 <span>View Vendors</span>
//               </Link>
//               <Link
//                 href="/procurement/purchase-orders"
//                 className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
//               >
//                 <Database size={16} />
//                 <span>View Purchase Orders</span>
//               </Link>
//             </div>
//           </div>
//         )}
//       </div>
//     </MainLayout>
//   )
// }
'use client'

import { useState, useRef, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import * as XLSX from 'xlsx'
import {
  Upload,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  Users,
  Building2,
  FileSpreadsheet,
  Package,
  Database,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface UploadSummary {
  totalRows: number
  created: number
  updated: number
  errors: string[]
}

// API Response interface
interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

export default function VendorUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploadType, setUploadType] = useState<'master' | 'po'>('master')
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [summary, setSummary] = useState<UploadSummary | null>(null)
  const [error, setError] = useState('')
  const [previewData, setPreviewData] = useState<any[]>([])
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token')
  }

  // Generic fetch with auth
  const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken()
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    }

    // Don't set Content-Type for FormData
    if (options.body instanceof FormData) {
      delete (headers as any)['Content-Type']
    } else {
      headers['Content-Type'] = 'application/json'
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token')
        window.location.href = '/login'
        throw new Error('Session expired. Please login again.')
      }
      
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setError('')
      setSummary(null)
      previewFile(selectedFile)
    }
  }

  const previewFile = async (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheet = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheet]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      
      const headers = jsonData[0] as string[]
      setPreviewHeaders(headers)
      
      const rows = jsonData.slice(1, 6) as any[][]
      const previewRows = rows.map(row => {
        const rowData: any = {}
        headers.forEach((header, index) => {
          rowData[header] = row[index]?.toString() || ''
        })
        return rowData
      })
      setPreviewData(previewRows)
      setShowPreview(true)
    }
    reader.readAsArrayBuffer(file)
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError('')
    setSummary(null)
    
    const formData = new FormData()
    formData.append('file', file)

    try {
      // Use the correct endpoint based on upload type
      const endpoint = uploadType === 'master' 
        ? `${API_BASE_URL}/api/vendors/upload/master`
        : `${API_BASE_URL}/api/vendors/upload/po`

      console.log(`📤 Uploading to: ${endpoint}`)
      
      // Upload the file
      const uploadResponse = await authFetch(endpoint, {
        method: 'POST',
        body: formData,
      })

      console.log('Upload response:', uploadResponse)

      // For PO uploads, we need to process the file
      if (uploadType === 'po' && uploadResponse.fileId) {
        setProcessing(true)
        
        const processEndpoint = `${API_BASE_URL}/api/vendors/upload/po/process/${uploadResponse.fileId}`
        const processResponse = await authFetch(processEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fileName: file.name }),
        })
        
        setSummary(processResponse.data)
      } else if (uploadType === 'master') {
        // Master upload returns summary directly
        setSummary(uploadResponse.data)
      }
      
      setShowPreview(false)
      
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload file')
    } finally {
      setUploading(false)
      setProcessing(false)
    }
  }

  const downloadTemplate = () => {
    if (uploadType === 'master') {
      // Master template headers
      const headers = [
        'Supplier Code',
        'Supplier Name',
        'Company Code',
        'Supplier Acct Group',
        'Country/Region Name',
        'City',
        'Bank Name',
        'Bank Account',
        'Tax Number',
        'E-Mail Address',
        'Telephone 1',
        'Address',
        'Postal Code',
        'Payment Methods',
        'Incoterms',
        'Order Currency'
      ]

      const sampleRow = [
        '100089',
        'METALMAN AUTO LTD',
        '', '', '', '', '', '', '', '', '', '', '', '', '', ''
      ]

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow])
      XLSX.utils.book_append_sheet(wb, ws, 'Vendor Master Template')
      XLSX.writeFile(wb, 'vendor_master_template.xlsx')
    } else {
      // PO template headers
      const headers = [
        'Supplier Code',
        'PO No.',
        'PO Creat. Date',
        'PO Amendt. Date',
        'Material Code',
        'Material Description',
        'Line Item',
        'Order Unit',
        'Rate',
        'Invoice Quantity'
      ]

      const sampleRow = [
        '100089',
        'PO-2024-001',
        '5/22/2025',
        '',
        'MAT001',
        'Sample Material',
        '1',
        'EA',
        '100.00',
        '10'
      ]

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow])
      XLSX.utils.book_append_sheet(wb, ws, 'PO Template')
      XLSX.writeFile(wb, 'po_template.xlsx')
    }
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vendor Data Upload</h1>
            <p className="text-gray-600 mt-1">Upload vendor master data or purchase orders</p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/vendors"
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <Users size={16} />
              <span>View Vendors</span>
            </Link>
            <Link
              href="/procurement/purchase-orders"
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <Package size={16} />
              <span>View POs</span>
            </Link>
          </div>
        </div>

        {/* Upload Type Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Upload Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                setUploadType('master')
                setFile(null)
                setShowPreview(false)
                setSummary(null)
              }}
              className={`p-6 rounded-xl border-2 transition text-left ${
                uploadType === 'master'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <Building2 className={`w-8 h-8 mb-3 ${
                uploadType === 'master' ? 'text-blue-600' : 'text-gray-400'
              }`} />
              <h3 className="font-semibold text-gray-900 mb-1">Vendor Master Data</h3>
              <p className="text-sm text-gray-500">
                Upload complete vendor details including contact info, addresses, etc.
                Empty fields will be ignored.
              </p>
            </button>

            <button
              onClick={() => {
                setUploadType('po')
                setFile(null)
                setShowPreview(false)
                setSummary(null)
              }}
              className={`p-6 rounded-xl border-2 transition text-left ${
                uploadType === 'po'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <Package className={`w-8 h-8 mb-3 ${
                uploadType === 'po' ? 'text-blue-600' : 'text-gray-400'
              }`} />
              <h3 className="font-semibold text-gray-900 mb-1">Purchase Orders</h3>
              <p className="text-sm text-gray-500">
                Upload purchase order data with line items, materials, rates, and quantities.
              </p>
            </button>
          </div>
        </div>

        {/* Template Download */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Download {uploadType === 'master' ? 'Vendor Master' : 'Purchase Order'} Template
                </p>
                <p className="text-xs text-blue-600">
                  {uploadType === 'master' 
                    ? 'Contains essential vendor fields. Add more columns as needed.'
                    : 'Contains PO fields. One row per line item.'}
                </p>
              </div>
            </div>
            <button
              onClick={downloadTemplate}
              className="px-4 py-2 bg-white text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 flex items-center space-x-2"
            >
              <Download size={16} />
              <span>Download Template</span>
            </button>
          </div>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
              file ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className={`w-12 h-12 mx-auto mb-3 ${file ? 'text-green-500' : 'text-gray-400'}`} />
            <p className="text-sm text-gray-600 mb-1">
              {file ? file.name : 'Click to select or drag and drop'}
            </p>
            <p className="text-xs text-gray-500">
              Excel files only (.xlsx, .xls) - Max 10MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
            />
          </div>

          {file && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleUpload}
                disabled={uploading || processing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {(uploading || processing) ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    <span>{uploading ? 'Uploading...' : 'Processing...'}</span>
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    <span>Upload & Process</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Preview Section */}
        {showPreview && previewHeaders.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Eye className="w-5 h-5 mr-2 text-gray-500" />
              Data Preview (First 5 Rows)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {previewHeaders.slice(0, 6).map((header, idx) => (
                      <th key={idx} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                        {header}
                      </th>
                    ))}
                    {previewHeaders.length > 6 && (
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                        ... and {previewHeaders.length - 6} more columns
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {previewData.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {previewHeaders.slice(0, 6).map((header, colIdx) => (
                        <td key={colIdx} className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
                          {row[header] || '—'}
                        </td>
                      ))}
                      {previewHeaders.length > 6 && (
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {previewHeaders.length - 6} more fields
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              *Empty cells will be ignored during upload
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6 flex items-center space-x-2">
            <XCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Summary Report */}
        {summary && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
              Upload Summary
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{summary.totalRows}</p>
                <p className="text-sm text-gray-600">Total Rows Processed</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{summary.created}</p>
                <p className="text-sm text-gray-600">New Records Created</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{summary.updated}</p>
                <p className="text-sm text-gray-600">Records Updated</p>
              </div>
            </div>

            {summary.errors && summary.errors.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle size={16} className="text-yellow-600" />
                  <p className="font-medium text-yellow-800">Warnings ({summary.errors.length})</p>
                </div>
                <ul className="list-disc list-inside text-sm text-yellow-700 max-h-40 overflow-y-auto">
                  {summary.errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
                <p className="text-xs text-yellow-600 mt-2">
                  *Records with warnings were still processed. Empty fields were ignored.
                </p>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setFile(null)
                  setSummary(null)
                  setShowPreview(false)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Upload Another File
              </button>
              <Link
                href={uploadType === 'master' ? '/vendors' : '/procurement/purchase-orders'}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                {uploadType === 'master' ? (
                  <>
                    <Users size={16} />
                    <span>View Vendors</span>
                  </>
                ) : (
                  <>
                    <Package size={16} />
                    <span>View Purchase Orders</span>
                  </>
                )}
              </Link>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}