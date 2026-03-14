// 'use client'

// import { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import { useSearchParams } from 'next/navigation'

// export default function VendorLoginPage() {
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const token = searchParams.get('token')
  
//   const [username, setUsername] = useState('')
//   const [password, setPassword] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')
//   const [showTokenSetup, setShowTokenSetup] = useState(!!token)

//   // If token is present, show token setup form
//   if (token && showTokenSetup) {
//     return <TokenSetup token={token} onComplete={() => setShowTokenSetup(false)} />
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)
//     setError('')

//     try {
//       const response = await 
// fetch('http://localhost:3001/api/vendor/public/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ username, password })
//       })

//       const data = await response.json()

//       if (data.success) {
//         localStorage.setItem('vendorToken', data.data.token)
//         localStorage.setItem('vendor', JSON.stringify(data.data.vendor))
//         router.push('/vendor/dashboard')
//       } else {
//         setError(data.error || 'Invalid credentials')
//       }
//     } catch (err) {
//       setError('Login failed. Please try again.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <div>
//           <div className="flex justify-center">
//             <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center">
//               <span className="text-white font-bold text-2xl">VF</span>
//             </div>
//           </div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//             Vendor Portal
//           </h2>
//           <p className="mt-2 text-center text-sm text-gray-600">
//             Sign in to your account to manage invoices and orders
//           </p>
//         </div>
        
//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           <div className="rounded-md shadow-sm -space-y-px">
//             <div className="mb-4">
//               <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
//                 Username (Supplier Code)
//               </label>
//               <input
//                 id="username"
//                 name="username"
//                 type="text"
//                 required
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
//                 placeholder="Enter your supplier code (e.g., 100103)"
//               />
//             </div>
            
//             <div className="mb-4">
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
//                 Password
//               </label>
//               <input
//                 id="password"
//                 name="password"
//                 type="password"
//                 required
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
//                 placeholder="Enter your password"
//               />
//             </div>
//           </div>

//           {error && (
//             <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded">
//               {error}
//             </div>
//           )}

//           <div>
//             <button
//               type="submit"
//               disabled={loading}
//               className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
//             >
//               {loading ? 'Signing in...' : 'Sign in'}
//             </button>
//           </div>

//           <div className="text-center">
//             <Link href="/vendor-login/forgot-password" className="text-sm text-green-600 hover:text-green-500">
//               Forgot your password?
//             </Link>
//           </div>
//         </form>

//         <div className="mt-4 text-center">
//           <p className="text-xs text-gray-500">
//             First time here? Check your email for an invitation link to set up your account.
//           </p>
//         </div>
//       </div>
//     </div>
//   )
// }

// // Token Setup Component (for first-time users)
// function TokenSetup({ token, onComplete }: { token: string; onComplete: () => void }) {
//   const router = useRouter()
//   const [step, setStep] = useState<'loading' | 'setup' | 'success' | 'error'>('loading')
//   const [vendor, setVendor] = useState<any>(null)
//   const [password, setPassword] = useState('')
//   const [confirmPassword, setConfirmPassword] = useState('')
//   const [error, setError] = useState('')
//   const [loading, setLoading] = useState(false)

//   // Verify token on load
//   useState(() => {
//     const verifyToken = async () => {
//       try {
//         const response = await fetch(`http://localhost:3001/api/vendor/verify-invitation?token=${token}`)
//         const data = await response.json()
        
//         if (data.success) {
//           setVendor(data.data)
//           setStep('setup')
//         } else {
//           setStep('error')
//           setError(data.error || 'Invalid or expired invitation')
//         }
//       } catch (err) {
//         setStep('error')
//         setError('Failed to verify invitation')
//       }
//     }

//     verifyToken()
//   }, [token])

//   const handleSetupPassword = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError('')
    
//     if (password.length < 8) {
//       setError('Password must be at least 8 characters')
//       return
//     }
    
//     if (password !== confirmPassword) {
//       setError('Passwords do not match')
//       return
//     }

//     setLoading(true)
    
//     try {
//       const response = await fetch('http://localhost:3001/api/vendor/set-password', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ token, password })
//       })
      
//       const data = await response.json()
      
//       if (data.success) {
//         localStorage.setItem('vendorToken', data.data.token)
//         localStorage.setItem('vendor', JSON.stringify(data.data.vendor))
//         setStep('success')
//         setTimeout(() => {
//           router.push('/vendor/dashboard')
//         }, 2000)
//       } else {
//         setError(data.error || 'Failed to set password')
//       }
//     } catch (err) {
//       setError('An error occurred')
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (step === 'loading') {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Verifying your invitation...</p>
//         </div>
//       </div>
//     )
//   }

//   if (step === 'error') {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
//           <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </div>
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h2>
//           <p className="text-gray-600 mb-6">{error}</p>
//           <button
//             onClick={onComplete}
//             className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
//           >
//             Go to Login
//           </button>
//         </div>
//       </div>
//     )
//   }

//   if (step === 'success') {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
//           <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//             </svg>
//           </div>
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
//           <p className="text-gray-600 mb-4">
//             Your account has been set up successfully. Redirecting to dashboard...
//           </p>
//           <div className="animate-pulse text-green-600">Redirecting...</div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <div>
//           <div className="flex justify-center">
//             <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center">
//               <span className="text-white font-bold text-2xl">VF</span>
//             </div>
//           </div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//             Set Up Your Account
//           </h2>
//           <p className="mt-2 text-center text-sm text-gray-600">
//             Welcome {vendor?.supplierName}! Please set your password.
//           </p>
//         </div>
        
//         <form className="mt-8 space-y-6" onSubmit={handleSetupPassword}>
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Username (Supplier Code)
//               </label>
//               <input
//                 type="text"
//                 value={vendor?.supplierCode || ''}
//                 disabled
//                 className="w-full px-3 py-2 border border-gray-300 bg-gray-50 text-gray-500 rounded-md"
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 New Password
//               </label>
//               <input
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
//                 placeholder="Enter your new password"
//                 minLength={8}
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Confirm Password
//               </label>
//               <input
//                 type="password"
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//                 required
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
//                 placeholder="Confirm your password"
//               />
//             </div>
//           </div>

//           {error && (
//             <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded">
//               {error}
//             </div>
//           )}

//           <div>
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
//             >
//               {loading ? 'Setting up...' : 'Create Account & Login'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function VendorLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showTokenSetup, setShowTokenSetup] = useState(!!token)

  // If token is present, show token setup form
  if (token && showTokenSetup) {
    return <TokenSetup token={token} onComplete={() => setShowTokenSetup(false)} />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('🔐 Vendor login attempt for:', username)
      
      const response = await fetch('http://localhost:3001/api/vendor/public/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()
      console.log('📡 Login response:', data)

      if (data.success) {
        // Clear any existing data first
        localStorage.clear()
        sessionStorage.clear()
        
        // Set new data
        localStorage.setItem('vendorToken', data.data.token)
        localStorage.setItem('vendor', JSON.stringify(data.data.vendor))
        
        // Also set cookie for middleware
        document.cookie = `vendorToken=${data.data.token}; path=/; max-age=604800; SameSite=Lax`
        
        console.log('✅ Login successful, redirecting to dashboard...')
        
        // Force hard redirect with replace
        window.location.replace('/vendor/dashboard')
      } else {
        setError(data.error || 'Invalid credentials')
        setLoading(false)
      }
    } catch (err) {
      console.error('❌ Login error:', err)
      setError('Login failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">VF</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Vendor Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username (Supplier Code)
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Enter your supplier code (e.g., 100103)"
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Token Setup Component (for first-time users)
function TokenSetup({ token, onComplete }: { token: string; onComplete: () => void }) {
  const router = useRouter()
  const [step, setStep] = useState<'loading' | 'setup' | 'success' | 'error'>('loading')
  const [vendor, setVendor] = useState<any>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/vendor/public/verify-invitation?token=${token}`)
        const data = await response.json()
        
        if (data.success) {
          setVendor(data.data)
          setStep('setup')
        } else {
          setStep('error')
          setError(data.error || 'Invalid or expired invitation')
        }
      } catch (err) {
        setStep('error')
        setError('Failed to verify invitation')
      }
    }

    verifyToken()
  }, [token])

  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('http://localhost:3001/api/vendor/public/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Clear any existing data
        localStorage.clear()
        
        // Set new data
        localStorage.setItem('vendorToken', data.data.token)
        localStorage.setItem('vendor', JSON.stringify(data.data.vendor))
        
        // Set cookie for middleware
        document.cookie = `vendorToken=${data.data.token}; path=/; max-age=604800; SameSite=Lax`
        
        setStep('success')
        setTimeout(() => {
          window.location.replace('/vendor/dashboard')
        }, 2000)
      } else {
        setError(data.error || 'Failed to set password')
        setLoading(false)
      }
    } catch (err) {
      setError('An error occurred')
      setLoading(false)
    }
  }

  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your invitation...</p>
        </div>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={onComplete}
            className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
          <p className="text-gray-600 mb-4">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Set Up Your Account</h2>
        <p className="text-gray-600 mb-6">Welcome {vendor?.supplierName}!</p>
        
        <form onSubmit={handleSetupPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={vendor?.supplierCode || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 bg-gray-50 text-gray-500 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              placeholder="Enter your new password"
              minLength={8}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              placeholder="Confirm your password"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Setting up...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}