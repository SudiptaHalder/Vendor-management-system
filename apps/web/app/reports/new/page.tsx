'use client'

import { useState } from 'react'
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
  Clock,
  FileText,
  Users,
  DollarSign,
  FolderOpen,
  PieChart,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

export default function NewReportPage() {
  const router = useRouter()
  
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'vendor',
    category: 'General',
    parameters: {},
    isScheduled: false,
    schedule: '',
    format: 'json',
    status: 'draft'
  })

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
    if (!formData.name.trim()) {
      setError('Report name is required')
      return false
    }
    if (!formData.type) {
      setError('Report type is required')
      return false
    }
    if (!formData.category) {
      setError('Category is required')
      return false
    }
    if (formData.isScheduled && !formData.schedule) {
      setError('Please enter a schedule expression')
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
      const reportData = {
        name: formData.name,
        description: formData.description || null,
        type: formData.type,
        category: formData.category,
        parameters: formData.parameters,
        isScheduled: formData.isScheduled,
        schedule: formData.schedule || null,
        format: formData.format,
        status: formData.status
      }

      const response = await api.createReport(reportData)
      
      if (response.success) {
        router.push(`/reports/${response.data.id}`)
      } else {
        setError(response.error || 'Failed to create report')
      }
    } catch (err: any) {
      console.error('Error creating report:', err)
      setError(err.message || 'Failed to create report')
    } finally {
      setSaving(false)
    }
  }

  const reportTypes = [
    { value: 'vendor', label: 'Vendor Report', icon: Users, description: 'Vendor performance, status, and metrics' },
    { value: 'procurement', label: 'Procurement Report', icon: FileText, description: 'Purchase orders, RFQs, quotes, and contracts' },
    { value: 'financial', label: 'Financial Report', icon: DollarSign, description: 'Invoices, payments, expenses, and budget' },
    { value: 'project', label: 'Project Report', icon: FolderOpen, description: 'Project status, tasks, and resources' },
    { value: 'custom', label: 'Custom Report', icon: PieChart, description: 'Build your own custom report' }
  ]

  const categories = [
    'General', 'Sales', 'Marketing', 'Operations', 'HR', 'Finance', 'Projects', 'Vendors', 'Custom'
  ]

  const scheduleOptions = [
    '0 0 * * *', // Daily at midnight
    '0 0 * * 1', // Weekly on Monday
    '0 0 1 * *', // Monthly on 1st
    '0 0 1 1 *', // Yearly on Jan 1
    '*/30 * * * *', // Every 30 minutes
    '0 */6 * * *' // Every 6 hours
  ]

  const formatOptions = ['json', 'pdf', 'csv', 'excel']

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 text-sm text-gray-500 mb-4">
          <Link href="/reports" className="hover:text-blue-600">
            Reports
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">New Report</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/reports"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Report</h1>
              <p className="text-sm text-gray-500 mt-1">Design a custom report with your preferred parameters</p>
            </div>
          </div>
          <Link
            href="/reports"
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
            {/* Report Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="e.g., Monthly Vendor Performance Report"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
                placeholder="What does this report show?"
              />
            </div>

            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Report Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <label
                      key={type.value}
                      className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                        formData.type === type.value
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="type"
                        value={type.value}
                        checked={formData.type === type.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          formData.type === type.value ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            formData.type === type.value ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            formData.type === type.value ? 'text-blue-700' : 'text-gray-900'
                          }`}>
                            {type.label}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Status and Format */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <option value="published">Published</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Export Format
                </label>
                <select
                  name="format"
                  value={formData.format}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  {formatOptions.map(format => (
                    <option key={format} value={format}>
                      {format.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Options */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900">Advanced Options</h2>
            <span className="text-blue-600 text-sm">{showAdvanced ? 'Hide' : 'Show'}</span>
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4">
              {/* Schedule */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="isScheduled"
                    id="isScheduled"
                    checked={formData.isScheduled}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isScheduled" className="text-sm text-gray-700">
                    Schedule this report to run automatically
                  </label>
                </div>

                {formData.isScheduled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Schedule Expression (Cron)
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          name="schedule"
                          value={formData.schedule}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          placeholder="0 0 * * *"
                        />
                      </div>
                      <select
                        value={formData.schedule}
                        onChange={(e) => setFormData(prev => ({ ...prev, schedule: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      >
                        <option value="">Presets</option>
                        <option value="0 0 * * *">Daily at midnight</option>
                        <option value="0 0 * * 1">Weekly on Monday</option>
                        <option value="0 0 1 * *">Monthly on 1st</option>
                        <option value="0 0 1 1 *">Yearly on Jan 1</option>
                        <option value="*/30 * * * *">Every 30 minutes</option>
                        <option value="0 */6 * * *">Every 6 hours</option>
                      </select>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Cron expression format: minute hour day month weekday
                    </p>
                  </div>
                )}
              </div>

              {/* Parameters JSON */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Parameters (JSON)
                </label>
                <textarea
                  name="parameters"
                  rows={4}
                  value={JSON.stringify(formData.parameters, null, 2)}
                  onChange={(e) => {
                    try {
                      const params = JSON.parse(e.target.value)
                      setFormData(prev => ({ ...prev, parameters: params }))
                    } catch {
                      // Invalid JSON, ignore
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-mono text-sm"
                  placeholder='{ "status": "active", "dateRange": "last30days" }'
                />
                <p className="text-xs text-gray-500 mt-1">
                  Default filter parameters for this report
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <Link
            href="/reports"
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
            <span>{saving ? 'Creating...' : 'Create Report'}</span>
          </button>
        </div>
      </form>
    </MainLayout>
  )
}