import { Metadata } from 'next'
import Link from 'next/link'
import { 
  Users, 
  Package, 
  Building2, 
  DollarSign, 
  FileText, 
  BarChart3,
  Shield,
  Zap,
  Clock,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Features - VendorFlow',
  description: 'Discover all the powerful features VendorFlow offers to streamline your vendor management, procurement, projects, and finances.',
}

export default function FeaturesPage() {
  const features = [
    {
      category: 'Vendor Management',
      icon: Users,
      color: 'blue',
      items: [
        {
          title: 'Centralized Vendor Database',
          description: 'Store all vendor information in one place with custom fields, documents, and history.'
        },
        {
          title: 'Vendor Onboarding',
          description: 'Streamlined onboarding process with automated workflows and approval chains.'
        },
        {
          title: 'Performance Tracking',
          description: 'Track vendor performance with ratings, reviews, and key metrics.'
        },
        {
          title: 'Vendor Portal',
          description: 'Give vendors self-service access to submit invoices, update profiles, and more.'
        }
      ]
    },
    {
      category: 'Procurement',
      icon: Package,
      color: 'green',
      items: [
        {
          title: 'Purchase Orders',
          description: 'Create and manage purchase orders with line items, approvals, and tracking.'
        },
        {
          title: 'RFQ Management',
          description: 'Send requests for quotes to multiple vendors and compare responses.'
        },
        {
          title: 'Contract Management',
          description: 'Manage contracts with version control, expiration alerts, and e-signatures.'
        },
        {
          title: 'Bid Management',
          description: 'Run competitive bidding processes with automated evaluation.'
        }
      ]
    },
    {
      category: 'Project Management',
      icon: Building2,
      color: 'purple',
      items: [
        {
          title: 'Project Planning',
          description: 'Plan projects with timelines, milestones, and resource allocation.'
        },
        {
          title: 'Work Orders',
          description: 'Create and track work orders with assignment and completion tracking.'
        },
        {
          title: 'Resource Management',
          description: 'Manage equipment, tools, and personnel across multiple projects.'
        },
        {
          title: 'Schedule Management',
          description: 'Visual calendar view of all project activities and deadlines.'
        }
      ]
    },
    {
      category: 'Financial Management',
      icon: DollarSign,
      color: 'orange',
      items: [
        {
          title: 'Invoice Processing',
          description: 'Manage vendor invoices with approval workflows and payment tracking.'
        },
        {
          title: 'Expense Tracking',
          description: 'Track employee expenses with receipt capture and approval workflows.'
        },
        {
          title: 'Budget Management',
          description: 'Set and track budgets by department, project, or category.'
        },
        {
          title: 'Payment Processing',
          description: 'Process payments and track payment history for all vendors.'
        }
      ]
    },
    {
      category: 'Document Management',
      icon: FileText,
      color: 'red',
      items: [
        {
          title: 'Secure Document Storage',
          description: 'Store all documents securely with version control and access permissions.'
        },
        {
          title: 'Document Sharing',
          description: 'Share documents internally and with vendors securely.'
        },
        {
          title: 'E-Signatures',
          description: 'Get documents signed electronically with legally binding signatures.'
        },
        {
          title: 'Document Expiry Alerts',
          description: 'Get alerts when important documents like contracts are about to expire.'
        }
      ]
    },
    {
      category: 'Reporting & Analytics',
      icon: BarChart3,
      color: 'indigo',
      items: [
        {
          title: 'Custom Reports',
          description: 'Create custom reports with the data that matters most to you.'
        },
        {
          title: 'Dashboard Widgets',
          description: 'Customizable dashboard with real-time metrics and charts.'
        },
        {
          title: 'Export Options',
          description: 'Export reports to PDF, Excel, or CSV for further analysis.'
        },
        {
          title: 'Scheduled Reports',
          description: 'Schedule reports to be generated and emailed automatically.'
        }
      ]
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Powerful Features for
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800"> Complete Control</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to manage vendors, procurement, projects, and finances in one integrated platform.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-16">
            {features.map((category) => {
              const Icon = category.icon
              return (
                <div key={category.category} className="border-b border-gray-200 pb-16 last:border-0">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className={`p-3 rounded-xl ${getColorClasses(category.color)}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {category.category}
                    </h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    {category.items.map((item, idx) => (
                      <div key={idx} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to transform your vendor management?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of companies already using VendorFlow.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition text-lg font-semibold"
            >
              Start Free Trial
            </Link>
            <Link
              href="/demo"
              className="px-8 py-4 bg-transparent text-white rounded-xl hover:bg-blue-700 transition text-lg font-semibold border-2 border-white"
            >
              Request Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
