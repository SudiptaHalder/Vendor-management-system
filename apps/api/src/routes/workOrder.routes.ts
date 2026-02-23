import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { z } from 'zod'

const router = Router()

// Validation schemas
const createWorkOrderSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  vendorId: z.string().min(1, 'Vendor is required'),
  contractId: z.string().optional().nullable(),
  assignedToId: z.string().optional().nullable(),
  type: z.string().default('maintenance'),
  priority: z.string().default('medium'),
  status: z.string().default('pending'),
  scheduledDate: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  estimatedHours: z.number().optional().nullable(),
  estimatedCost: z.number().optional().nullable(),
  currency: z.string().default('USD'),
  location: z.string().optional().nullable(),
  siteContact: z.string().optional().nullable(),
  sitePhone: z.string().optional().nullable()
})

// Generate Work Order Number
const generateWorkOrderNumber = async () => {
  const year = new Date().getFullYear()
  const count = await prisma.work_orders.count({
    where: {
      createdAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1)
      }
    }
  })
  return `WO-${year}-${(count + 1).toString().padStart(5, '0')}`
}

// GET all work orders
router.get('/', async (req, res) => {
  try {
    const { projectId, status, vendorId } = req.query
    
    const where: any = {
      deletedAt: null
    }
    
    if (projectId) where.projectId = projectId
    if (status) where.status = status
    if (vendorId) where.vendorId = vendorId

    const workOrders = await prisma.work_orders.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            projectNumber: true
          }
        },
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignedBy: {
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

    res.json({
      success: true,
      data: workOrders
    })
  } catch (error) {
    console.error('Error fetching work orders:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch work orders'
    })
  }
})

// GET single work order
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const workOrder = await prisma.work_orders.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            projectNumber: true
          }
        },
        vendor: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!workOrder || workOrder.deletedAt) {
      return res.status(404).json({
        success: false,
        error: 'Work order not found'
      })
    }

    res.json({
      success: true,
      data: workOrder
    })
  } catch (error) {
    console.error('Error fetching work order:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch work order'
    })
  }
})

// POST create work order - FIXED for your schema
router.post('/', async (req, res) => {
  try {
    console.log('📋 Creating work order:', JSON.stringify(req.body, null, 2))
    
    const validated = createWorkOrderSchema.parse(req.body)
    
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }

    // Get user's company
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { companyId: true }
    })

    const workOrderNumber = await generateWorkOrderNumber()

    // Prepare data according to your schema - FIXED
    const workOrderData = {
      workOrderNumber,
      title: validated.title,
      description: validated.description || null,
      projectId: validated.projectId || null,
      vendorId: validated.vendorId,
      contractId: validated.contractId || null,
      assignedToId: validated.assignedToId || null,      // Person assigned to do the work
      assignedById: userId,                               // Person who created/assigned the work order
      
      // ❌ REMOVED createdById - this field doesn't exist in your schema!
      // createdById: userId,  // ← REMOVED
      
      type: validated.type,
      priority: validated.priority,
      status: validated.status,
      scheduledDate: validated.scheduledDate ? new Date(validated.scheduledDate) : null,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
      estimatedHours: validated.estimatedHours || null,
      estimatedCost: validated.estimatedCost || null,
      currency: validated.currency || 'USD',
      location: validated.location || null,
      siteContact: validated.siteContact || null,
      sitePhone: validated.sitePhone || null,
      companyId: user?.companyId || null,
      
      // Default values
      requestedDate: new Date(),
      approvalStatus: 'pending',
      actualHours: 0,
      actualCost: 0
    }

    console.log('📋 Work order data:', JSON.stringify(workOrderData, null, 2))

    const workOrder = await prisma.work_orders.create({
      data: workOrderData,
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            projectNumber: true
          }
        }
      }
    })

    console.log('✅ Work order created:', workOrder.workOrderNumber)
    
    res.status(201).json({
      success: true,
      data: workOrder
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
    console.error('❌ Error creating work order:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create work order',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// PUT update work order
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const validated = createWorkOrderSchema.partial().parse(req.body)

    const workOrder = await prisma.work_orders.update({
      where: { id },
      data: {
        title: validated.title,
        description: validated.description,
        projectId: validated.projectId,
        vendorId: validated.vendorId,
        contractId: validated.contractId,
        assignedToId: validated.assignedToId,
        type: validated.type,
        priority: validated.priority,
        status: validated.status,
        scheduledDate: validated.scheduledDate ? new Date(validated.scheduledDate) : undefined,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
        estimatedHours: validated.estimatedHours,
        estimatedCost: validated.estimatedCost,
        currency: validated.currency,
        location: validated.location,
        siteContact: validated.siteContact,
        sitePhone: validated.sitePhone
      }
    })

    res.json({
      success: true,
      data: workOrder
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    console.error('Error updating work order:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update work order'
    })
  }
})

// DELETE work order (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    await prisma.work_orders.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    res.json({
      success: true,
      message: 'Work order deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting work order:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete work order'
    })
  }
})

export default router