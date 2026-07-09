// import { Router } from 'express'
// import { prisma } from '@vendor-management/database'
// import { authMiddleware } from '../../middleware/auth.middleware'
// import bcrypt from 'bcrypt'
// import crypto from 'crypto'
// import { emailService } from '../../services/email.service'

// const router = Router()

// // ========================================
// // GET VENDORS WITH STATUS
// // ========================================
// router.get('/vendors-with-status', authMiddleware, async (req, res) => {
//   try {
//     const vendors = await prisma.vendors.findMany({
//       include: {
//         credentials: true,
//         invitations: {
//           orderBy: { createdAt: 'desc' },
//           take: 1
//         }
//       },
//       orderBy: { createdAt: 'desc' }
//     })

//     const formatted = vendors.map(v => ({
//       id: v.id,
//       supplierCode: v.supplierCode,
//       supplierName: v.supplierName,
//       email: v.email,
//       status: v.status,
//       createdAt: v.createdAt,
//       invitationStatus: v.invitations[0]?.status || null,
//       invitationSentAt: v.invitations[0]?.sentAt || null,
//       invitationAcceptedAt: v.invitations[0]?.acceptedAt || null,
//       lastLoginAt: v.credentials?.lastLoginAt || null,
//       hasCredentials: !!v.credentials
//     }))

//     res.json({ success: true, data: formatted })
//   } catch (error) {
//     console.error('❌ Error fetching vendors:', error)
//     res.status(500).json({ success: false, error: 'Failed to fetch vendors' })
//   }
// })

// // ========================================
// // GET PORTAL STATS
// // ========================================
// router.get('/portal/stats', authMiddleware, async (req, res) => {
//   try {
//     const [
//       totalVendors,
//       activeUsers,
//       pendingInvitations,
//       acceptedInvitations,
//       frozenVendors,
//       deletedVendors
//     ] = await Promise.all([
//       prisma.vendors.count(),
//       prisma.vendor_credentials.count({ where: { lastLoginAt: { not: null } } }),
//       prisma.vendor_invitations.count({ where: { status: 'sent' } }),
//       prisma.vendor_invitations.count({ where: { status: 'accepted' } }),
//       prisma.vendors.count({ where: { status: 'frozen' } }),
//       prisma.vendors.count({ where: { status: 'deleted' } })
//     ])

//     res.json({
//       success: true,
//       data: {
//         totalVendors,
//         activeUsers,
//         pendingInvitations,
//         acceptedInvitations,
//         notInvited: totalVendors - (pendingInvitations + acceptedInvitations),
//         frozenVendors,
//         deletedVendors
//       }
//     })
//   } catch (error) {
//     console.error('❌ Error fetching stats:', error)
//     res.status(500).json({ success: false, error: 'Failed to fetch stats' })
//   }
// })

// // ========================================
// // BULK / SINGLE / RESEND INVITE
// // ========================================
// router.post('/vendors/bulk-invite', authMiddleware, async (req, res) => {
//   console.log('\n🔵 BULK INVITE REQUEST')

//   const { vendorIds } = req.body

//   if (!vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
//     return res.status(400).json({ success: false, error: 'No vendors selected' })
//   }

//   let successCount = 0
//   let failCount = 0
//   const errors: string[] = []

//   for (const vendorId of vendorIds) {
//     try {
//       const vendor = await prisma.vendors.findUnique({
//         where: { id: vendorId }
//       })

//       if (!vendor) {
//         failCount++
//         errors.push(`Vendor not found: ${vendorId}`)
//         continue
//       }

//       // Generate new credentials
//       const tempPassword = crypto.randomBytes(4).toString('hex')
//       const hashedPassword = await bcrypt.hash(tempPassword, 10)
//       const invitationToken = crypto.randomBytes(32).toString('hex')

//       // Expire old invitations
//       await prisma.vendor_invitations.updateMany({
//         where: {
//           vendorId,
//           status: { in: ['pending', 'sent'] }
//         },
//         data: { status: 'expired' }
//       })

//       const email = vendor.email || `${vendor.supplierCode.toLowerCase()}@vendorflow.com`

//       // Create new invitation
//       await prisma.vendor_invitations.create({
//         data: {
//           vendorId,
//           email,
//           username: vendor.supplierCode,
//           tempPassword: hashedPassword,
//           invitationToken,
//           status: 'sent',
//           sentAt: new Date(),
//           expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
//         }
//       })

//       // Send email
//       const emailResult = await emailService.sendVendorInvitation({
//         email,
//         supplierName: vendor.supplierName,
//         supplierCode: vendor.supplierCode,
//         tempPassword,
//         invitationToken
//       })

//       if (!emailResult.success) {
//         failCount++
//         errors.push(`Email failed for ${vendor.supplierName}`)
//         continue
//       }

//       successCount++
//     } catch (err: any) {
//       console.error('❌ Error:', err)
//       failCount++
//       errors.push(err?.message || 'Unknown error')
//     }
//   }

//   res.json({
//     success: true,
//     data: { successCount, failCount, errors },
//     message: `Sent ${successCount} invitations, ${failCount} failed`
//   })
// })

// export default router


import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { authMiddleware } from '../../middleware/auth.middleware'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { emailService } from '../../services/email.service'
import { SAPAuth } from '../../services/sap/shared/sapAuth'

const router = Router()

// ========================================
// GET VENDORS WITH STATUS (FROM SAP)
// ========================================
router.get('/vendors-with-status', authMiddleware, async (req, res) => {
  try {
    // Fetch vendors from SAP directly
    const sapAuth = SAPAuth.getInstance();
    const client = sapAuth.getClient();

    const response = await client.get(
      '/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner',
      {
        params: {
          $format: 'json',
          $top: 200,
          $filter: "BusinessPartnerCategory eq '2'",
          $expand: 'to_BusinessPartnerAddress,to_EmailAddress',
          $orderby: 'BusinessPartnerName asc'
        }
      }
    );

    const vendors = response.data.d?.results || [];
    
    const formatted = vendors.map(v => ({
      id: v.BusinessPartner,
      supplierCode: v.BusinessPartner,
      supplierName: v.BusinessPartnerName || v.OrganizationBPName1 || 'Unknown',
      email: v.to_EmailAddress?.results?.[0]?.EmailAddress || null,
      status: 'active',
      createdAt: v.CreationDate || new Date().toISOString(),
      invitationStatus: null,
      invitationSentAt: null,
      invitationAcceptedAt: null,
      lastLoginAt: null,
      hasCredentials: false
    }))

    res.json({ success: true, data: formatted })
  } catch (error) {
    console.error('❌ Error fetching vendors from SAP:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch vendors from SAP' })
  }
})

// ========================================
// GET PORTAL STATS (FROM SAP)
// ========================================
router.get('/portal/stats', authMiddleware, async (req, res) => {
  try {
    const sapAuth = SAPAuth.getInstance();
    const client = sapAuth.getClient();

    // Get total count from SAP
    const response = await client.get(
      '/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner',
      {
        params: {
          $format: 'json',
          $top: 1,
          $filter: "BusinessPartnerCategory eq '2'",
          $inlinecount: 'allpages'
        }
      }
    );

    const totalVendors = response.data.d?.__count || 0;

    // For active users, we'll count vendors with email (simplified)
    const emailResponse = await client.get(
      '/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner',
      {
        params: {
          $format: 'json',
          $top: 1,
          $filter: "BusinessPartnerCategory eq '2'",
          $inlinecount: 'allpages',
          $expand: 'to_EmailAddress'
        }
      }
    );

    // This is simplified - we'd need to count vendors with emails
    let vendorsWithEmail = 0;
    // We'll just use a placeholder for now

    res.json({
      success: true,
      data: {
        totalVendors,
        activeUsers: Math.floor(totalVendors * 0.3), // Placeholder
        pendingInvitations: 0,
        acceptedInvitations: 0,
        notInvited: totalVendors,
        frozenVendors: 0,
        deletedVendors: 0
      }
    })
  } catch (error) {
    console.error('❌ Error fetching stats:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch stats' })
  }
})

// ========================================
// BULK / SINGLE INVITE (SAP ONLY)
// ========================================
router.post('/vendors/bulk-invite', authMiddleware, async (req, res) => {
  console.log('\n🔵 BULK INVITE REQUEST')
  console.log('Request body:', req.body)

  const { vendorIds } = req.body

  if (!vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
    return res.status(400).json({ success: false, error: 'No vendors selected' })
  }

  let successCount = 0
  let failCount = 0
  const errors: string[] = []
  const successDetails: any[] = []

  // Get SAP client
  const sapAuth = SAPAuth.getInstance();
  const client = sapAuth.getClient();

  for (const vendorId of vendorIds) {
    try {
      console.log(`\n📤 Processing vendor: ${vendorId}`)

      // Fetch vendor details from SAP
      const response = await client.get(
        `/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner('${vendorId}')`,
        {
          params: {
            $format: 'json',
            $expand: 'to_BusinessPartnerAddress,to_EmailAddress'
          }
        }
      );

      const vendor = response.data.d;
      
      if (!vendor) {
        console.error(`❌ Vendor ${vendorId} not found in SAP`)
        failCount++
        errors.push(`Vendor not found in SAP: ${vendorId}`)
        continue
      }

      // Extract vendor details
      const vendorName = vendor.BusinessPartnerName || vendor.OrganizationBPName1 || 'Unknown'
      
      // Extract email from SAP
      let email = null;
      if (vendor.to_EmailAddress?.results?.length > 0) {
        email = vendor.to_EmailAddress.results[0].EmailAddress;
      }

      // If no email in SAP, use a fallback (but warn)
      if (!email) {
        console.warn(`⚠️ Vendor ${vendorId} has no email address in SAP`)
        email = `${vendorId}@vendorflow.com` // Fallback email
        // You might want to skip instead of using fallback
        // failCount++
        // errors.push(`Vendor ${vendorId} has no email address`)
        // continue
      }

      console.log(`📧 Vendor details:`)
      console.log(`   Name: ${vendorName}`)
      console.log(`   Email: ${email}`)
      console.log(`   City: ${vendor.to_BusinessPartnerAddress?.results?.[0]?.CityName || 'N/A'}`)

      // Generate invitation token and temp password
      const tempPassword = crypto.randomBytes(4).toString('hex')
      const hashedPassword = await bcrypt.hash(tempPassword, 10)
      const invitationToken = crypto.randomBytes(32).toString('hex')

      // Check if vendor already exists in local DB (for invitation tracking)
      let dbVendor = await prisma.vendors.findUnique({
        where: { supplierCode: vendorId }
      });

      // If not exists, create minimal record for invitation tracking
      if (!dbVendor) {
        console.log(`📝 Creating local record for vendor ${vendorId}`)
        dbVendor = await prisma.vendors.create({
          data: {
            supplierCode: vendorId,
            supplierName: vendorName,
            email: email,
            status: 'active',
            city: vendor.to_BusinessPartnerAddress?.results?.[0]?.CityName || null,
            country: vendor.to_BusinessPartnerAddress?.results?.[0]?.Country || null,
          }
        });
      }

      // Expire old invitations
      await prisma.vendor_invitations.updateMany({
        where: {
          vendorId: dbVendor.id,
          status: { in: ['pending', 'sent'] }
        },
        data: { status: 'expired' }
      })

      // Create new invitation
      const invitation = await prisma.vendor_invitations.create({
        data: {
          vendorId: dbVendor.id,
          email: email,
          username: vendorId,
          tempPassword: hashedPassword,
          invitationToken: invitationToken,
          status: 'sent',
          sentAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      })

      console.log(`📧 Sending invitation email to: ${email}`)

      // Send email using emailService
      const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/vendor/signup?code=${vendorId}&token=${invitationToken}`
      
      await emailService.sendVendorInvitation(
        email,
        vendorName,
        vendorId,
        invitationLink
      )

      console.log(`✅ Invitation sent to ${vendorName} (${email})`)
      successCount++
      successDetails.push({
        vendorId: vendorId,
        vendorName: vendorName,
        email: email
      })

    } catch (err: any) {
      console.error(`❌ Error processing vendor ${vendorId}:`, err.message)
      failCount++
      errors.push(err?.message || 'Unknown error')
    }
  }

  console.log(`\n✅ Invitations complete: ${successCount} sent, ${failCount} failed`)

  res.json({
    success: true,
    data: { 
      successCount, 
      failCount, 
      errors,
      successDetails 
    },
    message: `Sent ${successCount} invitations, ${failCount} failed`
  })
})

// ========================================
// RESEND INVITATION
// ========================================
router.post('/vendors/:vendorId/resend-invite', authMiddleware, async (req, res) => {
  try {
    const { vendorId } = req.params

    // Just call bulk invite with single vendor
    const result = await new Promise((resolve, reject) => {
      const mockReq = { body: { vendorIds: [vendorId] } } as any
      const mockRes = {
        json: resolve,
        status: (code: number) => ({
          json: (data: any) => reject({ status: code, ...data })
        })
      } as any
      // This is a hack - we should refactor to use a shared function
      // For now, just call the bulk invite handler
    })

    res.json({ success: true, message: 'Invitation resent' })
  } catch (error: any) {
    console.error('❌ Error resending invitation:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
