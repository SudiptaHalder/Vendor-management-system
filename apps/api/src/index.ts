// import dotenv from 'dotenv'
// dotenv.config()

// import express from 'express'
// import cors from 'cors'
// import helmet from 'helmet'
// import compression from 'compression'
// import rateLimit from 'express-rate-limit'
// import path from 'path'
// import fs from 'fs'

// import { prisma } from '@vendor-management/database'

// // Routes
// import authRoutes from './routes/auth.routes'
// import vendorRoutes from './routes/vendor.routes'
// import categoryRoutes from './routes/category.routes'
// import approvalRoutes from './routes/approval.routes'

// // Procurement Routes
// import purchaseOrderRoutes from './routes/purchaseOrder.routes'
// import rfqRoutes from './routes/rfq.routes'
// import quoteRoutes from './routes/quote.routes'
// import contractRoutes from './routes/contract.routes'
// import bidRoutes from './routes/bid.routes'

// // Vendor Upload Routes
// import vendorUploadRoutes from './routes/vendor/upload.routes'

// // Vendor Master Upload Routes
// import vendorMasterUploadRoutes from './routes/vendor/master-upload.routes'
// import adminSyncRoutes from './routes/adminSyncRoutes';
// // Vendor Auth Routes (for vendor portal)
// import vendorAuthRoutes from './routes/vendor/auth.routes'
// import poUploadRoutes from './routes/po-upload.routes'

// // Middleware
// import { errorHandler } from './middleware/error.middleware'
// import { authMiddleware } from './middleware/auth.middleware'
// import vendorManagementRoutes from './routes/vendor/management.routes'
// import sapSyncRoutes from './routes/sapSyncRoutes';
// // SAP Integration Routes
// import sapRoutes from './routes/sap.routes'
// import { SAPSyncService } from './services/sap/sapSyncService'
// import erpRoutes from './routes/erp.routes';
// const app = express()
// const PORT = process.env.PORT || 3001

// // Create uploads directory if it doesn't exist
// const uploadsDir = path.join(__dirname, '../uploads')
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true })
// }

// // Database connection test
// async function testDatabaseConnection() {
//   try {
//     await prisma.$queryRaw`SELECT 1`
//     console.log('✅ Database connected successfully')
//   } catch (error) {
//     console.error('❌ Database connection failed:', error)
//   }
// }

// testDatabaseConnection()

// // Middleware
// app.use(helmet())
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//   credentials: true,
// }))
// app.use(compression())
// app.use(express.json())
// app.use(express.urlencoded({ extended: true }))

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 200,
//   message: 'Too many requests from this IP, please try again later.',
//   standardHeaders: true,
//   legacyHeaders: false,
// })

// app.use('/api/', limiter)

// // ============= PUBLIC ROUTES (NO AUTH REQUIRED) =============
// app.use('/api/auth', authRoutes)
// app.get('/api/health', (req, res) => {
//   res.json({ 
//     status: 'ok', 
//     timestamp: new Date().toISOString(),
//     services: {
//       database: 'connected',
//       sap: process.env.SAP_ENABLED === 'true' ? 'configured' : 'disabled'
//     }
//   })
// })

// app.use('/api/vendor/public', vendorAuthRoutes)

// // SAP Public Routes (NO AUTH REQUIRED) - Mount the entire router first, then we'll override protected routes
// // We'll mount at /api/sap and let the router handle which endpoints are public vs protected
// app.use('/api/sap', sapRoutes)

// // ============= AUTH MIDDLEWARE - APPLIED TO ALL PROTECTED ROUTES =============
// // Note: This will apply to all routes under /api/* that come after this point
// // But our SAP routes are already mounted above, so we need to be careful
// // Actually, let's keep SAP routes after auth for protected endpoints, but we'll have separate public endpoints
// app.use('/api/admin/sync', adminSyncRoutes);
// // Better approach: Mount protected routes after auth middleware
// app.use('/api/*', authMiddleware)
// app.use('/api/sap-sync', sapSyncRoutes);
// // ============= PROTECTED ROUTES (AUTH REQUIRED) =============
// app.use('/api/vendors', vendorRoutes)
// app.use('/api/categories', categoryRoutes)
// app.use('/api/approvals', approvalRoutes)
// app.use('/api/purchase-orders', purchaseOrderRoutes)
// app.use('/api/rfqs', rfqRoutes)
// app.use('/api/quotes', quoteRoutes)
// app.use('/api/contracts', contractRoutes)
// app.use('/api/bids', bidRoutes)
// app.use('/api/vendors/upload/po', vendorUploadRoutes)
// app.use('/api/vendors/upload/master', vendorMasterUploadRoutes)
// app.use('/api/vendor-management', vendorManagementRoutes)
// app.use('/api/po-upload', poUploadRoutes)
// app.use('/api/vendor', vendorAuthRoutes)
// app.use('/api/erp', erpRoutes);
// // SAP Background Sync
// if (process.env.SAP_ENABLED === 'true') {
//   try {
//     const sapSyncService = new SAPSyncService()
//     setTimeout(() => {
//       console.log('🔄 Starting SAP background sync service...')
//       sapSyncService.startBackgroundSync()
//     }, 5000)
//   } catch (error) {
//     console.error('❌ Failed to initialize SAP service:', error.message)
//   }
// } else {
//   console.log('ℹ️ SAP integration is disabled. Set SAP_ENABLED=true to enable.')
// }

// // 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({ error: 'Endpoint not found' })
// })

// app.use(errorHandler)

// app.listen(PORT, () => {
//   console.log(`\n🚀 API server running on port ${PORT}`)
//   console.log(`📝 Health: http://localhost:${PORT}/api/health`)
//   console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`)
//   console.log(`🔑 Vendor Public: http://localhost:${PORT}/api/vendor/public/verify-invitation`)
//   console.log(`👥 Vendors: http://localhost:${PORT}/api/vendors`)
//   console.log(`📁 Categories: http://localhost:${PORT}/api/categories`)
//   console.log(`✅ Approvals: http://localhost:${PORT}/api/approvals`)
//   console.log(`📦 Purchase Orders: http://localhost:${PORT}/api/purchase-orders`)
//   console.log(`📋 RFQs: http://localhost:${PORT}/api/rfqs`)
//   console.log(`💬 Quotes: http://localhost:${PORT}/api/quotes`)
//   console.log(`📄 Contracts: http://localhost:${PORT}/api/contracts`)
//   console.log(`🔨 Bids: http://localhost:${PORT}/api/bids`)
//   console.log(`📤 PO Upload: http://localhost:${PORT}/api/vendors/upload/po`)
//   console.log(`📤 Master Upload: http://localhost:${PORT}/api/vendors/upload/master`)
  
//   if (process.env.SAP_ENABLED === 'true') {
//     console.log(`🔄 SAP Integration: ENABLED`)
//     console.log(`🔄 SAP Debug (public): http://localhost:${PORT}/api/sap/debug`)
//     console.log(`🔄 SAP Test (public): http://localhost:${PORT}/api/sap/test`)
//     console.log(`🔄 SAP Sync (protected): http://localhost:${PORT}/api/sap/sync/status`)
//   } else {
//     console.log(`🔄 SAP Integration: DISABLED (set SAP_ENABLED=true to enable)`)
//   }
// })

// export default app

import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import path from 'path'
import fs from 'fs'

import { prisma } from '@vendor-management/database'

// Routes
import authRoutes from './routes/auth.routes'
import vendorRoutes from './routes/vendor.routes'
import categoryRoutes from './routes/category.routes'
import approvalRoutes from './routes/approval.routes'

// Procurement Routes
import purchaseOrderRoutes from './routes/purchaseOrder.routes'
import rfqRoutes from './routes/rfq.routes'
import quoteRoutes from './routes/quote.routes'
import contractRoutes from './routes/contract.routes'
import bidRoutes from './routes/bid.routes'

// Vendor Upload Routes
import vendorUploadRoutes from './routes/vendor/upload.routes'

// Vendor Master Upload Routes
import vendorMasterUploadRoutes from './routes/vendor/master-upload.routes'

// Vendor Auth Routes (for vendor portal)
import vendorAuthRoutes from './routes/vendor/auth.routes'
import poUploadRoutes from './routes/po-upload.routes'

// Middleware
import { errorHandler } from './middleware/error.middleware'
import { authMiddleware } from './middleware/auth.middleware'
import vendorManagementRoutes from './routes/vendor/management.routes'

// SAP Integration Routes
import sapRoutes from './routes/sap.routes'
import { SAPSyncService } from './services/sap/sapSyncService'
import erpRoutes from './routes/erp.routes'

import sapVendorDirectRoutes from './routes/sapVendorDirectRoutes';
import sapPurchaseOrderRoutes from './routes/sapPurchaseOrderRoutes';
// Admin Sync Routes
import adminSyncRoutes from './routes/adminSyncRoutes'
import sapInvitationRoutes from './routes/sapInvitation.routes';
const app = express()
const PORT = process.env.PORT || 3001

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Database connection test
async function testDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connected successfully')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  }
}

testDatabaseConnection()

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api/', limiter)
app.use('/api/sap', sapVendorDirectRoutes);
// ============= PUBLIC ROUTES (NO AUTH REQUIRED) =============
app.use('/api/auth', authRoutes)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      sap: process.env.SAP_ENABLED === 'true' ? 'configured' : 'disabled'
    }
  })
})

app.use('/api/vendor/public', vendorAuthRoutes)

// SAP Public Routes (NO AUTH REQUIRED)
app.use('/api/sap', sapRoutes)


app.use('/api/sap/invitations', sapInvitationRoutes);
// ============= AUTH MIDDLEWARE - APPLIED TO ALL PROTECTED ROUTES =============
app.use('/api/*', authMiddleware)

// ============= PROTECTED ROUTES (AUTH REQUIRED) =============
app.use('/api/vendors', vendorRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/approvals', approvalRoutes)
app.use('/api/purchase-orders', purchaseOrderRoutes)
app.use('/api/rfqs', rfqRoutes)
app.use('/api/quotes', quoteRoutes)
app.use('/api/contracts', contractRoutes)
app.use('/api/bids', bidRoutes)
app.use('/api/vendors/upload/po', vendorUploadRoutes)
app.use('/api/vendors/upload/master', vendorMasterUploadRoutes)
app.use('/api/vendor-management', vendorManagementRoutes)
app.use('/api/po-upload', poUploadRoutes)
app.use('/api/vendor', vendorAuthRoutes)
app.use('/api/erp', erpRoutes)
app.use('/api/sap', sapVendorDirectRoutes);
// Admin Sync Routes (Protected)
app.use('/api/admin/sync', adminSyncRoutes)
app.use('/api/sap/purchase-orders', sapPurchaseOrderRoutes);
// SAP Background Sync
if (process.env.SAP_ENABLED === 'true') {
  try {
    const sapSyncService = new SAPSyncService()
    setTimeout(() => {
      console.log('🔄 Starting SAP background sync service...')
      sapSyncService.startBackgroundSync()
    }, 5000)
  } catch (error) {
    console.error('❌ Failed to initialize SAP service:', error.message)
  }
} else {
  console.log('ℹ️ SAP integration is disabled. Set SAP_ENABLED=true to enable.')
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`\n🚀 API server running on port ${PORT}`)
  console.log(`📝 Health: http://localhost:${PORT}/api/health`)
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`)
  console.log(`🔑 Vendor Public: http://localhost:${PORT}/api/vendor/public/verify-invitation`)
  console.log(`👥 Vendors: http://localhost:${PORT}/api/vendors`)
  console.log(`📁 Categories: http://localhost:${PORT}/api/categories`)
  console.log(`✅ Approvals: http://localhost:${PORT}/api/approvals`)
  console.log(`📦 Purchase Orders: http://localhost:${PORT}/api/purchase-orders`)
  console.log(`📋 RFQs: http://localhost:${PORT}/api/rfqs`)
  console.log(`💬 Quotes: http://localhost:${PORT}/api/quotes`)
  console.log(`📄 Contracts: http://localhost:${PORT}/api/contracts`)
  console.log(`🔨 Bids: http://localhost:${PORT}/api/bids`)
  console.log(`📤 PO Upload: http://localhost:${PORT}/api/vendors/upload/po`)
  console.log(`📤 Master Upload: http://localhost:${PORT}/api/vendors/upload/master`)
  
  if (process.env.SAP_ENABLED === 'true') {
    console.log(`🔄 SAP Integration: ENABLED`)
    console.log(`🔄 SAP Debug (public): http://localhost:${PORT}/api/sap/debug`)
    console.log(`🔄 SAP Test (public): http://localhost:${PORT}/api/sap/test`)
    console.log(`🔄 SAP Sync (protected): http://localhost:${PORT}/api/sap/sync/status`)
  } else {
    console.log(`🔄 SAP Integration: DISABLED (set SAP_ENABLED=true to enable)`)
  }
})

export default app
