'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ChevronRight,
  CheckCircle,
  Star,
  Users,
  Shield,
  Zap,
  BarChart3,
  FileText,
  DollarSign,
  Package,
  Building2,
  Clock,
  Award,
  TrendingUp,
  ArrowRight,
  Facebook,
  Twitter,
  Linkedin,
  Github
} from 'lucide-react'

export default function LandingPage() {
  const features = [
    {
      icon: Users,
      title: 'Vendor Management',
      description: 'Centralize vendor data, track performance, and manage relationships effortlessly.',
      color: 'blue'
    },
    {
      icon: Package,
      title: 'Procurement Suite',
      description: 'Streamline RFQs, purchase orders, quotes, and contracts in one place.',
      color: 'green'
    },
    {
      icon: Building2,
      title: 'Project Management',
      description: 'Track projects, work orders, schedules, and resources efficiently.',
      color: 'purple'
    },
    {
      icon: DollarSign,
      title: 'Financial Control',
      description: 'Manage invoices, payments, expenses, and budgets with precision.',
      color: 'orange'
    },
    {
      icon: FileText,
      title: 'Document Management',
      description: 'Store, organize, and share documents securely with version control.',
      color: 'red'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Gain insights with customizable reports and real-time dashboards.',
      color: 'indigo'
    }
  ]

  const benefits = [
    {
      icon: Clock,
      title: 'Save Time',
      description: 'Reduce manual work by 70% with automated workflows'
    },
    {
      icon: Shield,
      title: 'Stay Compliant',
      description: 'Built-in compliance with industry standards'
    },
    {
      icon: TrendingUp,
      title: 'Increase Efficiency',
      description: 'Boost team productivity by 40% on average'
    },
    {
      icon: Award,
      title: 'Better Decisions',
      description: 'Data-driven insights for strategic planning'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Procurement Director',
      company: 'TechCorp Solutions',
      content: 'VendorFlow has transformed how we manage our vendors. We\'ve reduced processing time by 60% and improved compliance dramatically.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Operations Manager',
      company: 'Global Construction Inc.',
      content: 'The project management features are outstanding. We can track every work order and resource in real-time.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'CFO',
      company: 'Innovate Industries',
      content: 'Financial controls and reporting are exactly what we needed. Invoice tracking and budget management are seamless.',
      rating: 5
    }
  ]

  const pricingPlans = [
    {
      name: 'Starter',
      price: 5,
      interval: 'month',
      description: 'Perfect for small businesses',
      features: [
        'Up to 50 vendors',
        'Basic procurement',
        'Up to 5 team members',
        'Email support',
        '1GB storage'
      ],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Professional',
      price: 12,
      interval: 'month',
      description: 'For growing companies',
      features: [
        'Unlimited vendors',
        'Advanced procurement',
        'Up to 20 team members',
        'Priority support',
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
      interval: 'month',
      description: 'For established businesses',
      features: [
        'Unlimited vendors',
        'Advanced procurement',
        'Unlimited team members',
        '24/7 phone support',
        '50GB storage',
        'SLA guarantee',
        'Dedicated account manager'
      ],
      cta: 'Start Free Trial',
      popular: false
    }
  ]

  const faqs = [
    {
      question: 'What is VendorFlow?',
      answer: 'VendorFlow is a comprehensive vendor management system that helps businesses streamline procurement, manage vendors, track projects, and control finances all in one platform.'
    },
    {
      question: 'How do I get started?',
      answer: 'Simply sign up for a free trial, no credit card required. You\'ll get access to all features for 14 days to explore the platform.'
    },
    {
      question: 'Can I customize the platform?',
      answer: 'Yes! VendorFlow offers extensive customization options including custom fields, workflows, and reports to match your specific business needs.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We use enterprise-grade encryption, regular security audits, and comply with industry standards to keep your data safe.'
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
      green: 'bg-green-50 text-green-600 group-hover:bg-green-100',
      purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-100',
      orange: 'bg-orange-50 text-orange-600 group-hover:bg-orange-100',
      red: 'bg-red-50 text-red-600 group-hover:bg-red-100',
      indigo: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
                <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                Trusted by 5000+ companies
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Streamline Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
                  Vendor Management
                </span>
              </h1>
              <p className="text-xl text-gray-600 mt-6 leading-relaxed">
                The all-in-one platform to manage vendors, procurement, projects, and finances. 
                Starting at just $5/month.
              </p>
              <div className="flex flex-wrap gap-4 mt-8">
                <Link
                  href="/signup"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl text-lg font-semibold inline-flex items-center"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  href="/demo"
                  className="px-8 py-4 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl text-lg font-semibold border border-gray-200"
                >
                  Request Demo
                </Link>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                No credit card required • 14-day free trial
              </p>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl shadow-2xl overflow-hidden border border-gray-200 bg-gradient-to-br from-blue-600 to-blue-800 p-8">
                <div className="text-white text-center">
                  <div className="text-6xl font-bold mb-2">$5</div>
                  <div className="text-xl mb-4">Starting price</div>
                  <div className="text-blue-100">Affordable plans for every business</div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">98% Customer Satisfaction</p>
                    <p className="text-xs text-gray-500">Based on 2,500+ reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm font-medium uppercase tracking-wide mb-8">
            Trusted by innovative companies worldwide
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center opacity-50">
            <div className="text-2xl font-bold text-gray-400">TechCorp</div>
            <div className="text-2xl font-bold text-gray-400">InnovateCo</div>
            <div className="text-2xl font-bold text-gray-400">GlobalInc</div>
            <div className="text-2xl font-bold text-gray-400">FutureLabs</div>
            <div className="text-2xl font-bold text-gray-400">SmartSys</div>
            <div className="text-2xl font-bold text-gray-400">ProManage</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Vendors
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features that work together to streamline your entire vendor management process
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-200 hover:border-blue-200"
                >
                  <div className={`p-4 rounded-xl w-fit mb-6 transition-all ${getColorClasses(feature.color)}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your business needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
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
                  <span className="text-gray-500">/{plan.interval}</span>
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
          <p className="text-center text-gray-500 mt-8">
            Save 20% with annual billing
          </p>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Business Leaders
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers have to say about VendorFlow
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <p className="text-sm text-gray-500">{testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group bg-gray-50 rounded-xl border border-gray-200">
                <summary className="flex items-center justify-between p-6 cursor-pointer">
                  <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                  <ChevronRight className="w-5 h-5 text-gray-500 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Vendor Management?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of companies already using VendorFlow
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl text-lg font-semibold inline-flex items-center"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/demo"
              className="px-8 py-4 bg-transparent text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl text-lg font-semibold border-2 border-white"
            >
              Request Demo
            </Link>
          </div>
          <p className="text-sm text-blue-200 mt-4">
            No credit card required • 14-day free trial
          </p>
        </div>
      </section>
    </div>
  )
}
