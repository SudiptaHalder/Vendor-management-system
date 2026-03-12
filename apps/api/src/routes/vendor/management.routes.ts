import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { authMiddleware } from '../../middleware/auth.middleware'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

const router = Router()

// ========================================
// GET ALL VENDORS WITH PORTAL STATUS
// Targets: VendorMaster, vendor_credentials, vendor_invitations
// ========================================

router.get('/vendors-with-status', authMiddleware, async (req, res) => {
  try {
    // Get all vendor master data (this has supplierCode, supplierName, email)
    const vendorMasters = await prisma.vendorMaster.findMany({
      orderBy: {
        supplierName: 'asc'
      }
    });

    // For each vendor master, get their credentials and invitations
    const vendorsWithStatus = await Promise.all(
      vendorMasters.map(async (master) => {
        // Get credentials for this vendor
        const credentials = await prisma.vendor_credentials.findFirst({
          where: {
            username: master.supplierCode // username is the supplierCode
          }
        });

        // Get the latest invitation for this vendor
        const latestInvitation = await prisma.vendor_invitations.findFirst({
          where: {
            vendor: {
              supplierCode: master.supplierCode
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        return {
          // From VendorMaster
          id: master.id,
          supplierCode: master.supplierCode,
          supplierName: master.supplierName,
          email: master.email,
          
          // From vendor_credentials
          credentials: credentials ? {
            isActive: credentials.isActive,
            lastLoginAt: credentials.lastLoginAt,
            hasCredentials: true
          } : {
            isActive: false,
            lastLoginAt: null,
            hasCredentials: false
          },
          
          // From vendor_invitations
          invitation: latestInvitation ? {
            status: latestInvitation.status,
            sentAt: latestInvitation.sentAt,
            acceptedAt: latestInvitation.acceptedAt,
            expiresAt: latestInvitation.expiresAt
          } : null,
          
          // Computed portal status
          portalStatus: credentials ? 'active' 
            : latestInvitation?.status === 'accepted' ? 'accepted'
            : latestInvitation?.status === 'sent' ? 'invited'
            : 'not_invited'
        };
      })
    );

    res.json({
      success: true,
      data: vendorsWithStatus
    });

  } catch (error) {
    console.error('Error fetching vendors with status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch vendors' 
    });
  }
});

// ========================================
// GET PORTAL STATISTICS
// ========================================

router.get('/portal/stats', authMiddleware, async (req, res) => {
  try {
    const [totalVendors, activeUsers, pendingInvitations, acceptedInvitations] = await Promise.all([
      // Total vendors from VendorMaster
      prisma.vendorMaster.count(),
      
      // Active users from vendor_credentials
      prisma.vendor_credentials.count({
        where: { 
          isActive: true,
          lastLoginAt: { not: null }
        }
      }),
      
      // Pending invitations
      prisma.vendor_invitations.count({
        where: { status: 'sent' }
      }),
      
      // Accepted invitations
      prisma.vendor_invitations.count({
        where: { status: 'accepted' }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalVendors,
        activeUsers,
        pendingInvitations,
        acceptedInvitations,
        notInvited: totalVendors - (pendingInvitations + acceptedInvitations)
      }
    });

  } catch (error) {
    console.error('Error fetching portal stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch portal statistics' 
    });
  }
});

// ========================================
// GET SINGLE VENDOR DETAILS
// ========================================

router.get('/vendors/:supplierCode', authMiddleware, async (req, res) => {
  try {
    const { supplierCode } = req.params;

    // Get vendor master data
    const vendorMaster = await prisma.vendorMaster.findUnique({
      where: { supplierCode }
    });

    if (!vendorMaster) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }

    // Get credentials
    const credentials = await prisma.vendor_credentials.findFirst({
      where: { username: supplierCode }
    });

    // Get invitations
    const invitations = await prisma.vendor_invitations.findMany({
      where: {
        vendor: {
          supplierCode
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: {
        // From VendorMaster
        ...vendorMaster,
        // From credentials
        credentials: credentials || null,
        // From invitations
        invitations: invitations || []
      }
    });

  } catch (error) {
    console.error('Error fetching vendor details:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch vendor details' 
    });
  }
});

// ========================================
// SEND INVITATION TO VENDOR
// Creates/updates vendor_invitations and vendor_credentials
// ========================================

router.post('/vendors/:supplierCode/invite', authMiddleware, async (req, res) => {
  try {
    const { supplierCode } = req.params;
    const { email } = req.body;

    // Get vendor master data
    const vendorMaster = await prisma.vendorMaster.findUnique({
      where: { supplierCode }
    });

    if (!vendorMaster) {
      return res.status(404).json({ 
        success: false, 
        error: 'Vendor not found' 
      });
    }

    // Check if there's already a pending invitation
    const existingInvitation = await prisma.vendor_invitations.findFirst({
      where: {
        vendor: {
          supplierCode
        },
        status: { in: ['pending', 'sent'] }
      }
    });

    if (existingInvitation) {
      return res.status(400).json({ 
        success: false, 
        error: 'Vendor already has a pending invitation' 
      });
    }

    // Generate temporary password and invitation token
    const tempPassword = crypto.randomBytes(4).toString('hex'); // 8 chars
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const invitationToken = crypto.randomBytes(32).toString('hex');

    // First, find or create the vendor record (needed for relationship)
    let vendor = await prisma.vendors.findUnique({
      where: { supplierCode }
    });

    if (!vendor) {
      // Create vendor record if it doesn't exist
      vendor = await prisma.vendors.create({
        data: {
          supplierCode,
          supplierName: vendorMaster.supplierName,
          email: email || vendorMaster.email,
          status: 'active'
        }
      });
    }

    // Create invitation
    const invitation = await prisma.vendor_invitations.create({
      data: {
        vendorId: vendor.id,
        email: email || vendorMaster.email || `${supplierCode.toLowerCase()}@vendorflow.com`,
        username: supplierCode,
        tempPassword: hashedPassword,
        invitationToken,
        status: 'sent',
        sentAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    // Log invitation details (replace with actual email sending)
    console.log('='.repeat(50));
    console.log(`📧 Invitation sent to ${vendorMaster.supplierName}:`);
    console.log(`   Email: ${invitation.email}`);
    console.log(`   Login URL: http://localhost:3000/vendor-login?token=${invitationToken}`);
    console.log(`   Username: ${supplierCode}`);
    console.log(`   Temporary Password: ${tempPassword}`);
    console.log('='.repeat(50));

    res.json({
      success: true,
      data: {
        id: invitation.id,
        email: invitation.email,
        status: invitation.status,
        expiresAt: invitation.expiresAt
      },
      message: `Invitation sent to ${vendorMaster.supplierName}`
    });

  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send invitation' 
    });
  }
});

// ========================================
// BULK SEND INVITATIONS
// ========================================

router.post('/vendors/bulk-invite', authMiddleware, async (req, res) => {
  try {
    const { supplierCodes } = req.body;

    if (!supplierCodes || !Array.isArray(supplierCodes) || supplierCodes.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No vendors selected' 
      });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      invitations: [] as any[]
    };

    for (const supplierCode of supplierCodes) {
      try {
        // Get vendor master
        const vendorMaster = await prisma.vendorMaster.findUnique({
          where: { supplierCode }
        });

        if (!vendorMaster) {
          results.failed++;
          results.errors.push(`Vendor ${supplierCode} not found`);
          continue;
        }

        // Find or create vendor record
        let vendor = await prisma.vendors.findUnique({
          where: { supplierCode }
        });

        if (!vendor) {
          vendor = await prisma.vendors.create({
            data: {
              supplierCode,
              supplierName: vendorMaster.supplierName,
              email: vendorMaster.email,
              status: 'active'
            }
          });
        }

        // Check for existing invitation
        const existing = await prisma.vendor_invitations.findFirst({
          where: {
            vendorId: vendor.id,
            status: { in: ['pending', 'sent'] }
          }
        });

        if (existing) {
          results.failed++;
          results.errors.push(`${vendorMaster.supplierName} already has a pending invitation`);
          continue;
        }

        // Generate invitation
        const tempPassword = crypto.randomBytes(4).toString('hex');
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        const invitationToken = crypto.randomBytes(32).toString('hex');

        const invitation = await prisma.vendor_invitations.create({
          data: {
            vendorId: vendor.id,
            email: vendorMaster.email || `${supplierCode.toLowerCase()}@vendorflow.com`,
            username: supplierCode,
            tempPassword: hashedPassword,
            invitationToken,
            status: 'sent',
            sentAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        });

        results.success++;
        results.invitations.push({
          vendorName: vendorMaster.supplierName,
          email: invitation.email,
          token: invitationToken
        });

        console.log(`✅ Invitation sent to ${vendorMaster.supplierName}`);

      } catch (err) {
        results.failed++;
        results.errors.push(`Failed to invite vendor ${supplierCode}: ${err}`);
      }
    }

    res.json({
      success: true,
      data: results,
      message: `Sent ${results.success} invitations, ${results.failed} failed`
    });

  } catch (error) {
    console.error('Error in bulk invite:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process bulk invitations' 
    });
  }
});

// ========================================
// RESEND INVITATION
// ========================================

router.post('/vendors/:supplierCode/resend-invitation', authMiddleware, async (req, res) => {
  try {
    const { supplierCode } = req.params;

    // Get vendor master
    const vendorMaster = await prisma.vendorMaster.findUnique({
      where: { supplierCode }
    });

    if (!vendorMaster) {
      return res.status(404).json({ 
        success: false, 
        error: 'Vendor not found' 
      });
    }

    // Find vendor record
    const vendor = await prisma.vendors.findUnique({
      where: { supplierCode }
    });

    if (!vendor) {
      return res.status(404).json({ 
        success: false, 
        error: 'Vendor record not found' 
      });
    }

    // Find the latest invitation
    const latestInvitation = await prisma.vendor_invitations.findFirst({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' }
    });

    if (!latestInvitation) {
      return res.status(404).json({ 
        success: false, 
        error: 'No previous invitation found' 
      });
    }

    // Generate new token and password
    const tempPassword = crypto.randomBytes(4).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const invitationToken = crypto.randomBytes(32).toString('hex');

    // Create new invitation
    const newInvitation = await prisma.vendor_invitations.create({
      data: {
        vendorId: vendor.id,
        email: latestInvitation.email,
        username: supplierCode,
        tempPassword: hashedPassword,
        invitationToken,
        status: 'sent',
        sentAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    console.log('='.repeat(50));
    console.log(`📧 Resent invitation to ${vendorMaster.supplierName}:`);
    console.log(`   Login URL: http://localhost:3000/vendor-login?token=${invitationToken}`);
    console.log(`   Username: ${supplierCode}`);
    console.log(`   Temporary Password: ${tempPassword}`);
    console.log('='.repeat(50));

    res.json({
      success: true,
      data: newInvitation,
      message: `Invitation resent to ${vendorMaster.supplierName}`
    });

  } catch (error) {
    console.error('Error resending invitation:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to resend invitation' 
    });
  }
});

export default router;