'use client'

import MainLayout from '@/components/layout/MainLayout'
import {
  BarChart3,
  Users,
  DollarSign,
  FolderOpen,
  TrendingUp,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export default function ReportsHomePage() {
  const reportTypes = [
    {
      title: 'Vendor Reports',
      description: 'Analyze vendor performance, status, and metrics',
      icon: Users,
      color: 'blue',
      href: '/reports/vendors',
      stats: ['Active vs Pending', 'Performance Ratings', 'Contract Analysis']
    },
    {
      title: 'Financial Reports',
      description: 'Track income, expenses, and financial performance',
      icon: DollarSign,
      color: 'green',
      href: '/reports/financial',
      stats: ['Revenue Analysis', 'Expense Tracking', 'Profit & Loss']
    },
    {
      title: 'Project Reports',
      description: 'Monitor project progress, budget, and resources',
      icon: FolderOpen,
      color: 'purple',
      href: '/reports/projects',
      stats: ['Status Distribution', 'Budget Variance', 'Timeline Analysis']
    },
    {
      title: 'Analytics',
      description: 'Real-time insights and business intelligence',
      icon: TrendingUp,
      color: 'orange',
      href: '/reports/analytics',
      stats: ['Key Metrics', 'Trend Analysis', 'Activity Feed']
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
      green: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100',
      purple: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100',
      orange: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-2">Choose a report type to view detailed insights</p>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon
          return (
            <Link
              key={report.title}
              href={report.href}
              className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-xl ${getColorClasses(report.color)}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {report.title}
                  </h2>
                  <p className="text-gray-600 mt-1">{report.description}</p>
                  
                  <div className="mt-4 space-y-1">
                    {report.stats.map((stat, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-500">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mr-2" />
                        {stat}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
                    <span>View Report</span>
                    <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center space-x-3 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">Need Custom Reports?</h3>
        </div>
        <p className="text-blue-800 mb-4">
          Our analytics team can help you create custom reports tailored to your specific business needs.
        </p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          Request Custom Report
        </button>
      </div>
    </MainLayout>
  )
}