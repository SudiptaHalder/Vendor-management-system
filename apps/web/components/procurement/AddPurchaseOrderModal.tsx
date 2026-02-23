"use client"

import { useState, useEffect } from 'react'
import { X, ShoppingCart, Package, Truck, Calendar, DollarSign, Plus, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'

interface Vendor {
  id: string
  name: string
}

interface LineItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
  notes?: string
}

interface AddPurchaseOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (po: any) => void
}

export default function AddPurchaseOrderModal({ isOpen, onClose, onSuccess }: AddPurchaseOrderModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loadingVendors, setLoadingVendors] = useState(false)

  const [formData, setFormData] = useState({
    vendorId: '',
    title: '',
    description: '',
    priority: 'medium',
    expectedDate: '',
    subtotal: 0,
    taxAmount: 0,
    discount: 0,
    total: 0,
    currency: 'USD',
    notes: '',
    terms: ''
  })

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unitPrice: 0, total: 0 }
  ])

  // Fetch vendors when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchVendors()
    }
  }, [isOpen])

  const fetchVendors = async () => {
    setLoadingVendors(true)
    try {
      const response = await api.getVendors()
      if (response.success) {
        setVendors(response.data)
      }
    } catch (err) {
      console.error('Error fetching vendors:', err)
    } finally {
      setLoadingVendors(false)
    }
  }

  // Calculate line item total
  const calculateLineItemTotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice
  }

  // Update line item
  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }
    
    // Recalculate total for this line item
    if (field === 'quantity' || field === 'unitPrice') {
      updated[index].total = calculateLineItemTotal(
        updated[index].quantity,
        updated[index].unitPrice
      )
    }
    
    setLineItems(updated)
    calculateTotals(updated)
  }

  // Add new line item
  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0, total: 0 }])
  }

  // Remove line item
  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      const updated = lineItems.filter((_, i) => i !== index)
      setLineItems(updated)
      calculateTotals(updated)
    }
  }

  // Calculate subtotal and total
  const calculateTotals = (items: LineItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0)
    const taxAmount = subtotal * 0.1 // 10% tax - make configurable later
    const discount = 0 // Make configurable later
    const total = subtotal + taxAmount - discount

    setFormData(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      discount,
      total
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.vendorId) {
      setError('Please select a vendor')
      return
    }

    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }

    if (lineItems.some(item => !item.description.trim())) {
      setError('All line items must have a description')
      return
    }

    setLoading(true)
    setError('')

    try {
      const poData = {
        ...formData,
        expectedDate: formData.expectedDate || undefined,
        lineItems: lineItems.map(item => ({
          ...item,
          total: item.quantity * item.unitPrice
        }))
      }

      console.log('Creating purchase order:', poData)
      
      const response = await api.createPurchaseOrder(poData)
      console.log('Response:', response)

      if (response.success) {
        onSuccess(response.data)
        handleClose()
      } else {
        setError(response.error || 'Failed to create purchase order')
      }
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message || 'Failed to create purchase order')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      vendorId: '', title: '', description: '', priority: 'medium', expectedDate: '',
      subtotal: 0, taxAmount: 0, discount: 0, total: 0, currency: 'USD', notes: '', terms: ''
    })
    setLineItems([{ description: '', quantity: 1, unitPrice: 0, total: 0 }])
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Create Purchase Order</h2>
                <p className="text-sm text-gray-500">Fill in the details to create a new PO</p>
              </div>
            </div>
            <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="vendorId"
                    value={formData.vendorId}
                    onChange={(e) => setFormData({...formData, vendorId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required
                  >
                    <option value="">Select a vendor</option>
                    {loadingVendors ? (
                      <option disabled>Loading vendors...</option>
                    ) : (
                      vendors.map(vendor => (
                        <option key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="e.g., Office Supplies Q1 2026"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
                    placeholder="Brief description of the purchase order..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Delivery
                  </label>
                  <input
                    type="date"
                    name="expectedDate"
                    value={formData.expectedDate}
                    onChange={(e) => setFormData({...formData, expectedDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-md font-medium text-gray-900">Line Items</h3>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                  >
                    <Plus size={16} />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {lineItems.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-4 gap-3">
                        <input
                          type="text"
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                          className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          required
                        />
                        <input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          min="0.01"
                          step="0.01"
                          required
                        />
                        <input
                          type="number"
                          placeholder="Unit Price"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                          ${item.total.toFixed(2)}
                        </span>
                        {lineItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLineItem(index)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-md font-medium text-gray-900 mb-3">Financial Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium text-gray-900">${formData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (10%):</span>
                    <span className="font-medium text-gray-900">${formData.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium text-gray-900">${formData.discount.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between">
                    <span className="font-medium text-gray-900">Total:</span>
                    <span className="font-bold text-gray-900">${formData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
                    placeholder="Additional notes or instructions..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Terms & Conditions
                  </label>
                  <textarea
                    name="terms"
                    value={formData.terms}
                    onChange={(e) => setFormData({...formData, terms: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
                    placeholder="Payment terms, delivery terms, etc."
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={16} />
                    <span>Create Purchase Order</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

