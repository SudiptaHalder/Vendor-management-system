import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const router = Router()

// Verify invitation token
router.get('/verify-invitation', async (req, res) => {
  try {
    const { token } = req.query

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token is required' 
      })
    }

    // Find invitation by token
    const invitation = await prisma.vendor_invitations.findUnique({
      where: { invitationToken: token as string },
      include: { vendor: true }
    })

    if (!invitation) {
      return res.status(404).json({ 
        success: false, 
        error: 'Invalid invitation token' 
      })
    }

    // Check if expired
    if (new Date() > invitation.expiresAt) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invitation has expired' 
      })
    }

    // Check if already accepted
    if (invitation.status === 'accepted') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invitation already used' 
      })
    }

    res.json({
      success: true,
      data: {
        supplierCode: invitation.vendor.supplierCode,
        supplierName: invitation.vendor.supplierName,
        email: invitation.email
      }
    })

  } catch (error) {
    console.error('Error verifying invitation:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to verify invitation' 
    })
  }
})

// Set password and complete registration
router.post('/set-password', async (req, res) => {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token and password are required' 
      })
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 8 characters' 
      })
    }

    // Find invitation by token
    const invitation = await prisma.vendor_invitations.findUnique({
      where: { invitationToken: token },
      include: { vendor: true }
    })

    if (!invitation) {
      return res.status(404).json({ 
        success: false, 
        error: 'Invalid invitation token' 
      })
    }

    // Check if expired
    if (new Date() > invitation.expiresAt) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invitation has expired' 
      })
    }

    // Check if already accepted
    if (invitation.status === 'accepted') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invitation already used' 
      })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create or update vendor credentials
    const credentials = await prisma.vendor_credentials.upsert({
      where: { vendorId: invitation.vendorId },
      update: {
        password: hashedPassword,
        isTempPassword: false,
        passwordChangedAt: new Date()
      },
      create: {
        vendorId: invitation.vendorId,
        username: invitation.vendor.supplierCode,
        password: hashedPassword,
        isTempPassword: false,
        passwordChangedAt: new Date(),
        isActive: true
      }
    })

    // Update invitation status
    await prisma.vendor_invitations.update({
      where: { id: invitation.id },
      data: {
        status: 'accepted',
        acceptedAt: new Date()
      }
    })

    // Generate JWT token for immediate login
    const jwtToken = jwt.sign(
      {
        vendorId: invitation.vendorId,
        username: invitation.vendor.supplierCode,
        type: 'vendor'
      },
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      data: {
        token: jwtToken,
        vendor: {
          id: invitation.vendorId,
          name: invitation.vendor.supplierName,
          code: invitation.vendor.supplierCode
        }
      }
    })

  } catch (error) {
    console.error('Error setting password:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to set password' 
    })
  }
})

// Vendor login (after password is set)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username and password are required' 
      })
    }

    // Find vendor credentials
    const credentials = await prisma.vendor_credentials.findUnique({
      where: { username },
      include: { vendor: true }
    })

    if (!credentials) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      })
    }

    // Verify password
    const isValid = await bcrypt.compare(password, credentials.password)
    if (!isValid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      })
    }

    // Update last login
    await prisma.vendor_credentials.update({
      where: { id: credentials.id },
      data: { lastLoginAt: new Date() }
    })

    // Generate JWT token
    const token = jwt.sign(
      {
        vendorId: credentials.vendorId,
        username: credentials.username,
        type: 'vendor'
      },
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      data: {
        token,
        vendor: {
          id: credentials.vendorId,
          name: credentials.vendor.supplierName,
          code: credentials.vendor.supplierCode,
          email: credentials.vendor.email
        }
      }
    })

  } catch (error) {
    console.error('Error logging in:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Login failed' 
    })
  }
})

export default router
