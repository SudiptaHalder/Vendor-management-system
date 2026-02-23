import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { z } from 'zod'

const router = Router()

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  status: z.string().default('planning'),
  priority: z.string().default('medium'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  budget: z.number().optional(),
  currency: z.string().default('USD'),
  managerId: z.string().optional()
})

// Generate Project Number
const generateProjectNumber = async () => {
  const year = new Date().getFullYear()
  const count = await prisma.projects.count({
    where: {
      createdAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1)
      }
    }
  })
  return `PRJ-${year}-${(count + 1).toString().padStart(4, '0')}`
}

// GET all projects
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query
    
    const where: any = {
      deletedAt: null
    }
    
    if (status) {
      where.status = status
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { projectNumber: { contains: search, mode: 'insensitive' } }
      ]
    }

    const projects = await prisma.projects.findMany({
      where,
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            workOrders: true,
            vendors: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json({
      success: true,
      data: projects
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch projects'
    })
  }
})

// GET single project
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const project = await prisma.projects.findUnique({
      where: { id },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true
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
            workOrders: true,
            vendors: true,
            purchaseOrders: true,
            contracts: true,
            rfqs: true,
            invoices: true,
            expenses: true
          }
        }
      }
    })

    if (!project || project.deletedAt) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      })
    }

    res.json({
      success: true,
      data: project
    })
  } catch (error) {
    console.error('Error fetching project:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project'
    })
  }
})

// POST create project
router.post('/', async (req, res) => {
  try {
    const validated = createProjectSchema.parse(req.body)
    
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

    const projectNumber = await generateProjectNumber()

    const project = await prisma.projects.create({
      data: {
        projectNumber,
        name: validated.name,
        description: validated.description,
        status: validated.status,
        priority: validated.priority,
        startDate: validated.startDate ? new Date(validated.startDate) : null,
        endDate: validated.endDate ? new Date(validated.endDate) : null,
        location: validated.location,
        address: validated.address,
        city: validated.city,
        state: validated.state,
        country: validated.country,
        budget: validated.budget,
        currency: validated.currency,
        managerId: validated.managerId,
        createdById: userId,
        companyId: user?.companyId || null
      }
    })

    res.status(201).json({
      success: true,
      data: project
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    console.error('Error creating project:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create project'
    })
  }
})

// DELETE project (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    await prisma.projects.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    res.json({
      success: true,
      message: 'Project deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting project:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete project'
    })
  }
})

// PUT update project
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const validated = createProjectSchema.partial().parse(req.body)

    const project = await prisma.projects.update({
      where: { id },
      data: {
        name: validated.name,
        description: validated.description,
        status: validated.status,
        priority: validated.priority,
        startDate: validated.startDate ? new Date(validated.startDate) : undefined,
        endDate: validated.endDate ? new Date(validated.endDate) : undefined,
        location: validated.location,
        address: validated.address,
        city: validated.city,
        state: validated.state,
        country: validated.country,
        budget: validated.budget,
        currency: validated.currency,
        managerId: validated.managerId
      }
    })

    res.json({
      success: true,
      data: project
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    console.error('Error updating project:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update project'
    })
  }
})

export default router