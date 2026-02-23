'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  FolderOpen,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  FileText,
  Image,
  File,
  Calendar,
  Lock,
  Unlock,
  User,
  Building2,
  Loader2,
  AlertCircle,
  MoreVertical
} from 'lucide-react'
import Link from 'next/link'

interface Document {
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
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const response = await api.getDocuments()
      if (response.success) {
        setDocuments(response.data)
      } else {
        setError('Failed to load documents')
      }
    } catch (err) {
      console.error('Error fetching documents:', err)
      setError('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  const handleDeleteDocument = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this document?')) {
      return
    }

    try {
      const response = await api.deleteDocument(id)
      if (response.success) {
        setDocuments(documents.filter(doc => doc.id !== id))
      }
    } catch (err) {
      alert('Failed to delete document')
    }
  }

  const handleDownload = async (id: string, fileName: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      const blob = await api.downloadDocument(id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      alert('Failed to download document')
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image
    if (fileType.includes('pdf')) return FileText
    if (fileType.includes('word')) return FileText
    if (fileType.includes('excel')) return FileText
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getUniqueCategories = () => {
    const categories = documents.map(doc => doc.category).filter(Boolean)
    return ['all', ...new Set(categories)]
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.vendor?.name.toLowerCase().includes(searchTerm.toLowerCase() || '')
    
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter
    const matchesType = typeFilter === 'all' || 
      (typeFilter === 'image' && doc.fileType.startsWith('image/')) ||
      (typeFilter === 'pdf' && doc.fileType.includes('pdf')) ||
      (typeFilter === 'document' && (doc.fileType.includes('word') || doc.fileType.includes('text'))) ||
      (typeFilter === 'spreadsheet' && doc.fileType.includes('excel'))
    
    return matchesSearch && matchesCategory && matchesType
  })

  const stats = {
    total: documents.length,
    images: documents.filter(d => d.fileType.startsWith('image/')).length,
    pdfs: documents.filter(d => d.fileType.includes('pdf')).length,
    documents: documents.filter(d => d.fileType.includes('word') || d.fileType.includes('text')).length,
    confidential: documents.filter(d => d.isConfidential).length,
    totalSize: documents.reduce((sum, d) => sum + d.fileSize, 0)
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600 mt-1">Manage and organize all your files</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                view === 'grid' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                view === 'list' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              List
            </button>
          </div>
          <button
            onClick={fetchDocuments}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <Link
            href="/documents/upload"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Upload Document</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FolderOpen className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Images</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.images}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Image className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">PDFs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pdfs}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <FileText className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Confidential</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.confidential}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Lock className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Size</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatFileSize(stats.totalSize)}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <File className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, description, vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All Categories</option>
              {getUniqueCategories().map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="pdf">PDF</option>
              <option value="document">Documents</option>
              <option value="spreadsheet">Spreadsheets</option>
            </select>
            <button className="p-2 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Documents Grid/List */}
      {documents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents yet</h3>
          <p className="text-gray-500 mb-6">Upload your first document to get started.</p>
          <Link
            href="/documents/upload"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Upload Document</span>
          </Link>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDocuments.map((doc) => {
            const Icon = getFileIcon(doc.fileType)
            return (
              <div
                key={doc.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  {doc.isConfidential && (
                    <span className="p-1 bg-purple-100 rounded-full" title="Confidential">
                      <Lock size={14} className="text-purple-600" />
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-gray-900 mb-1 truncate">{doc.name}</h3>
                {doc.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{doc.description}</p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs text-gray-500">
                    <File size={12} className="mr-1" />
                    {formatFileSize(doc.fileSize)}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar size={12} className="mr-1" />
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </div>
                  {doc.vendor && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Building2 size={12} className="mr-1" />
                      {doc.vendor.name}
                    </div>
                  )}
                  <div className="flex items-center text-xs text-gray-500">
                    <User size={12} className="mr-1" />
                    {doc.uploadedBy.name || doc.uploadedBy.email}
                  </div>
                  {doc.version > 1 && (
                    <div className="text-xs text-blue-600">Version {doc.version}</div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => handleDownload(doc.id, doc.fileName, e)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      title="Download"
                    >
                      <Download size={16} />
                    </button>
                    <Link
                      href={`/documents/${doc.id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </Link>
                    <Link
                      href={`/documents/${doc.id}/edit`}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </Link>
                    <button
                      onClick={(e) => handleDeleteDocument(doc.id, e)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded On</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDocuments.map((doc) => {
                  const Icon = getFileIcon(doc.fileType)
                  return (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Icon size={16} className="text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                            {doc.version > 1 && (
                              <div className="text-xs text-blue-600">v{doc.version}</div>
                            )}
                          </div>
                          {doc.isConfidential && (
                            <Lock size={12} className="ml-2 text-purple-600" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {doc.fileType.split('/').pop()?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{formatFileSize(doc.fileSize)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{doc.category || '—'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{doc.uploadedBy.name || doc.uploadedBy.email}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{doc.vendor?.name || '—'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={(e) => handleDownload(doc.id, doc.fileName, e)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Download size={16} />
                          </button>
                          <Link
                            href={`/documents/${doc.id}`}
                            className="p-1 text-blue-600 hover:text-blue-800"
                          >
                            <Eye size={16} />
                          </Link>
                          <Link
                            href={`/documents/${doc.id}/edit`}
                            className="p-1 text-gray-600 hover:text-gray-800"
                          >
                            <Edit size={16} />
                          </Link>
                          <button
                            onClick={(e) => handleDeleteDocument(doc.id, e)}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </MainLayout>
  )
}