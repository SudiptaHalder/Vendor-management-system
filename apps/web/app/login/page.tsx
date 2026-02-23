'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { initDevAuth } from '@/lib/dev-auth'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Simulate API call
    setTimeout(() => {
      // For development, any credentials work
      // Just initialize the dev auth
      initDevAuth()
      
      // Set cookie for middleware
      document.cookie = `token=dev-mock-token-12345; path=/; max-age=86400`
      
      router.push(callbackUrl)
    }, 1000)
  }

  const handleDevLogin = () => {
    setLoading(true)
    setTimeout(() => {
      initDevAuth()
      document.cookie = `token=dev-mock-token-12345; path=/; max-age=86400`
      router.push(callbackUrl)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <Link href="/" className="flex justify-center items-center space-x-2 mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">VF</span>
          </div>
          <span className="text-3xl font-bold text-gray-900">
            Vendor<span className="text-blue-600">Flow</span>
          </span>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </div>

          {/* Development Quick Login */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-800 mb-3">Development Mode</p>
            <button
              onClick={handleDevLogin}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login as Admin (Dev)'}
            </button>
            <p className="text-xs text-blue-600 mt-2 text-center">
              Email: admin@construction.com
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@construction.com"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}