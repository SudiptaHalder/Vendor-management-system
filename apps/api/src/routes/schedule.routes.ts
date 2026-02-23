import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { z } from 'zod'

const router = Router()

// Validation schemas
const createScheduleSchema = z.object({
  name: z.string().min(1, 'Schedule name is required'),
  description: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  type: z.string().default('project'),
  status: z.string().default('active'),
  startDate: z.string(),
  endDate: z.string().optional().nullable()
})

const createScheduleItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  workOrderId: z.string().optional().nullable(),
  startTime: z.string(),
  endTime: z.string(),
  isAllDay: z.boolean().default(false),
  location: z.string().optional().nullable(),
  status: z.string().default('scheduled'),
  assignedToId: z.string().optional().nullable()
})

// Generate SCH-2026-0001 format number
const generateScheduleNumber = async () => {
  const year = new Date().getFullYear()
  const count = await prisma.schedules.count({
    where: {
      createdAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1)
      }
    }
  })
  return `SCH-${year}-${(count + 1).toString().padStart(4, '0')}`
}

// ============ SCHEDULES ============

// GET all schedules
router.get('/', async (req, res) => {
  try {
    const schedules = await prisma.schedules.findMany({
      where: {
        deletedAt: null
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            projectNumber: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            items: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    })

    res.json({
      success: true,
      data: schedules
    })
  } catch (error) {
    console.error('Error fetching schedules:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch schedules'
    })
  }
})

// GET single schedule - FIXED (removed deletedAt filter)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    console.log('Fetching schedule with ID:', id)

    const schedule = await prisma.schedules.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            projectNumber: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          // REMOVED: where: { deletedAt: null } - schedule_items doesn't have deletedAt
          include: {
            workOrder: {
              select: {
                id: true,
                workOrderNumber: true,
                title: true,
                status: true
              }
            },
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            startTime: 'asc'
          }
        }
      }
    })

    if (!schedule) {
      console.log('Schedule not found:', id)
      return res.status(404).json({
        success: false,
        error: 'Schedule not found'
      })
    }

    if (schedule.deletedAt) {
      console.log('Schedule is deleted:', id)
      return res.status(404).json({
        success: false,
        error: 'Schedule not found'
      })
    }

    console.log('Schedule found:', schedule.id)
    res.json({
      success: true,
      data: schedule
    })
  } catch (error) {
    console.error('Error fetching schedule:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch schedule',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// POST create schedule
router.post('/', async (req, res) => {
  try {
    console.log('Creating schedule:', JSON.stringify(req.body, null, 2))
    
    const validated = createScheduleSchema.parse(req.body)
    
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

    // Generate schedule number (SCH-2026-0001)
    const scheduleNumber = await generateScheduleNumber()

    const schedule = await prisma.schedules.create({
      data: {
        scheduleNumber,
        name: validated.name,
        description: validated.description,
        projectId: validated.projectId || null,
        type: validated.type,
        status: validated.status,
        startDate: new Date(validated.startDate),
        endDate: validated.endDate ? new Date(validated.endDate) : null,
        createdById: userId,
        companyId: user?.companyId || null
      }
    })

    console.log('✅ Schedule created:', schedule.scheduleNumber)
    
    res.status(201).json({
      success: true,
      data: schedule
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
    console.error('Error creating schedule:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create schedule',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// DELETE schedule (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    await prisma.schedules.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    res.json({
      success: true,
      message: 'Schedule deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting schedule:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete schedule'
    })
  }
})

// ============ SCHEDULE ITEMS ============

// GET all items for a schedule - FIXED (removed deletedAt filter)
router.get('/:scheduleId/items', async (req, res) => {
  try {
    const { scheduleId } = req.params

    const items = await prisma.schedule_items.findMany({
      where: {
        scheduleId
        // REMOVED: deletedAt: null - schedule_items doesn't have deletedAt
      },
      include: {
        workOrder: {
          select: {
            id: true,
            workOrderNumber: true,
            title: true,
            status: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    res.json({
      success: true,
      data: items
    })
  } catch (error) {
    console.error('Error fetching schedule items:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch schedule items'
    })
  }
})

// POST create schedule item
router.post('/:scheduleId/items', async (req, res) => {
  try {
    const { scheduleId } = req.params
    const validated = createScheduleItemSchema.parse(req.body)

    const item = await prisma.schedule_items.create({
      data: {
        scheduleId,
        title: validated.title,
        description: validated.description,
        workOrderId: validated.workOrderId || null,
        startTime: new Date(validated.startTime),
        endTime: new Date(validated.endTime),
        isAllDay: validated.isAllDay,
        location: validated.location,
        status: validated.status,
        assignedToId: validated.assignedToId || null
      },
      include: {
        workOrder: {
          select: {
            id: true,
            workOrderNumber: true,
            title: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    res.status(201).json({
      success: true,
      data: item
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    console.error('Error creating schedule item:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create schedule item'
    })
  }
})

// DELETE schedule item - FIXED (schedule_items doesn't have deletedAt)
router.delete('/:scheduleId/items/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params

    // Since schedule_items doesn't have deletedAt, we need to ACTUALLY delete it
    await prisma.schedule_items.delete({
      where: { id: itemId }
    })

    res.json({
      success: true,
      message: 'Schedule item deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting schedule item:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete schedule item'
    })
  }
})

export default router