import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import { AppError } from '../middleware/error.middleware'

const router = Router()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  companyName: z.string().min(2),
  name: z.string().min(2)
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

router.post('/register', async (req, res, next) => {
  try {
    console.log('�� Register attempt:', req.body.email)
    
    const validated = registerSchema.parse(req.body)
    const { email, password, companyName, name } = validated

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw new AppError('User already exists', 409)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create company and user
    const company = await prisma.company.create({
      data: {
        name: companyName,
        plan: 'free',
        settings: {}
      }
    })

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'admin',
        companyId: company.id
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyId: true
      }
    })

    console.log('✅ User created:', user.id)

    res.status(201).json({
      success: true,
      data: {
        user,
        company,
        session: {
          userId: user.id,
          companyId: user.companyId,
          role: user.role
        }
      }
    })
  } catch (error) {
    next(error)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    console.log('🔐 Login attempt:', req.body.email)
    
    const validated = loginSchema.parse(req.body)
    const { email, password } = validated

    const user = await prisma.user.findUnique({
      where: { email, deletedAt: null },
      include: { company: true }
    })

    if (!user || !user.password) {
      throw new AppError('Invalid credentials', 401)
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      throw new AppError('Invalid credentials', 401)
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    console.log('✅ Login successful:', user.id)

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId
        },
        company: user.company,
        session: {
          userId: user.id,
          companyId: user.companyId,
          role: user.role
        }
      }
    })
  } catch (error) {
    next(error)
  }
})

export default router
