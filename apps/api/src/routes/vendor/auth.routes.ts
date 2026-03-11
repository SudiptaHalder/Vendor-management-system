import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { vendorMiddleware } from '../../middleware/vendor.middleware'

const router = Router()

// ============= PUBLIC ROUTES (NO AUTH REQUIRED) =============

// Vendor login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    
    console.log('🔐 Vendor login attempt:', username)

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username and password are required' 
      })
    }

    const credentials = await prisma.vendor_credentials.findUnique({
      where: { username },
      include: { vendor: true }
    })

    if (!credentials) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      })
    }

    const isValid = await bcrypt.compare(password, credentials.password)
    if (!isValid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      })
    }

    await prisma.vendor_credentials.update({
      where: { id: credentials.id },
      data: { lastLoginAt: new Date() }
    })

    const token = jwt.sign(
      {
        vendorId: credentials.vendorId,
        username: credentials.username,
        type: 'vendor'
      },
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: '7d' }
    )

    console.log('✅ Vendor login successful:', credentials.vendor.supplierName)

    res.json({
      success: true,
      data: {
        token,
        vendor: {
          id: credentials.vendorId,
          name: credentials.vendor.supplierName,
          code: credentials.vendor.supplierCode,
          email: credentials.vendor.email
        }
      }
    })

  } catch (error) {
    console.error('Error logging in:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Login failed' 
    })
  }
})

// Verify invitation token
router.get('/verify-invitation', async (req, res) => {
  try {
    const { token } = req.query
    
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token is required' 
      })
    }

    const invitation = await prisma.vendor_invitations.findUnique({
      where: { invitationToken: token as string },
      include: { vendor: true }
    })

    if (!invitation) {
      return res.status(404).json({ 
        success: false, 
        error: 'Invalid invitation token' 
      })
    }

    if (new Date() > invitation.expiresAt) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invitation has expired' 
      })
    }

    if (invitation.status === 'accepted') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invitation already used' 
      })
    }

    res.json({
      success: true,
      data: {
        supplierCode: invitation.vendor.supplierCode,
        supplierName: invitation.vendor.supplierName,
        email: invitation.email
      }
    })

  } catch (error) {
    console.error('Error verifying invitation:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to verify invitation' 
    })
  }
})

// Set password (first time login)
router.post('/set-password', async (req, res) => {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token and password are required' 
      })
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 8 characters' 
      })
    }

    const invitation = await prisma.vendor_invitations.findUnique({
      where: { invitationToken: token },
      include: { vendor: true }
    })

    if (!invitation) {
      return res.status(404).json({ 
        success: false, 
        error: 'Invalid invitation token' 
      })
    }

    if (new Date() > invitation.expiresAt) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invitation has expired' 
      })
    }

    if (invitation.status === 'accepted') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invitation already used' 
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.vendor_credentials.upsert({
      where: { vendorId: invitation.vendorId },
      update: {
        password: hashedPassword,
        isTempPassword: false,
        passwordChangedAt: new Date()
      },
      create: {
        vendorId: invitation.vendorId,
        username: invitation.vendor.supplierCode,
        password: hashedPassword,
        isTempPassword: false,
        isActive: true
      }
    })

    await prisma.vendor_invitations.update({
      where: { id: invitation.id },
      data: {
        status: 'accepted',
        acceptedAt: new Date()
      }
    })

    const jwtToken = jwt.sign(
      {
        vendorId: invitation.vendorId,
        username: invitation.vendor.supplierCode,
        type: 'vendor'
      },
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      data: {
        token: jwtToken,
        vendor: {
          id: invitation.vendorId,
          name: invitation.vendor.supplierName,
          code: invitation.vendor.supplierCode,
          email: invitation.vendor.email
        }
      }
    })

  } catch (error) {
    console.error('Error setting password:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to set password' 
    })
  }
})

// ============= PROTECTED ROUTES (AUTH REQUIRED) =============

// Get vendor's purchase orders with legacy line items
router.get('/purchase-orders', vendorMiddleware, async (req, res) => {
  try {
    const vendorId = (req as any).user?.vendorId
    
    if (!vendorId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authenticated' 
      })
    }

    // Get all POs for this vendor
    const pos = await prisma.purchase_orders.findMany({
      where: { vendorId },
      orderBy: {
        poCreateDate: 'desc'
      }
    })

    // For each PO, get the legacy line items
    const posWithItems = await Promise.all(pos.map(async (po) => {
      const lineItems = await prisma.purchase_order_line_items.findMany({
        where: { purchaseOrderId: po.id }
      })
      
      return {
        ...po,
        lineItems: lineItems.map(item => ({
          id: item.id,
          lineNumber: item.lineNumber || 1,
          materialCode: item.materialCode,
          materialDesc: item.materialDesc,
          orderUnit: item.orderUnit,
          rate: item.rate,
          invoiceQuantity: item.invoiceQuantity
        }))
      }
    }))

    res.json({
      success: true,
      data: posWithItems
    })
  } catch (error) {
    console.error('Error fetching vendor POs:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch purchase orders' 
    })
  }
})

// Get vendor profile
router.get('/me', vendorMiddleware, async (req, res) => {
  try {
    const vendor = (req as any).vendor
    res.json({
      success: true,
      data: {
        id: vendor.id,
        name: vendor.supplierName,
        code: vendor.supplierCode,
        email: vendor.email
      }
    })
  } catch (error) {
    console.error('Error fetching vendor profile:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch profile' 
    })
  }
})

export default router
