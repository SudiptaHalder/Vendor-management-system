'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import VendorLayout from '@/components/vendor/VendorLayout'
import { api } from '@/lib/api'
import { ArrowLeft, Plus, Trash2, Save, Bell } from 'lucide-react'
import Link from 'next/link'

export default function NewInvoicePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lineItems, setLineItems] = useState([
    { description: '', quantity: 1, unitPrice: 0, total: 0 }
  ])

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    poNumber: '',
    description: '',
    dueDate: '',
    notes: ''
  })

  const calculateLineTotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice
  }

  const updateLineItem = (index: number, field: string, value: any) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }
    
    if (field === 'quantity' || field === 'unitPrice') {
      updated[index].total = calculateLineTotal(
        updated[index].quantity,
        updated[index].unitPrice
      )
    }
    
    setLineItems(updated)
  }

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0, total: 0 }])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index))
    }
  }

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate required fields
      if (!formData.invoiceNumber) {
        throw new Error('Invoice number is required')
      }
      if (!formData.dueDate) {
        throw new Error('Due date is required')
      }
      if (lineItems.some(item => !item.description)) {
        throw new Error('All line items must have a description')
      }

      const subtotal = calculateSubtotal()
      const tax = subtotal * 0.1
      const total = subtotal + tax

      // Create invoice data
      const invoiceData = {
        ...formData,
        lineItems,
        subtotal,
        tax,
        total,
        status: 'pending',
        submittedAt: new Date().toISOString()
      }

      console.log('Submitting invoice:', invoiceData)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Create a mock invoice ID
      const newInvoiceId = `inv_${Date.now()}`
      const invoiceNumber = formData.invoiceNumber

      // ✅ CREATE NOTIFICATION FOR ADMIN
      try {
        // In production, this would call your actual API
        // await api.createNotification({
        //   type: 'new_invoice',
        //   title: 'New Invoice Submitted',
        //   message: `Vendor submitted invoice ${invoiceNumber}`,
        //   invoiceId: newInvoiceId,
        //   for: 'admin'
        // })
        
        console.log('📨 Notification sent to admin:', {
          type: 'new_invoice',
          title: 'New Invoice Submitted',
          message: `Vendor submitted invoice ${invoiceNumber}`,
          invoiceId: newInvoiceId
        })

        // Store in localStorage for demo purposes
        const notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]')
        notifications.push({
          id: Date.now(),
          type: 'new_invoice',
          title: 'New Invoice Submitted',
          message: `Vendor submitted invoice ${invoiceNumber}`,
          invoiceId: newInvoiceId,
          invoiceNumber,
          read: false,
          timestamp: new Date().toISOString(),
          vendorName: 'Your Company' // In production, get from user context
        })
        localStorage.setItem('admin_notifications', JSON.stringify(notifications))

      } catch (notifError) {
        console.error('Failed to send notification:', notifError)
        // Don't block invoice submission if notification fails
      }

      // Store invoice in localStorage for demo
      const invoices = JSON.parse(localStorage.getItem('vendor_invoices') || '[]')
      invoices.push({
        id: newInvoiceId,
        ...invoiceData,
        createdAt: new Date().toISOString()
      })
      localStorage.setItem('vendor_invoices', JSON.stringify(invoices))

      // Redirect to invoices list with success message
      router.push('/vendor/invoices?success=true')
      
    } catch (err: any) {
      console.error('Error creating invoice:', err)
      setError(err.message || 'Failed to create invoice')
    } finally {
      setLoading(false)
    }
  }

  const subtotal = calculateSubtotal()
  const tax = subtotal * 0.1
  const total = subtotal + tax

  return (
    <VendorLayout>
      {/* Header */}
      <div className="mb-6">
        <Link href="/vendor/invoices" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16} className="mr-1" />
          Back to Invoices
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New Invoice</h1>
        <p className="text-gray-600 mt-1">Fill in the details to submit a new invoice</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                placeholder="INV-2024-XXX"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PO Number (Optional)
              </label>
              <input
                type="text"
                value={formData.poNumber}
                onChange={(e) => setFormData({...formData, poNumber: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                placeholder="PO-2024-XXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                required
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 resize-none"
              placeholder="Describe the goods or services..."
            />
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Line Items</h2>
            <button
              type="button"
              onClick={addLineItem}
              className="text-sm text-green-600 hover:text-green-800 flex items-center space-x-1"
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
                    className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    min="0.01"
                    step="0.01"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Unit Price"
                    value={item.unitPrice}
                    onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h2>
          <div className="max-w-md ml-auto">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (10%):</span>
                <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between">
                <span className="font-medium text-gray-900">Total:</span>
                <span className="font-bold text-gray-900">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h2>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 resize-none"
            placeholder="Any additional notes or comments..."
          />
        </div>

        {/* Notification Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
          <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">Admin Notification</p>
            <p className="text-xs text-blue-600 mt-1">
              When you submit this invoice, the admin will be notified immediately for review.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <Link
            href="/vendor/invoices"
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Submit Invoice</span>
              </>
            )}
          </button>
        </div>
      </form>
    </VendorLayout>
  )
}
