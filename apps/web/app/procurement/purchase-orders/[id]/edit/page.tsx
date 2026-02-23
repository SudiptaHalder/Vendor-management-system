
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  ArrowLeft,
  ShoppingCart,
  Building2,
  Save,
  X,
  Plus,
  Trash2,
  AlertCircle,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

interface PurchaseOrder {
  id: string
  poNumber: string
  title: string
  description?: string
  status: string
  priority: string
  orderDate: string
  expectedDate?: string
  subtotal: number
  taxAmount: number
  discount: number
  total: number
  currency: string
  notes?: string
  terms?: string
  vendor: {
    id: string
    name: string
    email: string
  }
  lineItems: Array<{
    id: string
    lineNumber: number
    description: string
    quantity: number
    unitPrice: number
    total: number
    notes?: string
  }>
}

interface Vendor {
  id: string
  name: string
  email: string
}

interface LineItem {
  id: string
  lineNumber: number
  description: string
  quantity: number
  unitPrice: number
  total: number
  notes?: string
}

// Helper function to safely format currency
const formatCurrency = (amount: any, currency: string = 'USD'): string => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return `${currency} 0.00`
  }
  const numAmount = Number(amount)
  return `${currency} ${numAmount.toFixed(2)}`
}

export default function EditPurchaseOrderPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loadingVendors, setLoadingVendors] = useState(false)
  const [poNumber, setPoNumber] = useState('')

  const [formData, setFormData] = useState({
    vendorId: '',
    title: '',
    description: '',
    priority: 'medium',
    expectedDate: '',
    notes: '',
    terms: '',
    subtotal: 0,
    taxAmount: 0,
    discount: 0,
    total: 0,
    currency: 'USD'
  })

  const [lineItems, setLineItems] = useState<LineItem[]>([])

  const id = params.id as string

  useEffect(() => {
    fetchPurchaseOrder()
    fetchVendors()
  }, [id])

  const fetchPurchaseOrder = async () => {
    setLoading(true)
    try {
      const response = await api.getPurchaseOrder(id)
      if (response.success) {
        const po = response.data
        setPoNumber(po.poNumber)
        setFormData({
          vendorId: po.vendor.id,
          title: po.title,
          description: po.description || '',
          priority: po.priority,
          expectedDate: po.expectedDate ? po.expectedDate.split('T')[0] : '',
          notes: po.notes || '',
          terms: po.terms || '',
          subtotal: Number(po.subtotal) || 0,
          taxAmount: Number(po.taxAmount) || 0,
          discount: Number(po.discount) || 0,
          total: Number(po.total) || 0,
          currency: po.currency || 'USD'
        })
        setLineItems(po.lineItems.map((item: any) => ({
          id: item.id,
          lineNumber: item.lineNumber,
          description: item.description || '',
          quantity: Number(item.quantity) || 0,
          unitPrice: Number(item.unitPrice) || 0,
          total: Number(item.total) || 0,
          notes: item.notes || ''
        })))
      } else {
        setError('Failed to load purchase order')
      }
    } catch (err) {
      console.error('Error fetching purchase order:', err)
      setError('Failed to load purchase order')
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
    
    // Recalculate total when discount changes
    if (name === 'discount') {
      setTimeout(() => calculateTotals(), 0)
    }
  }

  const handleLineItemChange = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        
        // Recalculate line item total when quantity or unit price changes
        if (field === 'quantity' || field === 'unitPrice') {
          const quantity = field === 'quantity' ? Number(value) || 0 : item.quantity
          const unitPrice = field === 'unitPrice' ? Number(value) || 0 : item.unitPrice
          updatedItem.total = Number((quantity * unitPrice).toFixed(2))
        }
        
        return updatedItem
      }
      return item
    }))

    // Recalculate overall totals after line items update
    setTimeout(() => calculateTotals(), 0)
  }

  const addLineItem = () => {
    const nextLineNumber = lineItems.length > 0 
      ? Math.max(...lineItems.map(i => i.lineNumber)) + 1 
      : 1
    
    setLineItems(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        lineNumber: nextLineNumber,
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
        notes: ''
      }
    ])
    
    setTimeout(() => calculateTotals(), 0)
  }

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(prev => prev.filter(item => item.id !== id))
      setTimeout(() => calculateTotals(), 0)
    }
  }

  const calculateTotals = () => {
    // Calculate subtotal from all line items
    const subtotal = lineItems.reduce((sum, item) => {
      const itemTotal = Number(item.total) || 0
      return sum + itemTotal
    }, 0)
    
    // Calculate tax (10% of subtotal)
    const taxAmount = Number((subtotal * 0.1).toFixed(2))
    
    // Get discount
    const discount = Number(formData.discount) || 0
    
    // Calculate total
    const total = Number((subtotal + taxAmount - discount).toFixed(2))

    console.log('Calculating totals:', {
      subtotal,
      taxAmount,
      discount,
      total,
      lineItems: lineItems.map(i => ({ desc: i.description, total: i.total }))
    })

    setFormData(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      total
    }))
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
    if (lineItems.length === 0) {
      setError('At least one line item is required')
      return false
    }
    for (const item of lineItems) {
      if (!item.description.trim()) {
        setError('All line items must have a description')
        return false
      }
      if (Number(item.quantity) <= 0) {
        setError('Quantity must be greater than 0')
        return false
      }
      if (Number(item.unitPrice) < 0) {
        setError('Unit price cannot be negative')
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

    // Recalculate totals one last time before submit
    calculateTotals()

    setSaving(true)
    setError('')

    try {
      const updateData = {
        title: formData.title,
        description: formData.description || '',
        priority: formData.priority,
        expectedDate: formData.expectedDate || null,
        notes: formData.notes || '',
        terms: formData.terms || '',
        subtotal: formData.subtotal,
        taxAmount: formData.taxAmount,
        discount: formData.discount,
        total: formData.total,
        currency: formData.currency,
        lineItems: lineItems.map(item => ({
          // Don't send the ID - let the backend create new ones
          lineNumber: item.lineNumber,
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          total: Number(item.total),
          notes: item.notes || ''
        }))
      }

      console.log('📤 Sending update:', updateData)
      
      const response = await api.updatePurchaseOrder(id, updateData)
      
      if (response.success) {
        router.push(`/procurement/purchase-orders/${id}`)
      } else {
        setError(response.error || 'Failed to update purchase order')
      }
    } catch (err: any) {
      console.error('Error updating purchase order:', err)
      setError(err.message || 'Failed to update purchase order')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              href={`/procurement/purchase-orders/${id}`}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Purchase Order</h1>
              <p className="text-gray-600 mt-1">{poNumber || 'Loading...'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href={`/procurement/purchase-orders/${id}`}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <X size={16} />
              <span>Cancel</span>
            </Link>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor <span className="text-red-500">*</span>
                </label>
                <select
                  name="vendorId"
                  value={formData.vendorId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-gray-50"
                  disabled
                >
                  <option value={formData.vendorId}>
                    {vendors.find(v => v.id === formData.vendorId)?.name || 'Loading...'}
                  </option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Vendor cannot be changed after creation</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Delivery Date
              </label>
              <input
                type="date"
                name="expectedDate"
                value={formData.expectedDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Line Items</h2>
              <button
                type="button"
                onClick={addLineItem}
                className="px-3 py-1.5 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 flex items-center space-x-1"
              >
                <Plus size={16} />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-3">
              {lineItems.map((item) => (
                <div key={item.id} className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 w-8 pt-2">
                    #{item.lineNumber}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                      required
                    />
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                        min="0.01"
                        step="0.01"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Unit Price"
                        value={item.unitPrice}
                        onChange={(e) => handleLineItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                        min="0"
                        step="0.01"
                        required
                      />
                      <div className="px-3 py-2 bg-gray-100 text-gray-900 rounded-lg text-sm font-medium w-32">
                        {formatCurrency(item.total, formData.currency)}
                      </div>
                      <input
                        type="text"
                        placeholder="Notes"
                        value={item.notes || ''}
                        onChange={(e) => handleLineItemChange(item.id, 'notes', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                      />
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
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(formData.subtotal, formData.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (10%):</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(formData.taxAmount, formData.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount:</span>
                    <div className="flex items-center">
                      <input
                        type="number"
                        name="discount"
                        value={formData.discount}
                        onChange={handleChange}
                        className="w-20 px-2 py-1 text-right border border-gray-300 rounded text-sm"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-base font-semibold pt-2 border-t">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-gray-900">
                      {formatCurrency(formData.total, formData.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes & Terms</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
                  placeholder="Additional notes..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Terms & Conditions
                </label>
                <textarea
                  name="terms"
                  rows={4}
                  value={formData.terms}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
                  placeholder="Payment terms, delivery terms, etc..."
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}

