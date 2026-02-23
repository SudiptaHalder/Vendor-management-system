import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const router = Router()

// Simple login - no complex validation
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    console.log('🔐 Login attempt:', email)

    // Find user
    const user = await prisma.users.findUnique({
      where: { email }
    })

    if (!user || !user.password) {
      console.log('❌ User not found:', email)
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      })
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      console.log('❌ Invalid password for:', email)
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      })
    }

    // Generate token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: '7d' }
    )

    console.log('✅ Login successful:', user.email)
    console.log('✅ User ID:', user.id)
    console.log('✅ Role:', user.role)

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Login failed' 
    })
  }
})

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key')
    
    const user = await prisma.users.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      success: true,
      data: { user }
    })
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
})

export default router
