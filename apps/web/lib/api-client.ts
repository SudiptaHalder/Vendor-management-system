// // apps/web/lib/api-client.ts
// import { API_CONFIG } from './config'

// class ApiClient {
//   private baseURL: string
//   private defaultHeaders: HeadersInit

//   constructor() {
//     this.baseURL = API_CONFIG.baseURL
//     this.defaultHeaders = {
//       'Content-Type': 'application/json',
//     }
//   }

//   private getHeaders(auth?: boolean): HeadersInit {
//     const headers = { ...this.defaultHeaders }
    
//     if (auth) {
//       const token = localStorage.getItem('token')
//       if (token) {
//         headers['Authorization'] = `Bearer ${token}`
//       }
//     }
    
//     return headers
//   }

//   private async request<T>(
//     endpoint: string,
//     options: RequestInit & { auth?: boolean } = {}
//   ): Promise<T> {
//     const url = `${this.baseURL}${endpoint}`
//     const headers = this.getHeaders(options.auth)

//     try {
//       const response = await fetch(url, {
//         ...options,
//         headers: {
//           ...headers,
//           ...options.headers,
//         },
//       })

//       if (!response.ok) {
//         // Handle 401 Unauthorized - redirect to login
//         if (response.status === 401) {
//           localStorage.removeItem('token')
//           window.location.href = '/login'
//           throw new Error('Session expired')
//         }
        
//         const error = await response.json()
//         throw new Error(error.error || 'Request failed')
//       }

//       return await response.json()
//     } catch (error) {
//       console.error('API Request failed:', error)
//       throw error
//     }
//   }

//   // HTTP methods
//   async get<T>(endpoint: string, auth = true): Promise<T> {
//     return this.request<T>(endpoint, { method: 'GET', auth })
//   }

//   async post<T>(endpoint: string, data?: any, auth = true): Promise<T> {
//     return this.request<T>(endpoint, {
//       method: 'POST',
//       body: data instanceof FormData ? data : JSON.stringify(data),
//       headers: data instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
//       auth,
//     })
//   }

//   async put<T>(endpoint: string, data?: any, auth = true): Promise<T> {
//     return this.request<T>(endpoint, {
//       method: 'PUT',
//       body: JSON.stringify(data),
//       auth,
//     })
//   }

//   async delete<T>(endpoint: string, auth = true): Promise<T> {
//     return this.request<T>(endpoint, { method: 'DELETE', auth })
//   }

//   // File upload helper
//   async uploadFile<T>(endpoint: string, file: File, auth = true): Promise<T> {
//     const formData = new FormData()
//     formData.append('file', file)
    
//     return this.post<T>(endpoint, formData, auth)
//   }
// }

// export const apiClient = new ApiClient()

// apps/web/lib/api-client.ts
import { API_CONFIG } from './config'

interface RequestOptions extends RequestInit {
  auth?: boolean
  token?: string
}

interface ApiResponse<T = any> {
  success: boolean
  data: T
  error?: string
  message?: string
}

class ApiClient {
  private baseURL: string
  private defaultHeaders: HeadersInit

  constructor() {
    this.baseURL = API_CONFIG.baseURL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  private getAuthToken(): string | null {
    // Try to get admin token first, then vendor token
    return localStorage.getItem('token') || localStorage.getItem('vendorToken')
  }

  private getHeaders(auth?: boolean, customToken?: string): HeadersInit {
    const headers = { ...this.defaultHeaders }
    
    if (auth) {
      const token = customToken || this.getAuthToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }
    
    return headers
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`
    const headers = this.getHeaders(options.auth, options.token)

    // Log the request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`)
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      })

      // Handle 401 Unauthorized
      if (response.status === 401) {
        // Clear both tokens
        localStorage.removeItem('token')
        localStorage.removeItem('vendorToken')
        localStorage.removeItem('vendor')
        
        // Only redirect to login if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
        
        throw new Error('Session expired')
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('❌ API Request failed:', error)
      throw error
    }
  }

  // HTTP methods with proper typing
  async get<T = any>(
    endpoint: string, 
    auth: boolean = true, 
    token?: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', auth, token })
  }

  async post<T = any>(
    endpoint: string, 
    data?: any, 
    auth: boolean = true, 
    token?: string
  ): Promise<ApiResponse<T>> {
    // Handle FormData
    if (data instanceof FormData) {
      return this.request<T>(endpoint, {
        method: 'POST',
        body: data,
        auth,
        token,
        headers: undefined, // Let browser set content-type for FormData
      })
    }

    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      auth,
      token,
    })
  }

  async put<T = any>(
    endpoint: string, 
    data?: any, 
    auth: boolean = true, 
    token?: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      auth,
      token,
    })
  }

  async patch<T = any>(
    endpoint: string, 
    data?: any, 
    auth: boolean = true, 
    token?: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      auth,
      token,
    })
  }

  async delete<T = any>(
    endpoint: string, 
    auth: boolean = true, 
    token?: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', auth, token })
  }

  // File upload helper
  async uploadFile<T = any>(
    endpoint: string, 
    file: File, 
    additionalData?: Record<string, any>,
    auth: boolean = true,
    token?: string
  ): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
    }
    
    return this.post<T>(endpoint, formData, auth, token)
  }

  // Batch requests helper
  async batch<T = any>(
    requests: { method: string; endpoint: string; data?: any }[],
    auth: boolean = true,
    token?: string
  ): Promise<ApiResponse<T>[]> {
    return Promise.all(
      requests.map(req => {
        switch (req.method.toUpperCase()) {
          case 'GET':
            return this.get(req.endpoint, auth, token)
          case 'POST':
            return this.post(req.endpoint, req.data, auth, token)
          case 'PUT':
            return this.put(req.endpoint, req.data, auth, token)
          case 'DELETE':
            return this.delete(req.endpoint, auth, token)
          default:
            throw new Error(`Unsupported method: ${req.method}`)
        }
      })
    )
  }
}

export const apiClient = new ApiClient()