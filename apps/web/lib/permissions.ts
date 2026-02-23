import { api } from './api'

interface User {
  id: string
  role: string
  permissions?: string[]
}

export async function checkPermission(user: User | null, requiredPermission: string): Promise<boolean> {
  if (!user) return false
  
  // Super admin has all permissions
  if (user.role === 'super_admin') return true
  
  // If permissions are not loaded, fetch them
  if (!user.permissions) {
    try {
      const response = await api.getCurrentUser()
      if (response.success) {
        // Assuming the user object now has permissions
        user.permissions = response.data.permissions || []
      }
    } catch (error) {
      console.error('Error fetching permissions:', error)
      return false
    }
  }
  
  return user.permissions?.includes(requiredPermission) || false
}

export function hasPermission(userPermissions: string[] | undefined, requiredPermission: string): boolean {
  if (!userPermissions) return false
  return userPermissions.includes(requiredPermission)
}

export function hasAnyPermission(userPermissions: string[] | undefined, requiredPermissions: string[]): boolean {
  if (!userPermissions) return false
  return requiredPermissions.some(p => userPermissions.includes(p))
}

export function hasAllPermissions(userPermissions: string[] | undefined, requiredPermissions: string[]): boolean {
  if (!userPermissions) return false
  return requiredPermissions.every(p => userPermissions.includes(p))
}

// Permission constants
export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: 'dashboard:view',
  
  // Vendors
  VIEW_VENDORS: 'vendors:view',
  CREATE_VENDOR: 'vendors:create',
  EDIT_VENDOR: 'vendors:edit',
  DELETE_VENDOR: 'vendors:delete',
  APPROVE_VENDOR: 'vendors:approve',
  EXPORT_VENDORS: 'vendors:export',
  
  // Procurement
  VIEW_PURCHASE_ORDERS: 'procurement:po:view',
  CREATE_PURCHASE_ORDER: 'procurement:po:create',
  EDIT_PURCHASE_ORDER: 'procurement:po:edit',
  DELETE_PURCHASE_ORDER: 'procurement:po:delete',
  APPROVE_PURCHASE_ORDER: 'procurement:po:approve',
  
  VIEW_RFQS: 'procurement:rfq:view',
  CREATE_RFQ: 'procurement:rfq:create',
  EDIT_RFQ: 'procurement:rfq:edit',
  DELETE_RFQ: 'procurement:rfq:delete',
  SEND_RFQ: 'procurement:rfq:send',
  
  VIEW_QUOTES: 'procurement:quote:view',
  CREATE_QUOTE: 'procurement:quote:create',
  EDIT_QUOTE: 'procurement:quote:edit',
  DELETE_QUOTE: 'procurement:quote:delete',
  ACCEPT_QUOTE: 'procurement:quote:accept',
  
  VIEW_CONTRACTS: 'procurement:contract:view',
  CREATE_CONTRACT: 'procurement:contract:create',
  EDIT_CONTRACT: 'procurement:contract:edit',
  DELETE_CONTRACT: 'procurement:contract:delete',
  SIGN_CONTRACT: 'procurement:contract:sign',
  
  VIEW_BIDS: 'procurement:bid:view',
  CREATE_BID: 'procurement:bid:create',
  EDIT_BID: 'procurement:bid:edit',
  DELETE_BID: 'procurement:bid:delete',
  AWARD_BID: 'procurement:bid:award',
  
  // Projects
  VIEW_PROJECTS: 'projects:view',
  CREATE_PROJECT: 'projects:create',
  EDIT_PROJECT: 'projects:edit',
  DELETE_PROJECT: 'projects:delete',
  
  VIEW_WORK_ORDERS: 'projects:workorder:view',
  CREATE_WORK_ORDER: 'projects:workorder:create',
  EDIT_WORK_ORDER: 'projects:workorder:edit',
  DELETE_WORK_ORDER: 'projects:workorder:delete',
  
  VIEW_SCHEDULES: 'projects:schedule:view',
  CREATE_SCHEDULE: 'projects:schedule:create',
  EDIT_SCHEDULE: 'projects:schedule:edit',
  DELETE_SCHEDULE: 'projects:schedule:delete',
  
  VIEW_RESOURCES: 'projects:resource:view',
  CREATE_RESOURCE: 'projects:resource:create',
  EDIT_RESOURCE: 'projects:resource:edit',
  DELETE_RESOURCE: 'projects:resource:delete',
  ASSIGN_RESOURCE: 'projects:resource:assign',
  
  // Finance
  VIEW_INVOICES: 'finance:invoice:view',
  CREATE_INVOICE: 'finance:invoice:create',
  EDIT_INVOICE: 'finance:invoice:edit',
  DELETE_INVOICE: 'finance:invoice:delete',
  APPROVE_INVOICE: 'finance:invoice:approve',
  
  VIEW_PAYMENTS: 'finance:payment:view',
  CREATE_PAYMENT: 'finance:payment:create',
  EDIT_PAYMENT: 'finance:payment:edit',
  DELETE_PAYMENT: 'finance:payment:delete',
  
  VIEW_EXPENSES: 'finance:expense:view',
  CREATE_EXPENSE: 'finance:expense:create',
  EDIT_EXPENSE: 'finance:expense:edit',
  DELETE_EXPENSE: 'finance:expense:delete',
  APPROVE_EXPENSE: 'finance:expense:approve',
  
  VIEW_BUDGET: 'finance:budget:view',
  CREATE_BUDGET: 'finance:budget:create',
  EDIT_BUDGET: 'finance:budget:edit',
  DELETE_BUDGET: 'finance:budget:delete',
  
  // Documents
  VIEW_DOCUMENTS: 'documents:view',
  UPLOAD_DOCUMENT: 'documents:upload',
  EDIT_DOCUMENT: 'documents:edit',
  DELETE_DOCUMENT: 'documents:delete',
  DOWNLOAD_DOCUMENT: 'documents:download',
  
  // Reports
  VIEW_REPORTS: 'reports:view',
  CREATE_REPORT: 'reports:create',
  EDIT_REPORT: 'reports:edit',
  DELETE_REPORT: 'reports:delete',
  EXPORT_REPORT: 'reports:export',
  
  // Settings
  VIEW_SETTINGS: 'settings:view',
  EDIT_COMPANY: 'settings:company:edit',
  MANAGE_TEAM: 'settings:team:manage',
  MANAGE_ROLES: 'settings:roles:manage',
  MANAGE_PERMISSIONS: 'settings:permissions:manage',
  MANAGE_BILLING: 'settings:billing:manage',
  MANAGE_INTEGRATIONS: 'settings:integrations:manage',
}