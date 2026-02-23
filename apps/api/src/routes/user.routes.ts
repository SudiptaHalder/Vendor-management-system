import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const router = Router()

// Validation schemas
const updateUserSchema = z.object({
  name: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  email: z.string().email().optional(),
  phone: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  department: z.string().optional().nullable()
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8)
})

// GET current user
router.get('/me', async (req, res) => {
  try {
    const userId = (req as any).user?.id
    
    const user = await prisma.users.findUnique({
      where: { id: userId },
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
        avatarUrl: true,
        lastLoginAt: true,
        createdAt: true,
        preferences: true,
        notificationSettings: true,
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!user) {
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
    console.error('Error fetching current user:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    })
  }
})

// GET user by ID
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
        avatarUrl: true,
        lastLoginAt: true,
        createdAt: true,
        preferences: true,
        notificationSettings: true,
        company: {
          select: {
            id: true,
            name: true
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

// PUT update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const validated = updateUserSchema.parse(req.body)

    // Check if user exists
    const existingUser = await prisma.users.findUnique({
      where: { id }
    })

    if (!existingUser || existingUser.deletedAt) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // Check if email is being changed and if it's already taken
    if (validated.email && validated.email !== existingUser.email) {
      const emailExists = await prisma.users.findUnique({
        where: { email: validated.email }
      })
      if (emailExists) {
        return res.status(400).json({
          success: false,
          error: 'Email already in use'
        })
      }
    }

    const updatedUser = await prisma.users.update({
      where: { id },
      data: {
        name: validated.name,
        firstName: validated.firstName,
        lastName: validated.lastName,
        email: validated.email,
        phone: validated.phone,
        title: validated.title,
        department: validated.department
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
        avatarUrl: true,
        lastLoginAt: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    res.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
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

// POST change password
router.post('/:id/change-password', async (req, res) => {
  try {
    const { id } = req.params
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body)

    // Get user with password
    const user = await prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        password: true
      }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password || '')
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.users.update({
      where: { id },
      data: { password: hashedPassword }
    })

    res.json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    console.error('Error changing password:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    })
  }
})

// PUT update preferences
router.put('/:id/preferences', async (req, res) => {
  try {
    const { id } = req.params
    const { preferences } = req.body

    const user = await prisma.users.update({
      where: { id },
      data: { preferences: preferences || {} }
    })

    res.json({
      success: true,
      data: user.preferences,
      message: 'Preferences updated successfully'
    })
  } catch (error) {
    console.error('Error updating preferences:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update preferences'
    })
  }
})

// PUT update notification settings
router.put('/:id/notifications', async (req, res) => {
  try {
    const { id } = req.params
    const { notificationSettings } = req.body

    const user = await prisma.users.update({
      where: { id },
      data: { notificationSettings: notificationSettings || {} }
    })

    res.json({
      success: true,
      data: user.notificationSettings,
      message: 'Notification settings updated successfully'
    })
  } catch (error) {
    console.error('Error updating notification settings:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update notification settings'
    })
  }
})

// POST upload avatar
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../uploads/avatars')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type') as any, false)
    }
  }
})

router.post('/:id/avatar', upload.single('avatar'), async (req, res) => {
  try {
    const { id } = req.params

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      })
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`

    const user = await prisma.users.update({
      where: { id },
      data: { avatarUrl }
    })

    res.json({
      success: true,
      data: { avatarUrl: user.avatarUrl }
    })
  } catch (error) {
    console.error('Error uploading avatar:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to upload avatar'
    })
  }
})

export default router