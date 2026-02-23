export type UserRole = 'admin' | 'manager' | 'member' | 'finance'

export interface SessionUser {
  id: string
  email: string
  name: string
  companyId: string
  role: UserRole
}

export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export type PaginatedResponse<T> = {
  data: T[]
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}
