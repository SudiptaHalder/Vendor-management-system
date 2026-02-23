'use client'

import MainLayout from '@/components/layout/MainLayout'
import {
  Building2,
  Users,
  Shield,
  CreditCard,
  Puzzle,
  ArrowRight,
  Settings as SettingsIcon,
  Mail,
  Bell,
  Globe,
  Lock
} from 'lucide-react'
import Link from 'next/link'

export default function SettingsHomePage() {
  const settingsSections = [
    {
      title: 'Company Profile',
      description: 'Manage your company information and branding',
      icon: Building2,
      color: 'blue',
      href: '/settings/company',
      stats: ['Company name', 'Logo', 'Contact details']
    },
    {
      title: 'Team Members',
      description: 'Manage team members and their access',
      icon: Users,
      color: 'green',
      href: '/settings/team',
      stats: ['Invite members', 'Manage roles', 'Track activity']
    },
    {
      title: 'Roles & Permissions',
      description: 'Configure user roles and access levels',
      icon: Shield,
      color: 'purple',
      href: '/settings/roles',
      stats: ['Custom roles', 'Permission matrix', 'Access control']
    },
    {
      title: 'Billing',
      description: 'Manage subscription and payment methods',
      icon: CreditCard,
      color: 'orange',
      href: '/settings/billing',
      stats: ['Plan details', 'Payment methods', 'Invoices']
    },
    {
      title: 'Integrations',
      description: 'Connect with third-party services',
      icon: Puzzle,
      color: 'pink',
      href: '/settings/integrations',
      stats: ['Slack', 'QuickBooks', 'Google Drive']
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
      green: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100',
      purple: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100',
      orange: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100',
      pink: 'bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Configure your account and system preferences</p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsSections.map((section) => {
          const Icon = section.icon
          return (
            <Link
              key={section.title}
              href={section.href}
              className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-xl ${getColorClasses(section.color)}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {section.title}
                  </h2>
                  <p className="text-gray-600 mt-1">{section.description}</p>
                  
                  <div className="mt-4 space-y-1">
                    {section.stats.map((stat, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-500">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mr-2" />
                        {stat}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
                    <span>Manage</span>
                    <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Other Settings */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Other Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/settings/notifications"
            className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-gray-50"
          >
            <Bell size={20} className="text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">Notifications</p>
              <p className="text-xs text-gray-500">Email and in-app alerts</p>
            </div>
          </Link>
          <Link
            href="/settings/security"
            className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-gray-50"
          >
            <Lock size={20} className="text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">Security</p>
              <p className="text-xs text-gray-500">2FA, password, sessions</p>
            </div>
          </Link>
          <Link
            href="/settings/localization"
            className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-gray-50"
          >
            <Globe size={20} className="text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">Localization</p>
              <p className="text-xs text-gray-500">Timezone, currency, language</p>
            </div>
          </Link>
        </div>
      </div>
    </MainLayout>
  )
}