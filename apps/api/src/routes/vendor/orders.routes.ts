import { Router } from 'express'
import { prisma } from '@vendor-management/database'

const router = Router()

// Get all orders for vendor
router.get('/', async (req, res) => {
  try {
    const vendorId = (req as any).user?.vendorId
    
    const orders = await prisma.purchase_orders.findMany({
      where: { vendorId },
      include: {
        lineItems: true,
        invoices: true
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json({
      success: true,
      data: orders
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// Get single order
router.get('/:id', async (req, res) => {
  try {
    const vendorId = (req as any).user?.vendorId
    const { id } = req.params
    
    const order = await prisma.purchase_orders.findFirst({
      where: { id, vendorId },
      include: {
        lineItems: true,
        invoices: true
      }
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // Log activity
    await prisma.vendor_activity_logs.create({
      data: {
        vendorId,
        action: 'order_viewed',
        entityType: 'order',
        entityId: id,
        details: { poNumber: order.poNumber }
      }
    })

    res.json({
      success: true,
      data: order
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    res.status(500).json({ error: 'Failed to fetch order' })
  }
})

export default router
