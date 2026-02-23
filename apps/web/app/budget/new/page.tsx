'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  ArrowLeft,
  BarChart3,
  Save,
  X,
  AlertCircle,
  Calendar,
  DollarSign,
  FolderOpen,
  Tag,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

interface Project {
  id: string
  projectNumber: string
  name: string
}

export default function NewBudgetItemPage() {
  const router = useRouter()
  
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)

  const [formData, setFormData] = useState({
    fiscalYear: new Date().getFullYear(),
    category: '',
    description: '',
    plannedAmount: '',
    currency: 'USD',
    periodStart: `${new Date().getFullYear()}-01-01`,
    periodEnd: `${new Date().getFullYear()}-12-31`,
    status: 'active',
    projectId: ''
  })

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setLoadingProjects(true)
    try {
      const response = await api.getProjects()
      if (response.success) {
        setProjects(response.data)
      }
    } catch (err) {
      console.error('Error fetching projects:', err)
    } finally {
      setLoadingProjects(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.category) {
      setError('Category is required')
      return false
    }
    if (!formData.description.trim()) {
      setError('Description is required')
      return false
    }
    if (!formData.plannedAmount || parseFloat(formData.plannedAmount) <= 0) {
      setError('Please enter a valid budget amount')
      return false
    }
    if (!formData.periodStart) {
      setError('Period start date is required')
      return false
    }
    if (!formData.periodEnd) {
      setError('Period end date is required')
      return false
    }
    if (new Date(formData.periodStart) > new Date(formData.periodEnd)) {
      setError('Period end date must be after start date')
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
      const budgetData = {
        fiscalYear: parseInt(formData.fiscalYear.toString()),
        category: formData.category,
        description: formData.description,
        plannedAmount: parseFloat(formData.plannedAmount),
        currency: formData.currency,
        periodStart: formData.periodStart,
        periodEnd: formData.periodEnd,
        status: formData.status,
        projectId: formData.projectId || null
      }

      const response = await api.createBudgetItem(budgetData)
      
      if (response.success) {
        router.push(`/budget?year=${formData.fiscalYear}`)
      } else {
        setError(response.error || 'Failed to create budget item')
      }
    } catch (err: any) {
      console.error('Error creating budget item:', err)
      setError(err.message || 'Failed to create budget item')
    } finally {
      setSaving(false)
    }
  }

  const budgetCategories = [
    'Salaries & Wages',
    'Benefits',
    'Training & Development',
    'Travel',
    'Office Supplies',
    'Equipment',
    'Software & Licenses',
    'Hardware',
    'Marketing',
    'Professional Services',
    'Consulting',
    'Legal',
    'Accounting',
    'Rent',
    'Utilities',
    'Maintenance',
    'Insurance',
    'Taxes',
    'Research & Development',
    'Other'
  ]

  if (loadingProjects) {
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
          <Link href="/budget" className="hover:text-blue-600">
            Budget
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">New Budget Item</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/budget"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add Budget Item</h1>
              <p className="text-sm text-gray-500 mt-1">Create a new budget line item</p>
            </div>
          </div>
          <Link
            href="/budget"
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Item Details</h2>
          <div className="space-y-4">
            {/* Fiscal Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fiscal Year <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <select
                  name="fiscalYear"
                  value={formData.fiscalYear}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                >
                  <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                  <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
                  <option value={new Date().getFullYear() + 2}>{new Date().getFullYear() + 2}</option>
                  <option value={new Date().getFullYear() + 3}>{new Date().getFullYear() + 3}</option>
                </select>
              </div>
            </div>

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
                  <option value="">Select a category...</option>
                  {budgetCategories.map(category => (
                    <option key={category} value={category}>
                      {category}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
                placeholder="Describe what this budget is for..."
                required
              />
            </div>

            {/* Budget Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  name="plannedAmount"
                  value={formData.plannedAmount}
                  onChange={handleChange}
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>
            </div>

            {/* Currency */}
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
              </select>
            </div>
          </div>
        </div>

        {/* Budget Period */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Period</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Period Start <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  name="periodStart"
                  value={formData.periodStart}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Period End <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  name="periodEnd"
                  value={formData.periodEnd}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Project Association */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Association (Optional)</h2>
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
                <option value="">No Project (General Budget)</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.projectNumber} - {project.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Associate this budget with a specific project if applicable
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
          <div>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <Link
            href="/budget"
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
            <span>{saving ? 'Creating...' : 'Create Budget Item'}</span>
          </button>
        </div>
      </form>
    </MainLayout>
  )
}