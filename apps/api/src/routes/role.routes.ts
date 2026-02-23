import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { z } from 'zod'

const router = Router()

// Validation schemas
const createRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  description: z.string().optional().nullable(),
  permissions: z.array(z.string()).optional()
})

const updateRoleSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  permissions: z.array(z.string()).optional()
})

// GET all roles
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { companyId: true }
    })

    const roles = await prisma.roles.findMany({
      where: {
        companyId: user?.companyId,
        deletedAt: null
      },
      include: {
        permissions: {
          include: {
            permission: true
          }
        },
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format permissions
    const formattedRoles = roles.map(role => ({
      ...role,
      permissions: role.permissions.map(p => p.permission),
      userCount: role._count.users
    }))

    res.json({
      success: true,
      data: formattedRoles
    })
  } catch (error) {
    console.error('Error fetching roles:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch roles'
    })
  }
})

// GET single role
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const role = await prisma.roles.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true
          }
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!role || role.deletedAt) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      })
    }

    const formattedRole = {
      ...role,
      permissions: role.permissions.map(p => p.permission),
      userCount: role.users.length
    }

    res.json({
      success: true,
      data: formattedRole
    })
  } catch (error) {
    console.error('Error fetching role:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch role'
    })
  }
})

// POST create role
router.post('/', async (req, res) => {
  try {
    const validated = createRoleSchema.parse(req.body)
    
    const userId = (req as any).user?.id
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { companyId: true }
    })

    // Check if role with same name exists
    const existingRole = await prisma.roles.findFirst({
      where: {
        companyId: user?.companyId,
        name: validated.name,
        deletedAt: null
      }
    })

    if (existingRole) {
      return res.status(400).json({
        success: false,
        error: 'Role with this name already exists'
      })
    }

    // Create role
    const role = await prisma.roles.create({
      data: {
        name: validated.name,
        description: validated.description,
        companyId: user?.companyId,
        isSystem: false
      }
    })

    // Add permissions if provided
    if (validated.permissions && validated.permissions.length > 0) {
      await prisma.role_permissions.createMany({
        data: validated.permissions.map(permissionId => ({
          roleId: role.id,
          permissionId
        }))
      })
    }

    res.status(201).json({
      success: true,
      data: role
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    console.error('Error creating role:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create role'
    })
  }
})

// PUT update role
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const validated = updateRoleSchema.parse(req.body)

    const role = await prisma.roles.findUnique({
      where: { id }
    })

    if (!role || role.deletedAt) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      })
    }

    if (role.isSystem) {
      return res.status(403).json({
        success: false,
        error: 'System roles cannot be modified'
      })
    }

    // Update role in transaction
    const updatedRole = await prisma.$transaction(async (tx) => {
      // Update role basic info
      const updated = await tx.roles.update({
        where: { id },
        data: {
          name: validated.name,
          description: validated.description
        }
      })

      // Update permissions if provided
      if (validated.permissions) {
        // Delete existing permissions
        await tx.role_permissions.deleteMany({
          where: { roleId: id }
        })

        // Add new permissions
        if (validated.permissions.length > 0) {
          await tx.role_permissions.createMany({
            data: validated.permissions.map(permissionId => ({
              roleId: id,
              permissionId
            }))
          })
        }
      }

      return updated
    })

    res.json({
      success: true,
      data: updatedRole
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    console.error('Error updating role:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update role'
    })
  }
})

// DELETE role
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const role = await prisma.roles.findUnique({
      where: { id }
    })

    if (!role || role.deletedAt) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      })
    }

    if (role.isSystem) {
      return res.status(403).json({
        success: false,
        error: 'System roles cannot be deleted'
      })
    }

    // Check if role has users
    const userCount = await prisma.users.count({
      where: { roleId: id }
    })

    if (userCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete role with assigned users'
      })
    }

    await prisma.roles.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    res.json({
      success: true,
      message: 'Role deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting role:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete role'
    })
  }
})

// GET all permissions
router.get('/permissions/all', async (req, res) => {
  try {
    const userId = (req as any).user?.id
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { companyId: true }
    })

    const permissions = await prisma.permissions.findMany({
      where: {
        companyId: user?.companyId,
        OR: [
          { isSystem: true },
          { companyId: user?.companyId }
        ]
      },
      orderBy: [
        { module: 'asc' },
        { name: 'asc' }
      ]
    })

    // Group by module
    const grouped = permissions.reduce((acc: any, permission) => {
      if (!acc[permission.module]) {
        acc[permission.module] = []
      }
      acc[permission.module].push(permission)
      return acc
    }, {})

    res.json({
      success: true,
      data: grouped
    })
  } catch (error) {
    console.error('Error fetching permissions:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch permissions'
    })
  }
})

export default router