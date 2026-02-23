import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { z } from 'zod'
import { emailService } from '../services/email.service'

const router = Router()

// Validation schema
const demoRequestSchema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  companyName: z.string().min(1, 'Company name is required'),
  phone: z.string().optional().nullable(),
  companySize: z.string().optional().nullable(),
  interests: z.array(z.string()).default([]),
  preferredDate: z.string().optional().nullable(),
  preferredTime: z.string().optional().nullable()
})

// Generate request number
const generateRequestNumber = async () => {
  const year = new Date().getFullYear()
  const count = await prisma.demo_requests.count({
    where: {
      createdAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1)
      }
    }
  })
  return `DEMO-${year}-${(count + 1).toString().padStart(4, '0')}`
}

// POST /api/demo/request - Submit demo request
router.post('/request', async (req, res) => {
  try {
    console.log('📋 Demo request received:', req.body)

    const validated = demoRequestSchema.parse(req.body)

    // Generate request number
    const requestNumber = await generateRequestNumber()

    // Get IP and user agent
    const ipAddress = req.ip || req.socket.remoteAddress
    const userAgent = req.headers['user-agent']

    // Create demo request in database
    const demoRequest = await prisma.demo_requests.create({
      data: {
        requestNumber,
        fullName: validated.fullName,
        email: validated.email,
        companyName: validated.companyName,
        phone: validated.phone || null,
        companySize: validated.companySize || null,
        interests: validated.interests,
        preferredDate: validated.preferredDate ? new Date(validated.preferredDate) : null,
        preferredTime: validated.preferredTime || null,
        ipAddress,
        userAgent,
        status: 'pending'
      }
    })

    console.log('✅ Demo request saved:', requestNumber)

    // Send confirmation email to user
    await emailService.sendDemoRequestConfirmation({
      email: validated.email,
      name: validated.fullName,
      company: validated.companyName,
      requestNumber
    })

    // Send notification to sales team
    await emailService.sendDemoRequestNotification({
      requestNumber,
      name: validated.fullName,
      email: validated.email,
      company: validated.companyName,
      phone: validated.phone || undefined,
      companySize: validated.companySize || undefined,
      interests: validated.interests,
      preferredDate: demoRequest.preferredDate || undefined,
      preferredTime: validated.preferredTime || undefined
    })

    res.status(201).json({
      success: true,
      data: {
        requestNumber,
        message: 'Demo request submitted successfully. We will contact you soon.'
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors)
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    console.error('Error processing demo request:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to process demo request'
    })
  }
})

// GET /api/demo/requests - Get all demo requests (admin only)
router.get('/requests', async (req, res) => {
  try {
    // Check if user is admin
    const userId = (req as any).user?.id
    const user = await prisma.users.findUnique({
      where: { id: userId }
    })

    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      })
    }

    const { status, startDate, endDate } = req.query

    const where: any = {}
    if (status) where.status = status
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate as string)
      if (endDate) where.createdAt.lte = new Date(endDate as string)
    }

    const requests = await prisma.demo_requests.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    res.json({
      success: true,
      data: requests
    })
  } catch (error) {
    console.error('Error fetching demo requests:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch demo requests'
    })
  }
})

// GET /api/demo/requests/:id - Get single demo request (admin only)
router.get('/requests/:id', async (req, res) => {
  try {
    const { id } = req.params

    const request = await prisma.demo_requests.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Demo request not found'
      })
    }

    res.json({
      success: true,
      data: request
    })
  } catch (error) {
    console.error('Error fetching demo request:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch demo request'
    })
  }
})

// PUT /api/demo/requests/:id/status - Update request status (admin only)
router.put('/requests/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status, notes } = req.body

    const request = await prisma.demo_requests.update({
      where: { id },
      data: {
        status,
        notes: notes || undefined
      }
    })

    res.json({
      success: true,
      data: request
    })
  } catch (error) {
    console.error('Error updating demo request:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update demo request'
    })
  }
})

// POST /api/demo/requests/:id/assign - Assign request to team member (admin only)
router.post('/requests/:id/assign', async (req, res) => {
  try {
    const { id } = req.params
    const { assignedToId } = req.body

    const request = await prisma.demo_requests.update({
      where: { id },
      data: {
        assignedToId
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    res.json({
      success: true,
      data: request
    })
  } catch (error) {
    console.error('Error assigning demo request:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to assign demo request'
    })
  }
})

export default router