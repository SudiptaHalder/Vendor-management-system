const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

const getToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

const getHeaders = () => {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  
  // Always add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  // Add dev headers if needed
  if (process.env.NODE_ENV === 'development') {
    headers['x-user-id'] = 'cmlictvjl000311zcsn7ze0wi'
    headers['x-company-id'] = 'cmlictvjk000111zclu3i9hi4'
  }
  
  return headers
}

// Helper to handle API responses
const handleResponse = async (response: Response) => {
  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.clear()
      // Redirect to login page
      window.location.href = '/login'
    }
    throw new Error('Session expired. Please login again.')
  }
  
  const data = await response.json()
  
  if (!response.ok) {
    // If the response is not ok, throw an error with the message from the server
    throw new Error(data.error || data.message || 'API request failed')
  }
  
  return data
}

export const api = {
  // ============ AUTH ============
  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    return handleResponse(response)
  },

  async logout() {
    localStorage.clear()
    window.location.href = '/login'
  },

  async getCurrentUser() {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  // ============ VENDORS ============
  async getVendors() {
    const response = await fetch(`${API_URL}/vendors`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async createVendor(data: any) {
    const response = await fetch(`${API_URL}/vendors`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async updateVendor(id: string, data: any) {
    const response = await fetch(`${API_URL}/vendors/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async deleteVendor(id: string) {
    const response = await fetch(`${API_URL}/vendors/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  // ============ CATEGORIES ============
  async getCategories() {
    const response = await fetch(`${API_URL}/categories`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async createCategory(data: any) {
    const response = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async updateCategory(id: string, data: any) {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async deleteCategory(id: string) {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async getCategory(id: string) {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async getVendorsByCategory(categoryId: string) {
    const response = await fetch(`${API_URL}/categories/${categoryId}/vendors`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  // ============ APPROVALS ============
  async getApprovals() {
    const response = await fetch(`${API_URL}/approvals`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async getApprovalStats() {
    const response = await fetch(`${API_URL}/approvals/stats`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async approveVendor(id: string, notes?: string) {
    const response = await fetch(`${API_URL}/approvals/${id}/approve`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ notes })
    })
    return handleResponse(response)
  },

  async rejectVendor(id: string, notes: string) {
    const response = await fetch(`${API_URL}/approvals/${id}/reject`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ notes })
    })
    return handleResponse(response)
  },

  async bulkApproveVendors(ids: string[]) {
    const response = await fetch(`${API_URL}/approvals/bulk-approve`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ ids })
    })
    return handleResponse(response)
  },

  async getApprovalDetail(id: string) {
    const response = await fetch(`${API_URL}/approvals/${id}`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  // ============ PURCHASE ORDERS ============
  async getPurchaseOrders() {
    const response = await fetch(`${API_URL}/purchase-orders`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async getPurchaseOrder(id: string) {
    const response = await fetch(`${API_URL}/purchase-orders/${id}`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async createPurchaseOrder(data: any) {
    const response = await fetch(`${API_URL}/purchase-orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async updatePurchaseOrder(id: string, data: any) {
    const response = await fetch(`${API_URL}/purchase-orders/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async updatePurchaseOrderStatus(id: string, status: string) {
    const response = await fetch(`${API_URL}/purchase-orders/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    })
    return handleResponse(response)
  },

  async deletePurchaseOrder(id: string) {
    const response = await fetch(`${API_URL}/purchase-orders/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  // ============ RFQs ============
  async getRFQs() {
    const response = await fetch(`${API_URL}/rfqs`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async getRFQ(id: string) {
    const response = await fetch(`${API_URL}/rfqs/${id}`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async createRFQ(data: any) {
    const response = await fetch(`${API_URL}/rfqs`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async updateRFQ(id: string, data: any) {
    const response = await fetch(`${API_URL}/rfqs/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async sendRFQ(id: string) {
    const response = await fetch(`${API_URL}/rfqs/${id}/send`, {
      method: 'POST',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async deleteRFQ(id: string) {
    const response = await fetch(`${API_URL}/rfqs/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  // ============ QUOTES ============
  async getQuotes() {
    const response = await fetch(`${API_URL}/quotes`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async getQuote(id: string) {
    const response = await fetch(`${API_URL}/quotes/${id}`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async createQuote(data: any) {
    const response = await fetch(`${API_URL}/quotes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async updateQuoteStatus(id: string, status: string) {
    const response = await fetch(`${API_URL}/quotes/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    })
    return handleResponse(response)
  },

  async acceptQuote(id: string, data: any) {
    const response = await fetch(`${API_URL}/quotes/${id}/accept`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async deleteQuote(id: string) {
    const response = await fetch(`${API_URL}/quotes/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  // ============ CONTRACTS ============
  async getContracts() {
    const response = await fetch(`${API_URL}/contracts`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async getContract(id: string) {
    const response = await fetch(`${API_URL}/contracts/${id}`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async createContract(data: any) {
    const response = await fetch(`${API_URL}/contracts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async updateContract(id: string, data: any) {
    const response = await fetch(`${API_URL}/contracts/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async signContract(id: string, signedBy: string) {
    const response = await fetch(`${API_URL}/contracts/${id}/sign`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ signedBy })
    })
    return handleResponse(response)
  },

  async createContractAmendment(id: string, data: any) {
    const response = await fetch(`${API_URL}/contracts/${id}/amendments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async deleteContract(id: string) {
    const response = await fetch(`${API_URL}/contracts/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  // ============ PROJECTS ============
  async getProjects(params?: { status?: string, search?: string }) {
    let url = `${API_URL}/projects`
    if (params) {
      const queryParams = new URLSearchParams()
      if (params.status) queryParams.append('status', params.status)
      if (params.search) queryParams.append('search', params.search)
      url += `?${queryParams.toString()}`
    }
    const response = await fetch(url, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async getProject(id: string) {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async createProject(data: any) {
    const response = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async updateProject(id: string, data: any) {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async deleteProject(id: string) {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  // Project Vendors
  async getProjectVendors(projectId: string) {
    const response = await fetch(`${API_URL}/projects/${projectId}/vendors`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async addProjectVendor(projectId: string, data: any) {
    const response = await fetch(`${API_URL}/projects/${projectId}/vendors`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async updateProjectVendor(projectId: string, vendorId: string, data: any) {
    const response = await fetch(`${API_URL}/projects/${projectId}/vendors/${vendorId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async removeProjectVendor(projectId: string, vendorId: string) {
    const response = await fetch(`${API_URL}/projects/${projectId}/vendors/${vendorId}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  // ============ USERS / PROFILE ============
  async getUser(id: string) {
    const response = await fetch(`${API_URL}/users/${id}`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async updateUser(id: string, data: any) {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async changePassword(id: string, data: any) {
    const response = await fetch(`${API_URL}/users/${id}/change-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async updatePreferences(id: string, preferences: any) {
    const response = await fetch(`${API_URL}/users/${id}/preferences`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ preferences })
    })
    return handleResponse(response)
  },

  async updateNotificationSettings(id: string, settings: any) {
    const response = await fetch(`${API_URL}/users/${id}/notifications`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ notificationSettings: settings })
    })
    return handleResponse(response)
  },

  async uploadAvatar(id: string, formData: FormData) {
    const token = getToken()
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    const response = await fetch(`${API_URL}/users/${id}/avatar`, {
      method: 'POST',
      headers,
      body: formData
    })
    return handleResponse(response)
  },

  // ============ BIDS ============
  async getBids() {
    const response = await fetch(`${API_URL}/bids`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async getBid(id: string) {
    const response = await fetch(`${API_URL}/bids/${id}`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async createBid(data: any) {
    const response = await fetch(`${API_URL}/bids`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async publishBid(id: string) {
    const response = await fetch(`${API_URL}/bids/${id}/publish`, {
      method: 'POST',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async updateBid(id: string, data: any) {
    const response = await fetch(`${API_URL}/bids/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async submitBid(data: any) {
    const response = await fetch(`${API_URL}/bids/submissions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async awardBid(submissionId: string) {
    const response = await fetch(`${API_URL}/bids/submissions/${submissionId}/award`, {
      method: 'POST',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async deleteBid(id: string) {
    const response = await fetch(`${API_URL}/bids/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  // ============ WORK ORDERS ============
  async getWorkOrders(params?: { projectId?: string, status?: string, vendorId?: string }) {
    let url = `${API_URL}/work-orders`
    if (params) {
      const queryParams = new URLSearchParams()
      if (params.projectId) queryParams.append('projectId', params.projectId)
      if (params.status) queryParams.append('status', params.status)
      if (params.vendorId) queryParams.append('vendorId', params.vendorId)
      url += `?${queryParams.toString()}`
    }
    const response = await fetch(url, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async getWorkOrder(id: string) {
    const response = await fetch(`${API_URL}/work-orders/${id}`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async createWorkOrder(data: any) {
    const response = await fetch(`${API_URL}/work-orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async updateWorkOrder(id: string, data: any) {
    const response = await fetch(`${API_URL}/work-orders/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async deleteWorkOrder(id: string) {
    const response = await fetch(`${API_URL}/work-orders/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  // ============ SCHEDULES ============
  async getSchedules(params?: { projectId?: string, startDate?: string, endDate?: string }) {
    let url = `${API_URL}/schedules`
    if (params) {
      const queryParams = new URLSearchParams()
      if (params.projectId) queryParams.append('projectId', params.projectId)
      if (params.startDate) queryParams.append('startDate', params.startDate)
      if (params.endDate) queryParams.append('endDate', params.endDate)
      url += `?${queryParams.toString()}`
    }
    const response = await fetch(url, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async getSchedule(id: string) {
    const response = await fetch(`${API_URL}/schedules/${id}`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async createSchedule(data: any) {
    const response = await fetch(`${API_URL}/schedules`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async updateSchedule(id: string, data: any) {
    const response = await fetch(`${API_URL}/schedules/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async deleteSchedule(id: string) {
    const response = await fetch(`${API_URL}/schedules/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  // Schedule Items
  async getScheduleItems(scheduleId: string) {
    const response = await fetch(`${API_URL}/schedules/${scheduleId}/items`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async createScheduleItem(scheduleId: string, data: any) {
    const response = await fetch(`${API_URL}/schedules/${scheduleId}/items`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async updateScheduleItem(scheduleId: string, itemId: string, data: any) {
    const response = await fetch(`${API_URL}/schedules/${scheduleId}/items/${itemId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async deleteScheduleItem(scheduleId: string, itemId: string) {
    const response = await fetch(`${API_URL}/schedules/${scheduleId}/items/${itemId}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  // ============ RESOURCES ============
  async getResources(params?: { type?: string, status?: string, projectId?: string, search?: string }) {
    let url = `${API_URL}/resources`
    if (params) {
      const queryParams = new URLSearchParams()
      if (params.type) queryParams.append('type', params.type)
      if (params.status) queryParams.append('status', params.status)
      if (params.projectId) queryParams.append('projectId', params.projectId)
      if (params.search) queryParams.append('search', params.search)
      url += `?${queryParams.toString()}`
    }
    const response = await fetch(url, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async getResource(id: string) {
    const response = await fetch(`${API_URL}/resources/${id}`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async createResource(data: any) {
    const response = await fetch(`${API_URL}/resources`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async updateResource(id: string, data: any) {
    const response = await fetch(`${API_URL}/resources/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async deleteResource(id: string) {
    const response = await fetch(`${API_URL}/resources/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  // ============ RESOURCE ASSIGNMENTS ============
  async getResourceAssignments(params?: { resourceId?: string, projectId?: string, workOrderId?: string }) {
    let url = `${API_URL}/resource-assignments`
    if (params) {
      const queryParams = new URLSearchParams()
      if (params.resourceId) queryParams.append('resourceId', params.resourceId)
      if (params.projectId) queryParams.append('projectId', params.projectId)
      if (params.workOrderId) queryParams.append('workOrderId', params.workOrderId)
      url += `?${queryParams.toString()}`
    }
    const response = await fetch(url, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async assignResource(data: any) {
    const response = await fetch(`${API_URL}/resource-assignments/assignments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async updateResourceAssignment(id: string, data: any) {
    const response = await fetch(`${API_URL}/resource-assignments/assignments/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async removeResourceAssignment(id: string) {
    const response = await fetch(`${API_URL}/resource-assignments/assignments/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  // ============ INVOICES ============
  async getInvoices(params?: { status?: string, vendorId?: string, projectId?: string, startDate?: string, endDate?: string }) {
    let url = `${API_URL}/invoices`
    if (params) {
      const queryParams = new URLSearchParams()
      if (params.status) queryParams.append('status', params.status)
      if (params.vendorId) queryParams.append('vendorId', params.vendorId)
      if (params.projectId) queryParams.append('projectId', params.projectId)
      if (params.startDate) queryParams.append('startDate', params.startDate)
      if (params.endDate) queryParams.append('endDate', params.endDate)
      url += `?${queryParams.toString()}`
    }
    const response = await fetch(url, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async getInvoice(id: string) {
    const response = await fetch(`${API_URL}/invoices/${id}`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async createInvoice(data: any) {
    const response = await fetch(`${API_URL}/invoices`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async updateInvoice(id: string, data: any) {
    const response = await fetch(`${API_URL}/invoices/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async deleteInvoice(id: string) {
    const response = await fetch(`${API_URL}/invoices/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  // ============ PAYMENTS ============
  async getPayments(params?: { invoiceId?: string, status?: string, startDate?: string, endDate?: string }) {
    let url = `${API_URL}/payments`
    if (params) {
      const queryParams = new URLSearchParams()
      if (params.invoiceId) queryParams.append('invoiceId', params.invoiceId)
      if (params.status) queryParams.append('status', params.status)
      if (params.startDate) queryParams.append('startDate', params.startDate)
      if (params.endDate) queryParams.append('endDate', params.endDate)
      url += `?${queryParams.toString()}`
    }
    const response = await fetch(url, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async getPayment(id: string) {
    const response = await fetch(`${API_URL}/payments/${id}`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async createPayment(data: any) {
    const response = await fetch(`${API_URL}/payments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async updatePayment(id: string, data: any) {
    const response = await fetch(`${API_URL}/payments/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async deletePayment(id: string) {
    const response = await fetch(`${API_URL}/payments/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  // ============ EXPENSES ============
  async getExpenses(params?: { category?: string, projectId?: string, vendorId?: string, status?: string, startDate?: string, endDate?: string }) {
    let url = `${API_URL}/expenses`
    if (params) {
      const queryParams = new URLSearchParams()
      if (params.category) queryParams.append('category', params.category)
      if (params.projectId) queryParams.append('projectId', params.projectId)
      if (params.vendorId) queryParams.append('vendorId', params.vendorId)
      if (params.status) queryParams.append('status', params.status)
      if (params.startDate) queryParams.append('startDate', params.startDate)
      if (params.endDate) queryParams.append('endDate', params.endDate)
      url += `?${queryParams.toString()}`
    }
    const response = await fetch(url, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async getExpense(id: string) {
    const response = await fetch(`${API_URL}/expenses/${id}`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async createExpense(data: any) {
    const response = await fetch(`${API_URL}/expenses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async updateExpense(id: string, data: any) {
    const response = await fetch(`${API_URL}/expenses/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async deleteExpense(id: string) {
    const response = await fetch(`${API_URL}/expenses/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  // ============ BUDGET ============
  async getBudgetItems(params?: { fiscalYear?: number, projectId?: string, category?: string }) {
    let url = `${API_URL}/budget-items`
    if (params) {
      const queryParams = new URLSearchParams()
      if (params.fiscalYear) queryParams.append('fiscalYear', params.fiscalYear.toString())
      if (params.projectId) queryParams.append('projectId', params.projectId)
      if (params.category) queryParams.append('category', params.category)
      url += `?${queryParams.toString()}`
    }
    const response = await fetch(url, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async getBudgetItem(id: string) {
    const response = await fetch(`${API_URL}/budget-items/${id}`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async createBudgetItem(data: any) {
    const response = await fetch(`${API_URL}/budget-items`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async updateBudgetItem(id: string, data: any) {
    const response = await fetch(`${API_URL}/budget-items/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async deleteBudgetItem(id: string) {
    const response = await fetch(`${API_URL}/budget-items/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async getBudgetSummary(fiscalYear?: number) {
    let url = `${API_URL}/budget-summary`
    if (fiscalYear) {
      url += `?fiscalYear=${fiscalYear}`
    }
    const response = await fetch(url, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  // ============ DOCUMENTS ============
  async getDocuments(params?: { entityType?: string, entityId?: string, vendorId?: string, category?: string, search?: string }) {
    let url = `${API_URL}/documents`
    if (params) {
      const queryParams = new URLSearchParams()
      if (params.entityType) queryParams.append('entityType', params.entityType)
      if (params.entityId) queryParams.append('entityId', params.entityId)
      if (params.vendorId) queryParams.append('vendorId', params.vendorId)
      if (params.category) queryParams.append('category', params.category)
      if (params.search) queryParams.append('search', params.search)
      url += `?${queryParams.toString()}`
    }
    const response = await fetch(url, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async getDocument(id: string) {
    const response = await fetch(`${API_URL}/documents/${id}`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async createDocument(data: FormData) {
    const token = getToken()
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    const response = await fetch(`${API_URL}/documents`, {
      method: 'POST',
      headers,
      body: data
    })
    return handleResponse(response)
  },

  async updateDocument(id: string, data: any) {
    const response = await fetch(`${API_URL}/documents/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async deleteDocument(id: string) {
    const response = await fetch(`${API_URL}/documents/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async downloadDocument(id: string) {
    const response = await fetch(`${API_URL}/documents/${id}/download`, {
      headers: getHeaders()
    })
    if (!response.ok) {
      throw new Error('Failed to download document')
    }
    return response.blob()
  },

  // ============ REPORTS ============
  async getReports(params?: { type?: string, category?: string, status?: string, search?: string }) {
    let url = `${API_URL}/reports`
    if (params) {
      const queryParams = new URLSearchParams()
      if (params.type) queryParams.append('type', params.type)
      if (params.category) queryParams.append('category', params.category)
      if (params.status) queryParams.append('status', params.status)
      if (params.search) queryParams.append('search', params.search)
      url += `?${queryParams.toString()}`
    }
    const response = await fetch(url, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async getReport(id: string) {
    const response = await fetch(`${API_URL}/reports/${id}`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async createReport(data: any) {
    const response = await fetch(`${API_URL}/reports`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async updateReport(id: string, data: any) {
    const response = await fetch(`${API_URL}/reports/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async deleteReport(id: string) {
    const response = await fetch(`${API_URL}/reports/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async runReport(id: string, params?: any) {
    const response = await fetch(`${API_URL}/reports/${id}/run`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ params })
    })
    return handleResponse(response)
  },

  async exportReport(id: string, format: 'pdf' | 'csv' | 'excel' = 'pdf') {
    const response = await fetch(`${API_URL}/reports/${id}/export?format=${format}`, {
      headers: getHeaders()
    })
    if (!response.ok) {
      throw new Error('Failed to export report')
    }
    return response.blob()
  },

  async getReportCategories() {
    const response = await fetch(`${API_URL}/reports/categories`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  // ============ SETTINGS - COMPANY ============
  async getCompany(id: string) {
    const response = await fetch(`${API_URL}/companies/${id}`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async updateCompany(id: string, data: any) {
    const response = await fetch(`${API_URL}/companies/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async uploadCompanyLogo(id: string, formData: FormData) {
    const token = getToken()
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    const response = await fetch(`${API_URL}/companies/${id}/logo`, {
      method: 'POST',
      headers,
      body: formData
    })
    return handleResponse(response)
  },

  async getCompanySettings(id: string) {
    const response = await fetch(`${API_URL}/companies/${id}/settings`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async updateCompanySettings(id: string, data: any) {
    const response = await fetch(`${API_URL}/companies/${id}/settings`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  // ============ SETTINGS - TEAM ============
  async getTeamMembers() {
    const response = await fetch(`${API_URL}/team`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async getTeamMember(id: string) {
    const response = await fetch(`${API_URL}/team/${id}`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async inviteTeamMember(data: any) {
    const response = await fetch(`${API_URL}/team`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async updateTeamMember(id: string, data: any) {
    const response = await fetch(`${API_URL}/team/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async deleteTeamMember(id: string) {
    const response = await fetch(`${API_URL}/team/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async resendInvitation(id: string) {
    const response = await fetch(`${API_URL}/team/${id}/resend-invitation`, {
      method: 'POST',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  // ============ SETTINGS - ROLES ============
  async getRoles() {
    const response = await fetch(`${API_URL}/roles`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async getRole(id: string) {
    const response = await fetch(`${API_URL}/roles/${id}`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async createRole(data: any) {
    const response = await fetch(`${API_URL}/roles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async updateRole(id: string, data: any) {
    const response = await fetch(`${API_URL}/roles/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async deleteRole(id: string) {
    const response = await fetch(`${API_URL}/roles/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async getPermissions() {
    const response = await fetch(`${API_URL}/roles/permissions/all`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  // ============ SETTINGS - BILLING ============
  async getSubscription() {
    const response = await fetch(`${API_URL}/billing/subscription`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async updateSubscription(data: any) {
    const response = await fetch(`${API_URL}/billing/subscription`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async getPaymentMethods() {
    const response = await fetch(`${API_URL}/billing/payment-methods`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async addPaymentMethod(paymentMethodId: string) {
    const response = await fetch(`${API_URL}/billing/payment-methods`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ paymentMethodId })
    })
    return handleResponse(response)
  },

  async setDefaultPaymentMethod(id: string) {
    const response = await fetch(`${API_URL}/billing/payment-methods/${id}/default`, {
      method: 'PUT',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async deletePaymentMethod(id: string) {
    const response = await fetch(`${API_URL}/billing/payment-methods/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async getInvoices() {
    const response = await fetch(`${API_URL}/billing/invoices`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async downloadInvoice(id: string) {
    const response = await fetch(`${API_URL}/billing/invoices/${id}/pdf`, {
      headers: getHeaders()
    })
    if (!response.ok) {
      throw new Error('Failed to download invoice')
    }
    return response.blob()
  },

  async getUsageStats() {
    const response = await fetch(`${API_URL}/billing/usage`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  // ============ SETTINGS - INTEGRATIONS ============
  async getIntegrations() {
    const response = await fetch(`${API_URL}/integrations`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async getIntegration(id: string) {
    const response = await fetch(`${API_URL}/integrations/${id}`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async createIntegration(data: any) {
    const response = await fetch(`${API_URL}/integrations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async updateIntegration(id: string, data: any) {
    const response = await fetch(`${API_URL}/integrations/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async toggleIntegration(id: string, isActive: boolean) {
    const response = await fetch(`${API_URL}/integrations/${id}/toggle`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ isActive })
    })
    return handleResponse(response)
  },

  async syncIntegration(id: string) {
    const response = await fetch(`${API_URL}/integrations/${id}/sync`, {
      method: 'POST',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async deleteIntegration(id: string) {
    const response = await fetch(`${API_URL}/integrations/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async getIntegrationCatalog() {
    const response = await fetch(`${API_URL}/integrations/catalog/all`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  // ============ NOTIFICATIONS ============
  async getNotifications(params?: { status?: 'unread' | 'read' | 'all', limit?: number, offset?: number }) {
    let url = `${API_URL}/notifications`
    if (params) {
      const queryParams = new URLSearchParams()
      if (params.status) queryParams.append('status', params.status)
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.offset) queryParams.append('offset', params.offset.toString())
      url += `?${queryParams.toString()}`
    }
    const response = await fetch(url, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async getNotification(id: string) {
    const response = await fetch(`${API_URL}/notifications/${id}`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async markNotificationAsRead(id: string) {
    const response = await fetch(`${API_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async markAllNotificationsAsRead() {
    const response = await fetch(`${API_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async deleteNotification(id: string) {
    const response = await fetch(`${API_URL}/notifications/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async getUnreadCount() {
    const response = await fetch(`${API_URL}/notifications/unread-count`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  // ============ PERMISSIONS ============
  async getPermissions() {
    const response = await fetch(`${API_URL}/permissions`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async getPermission(id: string) {
    const response = await fetch(`${API_URL}/permissions/${id}`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async createPermission(data: any) {
    const response = await fetch(`${API_URL}/permissions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async updatePermission(id: string, data: any) {
    const response = await fetch(`${API_URL}/permissions/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async deletePermission(id: string) {
    const response = await fetch(`${API_URL}/permissions/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  // ============ ROLE PERMISSIONS ============
  async getRolePermissions(roleId: string) {
    const response = await fetch(`${API_URL}/roles/${roleId}/permissions`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async assignPermissionToRole(roleId: string, permissionId: string) {
    const response = await fetch(`${API_URL}/roles/${roleId}/permissions/${permissionId}`, {
      method: 'POST',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async removePermissionFromRole(roleId: string, permissionId: string) {
    const response = await fetch(`${API_URL}/roles/${roleId}/permissions/${permissionId}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async updateRolePermissions(roleId: string, permissionIds: string[]) {
    const response = await fetch(`${API_URL}/roles/${roleId}/permissions`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ permissionIds })
    })
    return handleResponse(response)
  },

  // ============ VENDOR PORTAL ============
  async getVendorDashboard() {
    const response = await fetch(`${API_URL}/vendor/dashboard/stats`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async getVendorActivity() {
    const response = await fetch(`${API_URL}/vendor/dashboard/activity`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  // Vendor Invoices
  async getVendorInvoices() {
    const response = await fetch(`${API_URL}/vendor/invoices`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async getVendorInvoice(id: string) {
    const response = await fetch(`${API_URL}/vendor/invoices/${id}`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async createVendorInvoice(data: any) {
    const response = await fetch(`${API_URL}/vendor/invoices`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  // Vendor Orders
  async getVendorOrders() {
    const response = await fetch(`${API_URL}/vendor/orders`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async getVendorOrder(id: string) {
    const response = await fetch(`${API_URL}/vendor/orders/${id}`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  // Vendor Profile
  async getVendorProfile() {
    const response = await fetch(`${API_URL}/vendor/profile`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async updateVendorProfile(data: any) {
    const response = await fetch(`${API_URL}/vendor/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  // Vendor Documents
  async getVendorDocuments() {
    const response = await fetch(`${API_URL}/vendor/documents`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async uploadVendorDocument(formData: FormData) {
    const token = getToken()
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    const response = await fetch(`${API_URL}/vendor/documents/upload`, {
      method: 'POST',
      headers,
      body: formData
    })
    return handleResponse(response)
  },

  async deleteVendorDocument(id: string) {
    const response = await fetch(`${API_URL}/vendor/documents/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  // Vendor Notifications
  async getVendorNotifications() {
    const response = await fetch(`${API_URL}/vendor/notifications`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async markVendorNotificationRead(id: string) {
    const response = await fetch(`${API_URL}/vendor/notifications/${id}/read`, {
      method: 'PUT',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async markAllVendorNotificationsRead() {
    const response = await fetch(`${API_URL}/vendor/notifications/read-all`, {
      method: 'PUT',
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  // Vendor Messages
  async getVendorMessages() {
    const response = await fetch(`${API_URL}/vendor/messages`, {
      headers: getHeaders()
    })
    return handleResponse(response)
  },

  async sendVendorMessage(data: any) {
    const response = await fetch(`${API_URL}/vendor/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async markVendorMessageRead(id: string) {
    const response = await fetch(`${API_URL}/vendor/messages/${id}/read`, {
      method: 'PUT',
      headers: getHeaders()
    })
    return handleResponse(response)
  },
async processVendorUpload(fileId: string, fileName: string) {
  const response = await fetch(`${API_URL}/vendors/upload/process/${fileId}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ fileName })
  })
  return handleResponse(response)
},
}
