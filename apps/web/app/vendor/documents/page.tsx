'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import VendorLayout from '@/components/vendor/VendorLayout'
import {
  FileText,
  Download,
  Eye,
  Upload,
  Trash2,
  Search,
  Filter,
  Calendar,
  Image,
  FileSpreadsheet,
  File as FileIcon,
  Archive,
  X
} from 'lucide-react'

interface Document {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: string
  category: string
  url: string
  content?: string // For preview
}

export default function VendorDocumentsPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadCategory, setUploadCategory] = useState('invoice')
  const [uploadDescription, setUploadDescription] = useState('')
  const [error, setError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  
  // Document preview states
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      // Mock data with base64 content for preview
      setDocuments([
        { 
          id: '1', 
          name: 'Invoice-2024-001.pdf', 
          type: 'pdf', 
          size: 245760, 
          uploadedAt: '2024-02-15',
          category: 'invoice',
          url: '#',
          content: 'JVBERi0yLjQKJcOkw7zD...' // Mock base64 content
        },
        { 
          id: '2', 
          name: 'W9-Form-2024.pdf', 
          type: 'pdf', 
          size: 189430, 
          uploadedAt: '2024-01-10',
          category: 'tax',
          url: '#',
          content: 'JVBERi0yLjQKJcOkw7zD...'
        },
        { 
          id: '3', 
          name: 'Insurance-Certificate.jpg', 
          type: 'jpg', 
          size: 512000, 
          uploadedAt: '2024-02-20',
          category: 'insurance',
          url: '#',
          content: '/9j/4AAQSkZJRgABAQ...' // Mock base64 image
        },
        { 
          id: '4', 
          name: 'Contract-2024-001.pdf', 
          type: 'pdf', 
          size: 1024000, 
          uploadedAt: '2024-01-05',
          category: 'contract',
          url: '#',
          content: 'JVBERi0yLjQKJcOkw7zD...'
        },
        { 
          id: '5', 
          name: 'Business-License.pdf', 
          type: 'pdf', 
          size: 345600, 
          uploadedAt: '2024-02-01',
          category: 'license',
          url: '#',
          content: 'JVBERi0yLjQKJcOkw7zD...'
        }
      ])
    } catch (err) {
      console.error('Error fetching documents:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file')
      return
    }

    setUploading(true)
    setError('')

    try {
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newDoc: Document = {
        id: Date.now().toString(),
        name: selectedFile.name,
        type: selectedFile.name.split('.').pop() || 'file',
        size: selectedFile.size,
        uploadedAt: new Date().toISOString().split('T')[0],
        category: uploadCategory,
        url: '#',
        content: 'Mock content for preview' // Mock content
      }
      
      setDocuments([newDoc, ...documents])
      setShowUploadModal(false)
      setSelectedFile(null)
      setUploadCategory('invoice')
      setUploadDescription('')
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id))
    setShowDeleteConfirm(null)
  }

  const handleDownload = (doc: Document) => {
    // Create a file for download
    let content = `This is a sample ${doc.name} file.\n\n`
    content += `Document Type: ${doc.category}\n`
    content += `Upload Date: ${doc.uploadedAt}\n`
    content += `File Size: ${formatFileSize(doc.size)}\n\n`
    content += `This is a demonstration file. In a real application, this would contain the actual document content.`
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = doc.name
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleView = (doc: Document) => {
    setPreviewDocument(doc)
    setShowPreviewModal(true)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-500" />
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="w-8 h-8 text-blue-500" />
      case 'xls':
      case 'xlsx':
      case 'csv':
        return <FileSpreadsheet className="w-8 h-8 text-green-500" />
      case 'zip':
      case 'rar':
      case '7z':
        return <Archive className="w-8 h-8 text-yellow-500" />
      default:
        return <FileText className="w-8 h-8 text-gray-500" />
    }
  }

  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(doc => categoryFilter === 'all' || doc.category === categoryFilter)

  const categories = ['all', 'invoice', 'contract', 'tax', 'insurance', 'license', 'other']

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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
          <p className="text-gray-600 mt-1">Upload and manage your documents</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
        >
          <Upload size={18} />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-gray-900"
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-gray-900"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            <button className="p-2 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                {getFileIcon(doc.type)}
                <div>
                  <h3 className="font-medium text-gray-900 line-clamp-1">{doc.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatFileSize(doc.size)} • {doc.uploadedAt}
                  </p>
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full capitalize">
                    {doc.category}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => handleView(doc)}
                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                  title="View"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => handleDownload(doc)}
                  className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                  title="Download"
                >
                  <Download size={16} />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(doc.id)}
                  className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Delete Confirmation */}
            {showDeleteConfirm === doc.id && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 mb-2">Delete this document?</p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredDocuments.length === 0 && (
          <div className="col-span-3 text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-500 mb-6">Upload your first document to get started.</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 inline-flex items-center space-x-2"
            >
              <Upload size={18} />
              <span>Upload Document</span>
            </button>
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      {showPreviewModal && previewDocument && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowPreviewModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  {getFileIcon(previewDocument.type)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{previewDocument.name}</h3>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(previewDocument.size)} • Uploaded on {previewDocument.uploadedAt}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6">
                {/* Document Preview Content */}
                <div className="bg-gray-50 rounded-lg p-8 min-h-[400px] flex items-center justify-center">
                  {previewDocument.type === 'pdf' ? (
                    <div className="text-center">
                      <FileText className="w-24 h-24 text-red-500 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">PDF Document Preview</p>
                      <div className="bg-white p-4 rounded-lg border border-gray-200 max-w-2xl mx-auto">
                        <p className="text-sm text-gray-700 mb-2 font-semibold">{previewDocument.name}</p>
                        <p className="text-xs text-gray-500 mb-4">Uploaded: {previewDocument.uploadedAt}</p>
                        <div className="border-t border-gray-200 pt-4">
                          <p className="text-sm text-gray-600">
                            This is a preview of the PDF document. In a production environment, 
                            you would see the actual PDF content here.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : previewDocument.type.match(/jpg|jpeg|png|gif/i) ? (
                    <div className="text-center">
                      <Image className="w-24 h-24 text-blue-500 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Image Preview</p>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="w-64 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500">Image Placeholder</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-4">{previewDocument.name}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <FileText className="w-24 h-24 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Document Preview</p>
                      <div className="bg-white p-6 rounded-lg border border-gray-200 max-w-2xl mx-auto">
                        <p className="text-sm text-gray-700 mb-4">
                          This is a preview of the document. The actual content would be displayed here.
                        </p>
                        <div className="bg-gray-100 p-4 rounded">
                          <p className="text-xs text-gray-600 font-mono">
                            Document Type: {previewDocument.category}<br />
                            File Name: {previewDocument.name}<br />
                            File Size: {formatFileSize(previewDocument.size)}<br />
                            Upload Date: {previewDocument.uploadedAt}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => handleDownload(previewDocument)}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  >
                    <Download size={16} />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => setShowPreviewModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowUploadModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Upload Document</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleUpload(); }} className="p-6">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition cursor-pointer"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-1">
                      {selectedFile ? selectedFile.name : 'Click to select or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, Images, Word, Excel (Max 10MB)
                    </p>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    >
                      <option value="invoice">Invoice</option>
                      <option value="contract">Contract</option>
                      <option value="tax">Tax / W-9</option>
                      <option value="insurance">Insurance</option>
                      <option value="license">License</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      value={uploadDescription}
                      onChange={(e) => setUploadDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 resize-none"
                      placeholder="Add a description for this document..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedFile || uploading}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        <span>Upload</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </VendorLayout>
  )
}
