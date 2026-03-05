import { Router } from 'express'
import { prisma } from '@vendor-management/database'

const router = Router()

// Get vendor dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const vendorId = (req as any).user?.vendorId
    
    const [invoices, orders, totalPaid, pendingAmount] = await Promise.all([
      prisma.invoices.count({
        where: { vendorId }
      }),
      prisma.purchase_orders.count({
        where: { vendorId }
      }),
      prisma.invoices.aggregate({
        where: { vendorId, status: 'paid' },
        _sum: { total: true }
      }),
      prisma.invoices.aggregate({
        where: { vendorId, status: 'pending' },
        _sum: { total: true }
      })
    ])

    res.json({
      success: true,
      data: {
        totalInvoices: invoices,
        totalOrders: orders,
        totalPaid: totalPaid._sum.total || 0,
        pendingAmount: pendingAmount._sum.total || 0
      }
    })
  } catch (error) {
    console.error('Error fetching vendor stats:', error)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

// Get recent activity
router.get('/activity', async (req, res) => {
  try {
    const vendorId = (req as any).user?.vendorId
    
    const activity = await prisma.vendor_activity_logs.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    res.json({
      success: true,
      data: activity
    })
  } catch (error) {
    console.error('Error fetching activity:', error)
    res.status(500).json({ error: 'Failed to fetch activity' })
  }
})

export default router
