'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, Clock, Users, CheckCircle, ArrowRight, Loader2, AlertCircle } from 'lucide-react'

export default function DemoForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    companyName: '',
    phone: '',
    companySize: '',
    interests: [] as string[],
    preferredDate: '',
    preferredTime: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [requestNumber, setRequestNumber] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleCheckbox = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const validateForm = () => {
    if (!formData.fullName.trim()) return 'Full name is required'
    if (!formData.email.trim()) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Valid email is required'
    if (!formData.companyName.trim()) return 'Company name is required'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/demo/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        setRequestNumber(data.data.requestNumber)
        setSubmitted(true)
      } else {
        setError(data.error || 'Failed to submit request')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Demo Request Sent!</h1>
          <p className="text-gray-600 mb-2">
            Thank you for your interest in VendorFlow.
          </p>
          <p className="text-sm text-blue-600 font-mono mb-4">
            Request #{requestNumber}
          </p>
          <p className="text-gray-600 mb-8">
            Our team will contact you within 24 hours to schedule your personalized demo.
          </p>
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            Return to Home
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Info */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              See VendorFlow in
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800"> Action</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Schedule a personalized demo with our product experts. We'll show you how VendorFlow can transform your vendor management.
            </p>

            <div className="space-y-6 mb-8">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Personalized Walkthrough</h3>
                  <p className="text-gray-600">See the features that matter most to your business</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">30-Minute Session</h3>
                  <p className="text-gray-600">Focused demo with time for your questions</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Flexible Scheduling</h3>
                  <p className="text-gray-600">Choose a time that works for you</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <p className="text-blue-800 font-medium mb-2">✨ No obligation, just insights</p>
              <p className="text-blue-700 text-sm">
                Our demos are completely free and there's no pressure to buy. We're here to help you make an informed decision.
              </p>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Request a Demo</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-600">
                <AlertCircle size={16} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  placeholder="john@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="companyName"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  placeholder="Acme Inc"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Size
                </label>
                <select
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">Select...</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501+">501+ employees</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  I'm interested in:
                </label>
                <div className="space-y-2">
                  {['Vendor Management', 'Procurement', 'Project Management', 'Financial Management'].map((interest) => (
                    <label key={interest} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.interests.includes(interest)}
                        onChange={() => handleCheckbox(interest)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{interest}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Time
                  </label>
                  <select
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">Select...</option>
                    <option value="9:00 AM">9:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="1:00 PM">1:00 PM</option>
                    <option value="2:00 PM">2:00 PM</option>
                    <option value="3:00 PM">3:00 PM</option>
                    <option value="4:00 PM">4:00 PM</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium flex items-center justify-center disabled:opacity-50 transition-all"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Request Demo
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                By submitting, you agree to our{' '}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
                  Privacy Policy
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
