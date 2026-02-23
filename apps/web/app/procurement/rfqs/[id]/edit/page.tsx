'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  ArrowLeft,
  MessageSquare,
  Plus,
  Trash2,
  AlertCircle,
  Users,
  Save,
  X
} from 'lucide-react'
import Link from 'next/link'

interface Vendor {
  id: string
  name: string
  email: string | null
}

interface LineItem {
  id: string
  lineNumber?: number
  description: string
  quantity: number
  unit: string
  notes?: string
}

export default function EditRFQPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loadingVendors, setLoadingVendors] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    expectedDeliveryDate: '',
    notes: '',
    deliveryTerms: '',
    vendorIds: [] as string[]
  })

  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      unit: 'piece'
    }
  ])

  useEffect(() => {
    fetchRFQ()
    fetchVendors()
  }, [params.id])

  const fetchRFQ = async () => {
    setLoading(true)
    try {
      const response = await api.getRFQ(params.id as string)
      if (response.success) {
        const rfq = response.data
        
        // Format dates for input fields
        const formatDate = (dateString: string | null) => {
          if (!dateString) return ''
          const date = new Date(dateString)
          return date.toISOString().split('T')[0]
        }

        setFormData({
          title: rfq.title || '',
          description: rfq.description || '',
          deadline: formatDate(rfq.deadline),
          expectedDeliveryDate: formatDate(rfq.expectedDeliveryDate),
          notes: rfq.notes || '',
          deliveryTerms: rfq.deliveryTerms || '',
          vendorIds: rfq.recipients?.map((r: any) => r.vendorId) || []
        })

        // Set line items
        if (rfq.lineItems && rfq.lineItems.length > 0) {
          setLineItems(rfq.lineItems.map((item: any) => ({
            id: item.id || crypto.randomUUID(),
            lineNumber: item.lineNumber,
            description: item.description,
            quantity: Number(item.quantity),
            unit: item.unit || 'piece',
            notes: item.notes || ''
          })))
        }
      } else {
        setError('Failed to load RFQ')
      }
    } catch (err) {
      setError('Failed to load RFQ')
    } finally {
      setLoading(false)
    }
  }

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleVendorSelection = (vendorId: string) => {
    setFormData(prev => ({
      ...prev,
      vendorIds: prev.vendorIds.includes(vendorId)
        ? prev.vendorIds.filter(id => id !== vendorId)
        : [...prev.vendorIds, vendorId]
    }))
  }

  const handleLineItemChange = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const addLineItem = () => {
    setLineItems(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        description: '',
        quantity: 1,
        unit: 'piece'
      }
    ])
  }

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(prev => prev.filter(item => item.id !== id))
    }
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required')
      return false
    }
    if (formData.vendorIds.length === 0) {
      setError('Please select at least one vendor')
      return false
    }
    for (const item of lineItems) {
      if (!item.description.trim()) {
        setError('All line items must have a description')
        return false
      }
      if (item.quantity <= 0) {
        setError('Quantity must be greater than 0')
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
      const rfqData = {
        title: formData.title,
        description: formData.description,
        deadline: formData.deadline || null,
        expectedDeliveryDate: formData.expectedDeliveryDate || null,
        notes: formData.notes,
        deliveryTerms: formData.deliveryTerms,
        status: 'draft', // Keep as draft when editing
        vendorIds: formData.vendorIds,
        lineItems: lineItems.map((item, index) => ({
          id: item.id.startsWith('new-') ? undefined : item.id,
          lineNumber: index + 1,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          notes: item.notes
        }))
      }

      const response = await api.updateRFQ(params.id as string, rfqData)
      
      if (response.success) {
        router.push(`/procurement/rfqs/${params.id}`)
      } else {
        setError(response.error || 'Failed to update RFQ')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update RFQ')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 text-sm text-gray-500 mb-4">
          <Link href="/procurement/rfqs" className="hover:text-purple-600">
            RFQs
          </Link>
          <span>/</span>
          <Link href={`/procurement/rfqs/${params.id}`} className="hover:text-purple-600">
            {params.id}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Edit</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit RFQ</h1>
              <p className="text-sm text-gray-500 mt-1">Update RFQ details and requirements</p>
            </div>
          </div>
          <Link
            href={`/procurement/rfqs/${params.id}`}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                placeholder="e.g., Office Supplies RFQ - Q1 2024"
                required
              />
            </div>

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
                placeholder="Detailed description of requirements..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline for Quotes
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Delivery Date
                </label>
                <input
                  type="date"
                  name="expectedDeliveryDate"
                  value={formData.expectedDeliveryDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Vendors</h2>
          {loadingVendors ? (
            <div className="text-center py-4">
              <div className="animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading vendors...</p>
            </div>
          ) : vendors.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <Users className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm text-yellow-700">No active vendors found.</p>
              <p className="text-xs text-yellow-600 mt-1">Please add and approve vendors first.</p>
            </div>
          ) : (
            <>
              <div className="border border-gray-200 rounded-lg divide-y max-h-48 overflow-y-auto">
                {vendors.map((vendor) => (
                  <label
                    key={vendor.id}
                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.vendorIds.includes(vendor.id)}
                      onChange={() => handleVendorSelection(vendor.id)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{vendor.name}</p>
                      {vendor.email && (
                        <p className="text-xs text-gray-500">{vendor.email}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Selected: {formData.vendorIds.length} vendor(s)
              </p>
            </>
          )}
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Items/Services</h2>
            <button
              type="button"
              onClick={addLineItem}
              className="text-sm text-purple-600 hover:text-purple-800 flex items-center space-x-1"
            >
              <Plus size={16} />
              <span>Add Item</span>
            </button>
          </div>
          
          <div className="space-y-3">
            {lineItems.map((item, index) => (
              <div key={item.id} className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 text-sm"
                    required
                  />
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleLineItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 text-sm"
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>
                <div className="w-24">
                  <select
                    value={item.unit}
                    onChange={(e) => handleLineItemChange(item.id, 'unit', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 text-sm"
                  >
                    <option value="piece">piece</option>
                    <option value="hour">hour</option>
                    <option value="day">day</option>
                    <option value="month">month</option>
                    <option value="kg">kg</option>
                    <option value="liter">liter</option>
                    <option value="meter">meter</option>
                    <option value="box">box</option>
                    <option value="set">set</option>
                  </select>
                </div>
                {lineItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLineItem(item.id)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes to Vendors
              </label>
              <textarea
                name="notes"
                rows={4}
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 resize-none"
                placeholder="Special instructions, delivery requirements, etc..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Terms
              </label>
              <textarea
                name="deliveryTerms"
                rows={4}
                value={formData.deliveryTerms}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 resize-none"
                placeholder="Payment terms, delivery terms, warranty, etc..."
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <Link
            href={`/procurement/rfqs/${params.id}`}
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
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </MainLayout>
  )
}