import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { authMiddleware } from '../../middleware/auth.middleware'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { emailService } from '../../services/email.service'

const router = Router()

// ========================================
// GET VENDORS WITH STATUS
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

    const formatted = vendors.map(v => ({
      id: v.id,
      supplierCode: v.supplierCode,
      supplierName: v.supplierName,
      email: v.email,
      status: v.status,
      createdAt: v.createdAt,
      invitationStatus: v.invitations[0]?.status || null,
      invitationSentAt: v.invitations[0]?.sentAt || null,
      invitationAcceptedAt: v.invitations[0]?.acceptedAt || null,
      lastLoginAt: v.credentials?.lastLoginAt || null,
      hasCredentials: !!v.credentials
    }))

    res.json({ success: true, data: formatted })
  } catch (error) {
    console.error('❌ Error fetching vendors:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch vendors' })
  }
})

// ========================================
// GET PORTAL STATS
// ========================================
router.get('/portal/stats', authMiddleware, async (req, res) => {
  try {
    const [
      totalVendors,
      activeUsers,
      pendingInvitations,
      acceptedInvitations,
      frozenVendors,
      deletedVendors
    ] = await Promise.all([
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
    console.error('❌ Error fetching stats:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch stats' })
  }
})

// ========================================
// BULK / SINGLE / RESEND INVITE
// ========================================
router.post('/vendors/bulk-invite', authMiddleware, async (req, res) => {
  console.log('\n🔵 BULK INVITE REQUEST')

  const { vendorIds } = req.body

  if (!vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
    return res.status(400).json({ success: false, error: 'No vendors selected' })
  }

  let successCount = 0
  let failCount = 0
  const errors: string[] = []

  for (const vendorId of vendorIds) {
    try {
      const vendor = await prisma.vendors.findUnique({
        where: { id: vendorId }
      })

      if (!vendor) {
        failCount++
        errors.push(`Vendor not found: ${vendorId}`)
        continue
      }

      // Generate new credentials
      const tempPassword = crypto.randomBytes(4).toString('hex')
      const hashedPassword = await bcrypt.hash(tempPassword, 10)
      const invitationToken = crypto.randomBytes(32).toString('hex')

      // Expire old invitations
      await prisma.vendor_invitations.updateMany({
        where: {
          vendorId,
          status: { in: ['pending', 'sent'] }
        },
        data: { status: 'expired' }
      })

      const email = vendor.email || `${vendor.supplierCode.toLowerCase()}@vendorflow.com`

      // Create new invitation
      await prisma.vendor_invitations.create({
        data: {
          vendorId,
          email,
          username: vendor.supplierCode,
          tempPassword: hashedPassword,
          invitationToken,
          status: 'sent',
          sentAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      })

      // Send email
      const emailResult = await emailService.sendVendorInvitation({
        email,
        supplierName: vendor.supplierName,
        supplierCode: vendor.supplierCode,
        tempPassword,
        invitationToken
      })

      if (!emailResult.success) {
        failCount++
        errors.push(`Email failed for ${vendor.supplierName}`)
        continue
      }

      successCount++
    } catch (err: any) {
      console.error('❌ Error:', err)
      failCount++
      errors.push(err?.message || 'Unknown error')
    }
  }

  res.json({
    success: true,
    data: { successCount, failCount, errors },
    message: `Sent ${successCount} invitations, ${failCount} failed`
  })
})

export default router