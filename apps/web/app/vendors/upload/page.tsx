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
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { API_CONFIG } from '@/lib/config'

interface UploadSummary {
  totalRows: number
  vendorsCreated: number
  vendorsUpdated: number
  purchaseOrders: number
  lineItems: number
  invitationsSent: number
  errors: string[]
}

export default function VendorUploadPage() {
  const [file, setFile] = useState<File | null>(null)
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

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError('')
    setSummary(null)
    
    const formData = new FormData()
    formData.append('file', file)

    try {
      const endpoint = `${API_CONFIG.baseURL}/api/vendors/upload/po`
      console.log('Uploading to:', endpoint)
      
      const uploadResponse = await authFetch(endpoint, {
        method: 'POST',
        body: formData
      })

      console.log('Upload response:', uploadResponse)
      
      setProcessing(true)
      const processEndpoint = `${API_CONFIG.baseURL}/api/vendors/upload/po/process/${uploadResponse.fileId}`
      const processResponse = await authFetch(processEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name })
      })
      
      setSummary(processResponse.data)
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
    const headers = [
      'Email', 'Supplier Code', 'Supplier Name', 'Sub- Division Code', 'Plant Name',
      'PO No.', 'PO Creat. Date', 'Material Code', 'Material Description', 'Line Item',
      'Order Qty', 'Order Unit', 'Tax Code', 'Rate', 'Total Price', 'Invoice Quantity',
      'CGST %', 'CGST Amt', 'SGST %', 'SGST Amt', 'IGST %', 'IGST Amt'
    ]

    const sampleRow = [
      'sudiptah2090@gmail.com', '100365', 'SELWEL ENTERPRISES PVT LTD', '1020',
      'Laxmi Metal W(E-77-Waluj)', '5500000679', '5/9/2024', '4000003799',
      'LOCTITE 7299', '90', '520', 'L', 'G3', '1800.00', '84960.00', '40.00',
      '9%', '6480.00', '9%', '6480.00', '#', '0.00'
    ]

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow])
    XLSX.utils.book_append_sheet(wb, ws, 'Template')
    XLSX.writeFile(wb, 'vendor_upload_template.xlsx')
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vendor Data Upload</h1>
            <p className="text-gray-600 mt-1">Upload vendor data to create accounts and purchase orders</p>
          </div>
          <Link href="/vendors" className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <Users size={16} />
            <span>View Vendors</span>
          </Link>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">Download Template</p>
                <p className="text-xs text-blue-600">Use this template to ensure correct format</p>
              </div>
            </div>
            <button onClick={downloadTemplate} className="px-4 py-2 bg-white text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 flex items-center space-x-2 text-sm">
              <Download size={16} />
              <span>Excel Template</span>
            </button>
          </div>
        </div>

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
                      <th key={idx} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">{header}</th>
                    ))}
                    {previewHeaders.length > 6 && (
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">... and {previewHeaders.length - 6} more columns</th>
                    )}
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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6 flex items-center space-x-2">
            <XCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {summary && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
              Upload Summary
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{summary.totalRows}</p>
                <p className="text-sm text-gray-600">Total Rows</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{summary.vendorsCreated}</p>
                <p className="text-sm text-gray-600">New Vendors</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{summary.vendorsUpdated || 0}</p>
                <p className="text-sm text-gray-600">Vendors Updated</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{summary.purchaseOrders}</p>
                <p className="text-sm text-gray-600">Purchase Orders</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{summary.invitationsSent}</p>
                <p className="text-sm text-gray-600">Invitations</p>
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
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => { setFile(null); setSummary(null); setShowPreview(false); if (fileInputRef.current) fileInputRef.current.value = '' }} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Upload Another File</button>
              <Link href="/vendors" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <Users size={16} />
                <span>View Vendors</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
