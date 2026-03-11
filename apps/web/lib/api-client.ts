// apps/web/lib/api-client.ts
import { API_CONFIG } from './config'

class ApiClient {
  private baseURL: string
  private defaultHeaders: HeadersInit

  constructor() {
    this.baseURL = API_CONFIG.baseURL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  private getHeaders(auth?: boolean): HeadersInit {
    const headers = { ...this.defaultHeaders }
    
    if (auth) {
      const token = localStorage.getItem('token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }
    
    return headers
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit & { auth?: boolean } = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const headers = this.getHeaders(options.auth)

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      })

      if (!response.ok) {
        // Handle 401 Unauthorized - redirect to login
        if (response.status === 401) {
          localStorage.removeItem('token')
          window.location.href = '/login'
          throw new Error('Session expired')
        }
        
        const error = await response.json()
        throw new Error(error.error || 'Request failed')
      }

      return await response.json()
    } catch (error) {
      console.error('API Request failed:', error)
      throw error
    }
  }

  // HTTP methods
  async get<T>(endpoint: string, auth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', auth })
  }

  async post<T>(endpoint: string, data?: any, auth = true): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
      headers: data instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
      auth,
    })
  }

  async put<T>(endpoint: string, data?: any, auth = true): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      auth,
    })
  }

  async delete<T>(endpoint: string, auth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', auth })
  }

  // File upload helper
  async uploadFile<T>(endpoint: string, file: File, auth = true): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)
    
    return this.post<T>(endpoint, formData, auth)
  }
}

export const apiClient = new ApiClient()