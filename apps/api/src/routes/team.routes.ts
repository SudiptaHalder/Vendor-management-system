import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const router = Router()

// Validation schemas
const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  role: z.string().default('member'),
  password: z.string().min(8).optional()
})

const updateUserSchema = z.object({
  name: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  role: z.string().optional(),
  isActive: z.boolean().optional()
})

// GET all users for a company
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { companyId: true }
    })

    const users = await prisma.users.findMany({
      where: {
        companyId: user?.companyId,
        deletedAt: null
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        title: true,
        department: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        avatarUrl: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json({
      success: true,
      data: users
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    })
  }
})

// GET single user
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const user = await prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        title: true,
        department: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        avatarUrl: true,
        preferences: true,
        notificationSettings: true,
        teams: {
          include: {
            team: true
          }
        }
      }
    })

    if (!user || user.deletedAt) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    })
  }
})

// POST create user (invite)
router.post('/', async (req, res) => {
  try {
    const validated = createUserSchema.parse(req.body)
    
    const currentUserId = (req as any).user?.id
    const currentUser = await prisma.users.findUnique({
      where: { id: currentUserId },
      select: { companyId: true }
    })

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email: validated.email }
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      })
    }

    // Generate temporary password if not provided
    const password = validated.password || Math.random().toString(36).slice(-8)
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.users.create({
      data: {
        email: validated.email,
        name: validated.name,
        firstName: validated.firstName,
        lastName: validated.lastName,
        phone: validated.phone,
        title: validated.title,
        department: validated.department,
        role: validated.role,
        password: hashedPassword,
        companyId: currentUser?.companyId,
        isActive: true
      }
    })

    // TODO: Send invitation email with password

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    console.error('Error creating user:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create user'
    })
  }
})

// PUT update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const validated = updateUserSchema.parse(req.body)

    const user = await prisma.users.update({
      where: { id },
      data: {
        name: validated.name,
        firstName: validated.firstName,
        lastName: validated.lastName,
        phone: validated.phone,
        title: validated.title,
        department: validated.department,
        role: validated.role,
        isActive: validated.isActive
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    })

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    console.error('Error updating user:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    })
  }
})

// DELETE user (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    await prisma.users.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    res.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    })
  }
})

// POST resend invitation
router.post('/:id/resend-invitation', async (req, res) => {
  try {
    const { id } = req.params

    const user = await prisma.users.findUnique({
      where: { id }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // TODO: Send invitation email

    res.json({
      success: true,
      message: 'Invitation sent successfully'
    })
  } catch (error) {
    console.error('Error sending invitation:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to send invitation'
    })
  }
})

export default router