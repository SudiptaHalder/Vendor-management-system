'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  ArrowLeft,
  Database,
  Save,
  X,
  AlertCircle,
  Calendar,
  DollarSign,
  MapPin,
  Wrench,
  Tool,
  Truck,
  HardHat,
  Zap,
  Package,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

export default function NewResourcePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    type: 'equipment',
    category: '',
    description: '',
    status: 'available',
    location: '',
    model: '',
    serialNumber: '',
    capacity: '',
    lastMaintenance: '',
    nextMaintenance: '',
    maintenanceInterval: '',
    hourlyRate: '',
    dailyRate: '',
    purchaseCost: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Resource name is required')
      return false
    }
    if (!formData.type) {
      setError('Resource type is required')
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
      const resourceData = {
        name: formData.name,
        type: formData.type,
        category: formData.category || null,
        description: formData.description || null,
        status: formData.status,
        location: formData.location || null,
        model: formData.model || null,
        serialNumber: formData.serialNumber || null,
        capacity: formData.capacity || null,
        lastMaintenance: formData.lastMaintenance || null,
        nextMaintenance: formData.nextMaintenance || null,
        maintenanceInterval: formData.maintenanceInterval ? parseInt(formData.maintenanceInterval) : null,
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
        dailyRate: formData.dailyRate ? parseFloat(formData.dailyRate) : null,
        purchaseCost: formData.purchaseCost ? parseFloat(formData.purchaseCost) : null
      }

      const response = await api.createResource(resourceData)
      
      if (response.success) {
        router.push(`/resources/${response.data.id}`)
      } else {
        setError(response.error || 'Failed to create resource')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create resource')
    } finally {
      setSaving(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'equipment': return <Wrench className="w-5 h-5" />;
      case 'vehicle': return <Truck className="w-5 h-5" />;
      case 'tool': return <Tool className="w-5 h-5" />;
      case 'personnel': return <HardHat className="w-5 h-5" />;
      case 'machinery': return <Zap className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 text-sm text-gray-500 mb-4">
          <Link href="/resources" className="hover:text-blue-600">
            Resources
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">New Resource</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/resources"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Resource</h1>
              <p className="text-sm text-gray-500 mt-1">Add equipment, tools, vehicles or personnel</p>
            </div>
          </div>
          <Link
            href="/resources"
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
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resource Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="e.g., Excavator 3000, Laptop Dell XPS, Senior Engineer"
                required
              />
            </div>

            {/* Type and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resource Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {getTypeIcon(formData.type)}
                  </div>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required
                  >
                    <option value="equipment">Equipment</option>
                    <option value="vehicle">Vehicle</option>
                    <option value="tool">Tool</option>
                    <option value="personnel">Personnel</option>
                    <option value="machinery">Machinery</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="e.g., Heavy, Light, Power Tools"
                />
              </div>
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
                placeholder="Detailed description of the resource..."
              />
            </div>

            {/* Status and Location */}
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
                  <option value="available">Available</option>
                  <option value="in_use">In Use</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="damaged">Damaged</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="e.g., Warehouse A, Site B"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="e.g., CAT 320D, Dell XPS 15"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Serial Number
              </label>
              <input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Serial #"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity
              </label>
              <input
                type="text"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="e.g., 20 tons, 512GB, 5 people"
              />
            </div>
          </div>
        </div>

        {/* Maintenance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Maintenance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Maintenance
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  name="lastMaintenance"
                  value={formData.lastMaintenance}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Next Maintenance
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  name="nextMaintenance"
                  value={formData.nextMaintenance}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maintenance Interval (days)
              </label>
              <input
                type="number"
                name="maintenanceInterval"
                value={formData.maintenanceInterval}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="e.g., 90"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Cost Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cost Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hourly Rate
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Daily Rate
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  name="dailyRate"
                  value={formData.dailyRate}
                  onChange={handleChange}
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Cost
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  name="purchaseCost"
                  value={formData.purchaseCost}
                  onChange={handleChange}
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <Link
            href="/resources"
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
            <span>{saving ? 'Creating...' : 'Create Resource'}</span>
          </button>
        </div>
      </form>
    </MainLayout>
  )
}