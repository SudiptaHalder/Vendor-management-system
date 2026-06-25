import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

// GET all purchase orders
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    console.log('📦 Fetching all purchase orders')
    
    const purchaseOrders = await prisma.purchase_orders.findMany({
      where: {
        // Only include non-deleted orders
      },
      include: {
        vendor: {
          select: {
            id: true,
            supplierCode: true,
            supplierName: true,
            email: true,
            status: true
          }
        },
        lineItems: {
          orderBy: {
            lineNumber: 'asc'
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 200
    })

    console.log(`✅ Found ${purchaseOrders.length} purchase orders`)
    res.json({
      success: true,
      data: purchaseOrders
    })
  } catch (error) {
    console.error('❌ Error fetching purchase orders:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// GET single purchase order
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    
    const purchaseOrder = await prisma.purchase_orders.findUnique({
      where: { id },
      include: {
        vendor: {
          select: {
            id: true,
            supplierCode: true,
            supplierName: true,
            email: true,
            phone: true,
            status: true
          }
        },
        lineItems: {
          orderBy: {
            lineNumber: 'asc'
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        error: 'Purchase order not found'
      })
    }

    console.log(`✅ Found purchase order: ${purchaseOrder.poNumber}`)
    res.json({
      success: true,
      data: purchaseOrder
    })
  } catch (error) {
    console.error('❌ Error fetching purchase order:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router
