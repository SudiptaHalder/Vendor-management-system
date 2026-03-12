// import express from 'express'
// import cors from 'cors'
// import helmet from 'helmet'
// import compression from 'compression'
// import rateLimit from 'express-rate-limit'
// import dotenv from 'dotenv'
// import path from 'path'

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

// // Vendor Auth Routes (for vendor portal) - IMPORTANT: These need to be public
// import vendorAuthRoutes from './routes/vendor/auth.routes'

// // Middleware
// import { errorHandler } from './middleware/error.middleware'
// import { authMiddleware } from './middleware/auth.middleware'
// import vendorMasterUploadRoutes from './routes/vendor/master-upload.routes'

// dotenv.config()

// const app = express()
// const PORT = process.env.PORT || 3001

// // Create uploads directory if it doesn't exist
// import fs from 'fs'
// const uploadsDir = path.join(__dirname, '../uploads')
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true })
// }

// async function testDatabaseConnection() {
//   try {
//     await prisma.$queryRaw`SELECT 1`
//     console.log('✅ Database connected successfully')
//   } catch (error) {
//     console.error('❌ Database connection failed:', error)
//   }
// }

// testDatabaseConnection()

// app.use(helmet())
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//   credentials: true,
// }))
// app.use(compression())
// app.use(express.json())
// app.use(express.urlencoded({ extended: true }))

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100
// })
// app.use('/api/', limiter)

// // ============= PUBLIC ROUTES (NO AUTH REQUIRED) =============
// app.use('/api/auth', authRoutes)
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'ok', timestamp: new Date().toISOString() })
// })

// // Vendor public routes - THESE MUST BE BEFORE AUTH MIDDLEWARE
// app.use('/api/vendor', vendorAuthRoutes)  // <-- MOVED HERE before auth middleware

// // ============= AUTH MIDDLEWARE - ALL ROUTES BELOW REQUIRE AUTH =============
// app.use('/api/*', authMiddleware)

// // ============= PROTECTED ROUTES (AUTH REQUIRED) =============
// app.use('/api/vendors', vendorRoutes)
// app.use('/api/categories', categoryRoutes)
// app.use('/api/approvals', approvalRoutes)

// // Procurement Routes
// app.use('/api/purchase-orders', purchaseOrderRoutes)
// app.use('/api/rfqs', rfqRoutes)
// app.use('/api/quotes', quoteRoutes)
// app.use('/api/contracts', contractRoutes)
// app.use('/api/bids', bidRoutes)

// // Vendor Upload Routes
// app.use('/api/vendors/upload', vendorUploadRoutes)
// app.use('/api/vendors/upload', vendorMasterUploadRoutes)
// app.use('*', (req, res) => {
//   res.status(404).json({ error: 'Endpoint not found' })
// })

// app.use(errorHandler)

// app.listen(PORT, () => {
//   console.log(`🚀 API server running on port ${PORT}`)
//   console.log(`📝 Health: http://localhost:${PORT}/api/health`)
//   console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`)
//   console.log(`🔑 Vendor Auth: http://localhost:${PORT}/api/vendor/verify-invitation`)
//   console.log(`👥 Vendors: http://localhost:${PORT}/api/vendors`)
//   console.log(`📁 Categories: http://localhost:${PORT}/api/categories`)
//   console.log(`✅ Approvals: http://localhost:${PORT}/api/approvals`)
//   console.log(`📦 Purchase Orders: http://localhost:${PORT}/api/purchase-orders`)
//   console.log(`📋 RFQs: http://localhost:${PORT}/api/rfqs`)
//   console.log(`💬 Quotes: http://localhost:${PORT}/api/quotes`)
//   console.log(`📄 Contracts: http://localhost:${PORT}/api/contracts`)
//   console.log(`🔨 Bids: http://localhost:${PORT}/api/bids`)
//   console.log(`📤 Upload: http://localhost:${PORT}/api/vendors/upload`)
// })
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import path from 'path'

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

// Middleware
import { errorHandler } from './middleware/error.middleware'
import { authMiddleware } from './middleware/auth.middleware'
import vendorManagementRoutes from './routes/vendor/management.routes'
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Create uploads directory if it doesn't exist
import fs from 'fs'
const uploadsDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

async function testDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connected successfully')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  }
}

testDatabaseConnection()

app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Find this section and update it
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increase from 100 to 200
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// ============= PUBLIC ROUTES (NO AUTH REQUIRED) =============
app.use('/api/auth', authRoutes)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Vendor public routes (verify invitation, set password) - NO AUTH REQUIRED
app.use('/api/vendor/public', vendorAuthRoutes)

// ============= AUTH MIDDLEWARE - APPLIED TO ALL /API ROUTES FROM HERE =============
app.use('/api/*', authMiddleware)

// ============= PROTECTED ROUTES (AUTH REQUIRED) =============
app.use('/api/vendors', vendorRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/approvals', approvalRoutes)

// Procurement Routes
app.use('/api/purchase-orders', purchaseOrderRoutes)
app.use('/api/rfqs', rfqRoutes)
app.use('/api/quotes', quoteRoutes)
app.use('/api/contracts', contractRoutes)
app.use('/api/bids', bidRoutes)

// Vendor Upload Routes - Organized by type
app.use('/api/vendors/upload/po', vendorUploadRoutes)        // For PO uploads
app.use('/api/vendors/upload/master', vendorMasterUploadRoutes) // For master data uploads
app.use('/api/vendor-management', vendorManagementRoutes)
// Protected vendor routes (require auth)
app.use('/api/vendor', vendorAuthRoutes)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 API server running on port ${PORT}`)
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
})