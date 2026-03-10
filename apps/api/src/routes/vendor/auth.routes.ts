import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { vendorMiddleware } from '../../middleware/vendor.middleware'

const router = Router()

// ... (keep your existing login, verify, set-password routes)

// Get vendor's purchase orders (protected - vendor only)
router.get('/purchase-orders', vendorMiddleware, async (req, res) => {
  try {
    const vendorId = (req as any).user?.vendorId
    
    if (!vendorId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authenticated' 
      })
    }

    // Get all POs for this vendor with line items
    const pos = await prisma.purchase_orders.findMany({
      where: { vendorId },
      include: {
        lineItems: true
      },
      orderBy: {
        poCreateDate: 'desc'
      }
    })

    res.json({
      success: true,
      data: pos
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
