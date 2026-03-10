'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import {
  Building2,
  Users,
  FileText,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  LogOut,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    if (!token || !userStr) {
      window.location.href = '/'
      return
    }

    try {
      const userData = JSON.parse(userStr)
      if (userData.type === 'vendor') {
        window.location.href = '/vendor/dashboard'
        return
      }
      setUser(userData)
    } catch (err) {
      window.location.href = '/'
    } finally {
      setLoading(false)
    }
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    sessionStorage.clear()
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    })
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const stats = {
    totalVendors: 45,
    activeVendors: 32,
    pendingApprovals: 8,
    totalSpent: 284500,
    pendingPayments: 45200,
    overdueInvoices: 12300,
    activeContracts: 23,
    expiringContracts: 4
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with Logout */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name || 'Admin'}! 👋
          </h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your vendors today.</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Vendors</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalVendors}</p>
              <p className="text-sm text-green-600 mt-2 flex items-center">
                <ArrowUpRight size={16} className="mr-1" />
                +12% from last month
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Vendors</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeVendors}</p>
              <p className="text-sm text-green-600 mt-2 flex items-center">
                <CheckCircle size={16} className="mr-1" />
                {stats.activeVendors} currently active
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingApprovals}</p>
              <p className="text-sm text-yellow-600 mt-2 flex items-center">
                <Clock size={16} className="mr-1" />
                Awaiting review
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Spent</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">${stats.totalSpent.toLocaleString()}</p>
              <p className="text-sm text-red-600 mt-2 flex items-center">
                <ArrowDownRight size={16} className="mr-1" />
                -5% from last month
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Pending Payments</p>
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              Due soon
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">${stats.pendingPayments.toLocaleString()}</p>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">65% of monthly budget</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Overdue Invoices</p>
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
              Critical
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">${stats.overdueInvoices.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-3">3 invoices overdue</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Active Contracts</p>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              {stats.activeContracts} total
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.activeContracts}</p>
          <p className="text-xs text-orange-600 mt-3">
            {stats.expiringContracts} contracts expiring in 30 days
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">This Month</p>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              vs last month
            </span>
          </div>
          <div className="flex items-baseline">
            <p className="text-2xl font-bold text-gray-900">$45,200</p>
            <p className="text-sm text-green-600 ml-2">+8%</p>
          </div>
          <p className="text-xs text-gray-500 mt-3">Projected: $52,000</p>
        </div>
      </div>
    </div>
  )
}
