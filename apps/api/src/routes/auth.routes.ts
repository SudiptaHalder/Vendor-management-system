import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const router = Router()

// Login endpoint - handles both admin and vendor login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    console.log('='.repeat(50))
    console.log('🔐 Login attempt at:', new Date().toISOString())
    console.log('📧 Email:', email)
    console.log('🔑 Password provided:', !!password)
    console.log('📍 Headers:', req.headers)
    console.log('='.repeat(50))

    // First check if it's a regular user (admin)
    console.log('🔍 Checking users table...')
    let user = await prisma.users.findUnique({
      where: { email }
    })

    if (user) {
      console.log('✅ User found in database')
      console.log('User ID:', user.id)
      console.log('User role:', user.role)
      console.log('Password hash exists:', !!user.password)
      console.log('Password hash:', user.password)
      
      const isValid = await bcrypt.compare(password, user.password || '')
      console.log('Password comparison result:', isValid)
      
      if (!isValid) {
        console.log('❌ Password invalid for admin')
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid credentials' 
        })
      }

      console.log('✅ Password valid, generating token...')
      
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
      console.log('Token generated:', token.substring(0, 20) + '...')

      return res.json({
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
    }

    console.log('❌ User not found in users table')
    
    // If not a regular user, check if it's a vendor portal user
    console.log('👤 Checking vendor credentials...')
    
    const vendorCredential = await prisma.vendor_credentials.findFirst({
      where: {
        OR: [
          { username: email },
          { vendor: { email: email } }
        ]
      },
      include: { 
        vendor: true 
      }
    })

    if (vendorCredential) {
      console.log('✅ Vendor found:', vendorCredential.vendor.supplierName)
      
      // Check password (try both regular and temp password)
      const isValid = await bcrypt.compare(password, vendorCredential.password || '')
      const isTempValid = vendorCredential.tempPassword ? 
        await bcrypt.compare(password, vendorCredential.tempPassword) : false

      console.log('Password valid:', isValid)
      console.log('Temp password valid:', isTempValid)

      if (!isValid && !isTempValid) {
        console.log('❌ Invalid password for vendor')
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid credentials' 
        })
      }

      // Update last login
      await prisma.vendor_credentials.update({
        where: { id: vendorCredential.id },
        data: { 
          lastLoginAt: new Date(),
          isTempPassword: isTempValid ? true : vendorCredential.isTempPassword
        }
      })

      const token = jwt.sign(
        { 
          vendorId: vendorCredential.vendorId,
          email: vendorCredential.username,
          type: 'vendor',
          role: 'vendor'
        },
        process.env.JWT_SECRET || 'dev-secret-key',
        { expiresIn: '7d' }
      )

      console.log('✅ Vendor login successful:', vendorCredential.vendor.supplierName)

      return res.json({
        success: true,
        data: {
          user: {
            id: vendorCredential.vendorId,
            email: vendorCredential.username,
            name: vendorCredential.vendor.supplierName,
            type: 'vendor',
            role: 'vendor'
          },
          token
        }
      })
    }

    console.log('❌ No user or vendor found with email:', email)
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid credentials' 
    })

  } catch (error) {
    console.error('💥 Login error:', error)
    console.error('Error stack:', error.stack)
    res.status(500).json({ 
      success: false, 
      error: 'Login failed',
      details: error.message 
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
        include: { credentials: true }
      })

      if (!vendor) {
        return res.status(404).json({ error: 'Vendor not found' })
      }

      return res.json({
        success: true,
        data: {
          user: {
            id: vendor.id,
            email: vendor.credentials?.username || vendor.email,
            name: vendor.supplierName,
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
