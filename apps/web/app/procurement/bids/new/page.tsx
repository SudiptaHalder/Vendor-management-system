'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  ArrowLeft,
  ClipboardList,
  Save,
  X,
  AlertCircle,
  DollarSign,
  Calendar,
  FileText,
  Plus,
  Trash2
} from 'lucide-react'
import Link from 'next/link'

export default function NewBidPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'public_tender',
    openDate: new Date().toISOString().split('T')[0],
    closeDate: '',
    estimatedValue: '',
    currency: 'USD',
    requirements: '',
    evaluationCriteria: '',
    eligibilityCriteria: '',
    documentUrls: [] as string[]
  })

  const [newDocumentUrl, setNewDocumentUrl] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddDocument = () => {
    if (newDocumentUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        documentUrls: [...prev.documentUrls, newDocumentUrl.trim()]
      }))
      setNewDocumentUrl('')
    }
  }

  const handleRemoveDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documentUrls: prev.documentUrls.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required')
      return false
    }
    if (!formData.closeDate) {
      setError('Closing date is required')
      return false
    }
    if (new Date(formData.closeDate) <= new Date(formData.openDate)) {
      setError('Closing date must be after opening date')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSaving(true)
    setError('')

    try {
      const bidData = {
        title: formData.title,
        description: formData.description || undefined,
        type: formData.type,
        openDate: formData.openDate,
        closeDate: formData.closeDate,
        estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : undefined,
        currency: formData.currency,
        requirements: formData.requirements || undefined,
        evaluationCriteria: formData.evaluationCriteria || undefined,
        eligibilityCriteria: formData.eligibilityCriteria || undefined,
        documentUrls: formData.documentUrls
      }

      const response = await api.createBid(bidData)
      
      if (response.success) {
        router.push(`/procurement/bids/${response.data.id}`)
      } else {
        setError(response.error || 'Failed to create bid')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create bid')
    } finally {
      setSaving(false)
    }
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 text-sm text-gray-500 mb-4">
          <Link href="/procurement/bids" className="hover:text-purple-600">
            Bids
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">New Bid</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ClipboardList className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Bid</h1>
              <p className="text-sm text-gray-500 mt-1">Create a competitive bidding opportunity</p>
            </div>
          </div>
          <Link
            href="/procurement/bids"
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bid Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                placeholder="e.g., Annual Office Supplies Tender 2024"
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
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 resize-none"
                placeholder="Detailed description of the bidding opportunity..."
              />
            </div>

            {/* Bid Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bid Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              >
                <option value="public_tender">Public Tender</option>
                <option value="private_tender">Private Tender</option>
                <option value="request_for_proposal">Request for Proposal (RFP)</option>
                <option value="request_for_quotation">Request for Quotation (RFQ)</option>
                <option value="auction">Auction</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Bidding Period</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opening Date
              </label>
              <input
                type="date"
                name="openDate"
                value={formData.openDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Closing Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="closeDate"
                value={formData.closeDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                required
              />
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Value
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="estimatedValue"
                  value={formData.estimatedValue}
                  onChange={handleChange}
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="JPY">JPY - Japanese Yen</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="AUD">AUD - Australian Dollar</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requirements & Criteria */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Requirements & Criteria</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requirements
              </label>
              <textarea
                name="requirements"
                rows={4}
                value={formData.requirements}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 resize-none"
                placeholder="List the requirements for bidders..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Evaluation Criteria
              </label>
              <textarea
                name="evaluationCriteria"
                rows={4}
                value={formData.evaluationCriteria}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 resize-none"
                placeholder="How will bids be evaluated? (e.g., Price 40%, Quality 30%, Delivery 30%)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Eligibility Criteria
              </label>
              <textarea
                name="eligibilityCriteria"
                rows={4}
                value={formData.eligibilityCriteria}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 resize-none"
                placeholder="Who is eligible to bid? (e.g., Minimum experience, certifications, etc.)"
              />
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Bid Documents</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="url"
                value={newDocumentUrl}
                onChange={(e) => setNewDocumentUrl(e.target.value)}
                placeholder="Enter document URL"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              />
              <button
                type="button"
                onClick={handleAddDocument}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Add</span>
              </button>
            </div>

            {formData.documentUrls.length > 0 && (
              <div className="border rounded-lg divide-y">
                {formData.documentUrls.map((url, index) => (
                  <div key={index} className="flex items-center justify-between p-3">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-600 hover:text-purple-800 truncate flex-1"
                    >
                      {url}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemoveDocument(index)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <Link
            href="/procurement/bids"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <Save size={16} />
            <span>{saving ? 'Creating...' : 'Create Bid'}</span>
          </button>
        </div>
      </form>
    </MainLayout>
  )
}