import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const router = Router()

// Login endpoint - handles both admin and vendor login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    console.log('🔐 Login attempt:', email)

    // First check if it's a regular user (admin)
    let user = await prisma.users.findUnique({
      where: { email }
    })

    // If not a regular user, check if it's a vendor portal user
    if (!user) {
      console.log('👤 Not an admin user, checking vendor portal...')
      
      const vendorAccess = await prisma.vendor_portal_access.findUnique({
        where: { email },
        include: { vendor: true }
      })

      if (vendorAccess) {
        console.log('✅ Vendor found:', vendorAccess.vendor.name)
        
        const isValid = await bcrypt.compare(password, vendorAccess.password || '')
        if (!isValid) {
          console.log('❌ Invalid password for vendor')
          return res.status(401).json({ 
            success: false, 
            error: 'Invalid credentials' 
          })
        }

        // Update last login
        await prisma.vendor_portal_access.update({
          where: { id: vendorAccess.id },
          data: { lastLoginAt: new Date() }
        })

        const token = jwt.sign(
          { 
            vendorId: vendorAccess.vendorId,
            email: vendorAccess.email,
            type: 'vendor',
            role: 'vendor',
            accessLevel: vendorAccess.accessLevel
          },
          process.env.JWT_SECRET || 'dev-secret-key',
          { expiresIn: '7d' }
        )

        console.log('✅ Vendor login successful:', vendorAccess.vendor.name)

        return res.json({
          success: true,
          data: {
            user: {
              id: vendorAccess.vendorId,
              email: vendorAccess.email,
              name: vendorAccess.vendor.name,
              type: 'vendor',
              role: 'vendor'
            },
            token
          }
        })
      }

      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      })
    }

    // Regular user login
    const isValid = await bcrypt.compare(password, user.password || '')
    if (!isValid) {
      console.log('❌ Invalid password for admin')
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      })
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        type: 'admin',
        role: user.role 
      },
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: '7d' }
    )

    console.log('✅ Admin login successful:', user.email)

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          type: 'admin',
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
    
    if (decoded.type === 'vendor') {
      const vendor = await prisma.vendors.findUnique({
        where: { id: decoded.vendorId },
        include: { portalAccess: true }
      })

      if (!vendor) {
        return res.status(404).json({ error: 'Vendor not found' })
      }

      return res.json({
        success: true,
        data: {
          user: {
            id: vendor.id,
            email: decoded.email,
            name: vendor.name,
            type: 'vendor',
            role: 'vendor'
          }
        }
      })
    }

    const user = await prisma.users.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          type: 'admin',
          role: user.role
        }
      }
    })
  } catch (error) {
    console.error('Auth error:', error)
    res.status(401).json({ error: 'Invalid token' })
  }
})

export default router
