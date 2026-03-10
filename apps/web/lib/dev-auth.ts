// Development authentication helper
export const DEV_USER = null
export const DEV_SESSION = null

export function initDevAuth() {
  console.warn('dev-auth is deprecated. Using real authentication.')
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  
  if (!token || !userStr) return false
  
  try {
    const user = JSON.parse(userStr)
    return user.type !== 'vendor'
  } catch {
    return false
  }
}

export function getCurrentUser() {
  if (typeof window === 'undefined') return null
  const userStr = localStorage.getItem('user')
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export function clearAuth() {
  if (typeof window === 'undefined') return
  
  console.log('🔴 Logging out...')
  
  // Clear localStorage
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('session')
  
  // Clear all cookies
  document.cookie.split(";").forEach(function(c) {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  })
  
  // Force multiple cookie clears for different paths
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=' + window.location.hostname
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=.' + window.location.hostname
  
  console.log('✅ Auth cleared')
  
  // Hard redirect to home page
  window.location.href = '/'
}

export function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}
