'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  Puzzle,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Link2,
  Unlink,
  Settings,
  ExternalLink,
  Clock,
  Zap,
  Database,
  Mail,
  Calendar,
  FileText,
  Users,
  DollarSign
} from 'lucide-react'
import Link from 'next/link'

interface Integration {
  id: string
  name: string
  provider: string
  type: string
  isActive: boolean
  lastSyncAt: string | null
  syncStatus: string
  description: string
  icon: any
}

export default function IntegrationsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [activeTab, setActiveTab] = useState('all')

  const fetchIntegrations = async () => {
    setLoading(true)
    try {
      // Mock data for now
      setIntegrations([
        {
          id: '1',
          name: 'Slack',
          provider: 'slack',
          type: 'communication',
          isActive: true,
          lastSyncAt: new Date().toISOString(),
          syncStatus: 'success',
          description: 'Get notifications and updates in your Slack channels',
          icon: Mail
        },
        {
          id: '2',
          name: 'QuickBooks',
          provider: 'quickbooks',
          type: 'accounting',
          isActive: true,
          lastSyncAt: new Date().toISOString(),
          syncStatus: 'success',
          description: 'Sync invoices and payments with QuickBooks',
          icon: DollarSign
        },
        {
          id: '3',
          name: 'Google Drive',
          provider: 'google_drive',
          type: 'storage',
          isActive: false,
          lastSyncAt: null,
          syncStatus: 'idle',
          description: 'Store and access documents from Google Drive',
          icon: Database
        },
        {
          id: '4',
          name: 'Microsoft Teams',
          provider: 'teams',
          type: 'communication',
          isActive: false,
          lastSyncAt: null,
          syncStatus: 'idle',
          description: 'Collaborate and share updates in Microsoft Teams',
          icon: Users
        },
        {
          id: '5',
          name: 'Salesforce',
          provider: 'salesforce',
          type: 'crm',
          isActive: false,
          lastSyncAt: null,
          syncStatus: 'idle',
          description: 'Sync vendor data with Salesforce CRM',
          icon: Database
        },
        {
          id: '6',
          name: 'Zapier',
          provider: 'zapier',
          type: 'automation',
          isActive: true,
          lastSyncAt: new Date().toISOString(),
          syncStatus: 'success',
          description: 'Connect with 5000+ apps via Zapier',
          icon: Zap
        }
      ])
    } catch (err) {
      console.error('Error fetching integrations:', err)
      setError('Failed to load integrations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIntegrations()
  }, [])

  const handleToggleIntegration = async (id: string, currentState: boolean) => {
    try {
      // Implement toggle API
      setIntegrations(integrations.map(i => 
        i.id === id ? { ...i, isActive: !currentState } : i
      ))
    } catch (err) {
      alert('Failed to update integration')
    }
  }

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = 
      integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = activeTab === 'all' || integration.type === activeTab
    
    return matchesSearch && matchesType
  })

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      success: 'bg-green-100 text-green-800',
      syncing: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      idle: 'bg-gray-100 text-gray-800'
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || colors.idle}`}>
        {status}
      </span>
    )
  }

  const categories = [
    { id: 'all', name: 'All', icon: Puzzle },
    { id: 'communication', name: 'Communication', icon: Mail },
    { id: 'accounting', name: 'Accounting', icon: DollarSign },
    { id: 'storage', name: 'Storage', icon: Database },
    { id: 'crm', name: 'CRM', icon: Users },
    { id: 'automation', name: 'Automation', icon: Zap }
  ]

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
          <Link href="/settings" className="hover:text-blue-600">
            Settings
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Integrations</span>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
            <p className="text-gray-600 mt-1">Connect your favorite tools and services</p>
          </div>
          <button
            onClick={fetchIntegrations}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 whitespace-nowrap ${
                  activeTab === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Icon size={16} />
                <span className="text-sm font-medium">{cat.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search integrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
          />
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredIntegrations.map((integration) => {
          const Icon = integration.icon
          return (
            <div
              key={integration.id}
              className={`bg-white rounded-xl shadow-sm border p-6 transition-all ${
                integration.isActive ? 'border-green-200 ring-1 ring-green-200' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${
                    integration.isActive ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      integration.isActive ? 'text-green-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{integration.provider}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleIntegration(integration.id, integration.isActive)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-1 ${
                    integration.isActive
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {integration.isActive ? (
                    <>
                      <CheckCircle size={14} />
                      <span>Connected</span>
                    </>
                  ) : (
                    <>
                      <Link2 size={14} />
                      <span>Connect</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">{integration.description}</p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  {getStatusBadge(integration.syncStatus)}
                  {integration.lastSyncAt && (
                    <span className="text-xs text-gray-400">
                      Last sync: {new Date(integration.lastSyncAt).toLocaleString()}
                    </span>
                  )}
                </div>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Settings size={16} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Need a custom integration?</h3>
        <p className="text-blue-800 mb-4">
          Our team can help you build custom integrations for your specific business needs.
        </p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          Contact Sales
        </button>
      </div>
    </MainLayout>
  )
}