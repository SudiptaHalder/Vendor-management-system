'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  FolderOpen,
  FileText,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
  Calendar
} from 'lucide-react'
import Link from 'next/link'

interface AnalyticsData {
  vendors: {
    total: number
    active: number
    pending: number
    newThisMonth: number
  }
  procurement: {
    totalPOs: number
    totalRFQs: number
    totalQuotes: number
    totalContracts: number
    pendingApprovals: number
  }
  projects: {
    total: number
    active: number
    completed: number
    onHold: number
  }
  financial: {
    totalInvoiced: number
    totalPaid: number
    outstanding: number
    monthlyRevenue: number
    monthlyExpenses: number
  }
  recentActivity: Array<{
    id: string
    type: string
    description: string
    timestamp: string
    status: string
  }>
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [dateRange, setDateRange] = useState('thisMonth')

  const fetchAnalytics = async () => {
    setLoading(true)
    setError('')
    try {
      // Fetch all data in parallel
      const [vendorsRes, projectsRes, invoicesRes, paymentsRes, expensesRes, posRes, rfqsRes, contractsRes] = await Promise.all([
        api.getVendors(),
        api.getProjects(),
        api.getInvoices(),
        api.getPayments(),
        api.getExpenses(),
        api.getPurchaseOrders(),
        api.getRFQs(),
        api.getContracts()
      ])

      // Calculate vendor metrics
      const vendors = vendorsRes.success ? vendorsRes.data : []
      const activeVendors = vendors.filter((v: any) => v.status === 'active').length
      const pendingVendors = vendors.filter((v: any) => v.status === 'pending').length
      
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      const newVendorsThisMonth = vendors.filter((v: any) => new Date(v.createdAt) > oneMonthAgo).length

      // Calculate project metrics
      const projects = projectsRes.success ? projectsRes.data : []
      const activeProjects = projects.filter((p: any) => p.status === 'active').length
      const completedProjects = projects.filter((p: any) => p.status === 'completed').length
      const onHoldProjects = projects.filter((p: any) => p.status === 'on_hold').length

      // Calculate financial metrics
      const invoices = invoicesRes.success ? invoicesRes.data : []
      const payments = paymentsRes.success ? paymentsRes.data : []
      const expenses = expensesRes.success ? expensesRes.data : []

      const totalInvoiced = invoices.reduce((sum: number, inv: any) => sum + Number(inv.total), 0)
      const totalPaid = payments.reduce((sum: number, p: any) => sum + (p.status === 'completed' ? Number(p.amount) : 0), 0)
      const outstanding = totalInvoiced - totalPaid

      // Calculate monthly figures
      const thisMonth = new Date().getMonth()
      const thisYear = new Date().getFullYear()
      
      const monthlyInvoices = invoices.filter((inv: any) => {
        const date = new Date(inv.createdAt)
        return date.getMonth() === thisMonth && date.getFullYear() === thisYear
      })
      const monthlyRevenue = monthlyInvoices.reduce((sum: number, inv: any) => sum + Number(inv.total), 0)

      const monthlyExpensesList = expenses.filter((exp: any) => {
        const date = new Date(exp.createdAt)
        return date.getMonth() === thisMonth && date.getFullYear() === thisYear
      })
      const monthlyExpenses = monthlyExpensesList.reduce((sum: number, exp: any) => sum + Number(exp.amount), 0)

      // Calculate procurement metrics
      const pos = posRes.success ? posRes.data : []
      const rfqs = rfqsRes.success ? rfqsRes.data : []
      const contracts = contractsRes.success ? contractsRes.data : []

      // Generate recent activity
      const recentActivity = [
        ...vendors.slice(0, 3).map((v: any) => ({
          id: v.id,
          type: 'vendor',
          description: `New vendor: ${v.name}`,
          timestamp: v.createdAt,
          status: v.status
        })),
        ...projects.slice(0, 3).map((p: any) => ({
          id: p.id,
          type: 'project',
          description: `Project ${p.status}: ${p.name}`,
          timestamp: p.updatedAt,
          status: p.status
        })),
        ...invoices.slice(0, 3).map((i: any) => ({
          id: i.id,
          type: 'invoice',
          description: `Invoice ${i.invoiceNumber} - ${i.vendor?.name}`,
          timestamp: i.createdAt,
          status: i.status
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5)

      setData({
        vendors: {
          total: vendors.length,
          active: activeVendors,
          pending: pendingVendors,
          newThisMonth: newVendorsThisMonth
        },
        procurement: {
          totalPOs: pos.length,
          totalRFQs: rfqs.length,
          totalQuotes: 0, // Would need quotes API
          totalContracts: contracts.length,
          pendingApprovals: vendors.filter((v: any) => v.status === 'pending').length
        },
        projects: {
          total: projects.length,
          active: activeProjects,
          completed: completedProjects,
          onHold: onHoldProjects
        },
        financial: {
          totalInvoiced,
          totalPaid,
          outstanding,
          monthlyRevenue,
          monthlyExpenses
        },
        recentActivity
      })
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

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
          <span className="text-gray-900 font-medium">Analytics</span>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Real-time insights into your business performance</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setDateRange('thisMonth')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                  dateRange === 'thisMonth' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setDateRange('lastMonth')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                  dateRange === 'lastMonth' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Last Month
              </button>
              <button
                onClick={() => setDateRange('thisQuarter')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                  dateRange === 'thisQuarter' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                This Quarter
              </button>
            </div>
            <button
              onClick={fetchAnalytics}
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

      {data && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Vendors</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{data.vendors.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center mt-2 text-xs">
                <span className="text-green-600 font-medium">+{data.vendors.newThisMonth}</span>
                <span className="text-gray-500 ml-1">this month</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Projects</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{data.projects.active}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <FolderOpen className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="flex items-center mt-2 text-xs">
                <span className="text-gray-500">{data.projects.completed} completed</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    ${data.financial.monthlyRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="flex items-center mt-2 text-xs">
                <span className="text-gray-500">vs ${data.financial.monthlyExpenses.toLocaleString()} expenses</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Outstanding</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">
                    ${data.financial.outstanding.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <div className="flex items-center mt-2 text-xs">
                <span className="text-gray-500">of ${data.financial.totalInvoiced.toLocaleString()} total</span>
              </div>
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Vendor Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active</span>
                  <span className="text-sm font-medium text-green-600">{data.vendors.active}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="text-sm font-medium text-yellow-600">{data.vendors.pending}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Total</span>
                  <span className="text-sm font-bold text-gray-900">{data.vendors.total}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Project Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active</span>
                  <span className="text-sm font-medium text-green-600">{data.projects.active}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="text-sm font-medium text-blue-600">{data.projects.completed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">On Hold</span>
                  <span className="text-sm font-medium text-yellow-600">{data.projects.onHold}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Procurement Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Purchase Orders</span>
                  <span className="text-sm font-medium text-gray-900">{data.procurement.totalPOs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">RFQs</span>
                  <span className="text-sm font-medium text-gray-900">{data.procurement.totalRFQs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Contracts</span>
                  <span className="text-sm font-medium text-gray-900">{data.procurement.totalContracts}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {data.recentActivity.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'vendor' ? 'bg-blue-100' :
                        activity.type === 'project' ? 'bg-green-100' :
                        'bg-purple-100'
                      }`}>
                        {activity.type === 'vendor' && <Users size={16} className="text-blue-600" />}
                        {activity.type === 'project' && <FolderOpen size={16} className="text-green-600" />}
                        {activity.type === 'invoice' && <DollarSign size={16} className="text-purple-600" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      activity.status === 'active' ? 'bg-green-100 text-green-800' :
                      activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      activity.status === 'paid' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </MainLayout>
  )
}