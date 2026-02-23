'use client'

import { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Link from 'next/link'
import {
  HelpCircle,
  BookOpen,
  MessageCircle,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  Video,
  ExternalLink,
  Search,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Settings,
  Shield,
  CreditCard,
  Database,
  Download,
  Upload,
  FileSignature,
  Bell,
  Globe,
  Zap,
  Award,
  ThumbsUp,
  ThumbsDown,
  Send
} from 'lucide-react'

export default function SupportPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('help')
  const [showContactForm, setShowContactForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'technical',
    message: '',
    priority: 'medium'
  })
  const [formSubmitted, setFormSubmitted] = useState(false)

  const faqs = [
    {
      question: 'How do I add a new vendor?',
      answer: 'Go to Vendors > All Vendors and click "New Vendor". Fill in the required information and submit for approval.',
      category: 'vendors'
    },
    {
      question: 'How do I create a purchase order?',
      answer: 'Navigate to Procurement > Purchase Orders and click "New Purchase Order". Select vendor, add line items, and submit.',
      category: 'procurement'
    },
    {
      question: 'How do I invite team members?',
      answer: 'Go to Settings > Team Members and click "Invite Member". Enter their email and assign a role.',
      category: 'team'
    },
    {
      question: 'How do I generate an invoice?',
      answer: 'Go to Finance > Invoices and click "New Invoice". Select the vendor, add items, and create the invoice.',
      category: 'finance'
    },
    {
      question: 'How do I reset my password?',
      answer: 'Click on your profile picture, select Settings, then go to Security section to change your password.',
      category: 'account'
    },
    {
      question: 'How do I export reports?',
      answer: 'Go to Reports, select the report you want, click the Export button and choose your preferred format (PDF, CSV, Excel).',
      category: 'reports'
    },
    {
      question: 'How do I integrate with QuickBooks?',
      answer: 'Go to Settings > Integrations, find QuickBooks, and click "Connect". Follow the authentication steps.',
      category: 'integrations'
    },
    {
      question: 'How do I set up notifications?',
      answer: 'Go to Settings > Notifications to configure email and in-app alerts for various events.',
      category: 'settings'
    }
  ]

  const guides = [
    {
      title: 'Getting Started Guide',
      description: 'Learn the basics of VendorFlow in 10 minutes',
      icon: BookOpen,
      color: 'blue',
      readTime: '5 min',
      level: 'Beginner'
    },
    {
      title: 'Vendor Management',
      description: 'Complete guide to managing vendors and categories',
      icon: Users,
      color: 'green',
      readTime: '10 min',
      level: 'Intermediate'
    },
    {
      title: 'Procurement Workflow',
      description: 'RFQs, Quotes, Purchase Orders, and Contracts',
      icon: FileSignature,
      color: 'purple',
      readTime: '15 min',
      level: 'Advanced'
    },
    {
      title: 'Financial Management',
      description: 'Invoices, Payments, Expenses, and Budget',
      icon: CreditCard,
      color: 'orange',
      readTime: '12 min',
      level: 'Intermediate'
    },
    {
      title: 'Project Management',
      description: 'Projects, Work Orders, Schedules, and Resources',
      icon: Database,
      color: 'pink',
      readTime: '15 min',
      level: 'Advanced'
    },
    {
      title: 'Reports & Analytics',
      description: 'Create and export custom reports',
      icon: FileText,
      color: 'indigo',
      readTime: '8 min',
      level: 'Intermediate'
    }
  ]

  const videos = [
    {
      title: 'VendorFlow Overview',
      duration: '3:45',
      thumbnail: '/thumbnails/overview.jpg',
      views: '2.5k'
    },
    {
      title: 'Setting Up Your Company',
      duration: '5:20',
      thumbnail: '/thumbnails/setup.jpg',
      views: '1.8k'
    },
    {
      title: 'Managing Vendors',
      duration: '8:15',
      thumbnail: '/thumbnails/vendors.jpg',
      views: '3.2k'
    },
    {
      title: 'Creating Purchase Orders',
      duration: '6:30',
      thumbnail: '/thumbnails/po.jpg',
      views: '2.1k'
    }
  ]

  const categories = [
    { name: 'All', icon: Globe, count: 24 },
    { name: 'Getting Started', icon: BookOpen, count: 4 },
    { name: 'Vendors', icon: Users, count: 6 },
    { name: 'Procurement', icon: FileSignature, count: 5 },
    { name: 'Finance', icon: CreditCard, count: 4 },
    { name: 'Projects', icon: Database, count: 3 },
    { name: 'Settings', icon: Settings, count: 2 }
  ]

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault()
    // In production, this would send to your backend
    console.log('Support ticket:', formData)
    setFormSubmitted(true)
    setTimeout(() => {
      setShowContactForm(false)
      setFormSubmitted(false)
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: 'technical',
        message: '',
        priority: 'medium'
      })
    }, 3000)
  }

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
      green: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100',
      purple: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100',
      orange: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100',
      pink: 'bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-600 mt-2">Find answers, get help, and contact our support team</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for help articles, FAQs, guides..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <button
                key={cat.name}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 flex items-center space-x-1"
              >
                <Icon size={14} />
                <span>{cat.name}</span>
                <span className="text-xs text-gray-500 ml-1">({cat.count})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Quick Action Tabs */}
      <div className="flex space-x-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('help')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'help'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Help Center
        </button>
        <button
          onClick={() => setActiveTab('faq')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'faq'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          FAQs
        </button>
        <button
          onClick={() => setActiveTab('guides')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'guides'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Guides
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'videos'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Video Tutorials
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'contact'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Contact Us
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Help Center Tab */}
        {activeTab === 'help' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.slice(0, 6).map((guide, index) => {
              const Icon = guide.icon
              return (
                <Link
                  key={index}
                  href={`/support/guide/${index}`}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all group"
                >
                  <div className={`p-3 rounded-lg w-fit ${getColorClasses(guide.color)} mb-4`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {guide.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{guide.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-2">
                      <Clock size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-500">{guide.readTime}</span>
                      <span className="text-xs text-gray-300">•</span>
                      <span className="text-xs text-gray-500">{guide.level}</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredFaqs.map((faq, index) => (
                <details key={index} className="group">
                  <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                    <h3 className="text-base font-medium text-gray-900">{faq.question}</h3>
                    <ChevronRight className="w-5 h-5 text-gray-500 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="px-6 pb-6">
                    <p className="text-gray-600">{faq.answer}</p>
                    <div className="mt-4 flex items-center space-x-4">
                      <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-green-600">
                        <ThumbsUp size={14} />
                        <span>Helpful</span>
                      </button>
                      <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-600">
                        <ThumbsDown size={14} />
                        <span>Not helpful</span>
                      </button>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* Guides Tab */}
        {activeTab === 'guides' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {guides.map((guide, index) => {
                const Icon = guide.icon
                return (
                  <Link
                    key={index}
                    href={`/support/guide/${index}`}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${getColorClasses(guide.color)}`}>
                        <Icon size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {guide.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{guide.description}</p>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-2">
                            <Clock size={14} className="text-gray-400" />
                            <span className="text-xs text-gray-500">{guide.readTime}</span>
                            <span className="text-xs text-gray-300">•</span>
                            <span className="text-xs text-gray-500">{guide.level}</span>
                          </div>
                          <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {videos.map((video, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all group cursor-pointer">
                <div className="aspect-video bg-gray-100 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                      <Video size={20} className="text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {video.title}
                  </h3>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>{video.duration}</span>
                    <span>{video.views} views</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contact Options */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Get in Touch</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mail size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Email Support</p>
                      <a href="mailto:support@vendorflow.com" className="text-sm text-blue-600 hover:text-blue-800">
                        support@vendorflow.com
                      </a>
                      <p className="text-xs text-gray-500 mt-1">Response within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Phone size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Phone Support</p>
                      <a href="tel:+18005551234" className="text-sm text-green-600 hover:text-green-800">
                        1-800-555-1234
                      </a>
                      <p className="text-xs text-gray-500 mt-1">Mon-Fri, 9am-6pm EST</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <MessageCircle size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Live Chat</p>
                      <button className="text-sm text-purple-600 hover:text-purple-800">
                        Start chat
                      </button>
                      <p className="text-xs text-gray-500 mt-1">Available 24/7</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Status Page</h3>
                <p className="text-sm text-blue-800 mb-4">
                  Check our system status and service availability.
                </p>
                <Link
                  href="/status"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  View Status
                  <ExternalLink size={14} className="ml-2" />
                </Link>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Send us a Message</h3>
                
                {formSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={32} className="text-green-600" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Ticket Submitted!</h4>
                    <p className="text-gray-600">
                      We'll get back to you within 24 hours. Check your email for updates.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitTicket} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="john@company.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject *
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Brief description of your issue"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category *
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="technical">Technical Issue</option>
                          <option value="billing">Billing Question</option>
                          <option value="account">Account Management</option>
                          <option value="feature">Feature Request</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Priority *
                        </label>
                        <select
                          name="priority"
                          value={formData.priority}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Please describe your issue in detail..."
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <p className="text-xs text-gray-500">
                        * Required fields. We'll respond within 24 hours.
                      </p>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                      >
                        <Send size={16} />
                        <span>Submit Ticket</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Help Section */}
      <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold mb-2">Still need help?</h2>
            <p className="text-blue-100">
              Our support team is available 24/7 to assist you with any questions.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('contact')}
            className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-medium"
          >
            Contact Support
          </button>
        </div>
      </div>
    </MainLayout>
  )
}