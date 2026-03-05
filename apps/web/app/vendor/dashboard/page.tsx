'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import VendorLayout from '@/components/vendor/VendorLayout'
import { api } from '@/lib/api'
import {
  DollarSign,
  FileText,
  ShoppingCart,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  TrendingUp,
  Calendar,
  User  // ✅ Added missing import
} from 'lucide-react'
import Link from 'next/link'

export default function VendorDashboardPage() {
  const router = useRouter()
  const [vendor, setVendor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    totalEarned: 0,
    pendingAmount: 0,
    totalOrders: 0
  })
  const [recentInvoices, setRecentInvoices] = useState<any[]>([])

  useEffect(() => {
    // Check vendor auth
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    if (!token || !userStr) {
      router.push('/login')
      return
    }

    try {
      const userData = JSON.parse(userStr)
      if (userData.type !== 'vendor') {
        router.push('/dashboard')
        return
      }
      setVendor(userData)
      fetchVendorData()
    } catch (err) {
      router.push('/login')
    }
  }, [router])

  const fetchVendorData = async () => {
    setLoading(true)
    try {
      // In production, fetch real data from API
      // For now, using mock data
      setStats({
        totalInvoices: 24,
        paidInvoices: 16,
        pendingInvoices: 8,
        totalEarned: 45200,
        pendingAmount: 12800,
        totalOrders: 12
      })

      setRecentInvoices([
        { id: 'INV-001', number: 'INV-2024-001', amount: 2500, status: 'paid', date: '2024-02-15' },
        { id: 'INV-002', number: 'INV-2024-002', amount: 1800, status: 'pending', date: '2024-03-01' },
        { id: 'INV-003', number: 'INV-2024-003', amount: 3200, status: 'pending', date: '2024-03-05' },
        { id: 'INV-004', number: 'INV-2024-004', amount: 1500, status: 'paid', date: '2024-02-28' },
        { id: 'INV-005', number: 'INV-2024-005', amount: 2800, status: 'paid', date: '2024-02-20' }
      ])
    } catch (err) {
      console.error('Error fetching vendor data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </VendorLayout>
    )
  }

  return (
    <VendorLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {vendor?.name}! 👋
        </h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your account today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Earned</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${stats.totalEarned.toLocaleString()}
              </p>
              <p className="text-xs text-green-600 mt-2 flex items-center">
                <TrendingUp size={14} className="mr-1" />
                +12% from last month
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Amount</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                ${stats.pendingAmount.toLocaleString()}
              </p>
              <p className="text-xs text-yellow-600 mt-2 flex items-center">
                <Clock size={14} className="mr-1" />
                {stats.pendingInvoices} invoices pending
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
              <p className="text-xs text-blue-600 mt-2 flex items-center">
                <ShoppingCart size={14} className="mr-1" />
                {stats.totalInvoices} invoices
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => router.push('/vendor/invoices/new')}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition flex flex-col items-center text-center group"
        >
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-200 transition">
            <FileText className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Submit Invoice</h3>
          <p className="text-sm text-gray-500 mt-1">Upload a new invoice</p>
        </button>

        <button
          onClick={() => router.push('/vendor/invoices')}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition flex flex-col items-center text-center group"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-200 transition">
            <Eye className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">View Invoices</h3>
          <p className="text-sm text-gray-500 mt-1">Check invoice status</p>
        </button>

        <button
          onClick={() => router.push('/vendor/profile')}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition flex flex-col items-center text-center group"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-200 transition">
            <User className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Update Profile</h3>
          <p className="text-sm text-gray-500 mt-1">Edit company information</p>
        </button>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
          <Link href="/vendor/invoices" className="text-sm text-green-600 hover:text-green-800">
            View All
          </Link>
        </div>
        <div className="divide-y divide-gray-200">
          {recentInvoices.slice(0, 4).map((invoice) => (
            <div key={invoice.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{invoice.number}</p>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Calendar size={12} className="mr-1" />
                    {invoice.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  invoice.status === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {invoice.status}
                </span>
                <span className="font-medium text-gray-900">${invoice.amount.toLocaleString()}</span>
                <button className="text-gray-400 hover:text-gray-600">
                  <Eye size={16} />
                </button>
                <button className="text-gray-400 hover:text-gray-600">
                  <Download size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Summary */}
      <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-3">Payment Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-green-700">Total Paid</p>
            <p className="text-xl font-bold text-green-900">
              ${(stats.totalEarned - stats.pendingAmount).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-green-700">Pending</p>
            <p className="text-xl font-bold text-yellow-600">
              ${stats.pendingAmount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-green-700">Next Payment</p>
            <p className="text-xl font-bold text-green-900">Mar 15, 2024</p>
          </div>
        </div>
      </div>
    </VendorLayout>
  )
}
