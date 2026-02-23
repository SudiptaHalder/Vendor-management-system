'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  ArrowLeft,
  FileText,
  Save,
  X,
  AlertCircle,
  Building2,
  Calendar,
  DollarSign,
  FolderOpen,
  Tag,
  Receipt,
  Link2,
  Loader2,
  Upload
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

interface WorkOrder {
  id: string
  workOrderNumber: string
  title: string
}

export default function NewExpensePage() {
  const router = useRouter()
  
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const [formData, setFormData] = useState({
    category: 'office',
    description: '',
    amount: '',
    currency: 'USD',
    expenseDate: new Date().toISOString().split('T')[0],
    vendorId: '',
    projectId: '',
    workOrderId: '',
    receiptUrl: '',
    receiptNumber: '',
    isBillable: false,
    billableClient: '',
    status: 'pending',
    notes: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

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

      // Fetch work orders
      const workOrdersRes = await api.getWorkOrders()
      if (workOrdersRes.success) {
        setWorkOrders(workOrdersRes.data)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoadingData(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const validateForm = () => {
    if (!formData.category) {
      setError('Please select a category')
      return false
    }
    if (!formData.description.trim()) {
      setError('Description is required')
      return false
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount')
      return false
    }
    if (!formData.expenseDate) {
      setError('Expense date is required')
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
      const expenseData = {
        category: formData.category,
        description: formData.description,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        expenseDate: formData.expenseDate,
        vendorId: formData.vendorId || null,
        projectId: formData.projectId || null,
        workOrderId: formData.workOrderId || null,
        receiptUrl: formData.receiptUrl || null,
        receiptNumber: formData.receiptNumber || null,
        isBillable: formData.isBillable,
        billableClient: formData.billableClient || null,
        status: formData.status,
        notes: formData.notes || null
      }

      const response = await api.createExpense(expenseData)
      
      if (response.success) {
        router.push(`/expenses/${response.data.id}`)
      } else {
        setError(response.error || 'Failed to create expense')
      }
    } catch (err: any) {
      console.error('Error creating expense:', err)
      setError(err.message || 'Failed to create expense')
    } finally {
      setSaving(false)
    }
  }

  const categories = [
    { value: 'travel', label: 'Travel', icon: '✈️' },
    { value: 'meals', label: 'Meals & Entertainment', icon: '🍽️' },
    { value: 'office', label: 'Office Supplies', icon: '📎' },
    { value: 'equipment', label: 'Equipment', icon: '🖥️' },
    { value: 'supplies', label: 'Materials', icon: '📦' },
    { value: 'utilities', label: 'Utilities', icon: '💡' },
    { value: 'rent', label: 'Rent', icon: '🏢' },
    { value: 'maintenance', label: 'Maintenance', icon: '🔧' },
    { value: 'training', label: 'Training', icon: '📚' },
    { value: 'other', label: 'Other', icon: '📌' }
  ]

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
          <Link href="/expenses" className="hover:text-blue-600">
            Expenses
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">New Expense</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/expenses"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Expense</h1>
              <p className="text-sm text-gray-500 mt-1">Record a company expense</p>
            </div>
          </div>
          <Link
            href="/expenses"
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Expense Details</h2>
          <div className="space-y-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none placeholder:text-gray-500"
                placeholder="Describe the expense..."
                required
              />
            </div>

            {/* Amount and Currency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    required
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                </select>
              </div>
            </div>

            {/* Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expense Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    name="expenseDate"
                    value={formData.expenseDate}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>
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
                  <option value="pending">Pending</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Vendor & Project */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Vendor & Project</h2>
          <div className="space-y-4">
            {/* Vendor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <select
                  name="vendorId"
                  value={formData.vendorId}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">Select Vendor (Optional)</option>
                  {vendors.map(vendor => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Project */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project
              </label>
              <div className="relative">
                <FolderOpen className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">Select Project (Optional)</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.projectNumber} - {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Work Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Order
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <select
                  name="workOrderId"
                  value={formData.workOrderId}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">Select Work Order (Optional)</option>
                  {workOrders.map(wo => (
                    <option key={wo.id} value={wo.id}>
                      {wo.workOrderNumber} - {wo.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Billable Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Billable Information</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="isBillable"
                id="isBillable"
                checked={formData.isBillable}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isBillable" className="text-sm text-gray-700">
                This expense is billable to client
              </label>
            </div>

            {formData.isBillable && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Billable Client
                </label>
                <input
                  type="text"
                  name="billableClient"
                  value={formData.billableClient}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                  placeholder="Client name"
                />
              </div>
            )}
          </div>
        </div>

        {/* Receipt Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Receipt Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Receipt Number
                </label>
                <div className="relative">
                  <Receipt className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="receiptNumber"
                    value={formData.receiptNumber}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                    placeholder="Receipt #"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Receipt URL
                </label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    name="receiptUrl"
                    value={formData.receiptUrl}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-1 text-sm text-gray-600">
                    Drag and drop or click to upload receipt image
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, PDF up to 10MB
                  </p>
                  <button
                    type="button"
                    className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Upload Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h2>
          <div>
            <textarea
              name="notes"
              rows={4}
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none placeholder:text-gray-500"
              placeholder="Any additional notes or comments..."
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <Link
            href="/expenses"
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
            <span>{saving ? 'Creating...' : 'Create Expense'}</span>
          </button>
        </div>
      </form>
    </MainLayout>
  )
}