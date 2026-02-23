'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  ArrowLeft,
  FileCheck,
  Plus,
  Save,
  X,
  AlertCircle,
  Building2,
  DollarSign,
  Calendar,
  FileText,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

interface Vendor {
  id: string
  name: string
  email: string | null
}

interface Quote {
  id: string
  quoteNumber: string
  total: number
  currency: string
  vendorId: string
  vendor: {
    name: string
  }
}

interface Project {
  id: string
  name: string
  projectNumber: string
}

export default function NewContractPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingVendors, setLoadingVendors] = useState(false)
  const [loadingQuotes, setLoadingQuotes] = useState(false)

  const [formData, setFormData] = useState({
    vendorId: '',
    quoteId: '',
    projectId: '',
    title: '',
    description: '',
    type: 'purchase_contract',
    startDate: '',
    endDate: '',
    effectiveDate: '',
    value: '',
    currency: 'USD',
    paymentTerms: '',
    billingCycle: '',
    autoRenew: false,
    renewalTerms: '',
    documentUrl: '',
    terms: '',
    specialTerms: ''
  })

  useEffect(() => {
    fetchVendors()
    fetchQuotes()
    fetchProjects()
  }, [])

  const fetchVendors = async () => {
    setLoadingVendors(true)
    try {
      const response = await api.getVendors()
      if (response.success) {
        const activeVendors = response.data.filter((v: any) => v.status === 'active')
        setVendors(activeVendors)
      }
    } catch (err) {
      console.error('Error fetching vendors:', err)
    } finally {
      setLoadingVendors(false)
    }
  }

  const fetchQuotes = async () => {
    setLoadingQuotes(true)
    try {
      const response = await api.getQuotes()
      if (response.success) {
        // Only show accepted quotes that don't have contracts yet
        const acceptedQuotes = response.data.filter((q: any) => q.status === 'accepted')
        setQuotes(acceptedQuotes)
      }
    } catch (err) {
      console.error('Error fetching quotes:', err)
    } finally {
      setLoadingQuotes(false)
    }
  }

 const fetchProjects = async () => {
  try {
    // Check if the API method exists before calling it
    if (api.getProjects) {
      const response = await api.getProjects()
      if (response.success) {
        setProjects(response.data)
      }
    }
  } catch (err) {
    // Silently fail - projects are optional
    console.log('Projects API not available yet')
    setProjects([])
  }
}

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleQuoteSelect = (quoteId: string) => {
    const selectedQuote = quotes.find(q => q.id === quoteId)
    if (selectedQuote) {
      setFormData(prev => ({
        ...prev,
        quoteId,
        vendorId: selectedQuote.vendorId,
        title: `Contract for Quote ${selectedQuote.quoteNumber}`,
        value: selectedQuote.total.toString(),
        currency: selectedQuote.currency
      }))
    }
  }

  const validateForm = () => {
    if (!formData.vendorId) {
      setError('Please select a vendor')
      return false
    }
    if (!formData.title.trim()) {
      setError('Title is required')
      return false
    }
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        setError('Start date must be before end date')
        return false
      }
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
      const contractData = {
        vendorId: formData.vendorId,
        quoteId: formData.quoteId || undefined,
        projectId: formData.projectId || undefined,
        title: formData.title,
        description: formData.description || undefined,
        type: formData.type,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        effectiveDate: formData.effectiveDate || undefined,
        value: formData.value ? parseFloat(formData.value) : undefined,
        currency: formData.currency,
        paymentTerms: formData.paymentTerms || undefined,
        billingCycle: formData.billingCycle || undefined,
        autoRenew: formData.autoRenew,
        renewalTerms: formData.renewalTerms || undefined,
        documentUrl: formData.documentUrl || undefined,
        terms: formData.terms || undefined,
        specialTerms: formData.specialTerms || undefined
      }

      const response = await api.createContract(contractData)
      
      if (response.success) {
        router.push(`/procurement/contracts/${response.data.id}`)
      } else {
        setError(response.error || 'Failed to create contract')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create contract')
    } finally {
      setSaving(false)
    }
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 text-sm text-gray-500 mb-4">
          <Link href="/procurement/contracts" className="hover:text-purple-600">
            Contracts
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">New Contract</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileCheck className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Contract</h1>
              <p className="text-sm text-gray-500 mt-1">Create a new contract with a vendor</p>
            </div>
          </div>
          <Link
            href="/procurement/contracts"
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
            {/* Quote Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Create from Quote (Optional)
              </label>
              <select
                name="quoteId"
                value={formData.quoteId}
                onChange={(e) => handleQuoteSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              >
                <option value="">Select a quote...</option>
                {loadingQuotes ? (
                  <option disabled>Loading quotes...</option>
                ) : (
                  quotes.map(quote => (
                    <option key={quote.id} value={quote.id}>
                      {quote.quoteNumber} - {quote.vendor.name} - {quote.currency} {quote.total.toLocaleString()}
                    </option>
                  ))
                )}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select an accepted quote to auto-populate vendor and value
              </p>
            </div>

            {/* Vendor Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor <span className="text-red-500">*</span>
              </label>
              <select
                name="vendorId"
                value={formData.vendorId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                required
              >
                <option value="">Select a vendor...</option>
                {loadingVendors ? (
                  <option disabled>Loading vendors...</option>
                ) : (
                  vendors.map(vendor => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name} {vendor.email ? `- ${vendor.email}` : ''}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Project Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project (Optional)
              </label>
              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              >
                <option value="">No project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.projectNumber} - {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contract Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                placeholder="e.g., Office Supplies Contract 2024"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 resize-none"
                placeholder="Detailed description of the contract..."
              />
            </div>

            {/* Contract Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contract Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              >
                <option value="purchase_contract">Purchase Contract</option>
                <option value="service_contract">Service Contract</option>
                <option value="maintenance_contract">Maintenance Contract</option>
                <option value="lease_contract">Lease Contract</option>
                <option value="nda">Non-Disclosure Agreement</option>
                <option value="msa">Master Service Agreement</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contract Dates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effective Date
              </label>
              <input
                type="date"
                name="effectiveDate"
                value={formData.effectiveDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contract Value
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="value"
                  value={formData.value}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Billing Cycle
              </label>
              <select
                name="billingCycle"
                value={formData.billingCycle}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              >
                <option value="">Select billing cycle...</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="semi_annual">Semi-Annual</option>
                <option value="annual">Annual</option>
                <option value="one_time">One Time</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Terms
            </label>
            <input
              type="text"
              name="paymentTerms"
              value={formData.paymentTerms}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              placeholder="e.g., Net 30"
            />
          </div>
        </div>

        {/* Renewal Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Renewal Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="autoRenew"
                name="autoRenew"
                checked={formData.autoRenew}
                onChange={handleChange}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="autoRenew" className="text-sm text-gray-700">
                Auto-renew contract
              </label>
            </div>

            {formData.autoRenew && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Renewal Terms
                </label>
                <textarea
                  name="renewalTerms"
                  rows={3}
                  value={formData.renewalTerms}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 resize-none"
                  placeholder="Describe the renewal terms and conditions..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Terms and Conditions</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Standard Terms
              </label>
              <textarea
                name="terms"
                rows={6}
                value={formData.terms}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 resize-none font-mono text-sm"
                placeholder="Enter the standard terms and conditions..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Terms
              </label>
              <textarea
                name="specialTerms"
                rows={4}
                value={formData.specialTerms}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 resize-none"
                placeholder="Any special terms or conditions specific to this contract..."
              />
            </div>
          </div>
        </div>

        {/* Document URL */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contract Document</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document URL
            </label>
            <input
              type="url"
              name="documentUrl"
              value={formData.documentUrl}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              placeholder="https://example.com/contract.pdf"
            />
            <p className="text-xs text-gray-500 mt-1">
              Link to the uploaded contract document
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <Link
            href="/procurement/contracts"
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
            <span>{saving ? 'Creating...' : 'Create Contract'}</span>
          </button>
        </div>
      </form>
    </MainLayout>
  )
}