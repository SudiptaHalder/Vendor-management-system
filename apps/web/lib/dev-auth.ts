// // Development authentication helper
// // This bypasses real authentication for development

// export const DEV_USER = {
//   id: 'cmlictvjl000311zcsn7ze0wi',
//   email: 'admin@construction.com',
//   name: 'John Admin',
//   role: 'admin',
//   companyId: 'cmlictvjk000111zclu3i9hi4'
// }

// export const DEV_SESSION = {
//   userId: 'cmlictvjl000311zcsn7ze0wi',
//   companyId: 'cmlictvjk000111zclu3i9hi4',
//   role: 'admin'
// }

// // Initialize dev auth data in localStorage
// export function initDevAuth() {
//   if (typeof window !== 'undefined') {
//     // Only run on client side
//     const hasUser = localStorage.getItem('user')
//     const hasSession = localStorage.getItem('session')
    
//     if (!hasUser || !hasSession) {
//       console.log('🔧 Dev mode: Setting up mock authentication')
//       localStorage.setItem('user', JSON.stringify(DEV_USER))
//       localStorage.setItem('session', JSON.stringify(DEV_SESSION))
//       localStorage.setItem('company', JSON.stringify({ 
//         id: DEV_USER.companyId, 
//         name: 'ABC Construction' 
//       }))
//     }
//   }
// }

// // ✅ ADD THIS FUNCTION - Get current user from localStorage
// export function getCurrentUser() {
//   if (typeof window === 'undefined') return null
  
//   const userStr = localStorage.getItem('user')
//   if (!userStr) return null
  
//   try {
//     return JSON.parse(userStr)
//   } catch {
//     return null
//   }
// }

// // ✅ ADD THIS FUNCTION - Get current session
// export function getCurrentSession() {
//   if (typeof window === 'undefined') return null
  
//   const sessionStr = localStorage.getItem('session')
//   if (!sessionStr) return null
  
//   try {
//     return JSON.parse(sessionStr)
//   } catch {
//     return null
//   }
// }

// // ✅ ADD THIS FUNCTION - Clear auth data
// export function clearAuth() {
//   if (typeof window !== 'undefined') {
//     localStorage.removeItem('user')
//     localStorage.removeItem('session')
//     localStorage.removeItem('company')
//     localStorage.removeItem('token')
    
//     // Also clear cookies if you're using them
//     document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
//     document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
//   }
// }

// // ✅ ADD THIS FUNCTION - Check if user is authenticated
// export function isAuthenticated() {
//   if (typeof window === 'undefined') return false
//   return !!localStorage.getItem('user') && !!localStorage.getItem('session')
// }

// // Get auth headers for API calls
// export function getAuthHeaders() {
//   return {
//     'x-user-id': DEV_USER.id,
//     'x-company-id': DEV_USER.companyId,
//     'Content-Type': 'application/json'
//   }
// }
// apps/web/lib/dev-auth.ts
export const DEV_USER = {
  id: 'cmlictvjl000311zcsn7ze0wi',
  email: 'admin@construction.com',
  name: 'John Admin',
  role: 'admin',
  companyId: 'cmlictvjk000111zclu3i9hi4'
}

export const DEV_SESSION = {
  userId: 'cmlictvjl000311zcsn7ze0wi',
  companyId: 'cmlictvjk000111zclu3i9hi4',
  role: 'admin'
}

export function initDevAuth() {
  if (typeof window !== 'undefined') {
    const hasUser = localStorage.getItem('user')
    const hasSession = localStorage.getItem('session')
    const hasToken = localStorage.getItem('token')
    
    if (!hasUser || !hasSession || !hasToken) {
      console.log('🔧 Dev mode: Setting up mock authentication')
      localStorage.setItem('user', JSON.stringify(DEV_USER))
      localStorage.setItem('session', JSON.stringify(DEV_SESSION))
      localStorage.setItem('token', 'dev-mock-token-12345')
      localStorage.setItem('company', JSON.stringify({ 
        id: DEV_USER.companyId, 
        name: 'ABC Construction' 
      }))
      
      // Also set cookie for middleware
      document.cookie = `token=dev-mock-token-12345; path=/; max-age=86400`
    }
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
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user')
    localStorage.removeItem('session')
    localStorage.removeItem('company')
    localStorage.removeItem('token')
    localStorage.removeItem('expandedMenus')
    
    // Clear cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
  }
}

export function isAuthenticated() {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('token')
}

export function getAuthHeaders() {
  return {
    'Authorization': `Bearer ${localStorage.getItem('token') || 'dev-mock-token-12345'}`,
    'x-user-id': DEV_USER.id,
    'x-company-id': DEV_USER.companyId,
    'Content-Type': 'application/json'
  }
}