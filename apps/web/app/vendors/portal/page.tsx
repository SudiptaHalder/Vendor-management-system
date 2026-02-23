"use client"

import { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import {
  Globe,
  Lock,
  Users,
  Settings,
  ChevronRight,
  ExternalLink,
  Copy,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Key,
  Shield,
  Eye,
  EyeOff,
  Download,
  Upload,
  FileText,
  DollarSign,
  MessageSquare
} from 'lucide-react'

export default function VendorPortalPage() {
  const [portalEnabled, setPortalEnabled] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  const portalUrl = 'https://portal.vendorflow.com/abc-construction'
  const apiKey = 'vf_live_abc123xyz789_2026'

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <span>Vendors</span>
            <ChevronRight size={14} />
            <span className="text-gray-900">Vendor Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Portal</h1>
          <p className="text-gray-600 mt-1">Give your vendors access to submit invoices, track payments, and manage their profile</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <Download size={16} />
            <span>Guide</span>
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Users size={16} />
            <span>Invite Vendors</span>
          </button>
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${portalEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Globe className={`w-6 h-6 ${portalEnabled ? 'text-green-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Portal Status</h2>
              <p className="text-sm text-gray-600">
                {portalEnabled 
                  ? 'Your vendor portal is active and accessible' 
                  : 'Your vendor portal is currently disabled'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setPortalEnabled(!portalEnabled)}
            className={`px-4 py-2 rounded-lg font-medium ${
              portalEnabled 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {portalEnabled ? 'Disable Portal' : 'Enable Portal'}
          </button>
        </div>
      </div>

      {/* Portal URL Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Lock className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-700">Portal URL</h3>
            </div>
            <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
              <code className="flex-1 text-sm text-gray-900 font-mono">{portalUrl}</code>
              <button
                onClick={() => copyToClipboard(portalUrl)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Share this URL with your vendors to give them access to the portal
            </p>
          </div>
          <button className="ml-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <ExternalLink size={18} />
          </button>
        </div>
      </div>

      {/* API Key Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Key className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-700">API Key</h3>
            </div>
            <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
              <code className="flex-1 text-sm text-gray-900 font-mono">
                {showApiKey ? apiKey : '••••••••••••••••••••••••'}
              </code>
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => copyToClipboard(apiKey)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Use this API key for programmatic access to the vendor portal
            </p>
          </div>
          <button className="ml-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Portal Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Portal Settings</h2>
          <p className="text-sm text-gray-600 mt-1">Configure what vendors can access and do</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">Vendor Self-Registration</h3>
                <p className="text-sm text-gray-500">Allow vendors to create their own accounts</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="p-6 flex items-center justify-between">
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">Invoice Submission</h3>
                <p className="text-sm text-gray-500">Vendors can submit invoices through the portal</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="p-6 flex items-center justify-between">
            <div className="flex items-start space-x-3">
              <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">Payment Tracking</h3>
                <p className="text-sm text-gray-500">Vendors can view payment status and history</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="p-6 flex items-center justify-between">
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">Document Upload</h3>
                <p className="text-sm text-gray-500">Vendors can upload contracts and certificates</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="p-6 flex items-center justify-between">
            <div className="flex items-start space-x-3">
              <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">Messaging</h3>
                <p className="text-sm text-gray-500">Enable direct messaging with vendors</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
