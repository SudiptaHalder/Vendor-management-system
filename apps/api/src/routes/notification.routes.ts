import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { z } from 'zod'

const router = Router()

// GET all notifications for current user
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id
    const { status, limit = 20, offset = 0 } = req.query

    const where: any = {
      userId,
      ...(status === 'unread' && { status: 'unread' }),
      ...(status === 'read' && { status: 'read' })
    }

    const [notifications, totalCount] = await Promise.all([
      prisma.notifications.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        take: Number(limit),
        skip: Number(offset)
      }),
      prisma.notifications.count({ where })
    ])

    res.json({
      success: true,
      data: {
        notifications,
        totalCount,
        unreadCount: notifications.filter(n => n.status === 'unread').length
      }
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications'
    })
  }
})

// GET unread count
router.get('/unread-count', async (req, res) => {
  try {
    const userId = (req as any).user?.id

    const count = await prisma.notifications.count({
      where: {
        userId,
        status: 'unread'
      }
    })

    res.json({
      success: true,
      data: { count }
    })
  } catch (error) {
    console.error('Error fetching unread count:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unread count'
    })
  }
})

// GET single notification
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const userId = (req as any).user?.id

    const notification = await prisma.notifications.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      })
    }

    res.json({
      success: true,
      data: notification
    })
  } catch (error) {
    console.error('Error fetching notification:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notification'
    })
  }
})

// PUT mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params
    const userId = (req as any).user?.id

    const notification = await prisma.notifications.updateMany({
      where: {
        id,
        userId
      },
      data: {
        status: 'read',
        readAt: new Date()
      }
    })

    if (notification.count === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      })
    }

    // Get updated unread count
    const unreadCount = await prisma.notifications.count({
      where: {
        userId,
        status: 'unread'
      }
    })

    res.json({
      success: true,
      data: { unreadCount }
    })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read'
    })
  }
})

// PUT mark all notifications as read
router.put('/read-all', async (req, res) => {
  try {
    const userId = (req as any).user?.id

    await prisma.notifications.updateMany({
      where: {
        userId,
        status: 'unread'
      },
      data: {
        status: 'read',
        readAt: new Date()
      }
    })

    res.json({
      success: true,
      message: 'All notifications marked as read'
    })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read'
    })
  }
})

// DELETE notification
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const userId = (req as any).user?.id

    await prisma.notifications.deleteMany({
      where: {
        id,
        userId
      }
    })

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting notification:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification'
    })
  }
})

// POST create notification (internal use - called by other services)
export async function createNotification(data: {
  userId: string
  type: string
  title: string
  message: string
  entityType?: string
  entityId?: string
  actionUrl?: string
  priority?: string
}) {
  try {
    const notification = await prisma.notifications.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        entityType: data.entityType,
        entityId: data.entityId,
        actionUrl: data.actionUrl,
        priority: data.priority || 'normal',
        status: 'unread'
      }
    })
    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}

export default router