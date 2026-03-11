// apps/web/lib/config.ts
export const API_CONFIG = {
  // In development, use localhost
  // In production, use your actual domain
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://api.yourdomain.com'  // Change this to your production API URL
    : 'http://localhost:3001',
  
  endpoints: {
    // Auth endpoints
    auth: {
      login: '/api/auth/login',
      me: '/api/auth/me',
    },
    
    // Vendor endpoints
    vendors: {
      list: '/api/vendors',
      upload: {
        po: '/api/vendors/upload/po',           // PO uploads
        master: '/api/vendors/upload/master',    // Master data uploads
        process: (fileId: string) => `/api/vendors/upload/process/${fileId}`,
      }
    },
    
    // Vendor portal endpoints
    vendor: {
      verifyInvitation: '/api/vendor/verify-invitation',
      setPassword: '/api/vendor/set-password',
      login: '/api/vendor/login',
      purchaseOrders: '/api/vendor/purchase-orders',
    },
    
    // Procurement endpoints
    procurement: {
      purchaseOrders: '/api/purchase-orders',
      rfqs: '/api/rfqs',
      quotes: '/api/quotes',
      contracts: '/api/contracts',
      bids: '/api/bids',
    }
  }
}

// Type for API endpoints
export type ApiEndpoints = typeof API_CONFIG.endpoints