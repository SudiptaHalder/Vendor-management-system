'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  ArrowLeft,
  Receipt,
  Save,
  X,
  AlertCircle,
  Building2,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  Loader2,
  FileText
} from 'lucide-react'
import Link from 'next/link'

interface Vendor {
  id: string
  name: string
  email: string | null
}

interface Project {
  id: string
  projectNumber: string
  name: string
}

interface PurchaseOrder {
  id: string
  poNumber: string
  title: string
  vendorId: string
}

interface LineItem {
  id: string
  lineNumber: number
  description: string
  quantity: number
  unit: string
  unitPrice: number
  discountPercent: number
  taxRate: number
  total: number
}

export default function NewInvoicePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const poId = searchParams.get('poId')
  
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const [formData, setFormData] = useState({
    vendorId: '',
    projectId: '',
    purchaseOrderId: poId || '',
    reference: '',
    type: 'service',
    status: 'draft',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    paymentTerms: '',
    currency: 'USD',
    notes: '',
    subtotal: 0,
    taxAmount: 0,
    taxRate: 0,
    discount: 0,
    discountType: 'percentage',
    shippingCost: 0,
    total: 0
  })

  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: crypto.randomUUID(),
      lineNumber: 1,
      description: '',
      quantity: 1,
      unit: 'piece',
      unitPrice: 0,
      discountPercent: 0,
      taxRate: 0,
      total: 0
    }
  ])

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    calculateTotals()
  }, [lineItems, formData.discount, formData.taxRate, formData.shippingCost])

  const fetchData = async () => {
    setLoadingData(true)
    try {
      // Fetch vendors
      const vendorsRes = await api.getVendors()
      if (vendorsRes.success) {
        setVendors(vendorsRes.data.filter((v: any) => v.status === 'active'))
      }

      // Fetch projects
      const projectsRes = await api.getProjects()
      if (projectsRes.success) {
        setProjects(projectsRes.data)
      }

      // Fetch purchase orders
      const poRes = await api.getPurchaseOrders()
      if (poRes.success) {
        setPurchaseOrders(poRes.data.filter((po: any) => po.status === 'approved' || po.status === 'sent'))
      }

      // If PO ID is provided, load PO details
      if (poId) {
        const poRes = await api.getPurchaseOrder(poId)
        if (poRes.success) {
          const po = poRes.data
          setFormData(prev => ({
            ...prev,
            vendorId: po.vendorId,
            purchaseOrderId: po.id,
            reference: po.poNumber
          }))
          
          // Convert PO line items to invoice line items
          if (po.lineItems) {
            setLineItems(po.lineItems.map((item: any, index: number) => ({
              id: crypto.randomUUID(),
              lineNumber: index + 1,
              description: item.description,
              quantity: Number(item.quantity) - Number(item.receivedQuantity || 0),
              unit: item.unit || 'piece',
              unitPrice: Number(item.unitPrice),
              discountPercent: 0,
              taxRate: 0,
              total: (Number(item.quantity) - Number(item.receivedQuantity || 0)) * Number(item.unitPrice)
            })))
          }
        }
      }

    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoadingData(false)
    }
  }

  const calculateTotals = () => {
    // Calculate subtotal from line items
    const subtotal = lineItems.reduce((sum, item) => sum + Number(item.total), 0)
    
    // Calculate discount
    let discountAmount = 0
    if (formData.discountType === 'percentage') {
      discountAmount = subtotal * (Number(formData.discount) / 100)
    } else {
      discountAmount = Number(formData.discount)
    }
    
    // Calculate tax
    const afterDiscount = subtotal - discountAmount
    const taxAmount = afterDiscount * (Number(formData.taxRate) / 100)
    
    // Calculate total
    const total = afterDiscount + taxAmount + Number(formData.shippingCost)
    
    setFormData(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      total
    }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }))
  }

  const handleVendorChange = (vendorId: string) => {
    setFormData(prev => ({ ...prev, vendorId }))
  }

  const handleLineItemChange = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        
        // Recalculate total for this line item
        if (field === 'quantity' || field === 'unitPrice' || field === 'discountPercent') {
          const quantity = typeof updatedItem.quantity === 'number' ? updatedItem.quantity : parseFloat(updatedItem.quantity as string) || 0
          const unitPrice = typeof updatedItem.unitPrice === 'number' ? updatedItem.unitPrice : parseFloat(updatedItem.unitPrice as string) || 0
          const discountPercent = typeof updatedItem.discountPercent === 'number' ? updatedItem.discountPercent : parseFloat(updatedItem.discountPercent as string) || 0
          
          const lineSubtotal = quantity * unitPrice
          const discountAmount = lineSubtotal * (discountPercent / 100)
          updatedItem.total = lineSubtotal - discountAmount
        }
        
        return updatedItem
      }
      return item
    }))
  }

  const addLineItem = () => {
    setLineItems(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        lineNumber: prev.length + 1,
        description: '',
        quantity: 1,
        unit: 'piece',
        unitPrice: 0,
        discountPercent: 0,
        taxRate: 0,
        total: 0
      }
    ])
  }

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(prev => {
        const filtered = prev.filter(item => item.id !== id)
        // Renumber line numbers
        return filtered.map((item, index) => ({ ...item, lineNumber: index + 1 }))
      })
    }
  }

  const validateForm = () => {
    if (!formData.vendorId) {
      setError('Please select a vendor')
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
      if (item.quantity <= 0) {
        setError('Quantity must be greater than 0')
        return false
      }
      if (item.unitPrice <= 0) {
        setError('Unit price must be greater than 0')
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
      const invoiceData = {
        vendorId: formData.vendorId,
        projectId: formData.projectId || null,
        purchaseOrderId: formData.purchaseOrderId || null,
        reference: formData.reference || null,
        type: formData.type,
        status: formData.status,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate || null,
        paymentTerms: formData.paymentTerms || null,
        subtotal: formData.subtotal,
        taxAmount: formData.taxAmount,
        taxRate: formData.taxRate || null,
        discount: formData.discount,
        discountType: formData.discountType,
        shippingCost: formData.shippingCost,
        total: formData.total,
        currency: formData.currency,
        notes: formData.notes || null,
        lineItems: lineItems.map(item => ({
          lineNumber: item.lineNumber,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent,
          discountAmount: item.discountPercent > 0 ? (item.quantity * item.unitPrice) * (item.discountPercent / 100) : 0,
          taxRate: item.taxRate,
          taxAmount: item.taxRate > 0 ? (item.total) * (item.taxRate / 100) : 0,
          total: item.total
        }))
      }

      const response = await api.createInvoice(invoiceData)
      
      if (response.success) {
        router.push(`/invoices/${response.data.id}`)
      } else {
        setError(response.error || 'Failed to create invoice')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create invoice')
    } finally {
      setSaving(false)
    }
  }

  if (loadingData) {
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
      <div className="mb-6">
        <div className="flex items-center space-x-3 text-sm text-gray-500 mb-4">
          <Link href="/invoices" className="hover:text-blue-600">
            Invoices
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">New Invoice</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/invoices"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Invoice</h1>
              <p className="text-sm text-gray-500 mt-1">Create an invoice from a purchase order or manually</p>
            </div>
          </div>
          <Link
            href="/invoices"
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
            {/* Vendor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <select
                  name="vendorId"
                  value={formData.vendorId}
                  onChange={(e) => handleVendorChange(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                >
                  <option value="">Select a vendor...</option>
                  {vendors.map(vendor => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Purchase Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Order (Optional)
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <select
                  name="purchaseOrderId"
                  value={formData.purchaseOrderId}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">No Purchase Order</option>
                  {purchaseOrders
                    .filter(po => !formData.vendorId || po.vendorId === formData.vendorId)
                    .map(po => (
                      <option key={po.id} value={po.id}>
                        {po.poNumber} - {po.title}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Project */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project (Optional)
              </label>
              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="">No Project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.projectNumber} - {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="service">Service</option>
                  <option value="product">Product</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="sent">Sent</option>
                </select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    name="issueDate"
                    value={formData.issueDate}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Terms
                </label>
                <input
                  type="text"
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-900"
                  placeholder="Net 30"
                />
              </div>
            </div>

            {/* Reference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference Number
              </label>
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-900"
                placeholder="Customer PO #, Contract #, etc."
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Line Items</h2>
            <button
              type="button"
              onClick={addLineItem}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <Plus size={16} />
              <span>Add Item</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Discount %</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase"></th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.lineNumber}</td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-900"
                        placeholder="Item description"
                        required
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right focus:ring-1 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-900"
                        min="0.01"
                        step="0.01"
                        placeholder="0.00"
                        required
                      />
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={item.unit}
                        onChange={(e) => handleLineItemChange(item.id, 'unit', e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      >
                        <option value="piece">pc</option>
                        <option value="hour">hr</option>
                        <option value="day">day</option>
                        <option value="month">mo</option>
                        <option value="kg">kg</option>
                        <option value="liter">L</option>
                        <option value="meter">m</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                          <span className="text-gray-500 text-xs">$</span>
                        </div>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleLineItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-24 pl-5 pr-2 py-1 border border-gray-300 rounded text-sm text-right focus:ring-1 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-900"
                          min="0.01"
                          step="0.01"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={item.discountPercent}
                        onChange={(e) => handleLineItemChange(item.id, 'discountPercent', parseFloat(e.target.value) || 0)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-right focus:ring-1 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-900"
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                      ${item.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLineItem(item.id)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
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
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none placeholder:text-gray-900"
                  placeholder="Additional notes or terms..."
                />
              </div>
            </div>
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-900">
                  {formData.currency} {formData.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount:</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right focus:ring-1 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-900"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleChange}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax Rate:</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    name="taxRate"
                    value={formData.taxRate}
                    onChange={handleChange}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right focus:ring-1 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-900"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="0"
                  />
                  <span className="text-gray-500">%</span>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax Amount:</span>
                <span className="font-medium text-gray-900">
                  {formData.currency} {formData.taxAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping:</span>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-xs">$</span>
                  </div>
                  <input
                    type="number"
                    name="shippingCost"
                    value={formData.shippingCost}
                    onChange={handleChange}
                    className="w-24 pl-5 pr-2 py-1 border border-gray-300 rounded text-sm text-right focus:ring-1 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-900"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-base font-semibold text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formData.currency} {formData.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <Link
            href="/invoices"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{saving ? 'Creating...' : 'Create Invoice'}</span>
          </button>
        </div>
      </form>
    </MainLayout>
  )
}