import { Router } from 'express'
import { prisma } from '@vendor-management/database'

const router = Router()

// Get notifications
router.get('/', async (req, res) => {
  try {
    const vendorId = (req as any).user?.vendorId
    
    const notifications = await prisma.vendor_notifications.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    const unreadCount = await prisma.vendor_notifications.count({
      where: { vendorId, isRead: false }
    })

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount
      }
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    res.status(500).json({ error: 'Failed to fetch notifications' })
  }
})

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const vendorId = (req as any).user?.vendorId
    const { id } = req.params
    
    await prisma.vendor_notifications.update({
      where: { id, vendorId },
      data: { isRead: true, readAt: new Date() }
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    res.status(500).json({ error: 'Failed to update notification' })
  }
})

// Mark all as read
router.put('/read-all', async (req, res) => {
  try {
    const vendorId = (req as any).user?.vendorId
    
    await prisma.vendor_notifications.updateMany({
      where: { vendorId, isRead: false },
      data: { isRead: true, readAt: new Date() }
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Error marking all as read:', error)
    res.status(500).json({ error: 'Failed to update notifications' })
  }
})

export default router
