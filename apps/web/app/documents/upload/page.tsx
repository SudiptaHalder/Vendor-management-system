'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  ArrowLeft,
  Upload,
  Save,
  X,
  AlertCircle,
  FileText,
  Calendar,
  Lock,
  Unlock,
  Building2,
  Loader2,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { useDropzone } from 'react-dropzone'

interface Vendor {
  id: string
  name: string
}

export default function UploadDocumentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const entityType = searchParams.get('entityType')
  const entityId = searchParams.get('entityId')
  
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    entityType: entityType || '',
    entityId: entityId || '',
    name: '',
    description: '',
    category: '',
    version: 1,
    expiryDate: '',
    isConfidential: false,
    vendorId: ''
  })

  useEffect(() => {
    fetchVendors()
  }, [])

  const fetchVendors = async () => {
    try {
      const response = await api.getVendors()
      if (response.success) {
        setVendors(response.data)
      }
    } catch (err) {
      console.error('Error fetching vendors:', err)
    }
  }

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    setSelectedFile(file)
    setFormData(prev => ({
      ...prev,
      name: file.name,
      description: file.name
    }))

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => {
        setFilePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setFilePreview(null)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
      'text/plain': ['.txt']
    }
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const validateForm = () => {
    if (!selectedFile) {
      setError('Please select a file to upload')
      return false
    }
    if (!formData.name.trim()) {
      setError('Document name is required')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('file', selectedFile!)
      formDataToSend.append('data', JSON.stringify({
        entityType: formData.entityType || 'general',
        entityId: formData.entityId || 'general',
        name: formData.name,
        description: formData.description || null,
        category: formData.category || null,
        version: formData.version,
        expiryDate: formData.expiryDate || null,
        isConfidential: formData.isConfidential,
        vendorId: formData.vendorId || null
      }))

      console.log('Uploading document...')
      const response = await api.createDocument(formDataToSend)
      console.log('Upload response:', response)
      
      if (response.success) {
        setSuccess('Document uploaded successfully!')
        // ✅ FIX: Redirect to the document detail page
        setTimeout(() => {
          router.push(`/documents/${response.data.id}`)
        }, 1500)
      } else {
        setError(response.error || 'Failed to upload document')
      }
    } catch (err: any) {
      console.error('Error uploading document:', err)
      setError(err.message || 'Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const entityTypes = [
    'general', 'vendor', 'project', 'workOrder', 'contract', 
    'invoice', 'purchaseOrder', 'rfq', 'bid', 'expense'
  ]

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 text-sm text-gray-500 mb-4">
          <Link href="/documents" className="hover:text-blue-600">
            Documents
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Upload Document</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/documents"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Upload Document</h1>
              <p className="text-sm text-gray-500 mt-1">Add a new file to the document repository</p>
            </div>
          </div>
          <Link
            href="/documents"
            className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <X size={16} />
            <span>Cancel</span>
          </Link>
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
          <span>{success} Redirecting...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select File</h2>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            {selectedFile ? (
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
                {filePreview && (
                  <div className="mt-4">
                    <img src={filePreview} alt="Preview" className="max-h-32 mx-auto rounded" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedFile(null)
                    setFilePreview(null)
                  }}
                  className="mt-4 text-sm text-red-600 hover:text-red-800"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, Word, Excel, Images, Text (Max 10MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Document Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Information</h2>
          <div className="space-y-4">
            {/* Document Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Enter document name"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
                placeholder="Brief description of the document"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="e.g., Contract, Invoice, Report, Manual"
              />
            </div>

            {/* Version */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Version
              </label>
              <input
                type="number"
                name="version"
                value={formData.version}
                onChange={handleChange}
                min="1"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">
                Increment version if this is an update to an existing document
              </p>
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                For documents that expire (licenses, certifications, etc.)
              </p>
            </div>

            {/* Confidential */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="isConfidential"
                id="isConfidential"
                checked={formData.isConfidential}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isConfidential" className="text-sm text-gray-700 flex items-center">
                {formData.isConfidential ? (
                  <Lock size={16} className="mr-1 text-purple-600" />
                ) : (
                  <Unlock size={16} className="mr-1 text-gray-400" />
                )}
                Mark as confidential document
              </label>
            </div>
          </div>
        </div>

        {/* Association */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Link to Record (Optional)</h2>
          <div className="space-y-4">
            {/* Entity Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Record Type
              </label>
              <select
                name="entityType"
                value={formData.entityType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="">General</option>
                {entityTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Entity ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Record ID
              </label>
              <input
                type="text"
                name="entityId"
                value={formData.entityId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Enter the record ID"
              />
              <p className="text-xs text-gray-500 mt-1">
                The ID of the record this document belongs to
              </p>
            </div>

            {/* Vendor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <select
                  name="vendorId"
                  value={formData.vendorId}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">No Vendor</option>
                  {vendors.map(vendor => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <Link
            href="/documents"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={uploading || !selectedFile}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            <span>{uploading ? 'Uploading...' : 'Upload Document'}</span>
          </button>
        </div>
      </form>
    </MainLayout>
  )
}