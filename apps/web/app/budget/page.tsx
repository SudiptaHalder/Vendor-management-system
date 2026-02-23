'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  BarChart3,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  PieChart,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  FolderOpen
} from 'lucide-react'
import Link from 'next/link'

interface BudgetSummary {
  fiscalYear: number
  totalPlanned: number
  totalActual: number
  totalCommitted: number
  totalVariance: number
  variancePercentage: number
  byCategory: Record<string, {
    planned: number
    actual: number
    committed: number
    variance: number
  }>
}

interface BudgetItem {
  id: string
  fiscalYear: number
  category: string
  description: string
  plannedAmount: number
  actualAmount: number
  committedAmount: number
  variance: number | null
  variancePercent: number | null
  currency: string
  periodStart: string
  periodEnd: string
  status: string
  projectId: string | null
  project?: {
    id: string
    name: string
    projectNumber: string
  } | null
}

export default function BudgetPage() {
  const [summary, setSummary] = useState<BudgetSummary | null>(null)
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [view, setView] = useState<'overview' | 'details'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const fetchBudgetData = async () => {
    setLoading(true)
    setError('')
    try {
      // Fetch summary
      const summaryRes = await api.getBudgetSummary(selectedYear)
      if (summaryRes.success) {
        setSummary(summaryRes.data)
      } else {
        console.error('Failed to fetch budget summary:', summaryRes.error)
      }

      // Fetch budget items
      const itemsRes = await api.getBudgetItems({ fiscalYear: selectedYear })
      if (itemsRes.success) {
        setBudgetItems(itemsRes.data || [])
      } else {
        console.error('Failed to fetch budget items:', itemsRes.error)
      }
    } catch (err) {
      console.error('Error fetching budget data:', err)
      setError('Failed to load budget data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBudgetData()
  }, [selectedYear])

  const handleDeleteBudgetItem = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this budget item?')) {
      return
    }

    try {
      const response = await api.deleteBudgetItem(id)
      if (response.success) {
        setBudgetItems(budgetItems.filter(item => item.id !== id))
        // Refresh summary
        fetchBudgetData()
      }
    } catch (err) {
      alert('Failed to delete budget item')
    }
  }

  const getAvailableYears = () => {
    const years = [2024, 2025, 2026, 2027, 2028]
    const existingYears = budgetItems.map(item => item.fiscalYear)
    return [...new Set([...years, ...existingYears])].sort((a, b) => b - a)
  }

  const getUniqueCategories = () => {
    const categories = budgetItems.map(item => item.category)
    return ['all', ...new Set(categories)]
  }

  const filteredBudgetItems = budgetItems.filter(item => {
    const matchesSearch = 
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.project?.projectNumber?.toLowerCase().includes(searchTerm.toLowerCase() || '')
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    
    return matchesSearch && matchesCategory
  })

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800'
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || colors.draft}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget</h1>
          <p className="text-gray-600 mt-1">Plan and track your financial budget</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setView('overview')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                view === 'overview' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setView('details')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                view === 'details' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Details
            </button>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
          >
            {getAvailableYears().map(year => (
              <option key={year} value={year}>Fiscal Year {year}</option>
            ))}
          </select>
          <button
            onClick={fetchBudgetData}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <Link
            href="/budget/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Add Budget Item</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center space-x-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {view === 'overview' ? (
        <>
          {!summary || summary.totalPlanned === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No budget data for {selectedYear}</h3>
              <p className="text-gray-500 mb-6">Add your first budget item to start planning.</p>
              <Link
                href="/budget/new"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
              >
                <Plus size={18} />
                <span>Add Budget Item</span>
              </Link>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Budget</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {formatCurrency(summary.totalPlanned)}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Fiscal Year {selectedYear}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Actual Spent</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {formatCurrency(summary.totalActual)}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <TrendingDown className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {summary.totalPlanned > 0 
                      ? ((summary.totalActual / summary.totalPlanned) * 100).toFixed(1) 
                      : '0'}% of budget
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Committed</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {formatCurrency(summary.totalCommitted)}
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Pending / Approved not yet paid
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Remaining</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {formatCurrency(summary.totalPlanned - summary.totalActual)}
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {summary.totalPlanned > 0 
                      ? ((summary.totalPlanned - summary.totalActual) / summary.totalPlanned * 100).toFixed(1) 
                      : '0'}% remaining
                  </p>
                </div>
              </div>

              {/* Budget Health */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 lg:col-span-2">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Overview</h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Budget Utilization</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(summary.totalActual)} / {formatCurrency(summary.totalPlanned)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${Math.min((summary.totalActual / summary.totalPlanned) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* On Track / Over Budget Cards - FIXED with null checks */}
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-xs text-green-600 font-medium">On Track</p>
                        <p className="text-lg font-bold text-green-700 mt-1">
                          {summary?.byCategory 
                            ? Object.values(summary.byCategory).filter(c => (c.variance || 0) >= 0).length 
                            : 0}
                        </p>
                        <p className="text-xs text-green-600">categories</p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-xs text-red-600 font-medium">Over Budget</p>
                        <p className="text-lg font-bold text-red-700 mt-1">
                          {summary?.byCategory 
                            ? Object.values(summary.byCategory).filter(c => (c.variance || 0) < 0).length 
                            : 0}
                        </p>
                        <p className="text-xs text-red-600">categories</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Total Categories</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {summary?.byCategory ? Object.keys(summary.byCategory).length : 0}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Budget Variance</dt>
                      <dd className={`text-sm font-medium ${
                        (summary.totalVariance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(summary.totalVariance || 0)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Variance %</dt>
                      <dd className={`text-sm font-medium ${
                        (summary.variancePercentage || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {(summary.variancePercentage || 0).toFixed(1)}%
                      </dd>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <dt className="text-sm font-medium text-gray-700">Budget Items</dt>
                      <dd className="text-sm font-medium text-gray-900">{budgetItems.length}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Category Breakdown - FIXED with null checks */}
              {summary?.byCategory && Object.keys(summary.byCategory).length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                  <div className="px-6 py-4 border-b bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900">Budget by Category</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Budget</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actual</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Committed</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Variance</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Utilization</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {Object.entries(summary.byCategory).map(([category, data]) => (
                          <tr key={category} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900 capitalize">
                                {category}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className="text-sm text-gray-900">
                                {formatCurrency(data.planned || 0)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className="text-sm text-gray-900">
                                {formatCurrency(data.actual || 0)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className="text-sm text-gray-900">
                                {formatCurrency(data.committed || 0)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className={`text-sm font-medium ${
                                (data.variance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {formatCurrency(data.variance || 0)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <span className="text-sm text-gray-600">
                                  {data.planned > 0 ? ((data.actual / data.planned) * 100).toFixed(1) : '0'}%
                                </span>
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      data.planned > 0 && (data.actual / data.planned) > 1 ? 'bg-red-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${Math.min(data.planned > 0 ? (data.actual / data.planned) * 100 : 0, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center mb-6">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No budget categories found for {selectedYear}</p>
                  <Link
                    href="/budget/new"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center space-x-1 mt-2"
                  >
                    <Plus size={14} />
                    <span>Add your first budget item</span>
                  </Link>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        /* ============ DETAILS VIEW ============ */
        <>
          {/* Filters for Details View */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by category, description, project..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
                />
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
                >
                  {getUniqueCategories().map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
                <button className="p-2 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Filter size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Budget Items Table */}
          {budgetItems.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No budget items yet</h3>
              <p className="text-gray-500 mb-6">Add your first budget item to start planning.</p>
              <Link
                href="/budget/new"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
              >
                <Plus size={18} />
                <span>Add Budget Item</span>
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Budget</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actual</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Variance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredBudgetItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{item.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.project ? (
                            <Link
                              href={`/projects/${item.project.id}`}
                              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                            >
                              <FolderOpen size={14} className="mr-1" />
                              {item.project.projectNumber}
                            </Link>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(item.plannedAmount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm text-gray-900">
                            {formatCurrency(item.actualAmount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`text-sm font-medium ${
                            (item.variance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(item.variance || 0)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs text-gray-500">
                            {new Date(item.periodStart).toLocaleDateString()} - 
                            {new Date(item.periodEnd).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              href={`/budget/${item.id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                              <Eye size={16} />
                            </Link>
                            <Link
                              href={`/budget/${item.id}/edit`}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                              <Edit size={16} />
                            </Link>
                            <button
                              onClick={(e) => handleDeleteBudgetItem(item.id, e)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </MainLayout>
  )
}