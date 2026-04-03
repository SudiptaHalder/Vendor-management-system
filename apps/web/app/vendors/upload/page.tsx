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
  Database,
  FileSpreadsheet,
  AlertCircle,
  Building2,
  Package,
  Tag,
  MapPin
} from 'lucide-react'
import Link from 'next/link'
import { API_CONFIG } from '@/lib/config'

interface UploadSummary {
  totalRows: number
  vendorsCreated?: number
  vendorsUpdated?: number
  purchaseOrders?: number
  lineItems?: number
  invitationsSent?: number
  created?: number
  updated?: number
  errors: string[]
}

type UploadCategory = 'vendor-master' | 'po-details' | 'tax-codes' | 'subdivisions'

export default function VendorUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploadCategory, setUploadCategory] = useState<UploadCategory>('vendor-master')
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [summary, setSummary] = useState<UploadSummary | null>(null)
  const [error, setError] = useState('')
  const [previewData, setPreviewData] = useState<any[]>([])
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    if (!token || !userStr) {
      window.location.href = '/admin-login'
      return
    }
    
    try {
      const user = JSON.parse(userStr)
      if (user.type === 'vendor') {
        window.location.href = '/vendor/dashboard'
        return
      }
    } catch (err) {
      window.location.href = '/admin-login'
    }
  }, [])

  const getAuthToken = () => localStorage.getItem('token')

  const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken()
    const headers: HeadersInit = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/admin-login'
        throw new Error('Session expired')
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

 const getEndpoint = () => {
  switch(uploadCategory) {
    case 'vendor-master':
      return `${API_CONFIG.baseURL}/api/vendors/upload/master`  // This now exists!
    case 'po-details':
      return `${API_CONFIG.baseURL}/api/vendors/upload/po`
    case 'tax-codes':
      return `${API_CONFIG.baseURL}/api/po-upload/tax-codes`
    case 'subdivisions':
      return `${API_CONFIG.baseURL}/api/po-upload/subdivisions`
    default:
      return `${API_CONFIG.baseURL}/api/vendors/upload/master`
  }
}

  const getProcessEndpoint = (fileId: string) => {
    switch(uploadCategory) {
      case 'vendor-master':
        return `${API_CONFIG.baseURL}/api/vendors/upload/master/process/${fileId}`
      case 'po-details':
        return `${API_CONFIG.baseURL}/api/vendors/upload/po/process/${fileId}`
      default:
        return `${API_CONFIG.baseURL}/api/vendors/upload/po/process/${fileId}`
    }
  }

const handleUpload = async () => {
  if (!file) return

  setUploading(true)
  setError('')
  setSummary(null)
  
  const formData = new FormData()
  formData.append('file', file)

  try {
    const endpoint = getEndpoint()
    console.log('Uploading to:', endpoint)
    
    const response = await authFetch(endpoint, {
      method: 'POST',
      body: formData
    })

    console.log('Upload response:', response)
    
    // For Vendor Master Data - response already contains summary directly
    if (uploadCategory === 'vendor-master') {
      setSummary(response.data)
    } 
    // For PO Details - need to process
    else if (uploadCategory === 'po-details') {
      setProcessing(true)
      const processEndpoint = getProcessEndpoint(response.fileId)
      const processResponse = await authFetch(processEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name })
      })
      setSummary(processResponse.data)
    } 
    // For tax codes and subdivisions - response already contains summary
    else {
      setSummary(response.data)
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
    let headers: string[] = []
    let sampleRow: any[] = []

    if (uploadCategory === 'vendor-master') {
      headers = [
        'Supplier Code', 'Supplier Name', 'Company Code', 'Supplier Acct Group', 'Country/Region Name',
        'City', 'Bank Name', 'Bank Account', 'Tax Number', 'Posting Block', 'Purchasing Block',
        'Payment Methods', 'Deletion Flag', 'Created By', 'Account Holder', 'Accounting Clerk',
        'Accounting Clerk Tel', 'Address', 'Alternative Payee', 'Alternative Payee CC', 'Authorization',
        'Automatic PO', 'Bank Control Key', 'Bank Country/Region', 'Bank Key', 'BP Bank Account',
        'BP PO Box Dvtg City', 'BP Type', 'Branch Code', 'Branch Description', 'Business Partner',
        'Check Double Invoice', 'Clerk Fax No', 'Country/Region Key', 'Created On', 'Default Branch',
        'E-Mail Address', 'Fax Number', 'GR-Based Inv. Verif.', 'IBAN', 'Incoterms', 'Incoterms (Part 2)',
        'Internet Add.', 'Item Payment Block', 'Liable for VAT', 'Minority Indicator', 'Natural Person',
        'Order Currency', 'Payment Block', 'Planning Group', 'Postal Code', 'Previous Account No.',
        'Purch. Organization', 'Purchasing Group', 'Recon. Account', 'Reference Details', 'Region',
        'Release Group', 'Search Term 1', 'Search Term 2', 'Sort key', 'Street', 'Street 2', 'Street 3',
        'Street 4', 'Street 5', 'Supplier Full Name', 'SWIFT / BIC', 'Tax Number 1', 'Tax Number 2',
        'Tax Number 3', 'Tax Number 4', 'Tax Number 5', 'Tax Number at Auth.', 'Tax Number Category',
        'Tax Number Type', 'Tax Type', 'Tax Type Name', 'Telephone 1', 'Telephone 2',
        'Terms of Payts Key CoCode', 'Terms Of Payts Key PO', 'Trading Partner No.', 'WTax C/R Key'
      ]
      sampleRow = [
        '100365', 'SELWEL ENTERPRISES PVT LTD', '4000', 'ZSTO', 'India',
        'MUMBAI', 'State Bank of India', '28715427055', '27KFEGT4688C1ZT', 'CoCd Block',
        'Purch. Org. Block', 'T', 'X', 'CB9980000010', 'SELWEL ENTERPRISES PVT LTD',
        'Ramesh Patil', '075-9989523', '5400', 'SELWEL ENTERPRISES PVT LTD', '4000',
        'AUTH01', 'No', '01', 'India (IN)', 'SBIN0001234', 'BPA100365832', 'MUMBAI',
        'BP001', 'BR001', 'Main Branch', '100365', 'No', '061-8270554', 'India (IN)',
        '09.04.2024', 'No', 'accounts@selwelente.in', '0222-5705370', 'Yes',
        'IN8628201027616124906528', 'EXW (Ex Works)', 'ex works', 'www.selwel-enterpri.com',
        'No Block', 'No', 'MN01', 'No', 'INR', 'No', 'A1', '411001', '620001', '4020',
        'P01', '130095', 'REF-100365-2024', 'MH (Maharashtra)', 'RG01', 'SELW-1 MUMBAI',
        '620001', '001', 'Plot No. 12, MIDC Industrial Area', 'Near State Bank',
        'Maharashtra 431001', 'MUMBAI', 'India', 'SELWEL ENTERPRISES PVT LTD', 'SBININBB',
        'MKPFX5632O', 'RWIY81756B', '27KFEGT4688C1ZT', '27HAFZN7839O1ZB', 'KXZQL8625W',
        'MKPFX5632O', 'IN3', 'GSTIN', 'V1', 'India: GST Identification Number(GSTIN)',
        '0141-9735969', '+91-7239735157', '0001', '0001', '100365', 'W001'
      ]
    } else if (uploadCategory === 'po-details') {
      headers = [
        'Email', 'Supplier Code', 'Supplier Name', 'Sub- Division Code', 'Plant Name',
        'PO No.', 'PO Creat. Date', 'Material Code', 'Material Description', 'Line Item',
        'Order Qty', 'Order Unit', 'Tax Code', 'Rate', 'Total Price', 'Invoice Quantity',
        'CGST %', 'CGST Amt', 'SGST %', 'SGST Amt', 'IGST %', 'IGST Amt'
      ]
      sampleRow = [
        'sudiptah2090@gmail.com', '100365', 'SELWEL ENTERPRISES PVT LTD', '1020',
        'Laxmi Metal W(E-77-Waluj)', '5500000679', '5/9/2024', '4000003799',
        'LOCTITE 7299', '90', '520', 'L', 'G3', '1800.00', '84960.00', '40.00',
        '9%', '6480.00', '9%', '6480.00', '#', '0.00'
      ]
    } else if (uploadCategory === 'tax-codes') {
      headers = ['Tax Code', 'SGST %', 'CGST %', 'IGST %']
      sampleRow = ['G3', '9', '9', '0']
    } else if (uploadCategory === 'subdivisions') {
      headers = ['Sub- Division Code', 'Plant Name']
      sampleRow = ['1020', 'Waluj - Aurangabad']
    }

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow])
    XLSX.utils.book_append_sheet(wb, ws, 'Template')
    XLSX.writeFile(wb, `${uploadCategory}_template.xlsx`)
  }

  const getCategoryIcon = () => {
    switch(uploadCategory) {
      case 'vendor-master': return <Building2 className="w-6 h-6" />
      case 'po-details': return <Package className="w-6 h-6" />
      case 'tax-codes': return <Tag className="w-6 h-6" />
      case 'subdivisions': return <MapPin className="w-6 h-6" />
    }
  }

  const getCategoryTitle = () => {
    switch(uploadCategory) {
      case 'vendor-master': return 'Vendor Master Data'
      case 'po-details': return 'Purchase Order Details'
      case 'tax-codes': return 'Tax Codes Master'
      case 'subdivisions': return 'Sub-Division Codes'
    }
  }

  const getCategoryDescription = () => {
    switch(uploadCategory) {
      case 'vendor-master': return 'Upload complete vendor information including bank details, tax numbers, and addresses'
      case 'po-details': return 'Upload purchase order data with line items, materials, rates, and GST details'
      case 'tax-codes': return 'Upload tax code mappings for SGST, CGST, and IGST percentages'
      case 'subdivisions': return 'Upload sub-division codes and plant name mappings'
    }
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vendor Data Upload</h1>
            <p className="text-gray-600 mt-1">Upload vendor master data, purchase orders, or reference data</p>
          </div>
          <Link href="/vendors" className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <Users size={16} />
            <span>View Vendors</span>
          </Link>
        </div>

        {/* Category Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Upload Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => { setUploadCategory('vendor-master'); setFile(null); setShowPreview(false); setSummary(null); }}
              className={`p-4 rounded-xl border-2 transition text-left ${uploadCategory === 'vendor-master' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
            >
              <div className={`p-2 rounded-lg w-10 h-10 flex items-center justify-center mb-3 ${uploadCategory === 'vendor-master' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900">Vendor Master Data</h3>
              <p className="text-xs text-gray-500 mt-1">70+ fields including bank, tax, address</p>
            </button>

            <button
              onClick={() => { setUploadCategory('po-details'); setFile(null); setShowPreview(false); setSummary(null); }}
              className={`p-4 rounded-xl border-2 transition text-left ${uploadCategory === 'po-details' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'}`}
            >
              <div className={`p-2 rounded-lg w-10 h-10 flex items-center justify-center mb-3 ${uploadCategory === 'po-details' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                <Package className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900">Purchase Orders</h3>
              <p className="text-xs text-gray-500 mt-1">PO details with line items & GST</p>
            </button>

            <button
              onClick={() => { setUploadCategory('tax-codes'); setFile(null); setShowPreview(false); setSummary(null); }}
              className={`p-4 rounded-xl border-2 transition text-left ${uploadCategory === 'tax-codes' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'}`}
            >
              <div className={`p-2 rounded-lg w-10 h-10 flex items-center justify-center mb-3 ${uploadCategory === 'tax-codes' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                <Tag className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900">Tax Codes</h3>
              <p className="text-xs text-gray-500 mt-1">SGST, CGST, IGST mappings</p>
            </button>

            <button
              onClick={() => { setUploadCategory('subdivisions'); setFile(null); setShowPreview(false); setSummary(null); }}
              className={`p-4 rounded-xl border-2 transition text-left ${uploadCategory === 'subdivisions' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'}`}
            >
              <div className={`p-2 rounded-lg w-10 h-10 flex items-center justify-center mb-3 ${uploadCategory === 'subdivisions' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900">Sub-Divisions</h3>
              <p className="text-xs text-gray-500 mt-1">Plant codes and locations</p>
            </button>
          </div>
        </div>

        {/* Template Download */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              {getCategoryIcon()}
              <div>
                <p className="text-sm font-medium text-blue-800">Download {getCategoryTitle()} Template</p>
                <p className="text-xs text-blue-600">{getCategoryDescription()}</p>
              </div>
            </div>
            <button onClick={downloadTemplate} className="px-4 py-2 bg-white text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 flex items-center space-x-2 text-sm">
              <Download size={16} />
              <span>Excel Template</span>
            </button>
          </div>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${file ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'}`} onClick={() => fileInputRef.current?.click()}>
            <Upload className={`w-12 h-12 mx-auto mb-3 ${file ? 'text-green-500' : 'text-gray-400'}`} />
            <p className="text-sm text-gray-600 mb-1">{file ? file.name : 'Click to select or drag and drop'}</p>
            <p className="text-xs text-gray-500">Excel files only (.xlsx, .xls) - Max 10MB</p>
            <input ref={fileInputRef} type="file" className="hidden" accept=".xlsx,.xls" onChange={handleFileSelect} />
          </div>

          {file && (
            <div className="mt-4 flex justify-end">
              <button onClick={handleUpload} disabled={uploading || processing} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2">
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
              Data Preview (First 5 Rows) - {getCategoryTitle()}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {previewHeaders.slice(0, 6).map((header, idx) => (
                      <th key={idx} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">{header}</th>
                    ))}
                    {previewHeaders.length > 6 && <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">... and {previewHeaders.length - 6} more columns</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {previewData.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {previewHeaders.slice(0, 6).map((header, colIdx) => (
                        <td key={colIdx} className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">{row[header] || '—'}</td>
                      ))}
                      {previewHeaders.length > 6 && <td className="px-4 py-2 text-sm text-gray-500">{previewHeaders.length - 6} more fields</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
              Upload Summary - {getCategoryTitle()}
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{summary.totalRows}</p>
                <p className="text-sm text-gray-600">Total Rows</p>
              </div>
              {(summary.vendorsCreated !== undefined || summary.created !== undefined) && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{summary.vendorsCreated || summary.created || 0}</p>
                  <p className="text-sm text-gray-600">Created</p>
                </div>
              )}
              {(summary.vendorsUpdated !== undefined || summary.updated !== undefined) && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{summary.vendorsUpdated || summary.updated || 0}</p>
                  <p className="text-sm text-gray-600">Updated</p>
                </div>
              )}
              {summary.purchaseOrders !== undefined && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{summary.purchaseOrders}</p>
                  <p className="text-sm text-gray-600">Purchase Orders</p>
                </div>
              )}
              {summary.lineItems !== undefined && (
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{summary.lineItems}</p>
                  <p className="text-sm text-gray-600">Line Items</p>
                </div>
              )}
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
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => { setFile(null); setSummary(null); setShowPreview(false); if (fileInputRef.current) fileInputRef.current.value = '' }} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Upload Another File</button>
              <Link href={uploadCategory === 'vendor-master' ? '/vendors' : uploadCategory === 'po-details' ? '/procurement/purchase-orders' : '/settings/master-data'} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <Database size={16} />
                <span>View Data</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}