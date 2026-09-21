'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import {
  CreditCard,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2,
  Download,
  Calendar,
  DollarSign,
  FileText,
  Shield,
  Zap,
  Users,
   XCircle ,
  Building2
} from 'lucide-react'
import Link from 'next/link'

interface Subscription {
  plan: string
  status: string
  trialEndsAt: string | null
  nextBillingDate: string | null
  amount: number
  currency: string
  interval: string
}

interface Invoice {
  id: string
  number: string
  date: string
  amount: number
  status: string
  pdfUrl: string | null
}

export default function BillingPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [selectedPlan, setSelectedPlan] = useState('professional')

  const fetchBillingData = async () => {
    setLoading(true)
    try {
      // Mock data for now
      setSubscription({
        plan: 'Professional',
        status: 'active',
        trialEndsAt: null,
        nextBillingDate: '2026-03-13',
        amount: 99,
        currency: 'USD',
        interval: 'month'
      })

      setInvoices([
        {
          id: '1',
          number: 'INV-2026-001',
          date: '2026-02-13',
          amount: 99,
          status: 'paid',
          pdfUrl: null
        },
        {
          id: '2',
          number: 'INV-2026-002',
          date: '2026-01-13',
          amount: 99,
          status: 'paid',
          pdfUrl: null
        },
        {
          id: '3',
          number: 'INV-2026-003',
          date: '2025-12-13',
          amount: 99,
          status: 'paid',
          pdfUrl: null
        }
      ])
    } catch (err) {
      console.error('Error fetching billing data:', err)
      setError('Failed to load billing information')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBillingData()
  }, [])

  const plans = [
    {
      name: 'Starter',
      price: 49,
      interval: 'month',
      features: [
        'Up to 10 team members',
        '50 vendors',
        'Basic reports',
        'Email support'
      ],
      limitations: [
        'No API access',
        'Limited integrations'
      ]
    },
    {
      name: 'Professional',
      price: 99,
      interval: 'month',
      features: [
        'Up to 25 team members',
        'Unlimited vendors',
        'Advanced reports',
        'Priority support',
        'API access',
        'All integrations'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 299,
      interval: 'month',
      features: [
        'Unlimited team members',
        'Unlimited vendors',
        'Custom reports',
        '24/7 phone support',
        'SLA guarantee',
        'Custom integrations',
        'Dedicated account manager'
      ]
    }
  ]

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Link href="/settings" className="hover:text-blue-600 dark:hover:text-blue-400">
            Settings
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">Billing</span>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Billing & Subscription</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your plan, payment methods, and invoices</p>
          </div>
          <button
            onClick={fetchBillingData}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Current Plan */}
      {subscription && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white mb-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Current Plan</p>
              <h2 className="text-3xl font-bold mb-2">{subscription.plan}</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <DollarSign size={16} className="mr-1" />
                  <span className="text-xl font-semibold">{subscription.amount}</span>
                  <span className="text-blue-200 text-sm ml-1">/{subscription.interval}</span>
                </div>
                <span className="px-2 py-1 bg-blue-500 rounded-full text-xs font-medium">
                  {subscription.status}
                </span>
              </div>
            </div>
            <button className="px-4 py-2 bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium">
              Change Plan
            </button>
          </div>

          {subscription.nextBillingDate && (
            <div className="mt-4 pt-4 border-t border-blue-500">
              <p className="text-sm text-blue-100">
                Next billing date: {new Date(subscription.nextBillingDate).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Plan Comparison */}
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Available Plans</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm border ${
              plan.popular ? 'border-blue-300 ring-2 ring-blue-200' : 'border-gray-200 dark:border-gray-700'
            } p-6 relative`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                Most Popular
              </span>
            )}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{plan.name}</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">${plan.price}</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">/{plan.interval}</span>
            </div>

            <div className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                </div>
              ))}
              {plan.limitations?.map((limitation, index) => (
                <div key={index} className="flex items-start opacity-50">
                  <XCircle size={16} className="text-gray-400 dark:text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-400 dark:text-gray-500">{limitation}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedPlan(plan.name.toLowerCase())}
              className={`w-full py-2 px-4 rounded-lg font-medium ${
                selectedPlan === plan.name.toLowerCase()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {selectedPlan === plan.name.toLowerCase() ? 'Current Plan' : 'Select Plan'}
            </button>
          </div>
        ))}
      </div>

      {/* Payment Method */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Payment Method</h2>
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white dark:bg-gray-900 rounded-lg">
              <CreditCard className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Visa ending in 4242</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Expires 12/2026</p>
            </div>
          </div>
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
            Update
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          Your payments are processed securely. We never store your full card details.
        </p>
      </div>

      {/* Billing History */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50 dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Billing History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono font-medium text-gray-900 dark:text-gray-100">{invoice.number}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(invoice.date).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      ${invoice.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400">
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  )
}