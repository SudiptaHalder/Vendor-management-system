import { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, HelpCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pricing - VendorFlow',
  description: 'Simple, transparent pricing starting at just $5/month. Choose the plan that fits your business needs.',
}

export default function PricingPage() {
  const plans = [
    {
      name: 'Starter',
      price: 5,
      description: 'Perfect for small businesses just getting started',
      features: [
        'Up to 50 vendors',
        'Basic procurement',
        'Up to 5 team members',
        'Email support',
        'Basic reports',
        '1GB storage'
      ],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Professional',
      price: 12,
      description: 'For growing companies with advanced needs',
      features: [
        'Unlimited vendors',
        'Advanced procurement',
        'Up to 20 team members',
        'Priority support',
        'Advanced reports',
        '10GB storage',
        'API access',
        'Custom fields'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Business',
      price: 20,
      description: 'For established businesses with multiple teams',
      features: [
        'Everything in Professional',
        'Unlimited team members',
        '24/7 phone support',
        '50GB storage',
        'Advanced security',
        'SLA guarantee',
        'Custom integrations',
        'Dedicated account manager'
      ],
      cta: 'Start Free Trial',
      popular: false
    }
  ]

  const faqs = [
    {
      question: 'Can I upgrade or downgrade my plan?',
      answer: 'Yes, you can change your plan at any time. Changes will be reflected in your next billing cycle.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes! All plans come with a 14-day free trial. No credit card required.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and bank transfers for annual plans.'
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes, you can cancel your subscription at any time. No hidden fees or contracts.'
    },
    {
      question: 'Do you offer discounts for non-profits?',
      answer: 'Yes, we offer special pricing for non-profit organizations. Contact our sales team for details.'
    },
    {
      question: 'Is there a setup fee?',
      answer: 'No, there are no setup fees. You only pay the monthly or annual subscription.'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800"> Pricing</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start for free, then pay as you grow. No hidden fees, no surprises.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl p-8 shadow-lg border ${
                  plan.popular ? 'border-blue-300 ring-2 ring-blue-200' : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block w-full py-3 px-4 rounded-xl text-center font-semibold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* Annual Discount */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Save 20% with annual billing. <Link href="/contact" className="text-blue-600 hover:text-blue-800">Contact us</Link> for enterprise pricing.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Compare Features
          </h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Starter</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Professional</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Business</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-600">Vendors</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">50</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">Unlimited</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">Unlimited</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-600">Team Members</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">5</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">20</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">Unlimited</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-600">Storage</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">1GB</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">10GB</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">50GB</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-600">API Access</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">-</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">✓</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">✓</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-600">Custom Fields</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">-</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">✓</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">✓</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-600">Priority Support</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">-</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">✓</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">24/7 Phone</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details key={idx} className="bg-white rounded-xl border border-gray-200">
                <summary className="flex items-center justify-between p-6 cursor-pointer">
                  <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                  <HelpCircle className="w-5 h-5 text-gray-500" />
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
