import { Metadata } from 'next'
import Link from 'next/link'
import { Users, Target, Heart, Award } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us - VendorFlow',
  description: 'Learn about VendorFlow\'s mission, team, and commitment to transforming vendor management.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-center">About VendorFlow</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto text-center mb-16">
          We're on a mission to simplify vendor management for businesses of all sizes.
        </p>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
            <p className="text-gray-600 mb-4">
              Founded in 2024, VendorFlow was born from the frustration of managing vendors with spreadsheets and disconnected tools. We saw an opportunity to create a unified platform that would transform how businesses manage their vendor relationships.
            </p>
            <p className="text-gray-600">
              Today, we help thousands of companies across the globe streamline their vendor management, procurement, projects, and finances—all in one place.
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
            <blockquote className="text-xl italic mb-4">
              "We built VendorFlow to solve real problems we experienced ourselves. Every feature is designed with our customers' needs in mind."
            </blockquote>
            <p className="font-semibold">— John Admin, Founder</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">10,000+ Users</h3>
            <p className="text-gray-600">Trusted by businesses worldwide</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">98% Satisfaction</h3>
            <p className="text-gray-600">From our customer reviews</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">24/7 Support</h3>
            <p className="text-gray-600">We're here when you need us</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Join thousands of happy customers</h2>
          <p className="text-gray-600 mb-6">Start your free trial today and see the difference.</p>
          <Link
            href="/signup"
            className="inline-flex px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  )
}
