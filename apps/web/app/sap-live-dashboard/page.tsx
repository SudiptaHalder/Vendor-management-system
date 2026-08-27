'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { Building2, FileText, Package, RefreshCw, Database, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface DashboardData {
  totalVendors: number
  activeVendors: number
  pendingVendors: number
  syncedVendors: number
  totalPOs: number
  openPOs: number
  closedPOs: number
  totalMaterialDocs: number
  lastSync: string | null
  lastSyncStatus: string
}

export default function SAPLiveDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.href = '/admin-login'
        return
      }

      // Fetch vendor metrics
      const metricsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/erp/vendor-metrics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const metrics = await metricsRes.json()

      // Fetch PO summary
      const poRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/erp/purchase-orders/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const poData = await poRes.json()

      // Fetch material documents count
      const docsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sap/material-documents?limit=1`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const docsData = await docsRes.json()

      // Fetch sync status
      const syncRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/sync/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const syncData = await syncRes.json()

      setData({
        totalVendors: metrics.totalVendors || 0,
        activeVendors: metrics.activeVendors || 0,
        pendingVendors: metrics.pendingVendors || 0,
        syncedVendors: metrics.syncedVendors || 0,
        totalPOs: poData.totalPOs || 0,
        openPOs: poData.openPOs || 0,
        closedPOs: poData.closedPOs || 0,
        totalMaterialDocs: docsData.data?.length || 0,
        lastSync: syncData.data?.lastSync || null,
        lastSyncStatus: syncData.data?.lastSyncStatus || 'unknown'
      })

    } catch (err: any) {
      console.error('Error fetching data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleSync = async () => {
    setRefreshing(true)
    try {
      const token = localStorage.getItem('token')
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/sync/all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      setTimeout(() => fetchData(), 3000)
    } catch (err: any) {
      console.error('Sync error:', err)
      setError(err.message)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-600">Loading SAP data...</div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SAP Live Dashboard</h1>
            <p className="text-gray-600 mt-1">Real-time data from SAP S/4HANA Cloud</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              Last sync: {data?.lastSync ? new Date(data.lastSync).toLocaleString() : 'Never'}
            </span>
            <button
              onClick={handleSync}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
            Error: {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Vendors</p>
                <p className="text-3xl font-bold text-blue-600">{data?.totalVendors.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">From SAP Business Partner</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Purchase Orders</p>
                <p className="text-3xl font-bold text-green-600">{data?.totalPOs.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">{data?.openPOs} open • {data?.closedPOs} closed</p>
              </div>
              <Package className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Material Documents</p>
                <p className="text-3xl font-bold text-purple-600">{data?.totalMaterialDocs.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Goods receipts tracked</p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Sync Status</p>
                <p className="text-3xl font-bold text-orange-600 capitalize">{data?.lastSyncStatus || 'Unknown'}</p>
                <p className="text-xs text-gray-500 mt-1">{data?.syncedVendors} vendors synced</p>
              </div>
              <Database className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/vendors" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition border border-gray-100">
            <div className="flex items-center space-x-3">
              <Building2 className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Vendor Directory</h3>
                <p className="text-sm text-gray-500">View all {data?.totalVendors} vendors</p>
              </div>
            </div>
          </Link>
          <Link href="/procurement/purchase-orders" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition border border-gray-100">
            <div className="flex items-center space-x-3">
              <Package className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Purchase Orders</h3>
                <p className="text-sm text-gray-500">{data?.openPOs} open POs</p>
              </div>
            </div>
          </Link>
          <Link href="/sap/material-documents" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition border border-gray-100">
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-purple-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Material Documents</h3>
                <p className="text-sm text-gray-500">{data?.totalMaterialDocs} documents</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </MainLayout>
  )
}
