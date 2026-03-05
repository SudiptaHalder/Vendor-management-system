// Development authentication helper - DEPRECATED
// Use real authentication via localStorage tokens instead

export const DEV_USER = null
export const DEV_SESSION = null

// @deprecated - Use localStorage token instead
export function initDevAuth() {
  console.warn('dev-auth is deprecated. Using real authentication.')
}

// @deprecated - Use localStorage token instead
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  
  if (!token || !userStr) return false
  
  try {
    const user = JSON.parse(userStr)
    return user.type !== 'vendor' // Only admin users for dashboard
  } catch {
    return false
  }
}

// @deprecated - Use localStorage token instead
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

// Use this for API headers instead
export function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}
