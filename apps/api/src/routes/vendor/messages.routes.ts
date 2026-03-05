import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { z } from 'zod'

const router = Router()

const messageSchema = z.object({
  subject: z.string().min(1),
  message: z.string().min(1),
  attachments: z.array(z.string()).optional()
})

// Get messages
router.get('/', async (req, res) => {
  try {
    const vendorId = (req as any).user?.vendorId
    
    const messages = await prisma.vendor_messages.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: { name: true, email: true }
        }
      }
    })

    const unreadCount = await prisma.vendor_messages.count({
      where: { 
        vendorId, 
        isFromVendor: false,
        isRead: false 
      }
    })

    res.json({
      success: true,
      data: {
        messages,
        unreadCount
      }
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
})

// Send message to admin
router.post('/', async (req, res) => {
  try {
    const vendorId = (req as any).user?.vendorId
    const validated = messageSchema.parse(req.body)
    
    const message = await prisma.vendor_messages.create({
      data: {
        vendorId,
        ...validated,
        isFromVendor: true
      }
    })

    // Notify admins
    const admins = await prisma.users.findMany({
      where: { role: 'admin' }
    })
    
    for (const admin of admins) {
      await prisma.notifications.create({
        data: {
          type: 'vendor_message',
          title: 'New Message from Vendor',
          message: validated.subject,
          entityType: 'message',
          entityId: message.id,
          userId: admin.id
        }
      })
    }

    res.json({
      success: true,
      data: message
    })
  } catch (error) {
    console.error('Error sending message:', error)
    res.status(500).json({ error: 'Failed to send message' })
  }
})

// Mark message as read
router.put('/:id/read', async (req, res) => {
  try {
    const vendorId = (req as any).user?.vendorId
    const { id } = req.params
    
    await prisma.vendor_messages.update({
      where: { id, vendorId },
      data: { isRead: true, readAt: new Date() }
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Error marking message as read:', error)
    res.status(500).json({ error: 'Failed to update message' })
  }
})

export default router
