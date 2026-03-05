
// import express from 'express'
// import cors from 'cors'
// import helmet from 'helmet'
// import compression from 'compression'
// import rateLimit from 'express-rate-limit'
// import dotenv from 'dotenv'
// import path from 'path'
// import fs from 'fs'

// import { prisma } from '@vendor-management/database'

// // ============ AUTH & CORE ROUTES ============
// import authRoutes from './routes/auth.routes'
// import userRoutes from './routes/user.routes'

// // ============ VENDOR MANAGEMENT ROUTES ============
// import vendorRoutes from './routes/vendor.routes'
// import categoryRoutes from './routes/category.routes'
// import approvalRoutes from './routes/approval.routes'

// // ============ PROCUREMENT ROUTES ============
// import purchaseOrderRoutes from './routes/purchaseOrder.routes'
// import rfqRoutes from './routes/rfq.routes'
// import quoteRoutes from './routes/quote.routes'
// import contractRoutes from './routes/contract.routes'
// import bidRoutes from './routes/bid.routes'

// // ============ PROJECT MANAGEMENT ROUTES ============
// import projectRoutes from './routes/project.routes'
// import workOrderRoutes from './routes/workOrder.routes'
// import scheduleRoutes from './routes/schedule.routes'
// import resourceRoutes from './routes/resource.routes'

// // ============ FINANCE ROUTES ============
// import invoiceRoutes from './routes/invoice.routes'
// import paymentRoutes from './routes/payment.routes'
// import expenseRoutes from './routes/expense.routes'
// import budgetRoutes from './routes/budget.routes'

// // ============ DOCUMENTS ROUTES ============
// import documentRoutes from './routes/document.routes'

// // ============ REPORTS ROUTES ============
// import reportRoutes from './routes/report.routes'

// // ============ SETTINGS ROUTES ============
// import companyRoutes from './routes/company.routes'
// import teamRoutes from './routes/team.routes'
// import roleRoutes from './routes/role.routes'
// import billingRoutes from './routes/billing.routes'
// import integrationRoutes from './routes/integration.routes'
// import notificationRoutes from './routes/notification.routes'
// // ============ MIDDLEWARE ============
// import { errorHandler } from './middleware/error.middleware'
// import { authMiddleware } from './middleware/auth.middleware'
// import permissionRoutes from './routes/permission.routes'
// import demoRoutes from './routes/demo.routes'

// dotenv.config()

// const app = express()
// const PORT = process.env.PORT || 3001

// // ============ DATABASE CONNECTION ============
// async function testDatabaseConnection() {
//   try {
//     await prisma.$queryRaw`SELECT 1`
//     console.log('✅ Database connected successfully')
//   } catch (error) {
//     console.error('❌ Database connection failed:', error)
//     process.exit(1)
//   }
// }

// testDatabaseConnection()

// // ============ GLOBAL MIDDLEWARE ============
// app.use(helmet({
//   crossOriginResourcePolicy: { policy: "cross-origin" },
//   crossOriginEmbedderPolicy: false
// }))

// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }))

// app.use(compression())
// app.use(express.json({ limit: '10mb' }))
// app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.'
// })
// app.use('/api/', limiter)

// // ============ PUBLIC ROUTES ============
// app.use('/api/auth', authRoutes)
// app.get('/api/health', (req, res) => {
//   res.json({ 
//     status: 'ok', 
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV || 'development'
//   })
// })

// // ============ PROTECTED ROUTES - AUTH MIDDLEWARE ============
// app.use('/api/*', authMiddleware)

// // ============ VENDOR MANAGEMENT ROUTES ============
// app.use('/api/vendors', vendorRoutes)
// app.use('/api/categories', categoryRoutes)
// app.use('/api/approvals', approvalRoutes)

// // ============ PROCUREMENT ROUTES ============
// app.use('/api/purchase-orders', purchaseOrderRoutes)
// app.use('/api/rfqs', rfqRoutes)
// app.use('/api/quotes', quoteRoutes)
// app.use('/api/contracts', contractRoutes)
// app.use('/api/bids', bidRoutes)

// // ============ PROJECT MANAGEMENT ROUTES ============
// app.use('/api/projects', projectRoutes)
// app.use('/api/work-orders', workOrderRoutes)
// app.use('/api/schedules', scheduleRoutes)
// app.use('/api/resources', resourceRoutes)
// app.use('/api/resource-assignments', resourceRoutes) // Same router, different endpoint

// // ============ FINANCE ROUTES ============
// app.use('/api/invoices', invoiceRoutes)
// app.use('/api/payments', paymentRoutes)
// app.use('/api/expenses', expenseRoutes)
// app.use('/api/budget-items', budgetRoutes)
// app.use('/api/budget-summary', budgetRoutes) // Same router, different endpoint

// // ============ DOCUMENTS ROUTES ============
// app.use('/api/documents', documentRoutes)

// // ============ REPORTS ROUTES ============
// app.use('/api/reports', reportRoutes)

// // ============ SETTINGS ROUTES ============
// app.use('/api/companies', companyRoutes)
// app.use('/api/team', teamRoutes)
// app.use('/api/roles', roleRoutes)
// app.use('/api/billing', billingRoutes)
// app.use('/api/integrations', integrationRoutes)

// // ============ USER MANAGEMENT ROUTES ============
// app.use('/api/users', userRoutes)
// app.use('/api/notifications', notificationRoutes)
// app.use('/api/demo', demoRoutes)

// // ============ STATIC FILES (for uploaded documents and logos) ============
// const uploadsPath = path.join(__dirname, '../../uploads')
// const logosPath = path.join(__dirname, '../../uploads/logos')

// // Ensure upload directories exist
// if (!fs.existsSync(uploadsPath)) {
//   fs.mkdirSync(uploadsPath, { recursive: true })
//   console.log('✅ Created uploads directory')
// }
// if (!fs.existsSync(logosPath)) {
//   fs.mkdirSync(logosPath, { recursive: true })
//   console.log('✅ Created logos directory')
// }

// // Serve uploaded files statically with proper headers
// app.use('/uploads', express.static(uploadsPath, {
//   setHeaders: (res, filepath) => {
//     res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000')
//     res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
//     res.setHeader('Access-Control-Allow-Credentials', 'true')
//     res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
//     res.setHeader('Cache-Control', 'public, max-age=31536000')
//   }
// }))

// // Add OPTIONS handler for preflight requests
// app.options('/uploads/*', (req, res) => {
//   res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000')
//   res.header('Access-Control-Allow-Methods', 'GET, OPTIONS')
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
//   res.header('Access-Control-Allow-Credentials', 'true')
//   res.status(200).end()
// })

// // ============ 404 HANDLER ============
// app.use('*', (req, res) => {
//   res.status(404).json({ 
//     success: false,
//     error: 'Endpoint not found',
//     path: req.originalUrl
//   })
// })

// // ============ ERROR HANDLER ============
// app.use(errorHandler)
// app.use('/api/permissions', permissionRoutes)
// // ============ START SERVER ============
// app.listen(PORT, () => {
//   console.log('\n=========================================')
//   console.log(`🚀  VendorFlow API Server`)
//   console.log(`=========================================`)
//   console.log(`📡  Port:        ${PORT}`)
//   console.log(`🌍  Environment: ${process.env.NODE_ENV || 'development'}`)
//   console.log(`🕒  Started:     ${new Date().toLocaleString()}`)
//   console.log(`=========================================`)
//   console.log(`📝  Health:      http://localhost:${PORT}/api/health`)
//   console.log(`🔐  Auth:        http://localhost:${PORT}/api/auth`)
//   console.log(`=========================================`)
//   console.log(`👥  Vendors:     http://localhost:${PORT}/api/vendors`)
//   console.log(`📁  Categories:  http://localhost:${PORT}/api/categories`)
//   console.log(`✅  Approvals:   http://localhost:${PORT}/api/approvals`)
//   console.log(`=========================================`)
//   console.log(`📦  POs:         http://localhost:${PORT}/api/purchase-orders`)
//   console.log(`📋  RFQs:        http://localhost:${PORT}/api/rfqs`)
//   console.log(`💬  Quotes:      http://localhost:${PORT}/api/quotes`)
//   console.log(`📄  Contracts:   http://localhost:${PORT}/api/contracts`)
//   console.log(`🔨  Bids:        http://localhost:${PORT}/api/bids`)
//   console.log(`=========================================`)
//   console.log(`🏗️  Projects:    http://localhost:${PORT}/api/projects`)
//   console.log(`🔧  Work Orders: http://localhost:${PORT}/api/work-orders`)
//   console.log(`📅  Schedules:   http://localhost:${PORT}/api/schedules`)
//   console.log(`🛠️  Resources:   http://localhost:${PORT}/api/resources`)
//   console.log(`📎  Assignments: http://localhost:${PORT}/api/resource-assignments`)
//   console.log(`=========================================`)
//   console.log(`📊  Invoices:    http://localhost:${PORT}/api/invoices`)
//   console.log(`💰  Payments:    http://localhost:${PORT}/api/payments`)
//   console.log(`🧾  Expenses:    http://localhost:${PORT}/api/expenses`)
//   console.log(`📈  Budget:      http://localhost:${PORT}/api/budget-items`)
//   console.log(`📉  Budget Sum:  http://localhost:${PORT}/api/budget-summary`)
//   console.log(`=========================================`)
//   console.log(`📄  Documents:   http://localhost:${PORT}/api/documents`)
//   console.log(`📂  Uploads:     http://localhost:${PORT}/uploads`)
//   console.log(`=========================================`)
//   console.log(`📊  Reports:     http://localhost:${PORT}/api/reports`)
//   console.log(`=========================================`)
//   console.log(`🏢  Companies:   http://localhost:${PORT}/api/companies`)
//   console.log(`👥  Team:        http://localhost:${PORT}/api/team`)
//   console.log(`🛡️  Roles:       http://localhost:${PORT}/api/roles`)
//   console.log(`💰  Billing:     http://localhost:${PORT}/api/billing`)
//   console.log(`🔌  Integrations: http://localhost:${PORT}/api/integrations`)
//   console.log(`=========================================`)
//   console.log(`👤  Users:       http://localhost:${PORT}/api/users`)
//   console.log(`=========================================\n`)
// console.log(`🔔  Notifications: http://localhost:${PORT}/api/notifications`)
// })

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

import { prisma } from '@vendor-management/database'

// ============ AUTH & CORE ROUTES ============
import authRoutes from './routes/auth.routes'
import userRoutes from './routes/user.routes'

// ============ VENDOR MANAGEMENT ROUTES ============
import vendorRoutes from './routes/vendor.routes'
import categoryRoutes from './routes/category.routes'
import approvalRoutes from './routes/approval.routes'

// ============ PROCUREMENT ROUTES ============
import purchaseOrderRoutes from './routes/purchaseOrder.routes'
import rfqRoutes from './routes/rfq.routes'
import quoteRoutes from './routes/quote.routes'
import contractRoutes from './routes/contract.routes'
import bidRoutes from './routes/bid.routes'

// ============ PROJECT MANAGEMENT ROUTES ============
import projectRoutes from './routes/project.routes'
import workOrderRoutes from './routes/workOrder.routes'
import scheduleRoutes from './routes/schedule.routes'
import resourceRoutes from './routes/resource.routes'

// ============ FINANCE ROUTES ============
import invoiceRoutes from './routes/invoice.routes'
import paymentRoutes from './routes/payment.routes'
import expenseRoutes from './routes/expense.routes'
import budgetRoutes from './routes/budget.routes'

// ============ DOCUMENTS ROUTES ============
import documentRoutes from './routes/document.routes'

// ============ REPORTS ROUTES ============
import reportRoutes from './routes/report.routes'

// ============ SETTINGS ROUTES ============
import companyRoutes from './routes/company.routes'
import teamRoutes from './routes/team.routes'
import roleRoutes from './routes/role.routes'
import billingRoutes from './routes/billing.routes'
import integrationRoutes from './routes/integration.routes'
import notificationRoutes from './routes/notification.routes'
import permissionRoutes from './routes/permission.routes'
import demoRoutes from './routes/demo.routes'

// ============ MIDDLEWARE ============
import { errorHandler } from './middleware/error.middleware'
import { authMiddleware } from './middleware/auth.middleware'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// ============ DATABASE CONNECTION ============
async function testDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connected successfully')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  }
}

testDatabaseConnection()

// ============ GLOBAL MIDDLEWARE ============
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}))

// ✅ FIXED CORS CONFIGURATION
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-company-id']
}))

// ✅ Handle preflight OPTIONS requests for all routes
app.options('*', cors())

app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use('/api/', limiter)

// ============ PUBLIC ROUTES (NO AUTH) ============
app.use('/api/auth', authRoutes)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// ✅ CRITICAL FIX: Handle OPTIONS preflight requests for ALL API routes BEFORE auth
app.options('/api/*', (req, res) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id, x-company-id')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.status(200).end()
})

// ============ PROTECTED ROUTES - AUTH MIDDLEWARE ============
// All routes after this point require authentication
app.use('/api/*', authMiddleware)

// ============ VENDOR MANAGEMENT ROUTES ============
app.use('/api/vendors', vendorRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/approvals', approvalRoutes)

// ============ PROCUREMENT ROUTES ============
app.use('/api/purchase-orders', purchaseOrderRoutes)
app.use('/api/rfqs', rfqRoutes)
app.use('/api/quotes', quoteRoutes)
app.use('/api/contracts', contractRoutes)
app.use('/api/bids', bidRoutes)

// ============ PROJECT MANAGEMENT ROUTES ============
app.use('/api/projects', projectRoutes)
app.use('/api/work-orders', workOrderRoutes)
app.use('/api/schedules', scheduleRoutes)
app.use('/api/resources', resourceRoutes)
app.use('/api/resource-assignments', resourceRoutes) // Same router, different endpoint

// ============ FINANCE ROUTES ============
app.use('/api/invoices', invoiceRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/budget-items', budgetRoutes)
app.use('/api/budget-summary', budgetRoutes) // Same router, different endpoint

// ============ DOCUMENTS ROUTES ============
app.use('/api/documents', documentRoutes)

// ============ REPORTS ROUTES ============
app.use('/api/reports', reportRoutes)

// ============ SETTINGS ROUTES ============
app.use('/api/companies', companyRoutes)
app.use('/api/team', teamRoutes)
app.use('/api/roles', roleRoutes)
app.use('/api/billing', billingRoutes)
app.use('/api/integrations', integrationRoutes)

// ============ USER MANAGEMENT ROUTES ============
app.use('/api/users', userRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/demo', demoRoutes)
app.use('/api/permissions', permissionRoutes)

// ============ STATIC FILES (for uploaded documents and logos) ============
const uploadsPath = path.join(__dirname, '../../uploads')
const logosPath = path.join(__dirname, '../../uploads/logos')

// Ensure upload directories exist
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true })
  console.log('✅ Created uploads directory')
}
if (!fs.existsSync(logosPath)) {
  fs.mkdirSync(logosPath, { recursive: true })
  console.log('✅ Created logos directory')
}

// Serve uploaded files statically with proper headers
app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res, filepath) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    res.setHeader('Cache-Control', 'public, max-age=31536000')
  }
}))

// Add OPTIONS handler for preflight requests
app.options('/uploads/*', (req, res) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000')
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.status(200).end()
})

// ============ 404 HANDLER ============
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  })
})

// ============ ERROR HANDLER ============
app.use(errorHandler)

// ============ START SERVER ============
app.listen(PORT, () => {
  console.log('\n=========================================')
  console.log(`🚀  VendorFlow API Server`)
  console.log(`=========================================`)
  console.log(`📡  Port:        ${PORT}`)
  console.log(`🌍  Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🕒  Started:     ${new Date().toLocaleString()}`)
  console.log(`=========================================`)
  console.log(`📝  Health:      http://localhost:${PORT}/api/health`)
  console.log(`🔐  Auth:        http://localhost:${PORT}/api/auth`)
  console.log(`=========================================`)
  console.log(`👥  Vendors:     http://localhost:${PORT}/api/vendors`)
  console.log(`📁  Categories:  http://localhost:${PORT}/api/categories`)
  console.log(`✅  Approvals:   http://localhost:${PORT}/api/approvals`)
  console.log(`=========================================`)
  console.log(`📦  POs:         http://localhost:${PORT}/api/purchase-orders`)
  console.log(`📋  RFQs:        http://localhost:${PORT}/api/rfqs`)
  console.log(`💬  Quotes:      http://localhost:${PORT}/api/quotes`)
  console.log(`📄  Contracts:   http://localhost:${PORT}/api/contracts`)
  console.log(`🔨  Bids:        http://localhost:${PORT}/api/bids`)
  console.log(`=========================================`)
  console.log(`🏗️  Projects:    http://localhost:${PORT}/api/projects`)
  console.log(`🔧  Work Orders: http://localhost:${PORT}/api/work-orders`)
  console.log(`📅  Schedules:   http://localhost:${PORT}/api/schedules`)
  console.log(`🛠️  Resources:   http://localhost:${PORT}/api/resources`)
  console.log(`📎  Assignments: http://localhost:${PORT}/api/resource-assignments`)
  console.log(`=========================================`)
  console.log(`📊  Invoices:    http://localhost:${PORT}/api/invoices`)
  console.log(`💰  Payments:    http://localhost:${PORT}/api/payments`)
  console.log(`🧾  Expenses:    http://localhost:${PORT}/api/expenses`)
  console.log(`📈  Budget:      http://localhost:${PORT}/api/budget-items`)
  console.log(`📉  Budget Sum:  http://localhost:${PORT}/api/budget-summary`)
  console.log(`=========================================`)
  console.log(`📄  Documents:   http://localhost:${PORT}/api/documents`)
  console.log(`📂  Uploads:     http://localhost:${PORT}/uploads`)
  console.log(`=========================================`)
  console.log(`📊  Reports:     http://localhost:${PORT}/api/reports`)
  console.log(`=========================================`)
  console.log(`🏢  Companies:   http://localhost:${PORT}/api/companies`)
  console.log(`👥  Team:        http://localhost:${PORT}/api/team`)
  console.log(`🛡️  Roles:       http://localhost:${PORT}/api/roles`)
  console.log(`💰  Billing:     http://localhost:${PORT}/api/billing`)
  console.log(`🔌  Integrations: http://localhost:${PORT}/api/integrations`)
  console.log(`🔔  Notifications: http://localhost:${PORT}/api/notifications`)
  console.log(`📝  Permissions: http://localhost:${PORT}/api/permissions`)
  console.log(`🎯  Demo:        http://localhost:${PORT}/api/demo`)
  console.log(`=========================================`)
  console.log(`👤  Users:       http://localhost:${PORT}/api/users`)
  console.log(`=========================================\n`)
})
// Vendor Routes
import vendorDashboardRoutes from './routes/vendor/dashboard.routes'
import vendorInvoicesRoutes from './routes/vendor/invoices.routes'
import vendorOrdersRoutes from './routes/vendor/orders.routes'
import vendorProfileRoutes from './routes/vendor/profile.routes'
import vendorDocumentsRoutes from './routes/vendor/documents.routes'
import vendorNotificationsRoutes from './routes/vendor/notifications.routes'
import vendorMessagesRoutes from './routes/vendor/messages.routes'

// Vendor routes
app.use('/api/vendor/dashboard', vendorDashboardRoutes)
app.use('/api/vendor/invoices', vendorInvoicesRoutes)
app.use('/api/vendor/orders', vendorOrdersRoutes)
app.use('/api/vendor/profile', vendorProfileRoutes)
app.use('/api/vendor/documents', vendorDocumentsRoutes)
app.use('/api/vendor/notifications', vendorNotificationsRoutes)
app.use('/api/vendor/messages', vendorMessagesRoutes)
