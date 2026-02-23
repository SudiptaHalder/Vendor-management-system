import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { z } from 'zod'

const router = Router()

// Validation schemas
const createRFQSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  deadline: z.string().optional(),
  expectedDeliveryDate: z.string().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(), // Keep this but we'll map it to deliveryTerms
  vendorIds: z.array(z.string()).min(1, 'At least one vendor is required'),
  lineItems: z.array(z.object({
    description: z.string().min(1),
    quantity: z.number().min(0.01),
    unit: z.string().optional(),
    notes: z.string().optional()
  })),
  purchaseOrderId: z.string().optional()
})
const updateRFQSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  deadline: z.string().optional(),
  expectedDeliveryDate: z.string().optional(),
  notes: z.string().optional(),
  deliveryTerms: z.string().optional(),
  vendorIds: z.array(z.string()).optional(),
  lineItems: z.array(z.object({
    id: z.string().optional(),
    lineNumber: z.number().optional(),
    description: z.string().min(1),
    quantity: z.number().min(0.01),
    unit: z.string().optional(),
    notes: z.string().optional()
  })).optional()
}).partial()

// Generate RFQ Number
const generateRFQNumber = async () => {
  const year = new Date().getFullYear()
  const count = await prisma.rfqs.count({
    where: {
      createdAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1)
      }
    }
  })
  return `RFQ-${year}-${(count + 1).toString().padStart(5, '0')}`
}

// GET all RFQs
router.get('/', async (req, res, next) => {
  try {
    console.log('📋 Fetching all RFQs')
    
    const rfqs = await prisma.rfqs.findMany({
      where: {
        deletedAt: null
      },
      include: {
        lineItems: true,
        recipients: {
          include: {
            vendor: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        quotes: {
          include: {
            vendor: {
              select: {
                id: true,
                name: true
              }
            }
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
      }
    })

    console.log(`Found ${rfqs.length} RFQs`)
    res.json({
      success: true,
      data: rfqs
    })
  } catch (error) {
    console.error('Error fetching RFQs:', error)
    next(error)
  }
})

// GET single RFQ
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    
    const rfq = await prisma.rfqs.findUnique({
      where: { id },
      include: {
        lineItems: true,
        recipients: {
          include: {
            vendor: true
          }
        },
        quotes: {
          include: {
            vendor: true,
            lineItems: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        purchaseOrder: true
      }
    })

    if (!rfq || rfq.deletedAt) {
      return res.status(404).json({
        success: false,
        error: 'RFQ not found'
      })
    }

    res.json({
      success: true,
      data: rfq
    })
  } catch (error) {
    console.error('Error fetching RFQ:', error)
    next(error)
  }
})

// POST create RFQ
router.post('/', async (req, res, next) => {
  try {
    console.log('📋 Creating RFQ:', req.body)

    const validated = createRFQSchema.parse(req.body)
    
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }

    const rfqNumber = await generateRFQNumber()

    const rfq = await prisma.rfqs.create({
      data: {
        rfqNumber,
        title: validated.title,
        description: validated.description,
        deadline: validated.deadline ? new Date(validated.deadline) : null,
        expectedDeliveryDate: validated.expectedDeliveryDate ? new Date(validated.expectedDeliveryDate) : null,
        notes: validated.notes,
        // Remove 'terms' or map it to the correct field
        // If you want to keep the terms, you need to add it to your Prisma schema
        // For now, let's comment it out or map to deliveryTerms
        deliveryTerms: validated.terms, // Map to deliveryTerms
        createdById: userId,
        status: 'draft',
        companyId: null,
        purchaseOrderId: validated.purchaseOrderId || null,
        lineItems: {
          create: validated.lineItems.map((item, index) => ({
            lineNumber: index + 1,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            notes: item.notes
          }))
        },
        recipients: {
          create: validated.vendorIds.map(vendorId => ({
            vendorId,
            status: 'pending'
          }))
        }
      },
      include: {
        lineItems: true,
        recipients: {
          include: {
            vendor: true
          }
        }
      }
    })

    console.log('✅ RFQ created:', rfq.rfqNumber)
    res.status(201).json({
      success: true,
      data: rfq
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Validation error:', error.errors)
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    console.error('Error creating RFQ:', error)
    next(error)
  }
})

// PUT update RFQ
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const validated = updateRFQSchema.parse(req.body)

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update RFQ basic info
      const rfq = await tx.rfqs.update({
        where: { id },
        data: {
          title: validated.title,
          description: validated.description,
          status: validated.status,
          deadline: validated.deadline ? new Date(validated.deadline) : null,
          expectedDeliveryDate: validated.expectedDeliveryDate ? new Date(validated.expectedDeliveryDate) : null,
          notes: validated.notes,
          deliveryTerms: validated.deliveryTerms
        }
      })

      // Update line items if provided
      if (validated.lineItems) {
        // Delete existing line items
        await tx.rfq_line_items.deleteMany({
          where: { rfqId: id }
        })

        // Create new line items
        await tx.rfq_line_items.createMany({
          data: validated.lineItems.map((item, index) => ({
            rfqId: id,
            lineNumber: item.lineNumber || index + 1,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            notes: item.notes
          }))
        })
      }

      // Update recipients if provided
      if (validated.vendorIds) {
        // Delete existing recipients
        await tx.rfq_recipients.deleteMany({
          where: { rfqId: id }
        })

        // Create new recipients
        await tx.rfq_recipients.createMany({
          data: validated.vendorIds.map(vendorId => ({
            rfqId: id,
            vendorId,
            status: 'pending'
          }))
        })
      }

      // Return updated RFQ with relations
      return await tx.rfqs.findUnique({
        where: { id },
        include: {
          lineItems: true,
          recipients: {
            include: {
              vendor: true
            }
          },
          quotes: true
        }
      })
    })

    console.log('✅ RFQ updated:', result?.rfqNumber)
    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Validation error:', error.errors)
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    console.error('Error updating RFQ:', error)
    next(error)
  }
})

// POST send RFQ (update status to sent)
router.post('/:id/send', async (req, res, next) => {
  try {
    const { id } = req.params

    const rfq = await prisma.rfqs.update({
      where: { id },
      data: {
        status: 'sent'
      }
    })

    // Also update all recipients status to 'sent'
    await prisma.rfq_recipients.updateMany({
      where: { rfqId: id },
      data: { 
        status: 'sent',
        sentAt: new Date()
      }
    })

    console.log('✅ RFQ sent:', rfq.rfqNumber)
    res.json({
      success: true,
      message: 'RFQ sent successfully',
      data: rfq
    })
  } catch (error) {
    console.error('Error sending RFQ:', error)
    next(error)
  }
})

// DELETE RFQ (soft delete)
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    await prisma.rfqs.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    console.log('✅ RFQ deleted:', id)
    res.json({
      success: true,
      message: 'RFQ deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting RFQ:', error)
    next(error)
  }
})

export default router