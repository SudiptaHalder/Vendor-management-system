'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  Users,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  PieChart
} from 'lucide-react'
import Link from 'next/link'

interface VendorReportData {
  summary: {
    totalVendors: number
    activeVendors: number
    pendingVendors: number
    totalContracts: number
    totalPOs: number
    averageRating: number
  }
  vendors: Array<{
    id: string
    name: string
    status: string
    category: string
    rating: number
    contracts: number
    purchaseOrders: number
    quotes: number
  }>
  filters: any
}

export default function VendorReportsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reportData, setReportData] = useState<VendorReportData | null>(null)
  const [dateRange, setDateRange] = useState('last30days')
  const [status, setStatus] = useState('all')

  const generateReport = async () => {
    setLoading(true)
    setError('')
    try {
      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      
      switch (dateRange) {
        case 'last7days':
          startDate.setDate(startDate.getDate() - 7)
          break
        case 'last30days':
          startDate.setDate(startDate.getDate() - 30)
          break
        case 'last90days':
          startDate.setDate(startDate.getDate() - 90)
          break
        case 'thisYear':
          startDate.setMonth(0, 1)
          break
        case 'lastYear':
          startDate.setFullYear(startDate.getFullYear() - 1, 0, 1)
          endDate.setFullYear(endDate.getFullYear() - 1, 11, 31)
          break
      }

      // In a real app, you would call an API endpoint
      // For now, we'll simulate with the existing getVendors
      const response = await api.getVendors()
      
      if (response.success) {
        const vendors = response.data
        
        // Filter by status if needed
        const filteredVendors = status === 'all' 
          ? vendors 
          : vendors.filter((v: any) => v.status === status)

        // Calculate summary
        const summary = {
          totalVendors: filteredVendors.length,
          activeVendors: filteredVendors.filter((v: any) => v.status === 'active').length,
          pendingVendors: filteredVendors.filter((v: any) => v.status === 'pending').length,
          totalContracts: filteredVendors.reduce((sum: number, v: any) => sum + (v._count?.contracts || 0), 0),
          totalPOs: filteredVendors.reduce((sum: number, v: any) => sum + (v._count?.purchaseOrders || 0), 0),
          averageRating: filteredVendors.reduce((sum: number, v: any) => sum + (v.rating || 0), 0) / filteredVendors.length || 0
        }

        // Format vendor list
        const vendorList = filteredVendors.map((v: any) => ({
          id: v.id,
          name: v.name,
          status: v.status,
          category: v.category?.name || 'Uncategorized',
          rating: v.rating || 0,
          contracts: v._count?.contracts || 0,
          purchaseOrders: v._count?.purchaseOrders || 0,
          quotes: v._count?.quotes || 0
        }))

        setReportData({
          summary,
          vendors: vendorList,
          filters: { dateRange, status }
        })
      }
    } catch (err) {
      console.error('Error generating report:', err)
      setError('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    generateReport()
  }, [dateRange, status])

  const handleExport = (format: 'pdf' | 'csv' | 'excel') => {
    // In a real app, this would call an export API
    alert(`Exporting as ${format.toUpperCase()}...`)
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
      <div className="mb-6">
        <div className="flex items-center space-x-3 text-sm text-gray-500 mb-4">
          <Link href="/reports" className="hover:text-blue-600">
            Reports
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Vendor Reports</span>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vendor Reports</h1>
            <p className="text-gray-600 mt-1">Analyze vendor performance, status, and metrics</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => handleExport('pdf')}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md flex items-center space-x-1"
              >
                <Download size={14} />
                <span>PDF</span>
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md flex items-center space-x-1"
              >
                <Download size={14} />
                <span>CSV</span>
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md flex items-center space-x-1"
              >
                <Download size={14} />
                <span>Excel</span>
              </button>
            </div>
            <button
              onClick={generateReport}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center space-x-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center space-x-2">
            <Calendar size={16} className="text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
            >
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="last90days">Last 90 Days</option>
              <option value="thisYear">This Year</option>
              <option value="lastYear">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {reportData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Vendors</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{reportData.summary.totalVendors}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{reportData.summary.activeVendors}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">{reportData.summary.pendingVendors}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Contracts</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{reportData.summary.totalContracts}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Purchase Orders</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{reportData.summary.totalPOs}</p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{reportData.summary.averageRating.toFixed(1)}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Vendor Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Vendor Details</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Contracts</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">POs</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quotes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.vendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">{vendor.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{vendor.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          vendor.status === 'active' ? 'bg-green-100 text-green-800' :
                          vendor.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {vendor.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900 mr-2">{vendor.rating}</span>
                          {vendor.rating >= 4 ? (
                            <TrendingUp size={14} className="text-green-500" />
                          ) : vendor.rating >= 3 ? (
                            <TrendingUp size={14} className="text-yellow-500" />
                          ) : (
                            <TrendingDown size={14} className="text-red-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-gray-900">{vendor.contracts}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-gray-900">{vendor.purchaseOrders}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-gray-900">{vendor.quotes}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </MainLayout>
  )
}