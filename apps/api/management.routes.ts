import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { authMiddleware } from '../../middleware/auth.middleware'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

const router = Router()

// ========================================
// GET ALL VENDORS WITH PORTAL STATUS
// ========================================
router.get('/vendors-with-status', authMiddleware, async (req, res) => {
  try {
    const vendors = await prisma.vendors.findMany({
      include: {
        credentials: true,
        invitations: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const vendorsWithStatus = vendors.map(vendor => ({
      id: vendor.id,
      supplierCode: vendor.supplierCode,
      supplierName: vendor.supplierName,
      email: vendor.email,
      status: vendor.status,
      createdAt: vendor.createdAt,
      invitationStatus: vendor.invitations[0]?.status || null,
      invitationSentAt: vendor.invitations[0]?.sentAt || null,
      invitationAcceptedAt: vendor.invitations[0]?.acceptedAt || null,
      lastLoginAt: vendor.credentials?.lastLoginAt || null,
      hasCredentials: !!vendor.credentials
    }))

    res.json({ success: true, data: vendorsWithStatus })
  } catch (error) {
    console.error('Error fetching vendors:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch vendors' })
  }
})

// ========================================
// GET PORTAL STATISTICS
// ========================================
router.get('/portal/stats', authMiddleware, async (req, res) => {
  try {
    const [totalVendors, activeUsers, pendingInvitations, acceptedInvitations, frozenVendors, deletedVendors] = await Promise.all([
      prisma.vendors.count(),
      prisma.vendor_credentials.count({ where: { lastLoginAt: { not: null } } }),
      prisma.vendor_invitations.count({ where: { status: 'sent' } }),
      prisma.vendor_invitations.count({ where: { status: 'accepted' } }),
      prisma.vendors.count({ where: { status: 'frozen' } }),
      prisma.vendors.count({ where: { status: 'deleted' } })
    ])

    res.json({
      success: true,
      data: {
        totalVendors,
        activeUsers,
        pendingInvitations,
        acceptedInvitations,
        notInvited: totalVendors - (pendingInvitations + acceptedInvitations),
        frozenVendors,
        deletedVendors
      }
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch stats' })
  }
})

// ========================================
// BULK SEND INVITATIONS - WITH DEBUG LOGS
// ========================================
router.post('/vendors/bulk-invite', authMiddleware, async (req, res) => {
  console.log('='.repeat(60))
  console.log('📨 BULK INVITE ENDPOINT HIT')
  console.log('Timestamp:', new Date().toISOString())
  console.log('Request body:', JSON.stringify(req.body, null, 2))
  
  const { vendorIds } = req.body

  console.log('vendorIds value:', vendorIds)
  console.log('vendorIds type:', typeof vendorIds)
  console.log('Is array:', Array.isArray(vendorIds))
  console.log('vendorIds length:', vendorIds?.length)

  if (!vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
    console.log('❌ No vendors selected - returning error')
    return res.status(400).json({ success: false, error: 'No vendors selected' })
  }

  let successCount = 0
  let failCount = 0
  const errors = []

  for (const vendorId of vendorIds) {
    console.log(`\n--- Processing vendor ID: ${vendorId} ---`)
    
    try {
      // Try to find vendor by ID
      const vendor = await prisma.vendors.findUnique({ 
        where: { id: vendorId } 
      })
      
      if (!vendor) {
        console.log(`❌ Vendor NOT found for ID: ${vendorId}`)
        errors.push(`Vendor ${vendorId} not found`)
        failCount++
        continue
      }

      console.log(`✅ Vendor found: ${vendor.supplierName} (${vendor.supplierCode})`)
      console.log(`   Email: ${vendor.email}`)
      console.log(`   Status: ${vendor.status}`)

      // Check for existing pending invitation
      const existing = await prisma.vendor_invitations.findFirst({
        where: { 
          vendorId, 
          status: { in: ['pending', 'sent'] } 
        }
      })

      if (existing) {
        console.log(`⚠️ Existing invitation found: ${existing.status}`)
        errors.push(`${vendor.supplierName} already has a pending invitation`)
        failCount++
        continue
      }

      // Generate invitation
      const tempPassword = crypto.randomBytes(4).toString('hex')
      const hashedPassword = await bcrypt.hash(tempPassword, 10)
      const invitationToken = crypto.randomBytes(32).toString('hex')

      console.log(`🔐 Generated invitation:`)
      console.log(`   Temp password: ${tempPassword}`)
      console.log(`   Token: ${invitationToken.substring(0, 20)}...`)

      // Create invitation
      await prisma.vendor_invitations.create({
        data: {
          vendorId,
          email: vendor.email || `${vendor.supplierCode.toLowerCase()}@vendorflow.com`,
          username: vendor.supplierCode,
          tempPassword: hashedPassword,
          invitationToken,
          status: 'sent',
          sentAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      })

      console.log(`✅ Invitation created for ${vendor.supplierName}`)
      successCount++
      
    } catch (err: any) {
      console.error(`❌ Error:`, err.message)
      failCount++
      errors.push(err.message)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 SUMMARY:')
  console.log(`   Success: ${successCount}`)
  console.log(`   Failed: ${failCount}`)
  console.log(`   Errors: ${errors.join(', ') || 'None'}`)
  console.log('='.repeat(60))
  
  res.json({
    success: true,
    data: { successCount, failCount, errors },
    message: `Sent ${successCount} invitations, ${failCount} failed`
  })
})

export default router
