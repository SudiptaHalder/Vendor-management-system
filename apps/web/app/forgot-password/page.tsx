'use client'

import Link from 'next/link'
import { Mail, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
              <Mail className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Password Reset Unavailable</h2>
          <p className="mt-2 text-sm text-gray-600">
            Self-service password reset isn&apos;t set up yet. Please contact your administrator to reset your password.
          </p>
          <Link
            href="/vendor-login"
            className="mt-6 inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
