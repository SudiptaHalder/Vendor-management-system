"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  ShoppingCart,
  FileText,
  MessageSquare,
  FileCheck,
  ClipboardList,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react'

export default function ProcurementPage() {
  const [stats, setStats] = useState({
    purchaseOrders: { total: 0, draft: 0, sent: 0, delivered: 0 },
    rfqs: { total: 0, draft: 0, sent: 0, awarded: 0 },
    quotes: { total: 0, submitted: 0, accepted: 0, rejected: 0 },
    contracts: { total: 0, draft: 0, active: 0, expired: 0 },
    bids: { total: 0, open: 0, awarded: 0 }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [poRes, rfqRes, quoteRes, contractRes, bidRes] = await Promise.all([
        api.getPurchaseOrders(),
        api.getRFQs(),
        api.getQuotes(),
        api.getContracts(),
        api.getBids()
      ])

      setStats({
        purchaseOrders: {
          total: poRes.data?.length || 0,
          draft: poRes.data?.filter((p: any) => p.status === 'draft').length || 0,
          sent: poRes.data?.filter((p: any) => p.status === 'sent').length || 0,
          delivered: poRes.data?.filter((p: any) => p.status === 'delivered').length || 0
        },
        rfqs: {
          total: rfqRes.data?.length || 0,
          draft: rfqRes.data?.filter((r: any) => r.status === 'draft').length || 0,
          sent: rfqRes.data?.filter((r: any) => r.status === 'sent').length || 0,
          awarded: rfqRes.data?.filter((r: any) => r.status === 'awarded').length || 0
        },
        quotes: {
          total: quoteRes.data?.length || 0,
          submitted: quoteRes.data?.filter((q: any) => q.status === 'submitted').length || 0,
          accepted: quoteRes.data?.filter((q: any) => q.status === 'accepted').length || 0,
          rejected: quoteRes.data?.filter((q: any) => q.status === 'rejected').length || 0
        },
        contracts: {
          total: contractRes.data?.length || 0,
          draft: contractRes.data?.filter((c: any) => c.status === 'draft').length || 0,
          active: contractRes.data?.filter((c: any) => c.status === 'active').length || 0,
          expired: contractRes.data?.filter((c: any) => c.status === 'expired').length || 0
        },
        bids: {
          total: bidRes.data?.length || 0,
          open: bidRes.data?.filter((b: any) => b.status === 'open').length || 0,
          awarded: bidRes.data?.filter((b: any) => b.status === 'awarded').length || 0
        }
      })
    } catch (error) {
      console.error('Error fetching procurement stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const modules = [
    {
      name: 'Purchase Orders',
      icon: ShoppingCart,
      href: '/procurement/purchase-orders',
      color: 'blue',
      stats: stats.purchaseOrders,
      description: 'Create and manage purchase orders'
    },
    {
      name: 'RFQs',
      icon: MessageSquare,
      href: '/procurement/rfqs',
      color: 'purple',
      stats: stats.rfqs,
      description: 'Request quotes from vendors'
    },
    {
      name: 'Quotes',
      icon: FileText,
      href: '/procurement/quotes',
      color: 'green',
      stats: stats.quotes,
      description: 'Review and compare vendor quotes'
    },
    {
      name: 'Contracts',
      icon: FileCheck,
      href: '/procurement/contracts',
      color: 'orange',
      stats: stats.contracts,
      description: 'Manage vendor contracts'
    },
    {
      name: 'Bids',
      icon: ClipboardList,
      href: '/procurement/bids',
      color: 'red',
      stats: stats.bids,
      description: 'Open and manage bidding processes'
    }
  ]

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Procurement</h1>
        <p className="text-gray-600 mt-1">Manage your entire procurement lifecycle</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Total POs</p>
            <ShoppingCart className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.purchaseOrders.total}</p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.purchaseOrders.delivered} delivered
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Active RFQs</p>
            <MessageSquare className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.rfqs.sent}</p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.rfqs.awarded} awarded
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Quotes</p>
            <FileText className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.quotes.total}</p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.quotes.accepted} accepted
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Active Contracts</p>
            <FileCheck className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.contracts.active}</p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.contracts.total} total
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Open Bids</p>
            <ClipboardList className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.bids.open}</p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.bids.awarded} awarded
          </p>
        </div>
      </div>

      {/* Procurement Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const Icon = module.icon
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-600',
            purple: 'bg-purple-100 text-purple-600',
            green: 'bg-green-100 text-green-600',
            orange: 'bg-orange-100 text-orange-600',
            red: 'bg-red-100 text-red-600'
          }[module.color]

          return (
            <Link
              key={module.name}
              href={module.href}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{module.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{module.description}</p>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {module.stats.draft || 0} draft
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-600">
                    {module.stats.active || module.stats.sent || module.stats.submitted || 0} active
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/procurement/purchase-orders?action=new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <ShoppingCart size={16} />
            <span>Create Purchase Order</span>
          </Link>
          <Link
            href="/procurement/rfqs?action=new"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
          >
            <MessageSquare size={16} />
            <span>New RFQ</span>
          </Link>
          <Link
            href="/procurement/bids?action=new"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
          >
            <ClipboardList size={16} />
            <span>Open Bid</span>
          </Link>
        </div>
      </div>
    </MainLayout>
  )
}
