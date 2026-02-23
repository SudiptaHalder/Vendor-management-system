import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { z } from 'zod'

const router = Router()

// Validation schemas
const createPermissionSchema = z.object({
  name: z.string().min(1, 'Permission name is required'),
  module: z.string().min(1, 'Module is required'),
  action: z.string().min(1, 'Action is required'),
  description: z.string().optional().nullable()
})

// GET all permissions
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { companyId: true }
    })

    const permissions = await prisma.permissions.findMany({
      where: {
        OR: [
          { companyId: user?.companyId },
          { isSystem: true }
        ],
        deletedAt: null
      },
      orderBy: [
        { module: 'asc' },
        { name: 'asc' }
      ]
    })

    res.json({
      success: true,
      data: permissions
    })
  } catch (error) {
    console.error('Error fetching permissions:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch permissions'
    })
  }
})

// GET single permission
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const permission = await prisma.permissions.findUnique({
      where: { id }
    })

    if (!permission || permission.deletedAt) {
      return res.status(404).json({
        success: false,
        error: 'Permission not found'
      })
    }

    res.json({
      success: true,
      data: permission
    })
  } catch (error) {
    console.error('Error fetching permission:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch permission'
    })
  }
})

// POST create permission
router.post('/', async (req, res) => {
  try {
    const validated = createPermissionSchema.parse(req.body)
    
    const userId = (req as any).user?.id
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { companyId: true }
    })

    // Check if permission already exists
    const existing = await prisma.permissions.findFirst({
      where: {
        companyId: user?.companyId,
        name: validated.name,
        deletedAt: null
      }
    })

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Permission with this name already exists'
      })
    }

    const permission = await prisma.permissions.create({
      data: {
        name: validated.name,
        module: validated.module,
        action: validated.action,
        description: validated.description,
        companyId: user?.companyId,
        isSystem: false
      }
    })

    res.status(201).json({
      success: true,
      data: permission
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    console.error('Error creating permission:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create permission'
    })
  }
})

// PUT update permission
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const validated = createPermissionSchema.partial().parse(req.body)

    const permission = await prisma.permissions.findUnique({
      where: { id }
    })

    if (!permission || permission.deletedAt) {
      return res.status(404).json({
        success: false,
        error: 'Permission not found'
      })
    }

    if (permission.isSystem) {
      return res.status(403).json({
        success: false,
        error: 'System permissions cannot be modified'
      })
    }

    const updated = await prisma.permissions.update({
      where: { id },
      data: {
        name: validated.name,
        module: validated.module,
        action: validated.action,
        description: validated.description
      }
    })

    res.json({
      success: true,
      data: updated
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    console.error('Error updating permission:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update permission'
    })
  }
})

// DELETE permission
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const permission = await prisma.permissions.findUnique({
      where: { id }
    })

    if (!permission || permission.deletedAt) {
      return res.status(404).json({
        success: false,
        error: 'Permission not found'
      })
    }

    if (permission.isSystem) {
      return res.status(403).json({
        success: false,
        error: 'System permissions cannot be deleted'
      })
    }

    await prisma.permissions.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    res.json({
      success: true,
      message: 'Permission deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting permission:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete permission'
    })
  }
})

export default router