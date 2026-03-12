// apps/web/lib/config.ts
export const API_CONFIG = {
  // Base URL from environment variable
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  
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
        po: '/api/vendors/upload/po',
        master: '/api/vendors/upload/master',
        process: (fileId: string) => `/api/vendors/upload/process/${fileId}`,
      },
      // Vendor Management endpoints - OPTIMIZED
      management: {
        // Single endpoint that returns all vendors with their portal status
        listWithStatus: '/api/vendor-management/vendors-with-status',
        // Basic vendor list (if needed)
        list: '/api/vendor-management/vendors',
        // Individual endpoints (fallback if needed)
        invitations: (vendorId: string) => `/api/vendor-management/vendors/${vendorId}/invitations`,
        credentials: (vendorId: string) => `/api/vendor-management/vendors/${vendorId}/credentials`,
        invite: (vendorId: string) => `/api/vendor-management/vendors/${vendorId}/invite`,
        bulkInvite: '/api/vendor-management/vendors/bulk-invite',
        resendInvitation: (vendorId: string) => `/api/vendor-management/vendors/${vendorId}/resend-invitation`,
        portalStats: '/api/vendor-management/portal/stats',
        portalSettings: '/api/vendor-management/portal/settings',
      }
    },
    
    // Vendor portal endpoints (for vendors)
    vendor: {
      public: {
        login: '/api/vendor/public/login',
        verifyInvitation: '/api/vendor/public/verify-invitation',
        setPassword: '/api/vendor/public/set-password',
      },
      protected: {
        purchaseOrders: '/api/vendor/purchase-orders',
        profile: '/api/vendor/me',
      }
    },
    
    // Procurement endpoints
    procurement: {
      purchaseOrders: '/api/purchase-orders',
      rfqs: '/api/rfqs',
      quotes: '/api/quotes',
      contracts: '/api/contracts',
      bids: '/api/bids',
    },
    
    // Upload endpoints
    upload: {
      po: '/api/vendors/upload/po',
      master: '/api/vendors/upload/master',
    }
  }
};

// Type for API endpoints
export type ApiEndpoints = typeof API_CONFIG.endpoints;

// Helper to get full URL
export const getFullUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseURL}${endpoint}`;
};