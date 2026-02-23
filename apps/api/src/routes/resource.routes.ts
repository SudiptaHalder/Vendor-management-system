import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { z } from 'zod'

const router = Router()

// Validation schemas
const createResourceSchema = z.object({
  name: z.string().min(1, 'Resource name is required'),
  type: z.string().min(1, 'Resource type is required'),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  status: z.string().default('available'),
  location: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  serialNumber: z.string().optional().nullable(),
  capacity: z.string().optional().nullable(),
  lastMaintenance: z.string().optional().nullable(),
  nextMaintenance: z.string().optional().nullable(),
  maintenanceInterval: z.number().optional().nullable(),
  hourlyRate: z.number().optional().nullable(),
  dailyRate: z.number().optional().nullable(),
  purchaseCost: z.number().optional().nullable()
})

// FIXED: CreateAssignmentSchema - made fields nullable properly
const createAssignmentSchema = z.object({
  resourceId: z.string().min(1, 'Resource ID is required'),
  projectId: z.string().optional().nullable(),
  workOrderId: z.string().optional().nullable(),
  assignedFrom: z.string(),
  assignedTo: z.string().optional().nullable(), // Make it optional
  quantity: z.number().default(1),
  status: z.string().default('active'),
  notes: z.string().optional().nullable()
})

// Generate Resource Number
const generateResourceNumber = async () => {
  const year = new Date().getFullYear()
  const count = await prisma.resources.count({
    where: {
      createdAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1)
      }
    }
  })
  return `RES-${year}-${(count + 1).toString().padStart(4, '0')}`
}

// ============ RESOURCES ============

// GET all resources
router.get('/', async (req, res) => {
  try {
    const { type, status, projectId, search } = req.query
    
    const where: any = {
      deletedAt: null
    }
    
    if (type) where.type = type
    if (status) where.status = status
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } }
      ]
    }

    const resources = await prisma.resources.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            assignments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json({
      success: true,
      data: resources
    })
  } catch (error) {
    console.error('Error fetching resources:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch resources'
    })
  }
})

// GET single resource
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const resource = await prisma.resources.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignments: {
          where: {
            status: 'active'
          },
          include: {
            project: {
              select: {
                id: true,
                name: true,
                projectNumber: true
              }
            },
            workOrder: {
              select: {
                id: true,
                workOrderNumber: true,
                title: true
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
            assignedAt: 'desc'
          }
        }
      }
    })

    if (!resource || resource.deletedAt) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      })
    }

    res.json({
      success: true,
      data: resource
    })
  } catch (error) {
    console.error('Error fetching resource:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch resource'
    })
  }
})

// POST create resource
router.post('/', async (req, res) => {
  try {
    console.log('Creating resource:', JSON.stringify(req.body, null, 2))
    
    const validated = createResourceSchema.parse(req.body)
    
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { companyId: true }
    })

    const resourceNumber = await generateResourceNumber()

    const resource = await prisma.resources.create({
      data: {
        id: resourceNumber,
        name: validated.name,
        type: validated.type,
        category: validated.category,
        description: validated.description,
        status: validated.status,
        location: validated.location,
        model: validated.model,
        serialNumber: validated.serialNumber,
        capacity: validated.capacity,
        lastMaintenance: validated.lastMaintenance ? new Date(validated.lastMaintenance) : null,
        nextMaintenance: validated.nextMaintenance ? new Date(validated.nextMaintenance) : null,
        maintenanceInterval: validated.maintenanceInterval,
        hourlyRate: validated.hourlyRate,
        dailyRate: validated.dailyRate,
        purchaseCost: validated.purchaseCost,
        createdById: userId,
        companyId: user?.companyId || null
      }
    })

    console.log('✅ Resource created:', resource.id)
    
    res.status(201).json({
      success: true,
      data: resource
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
    console.error('Error creating resource:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create resource',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// PUT update resource
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const validated = createResourceSchema.partial().parse(req.body)

    const resource = await prisma.resources.update({
      where: { id },
      data: {
        name: validated.name,
        type: validated.type,
        category: validated.category,
        description: validated.description,
        status: validated.status,
        location: validated.location,
        model: validated.model,
        serialNumber: validated.serialNumber,
        capacity: validated.capacity,
        lastMaintenance: validated.lastMaintenance ? new Date(validated.lastMaintenance) : undefined,
        nextMaintenance: validated.nextMaintenance ? new Date(validated.nextMaintenance) : undefined,
        maintenanceInterval: validated.maintenanceInterval,
        hourlyRate: validated.hourlyRate,
        dailyRate: validated.dailyRate,
        purchaseCost: validated.purchaseCost
      }
    })

    res.json({
      success: true,
      data: resource
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    console.error('Error updating resource:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update resource'
    })
  }
})

// DELETE resource (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    await prisma.resources.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    res.json({
      success: true,
      message: 'Resource deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting resource:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete resource'
    })
  }
})

// ============ RESOURCE ASSIGNMENTS ============

// IMPORTANT: This route must come BEFORE /:id to avoid conflict
router.get('/assignments/all', async (req, res) => {
  try {
    const { resourceId, projectId, workOrderId } = req.query
    
    const where: any = {}
    
    if (resourceId) where.resourceId = resourceId
    if (projectId) where.projectId = projectId
    if (workOrderId) where.workOrderId = workOrderId

    const assignments = await prisma.resource_assignments.findMany({
      where,
      include: {
        resource: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            projectNumber: true
          }
        },
        workOrder: {
          select: {
            id: true,
            workOrderNumber: true,
            title: true
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
        assignedAt: 'desc'
      }
    })

    res.json({
      success: true,
      data: assignments
    })
  } catch (error) {
    console.error('Error fetching assignments:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assignments'
    })
  }
})

// FIXED: POST create assignment
router.post('/assignments', async (req, res) => {
  try {
    console.log('Creating assignment:', JSON.stringify(req.body, null, 2))
    
    const validated = createAssignmentSchema.parse(req.body)
    
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }

    // Validate that either projectId OR workOrderId is provided
    if (!validated.projectId && !validated.workOrderId) {
      return res.status(400).json({
        success: false,
        error: 'Either project or work order must be selected'
      })
    }

    const assignment = await prisma.resource_assignments.create({
      data: {
        resourceId: validated.resourceId,
        projectId: validated.projectId || null,
        workOrderId: validated.workOrderId || null,
        assignedFrom: new Date(validated.assignedFrom),
        assignedTo: validated.assignedTo ? new Date(validated.assignedTo) : null,
        quantity: validated.quantity,
        status: validated.status,
        notes: validated.notes,
        assignedById: userId
      },
      include: {
        resource: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            projectNumber: true
          }
        },
        workOrder: {
          select: {
            id: true,
            workOrderNumber: true,
            title: true
          }
        }
      }
    })

    // Update resource status to 'in_use'
    await prisma.resources.update({
      where: { id: validated.resourceId },
      data: { status: 'in_use' }
    })

    console.log('✅ Assignment created:', assignment.id)
    
    res.status(201).json({
      success: true,
      data: assignment
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
    console.error('Error creating assignment:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create assignment',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// FIXED: PUT update assignment
router.put('/assignments/:id', async (req, res) => {
  try {
    const { id } = req.params
    const validated = createAssignmentSchema.partial().parse(req.body)

    const assignment = await prisma.resource_assignments.update({
      where: { id },
      data: {
        assignedFrom: validated.assignedFrom ? new Date(validated.assignedFrom) : undefined,
        assignedTo: validated.assignedTo ? new Date(validated.assignedTo) : undefined,
        quantity: validated.quantity,
        status: validated.status,
        notes: validated.notes
      }
    })

    // If assignment is completed/ended, check if resource has any other active assignments
    if (validated.status === 'completed' || validated.status === 'ended') {
      const activeAssignments = await prisma.resource_assignments.count({
        where: {
          resourceId: assignment.resourceId,
          status: 'active'
        }
      })

      if (activeAssignments === 0) {
        await prisma.resources.update({
          where: { id: assignment.resourceId },
          data: { status: 'available' }
        })
      }
    }

    res.json({
      success: true,
      data: assignment
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    console.error('Error updating assignment:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update assignment'
    })
  }
})

// FIXED: DELETE assignment
router.delete('/assignments/:id', async (req, res) => {
  try {
    const { id } = req.params

    const assignment = await prisma.resource_assignments.delete({
      where: { id }
    })

    // Check if resource has any other active assignments
    const activeAssignments = await prisma.resource_assignments.count({
      where: {
        resourceId: assignment.resourceId,
        status: 'active'
      }
    })

    if (activeAssignments === 0) {
      await prisma.resources.update({
        where: { id: assignment.resourceId },
        data: { status: 'available' }
      })
    }

    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting assignment:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete assignment'
    })
  }
})

export default router