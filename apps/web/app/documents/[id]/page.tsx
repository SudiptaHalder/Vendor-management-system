'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  ArrowLeft,
  FileText,
  Download,
  Edit,
  Trash2,
  Calendar,
  Lock,
  Unlock,
  User,
  Building2,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Image as ImageIcon,
  File
} from 'lucide-react'
import Link from 'next/link'

interface DocumentDetail {
  id: string
  name: string
  description: string | null
  fileUrl: string
  fileName: string
  fileSize: number
  fileType: string
  category: string | null
  version: number
  isLatest: boolean
  entityType: string
  entityId: string
  expiryDate: string | null
  isConfidential: boolean
  uploadedBy: {
    id: string
    name: string | null
    email: string
  }
  vendor: {
    id: string
    name: string
    email: string | null
  } | null
  uploadedAt: string
  createdAt: string
}

export default function DocumentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [document, setDocument] = useState<DocumentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    fetchDocument()
  }, [params.id])

  const fetchDocument = async () => {
    setLoading(true)
    try {
      const response = await api.getDocument(params.id as string)
      if (response.success) {
        setDocument(response.data)
      } else {
        setError('Failed to load document')
      }
    } catch (err) {
      console.error('Error fetching document:', err)
      setError('Failed to load document')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDocument = async () => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return
    }

    try {
      const response = await api.deleteDocument(params.id as string)
      if (response.success) {
        router.push('/documents')
      }
    } catch (err) {
      setError('Failed to delete document')
    }
  }

const handleDownload = async () => {
  if (!document) return
  
  setDownloading(true)
  try {
    // Use fetch directly with credentials
    const token = localStorage.getItem('token')
    const response = await fetch(`http://localhost:3001${document.fileUrl}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Download failed')
    }
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = document.fileName
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (err) {
    console.error('Download error:', err)
    alert('Failed to download document')
  } finally {
    setDownloading(false)
  }
}

  const getFileIcon = () => {
    if (!document) return File
    if (document.fileType.startsWith('image/')) return ImageIcon
    if (document.fileType.includes('pdf')) return FileText
    if (document.fileType.includes('word')) return FileText
    if (document.fileType.includes('excel')) return FileText
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getEntityLink = () => {
    if (!document) return null
    switch (document.entityType) {
      case 'vendor':
        return `/vendors/${document.entityId}`
      case 'project':
        return `/projects/${document.entityId}`
      case 'workOrder':
        return `/work-orders/${document.entityId}`
      case 'contract':
        return `/procurement/contracts/${document.entityId}`
      case 'invoice':
        return `/invoices/${document.entityId}`
      case 'purchaseOrder':
        return `/procurement/purchase-orders/${document.entityId}`
      case 'rfq':
        return `/procurement/rfqs/${document.entityId}`
      case 'bid':
        return `/procurement/bids/${document.entityId}`
      case 'expense':
        return `/expenses/${document.entityId}`
      default:
        return null
    }
  }

  const Icon = document ? getFileIcon() : File

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </MainLayout>
    )
  }

  if (error || !document) {
    return (
      <MainLayout>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Document</h3>
          <p className="text-gray-500 mb-6">{error || 'Document not found'}</p>
          <Link
            href="/documents"
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>Back to Documents</span>
          </Link>
        </div>
      </MainLayout>
    )
  }

  const entityLink = getEntityLink()

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 text-sm text-gray-500 mb-4">
          <Link href="/documents" className="hover:text-blue-600">
            Documents
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{document.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start space-x-4">
            <Link
              href="/documents"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Icon className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center flex-wrap gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{document.name}</h1>
                  {document.isConfidential && (
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full flex items-center">
                      <Lock size={12} className="mr-1" />
                      Confidential
                    </span>
                  )}
                  {!document.isLatest && (
                    <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                      Old Version
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Version {document.version} • {formatFileSize(document.fileSize)} • {document.fileType.split('/').pop()?.toUpperCase()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 disabled:opacity-50"
            >
              <Download size={16} />
              <span>{downloading ? 'Downloading...' : 'Download'}</span>
            </button>
            <Link
              href={`/documents/${document.id}/edit`}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <Edit size={16} />
              <span>Edit</span>
            </Link>
            <button
              onClick={handleDeleteDocument}
              className="px-4 py-2 text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 flex items-center space-x-2"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Document Preview (for images) */}
      {document.fileType.startsWith('image/') && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>
          <div className="flex justify-center">
            <img 
              src={`http://localhost:3001${document.fileUrl}`} 
              alt={document.name}
              className="max-h-96 rounded-lg shadow-sm"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Document Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {document.description && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{document.description}</p>
            </div>
          )}

          {/* File Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">File Information</h2>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-2 gap-6">
                <div>
                  <dt className="text-xs text-gray-500 mb-1">File Name</dt>
                  <dd className="text-sm text-gray-900">{document.fileName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 mb-1">File Type</dt>
                  <dd className="text-sm text-gray-900">{document.fileType}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 mb-1">File Size</dt>
                  <dd className="text-sm text-gray-900">{formatFileSize(document.fileSize)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 mb-1">Category</dt>
                  <dd className="text-sm text-gray-900">{document.category || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 mb-1">Version</dt>
                  <dd className="text-sm text-gray-900">{document.version}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 mb-1">Status</dt>
                  <dd className="text-sm">
                    {document.isLatest ? (
                      <span className="text-green-600">Latest Version</span>
                    ) : (
                      <span className="text-yellow-600">Old Version</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Expiry Information */}
          {document.expiryDate && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Expiry Information</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-900">
                      Expires on {new Date(document.expiryDate).toLocaleDateString()}
                    </p>
                    {new Date(document.expiryDate) < new Date() && (
                      <p className="text-xs text-red-600 mt-1">Expired</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Linked Record */}
          {entityLink && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Linked Record</h2>
              </div>
              <div className="p-6">
                <Link
                  href={entityLink}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                >
                  <Eye size={16} />
                  <span className="font-medium">
                    View {document.entityType.charAt(0).toUpperCase() + document.entityType.slice(1)}
                  </span>
                </Link>
                <p className="text-xs text-gray-500 mt-2">ID: {document.entityId}</p>
              </div>
            </div>
          )}

          {/* Vendor Information */}
          {document.vendor && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Vendor Information</h2>
              </div>
              <div className="p-6">
                <Link
                  href={`/vendors/${document.vendor.id}`}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                >
                  <Building2 size={16} />
                  <span className="font-medium">{document.vendor.name}</span>
                </Link>
                {document.vendor.email && (
                  <p className="text-xs text-gray-500 mt-2">{document.vendor.email}</p>
                )}
              </div>
            </div>
          )}

          {/* Upload Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Upload Information</h2>
            </div>
            <div className="p-6">
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-500">Uploaded By</dt>
                  <dd className="text-sm text-gray-900 flex items-center">
                    <User size={14} className="mr-1 text-gray-400" />
                    {document.uploadedBy.name || document.uploadedBy.email}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-500">Uploaded On</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(document.uploadedAt).toLocaleDateString()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-xs text-gray-500">Last Updated</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(document.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Security</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center space-x-2">
                {document.isConfidential ? (
                  <>
                    <Lock className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-900">Confidential Document</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-500">Public Document</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}