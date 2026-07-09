// import { Router } from 'express';
// import { authMiddleware } from '../middleware/auth.middleware';
// import { emailService } from '../services/email.service';
// import { prisma } from '@vendor-management/database';
// import bcrypt from 'bcrypt';
// import crypto from 'crypto';

// const router = Router();

// // Send invitation to SAP vendor using the vendor detail API
// router.post('/invite', authMiddleware, async (req, res) => {
//   try {
//     const { vendorId } = req.body;
    
//     if (!vendorId) {
//       return res.status(400).json({ success: false, error: 'Vendor ID required' });
//     }

//     console.log(`📤 Sending invitation to SAP vendor: ${vendorId}`);

//     // First, get the vendor details using the existing API
//     const token = req.headers.authorization?.replace('Bearer ', '');
    
//     if (!token) {
//       return res.status(401).json({ success: false, error: 'Unauthorized' });
//     }

//     // Call the vendor detail API
//     const detailResponse = await fetch(
//       `http://localhost:3001/api/sap/vendors/complete/${vendorId}`,
//       {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );

//     if (!detailResponse.ok) {
//       throw new Error(`Failed to fetch vendor details: ${detailResponse.status}`);
//     }

//     const detailData = await detailResponse.json();
    
//     if (!detailData.success || !detailData.data) {
//       throw new Error('Vendor not found');
//     }

//     const vendor = detailData.data;
//     const email = vendor.Email;
//     const vendorName = vendor.VendorName || vendor.BusinessPartnerName || 'Unknown';

//     console.log(`📧 Vendor details from API:`);
//     console.log(`   Name: ${vendorName}`);
//     console.log(`   Email: ${email}`);
//     console.log(`   Phone: ${vendor.Phone}`);

//     if (!email) {
//       return res.status(400).json({ 
//         success: false, 
//         error: 'Vendor has no email address in SAP. Please add email in SAP first.' 
//       });
//     }

//     // Check if vendor exists in local DB (for tracking)
//     let dbVendor = await prisma.vendors.findUnique({
//       where: { supplierCode: vendorId }
//     });

//     if (!dbVendor) {
//       dbVendor = await prisma.vendors.create({
//         data: {
//           supplierCode: vendorId,
//           supplierName: vendorName,
//           email: email,
//           status: 'active',
//           city: vendor.City || null,
//           country: vendor.Country || null,
//           gstn: vendor.GSTN || null
//         }
//       });
//     }

//     // Generate invitation token and temp password
//     const tempPassword = crypto.randomBytes(4).toString('hex');
//     const hashedPassword = await bcrypt.hash(tempPassword, 10);
//     const invitationToken = crypto.randomBytes(32).toString('hex');

//     // Expire old invitations
//     await prisma.vendor_invitations.updateMany({
//       where: {
//         vendorId: dbVendor.id,
//         status: { in: ['pending', 'sent'] }
//       },
//       data: { status: 'expired' }
//     });

//     // Create new invitation
//     const invitation = await prisma.vendor_invitations.create({
//       data: {
//         vendorId: dbVendor.id,
//         email: email,
//         username: vendorId,
//         tempPassword: hashedPassword,
//         invitationToken: invitationToken,
//         status: 'sent',
//         sentAt: new Date(),
//         expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
//       }
//     });

//     // Send invitation email
//     const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/vendor/signup?code=${vendorId}&token=${invitationToken}`;
    
//     await emailService.sendVendorInvitation(
//       email,
//       vendorName,
//       vendorId,
//       invitationLink,
//       tempPassword
//     );

//     console.log(`✅ Invitation sent to ${vendorName} (${email})`);

//     res.json({
//       success: true,
//       message: `Invitation sent to ${vendorName}`,
//       data: {
//         vendorId: vendorId,
//         vendorName: vendorName,
//         email: email,
//         invitationId: invitation.id
//       }
//     });

//   } catch (error: any) {
//     console.error('❌ Error sending invitation:', error.message);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Failed to send invitation'
//     });
//   }
// });

// // Bulk invite
// router.post('/bulk-invite', authMiddleware, async (req, res) => {
//   try {
//     const { vendorIds } = req.body;
    
//     if (!vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
//       return res.status(400).json({ success: false, error: 'No vendor IDs provided' });
//     }

//     console.log(`📤 Sending bulk invitations to ${vendorIds.length} vendors`);

//     const results = [];
//     let successCount = 0;
//     let failCount = 0;
//     const errors = [];

//     for (const vendorId of vendorIds) {
//       try {
//         // Use the single invite logic
//         const token = req.headers.authorization?.replace('Bearer ', '');
        
//         const detailResponse = await fetch(
//           `http://localhost:3001/api/sap/vendors/complete/${vendorId}`,
//           {
//             headers: {
//               'Authorization': `Bearer ${token}`,
//               'Content-Type': 'application/json'
//             }
//           }
//         );

//         if (!detailResponse.ok) {
//           failCount++;
//           errors.push(`Vendor ${vendorId}: Failed to fetch details`);
//           results.push({ vendorId, success: false, error: 'Failed to fetch vendor details' });
//           continue;
//         }

//         const detailData = await detailResponse.json();
        
//         if (!detailData.success || !detailData.data) {
//           failCount++;
//           errors.push(`Vendor ${vendorId}: Not found`);
//           results.push({ vendorId, success: false, error: 'Vendor not found' });
//           continue;
//         }

//         const vendor = detailData.data;
//         const email = vendor.Email;
//         const vendorName = vendor.VendorName || vendor.BusinessPartnerName || 'Unknown';

//         if (!email) {
//           failCount++;
//           errors.push(`Vendor ${vendorId}: No email address`);
//           results.push({ vendorId, success: false, error: 'No email address' });
//           continue;
//         }

//         // Create/update vendor in DB
//         let dbVendor = await prisma.vendors.findUnique({
//           where: { supplierCode: vendorId }
//         });

//         if (!dbVendor) {
//           dbVendor = await prisma.vendors.create({
//             data: {
//               supplierCode: vendorId,
//               supplierName: vendorName,
//               email: email,
//               status: 'active'
//             }
//           });
//         }

//         // Generate credentials
//         const tempPassword = crypto.randomBytes(4).toString('hex');
//         const hashedPassword = await bcrypt.hash(tempPassword, 10);
//         const invitationToken = crypto.randomBytes(32).toString('hex');

//         await prisma.vendor_invitations.updateMany({
//           where: {
//             vendorId: dbVendor.id,
//             status: { in: ['pending', 'sent'] }
//           },
//           data: { status: 'expired' }
//         });

//         await prisma.vendor_invitations.create({
//           data: {
//             vendorId: dbVendor.id,
//             email: email,
//             username: vendorId,
//             tempPassword: hashedPassword,
//             invitationToken: invitationToken,
//             status: 'sent',
//             sentAt: new Date(),
//             expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
//           }
//         });

//         const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/vendor/signup?code=${vendorId}&token=${invitationToken}`;
        
//         await emailService.sendVendorInvitation(
//           email,
//           vendorName,
//           vendorId,
//           invitationLink
//         );

//         successCount++;
//         results.push({ vendorId, success: true, vendorName, email });

//       } catch (err: any) {
//         failCount++;
//         errors.push(`Vendor ${vendorId}: ${err.message}`);
//         results.push({ vendorId, success: false, error: err.message });
//       }
//     }

//     res.json({
//       success: true,
//       message: `Sent ${successCount} invitations, ${failCount} failed`,
//       data: {
//         successCount,
//         failCount,
//         errors,
//         results
//       }
//     });

//   } catch (error: any) {
//     console.error('❌ Error in bulk invite:', error.message);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Failed to send invitations'
//     });
//   }
// });

// export default router;

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { emailService } from '../services/email.service';
import { prisma } from '@vendor-management/database';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const router = Router();

// Send invitation to SAP vendor using the vendor detail API
router.post('/invite', authMiddleware, async (req, res) => {
  try {
    const { vendorId } = req.body;
    
    if (!vendorId) {
      return res.status(400).json({ success: false, error: 'Vendor ID required' });
    }

    console.log(`📤 Sending invitation to SAP vendor: ${vendorId}`);

    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Call the vendor detail API
    const detailResponse = await fetch(
      `http://localhost:3001/api/sap/vendors/complete/${vendorId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!detailResponse.ok) {
      throw new Error(`Failed to fetch vendor details: ${detailResponse.status}`);
    }

    const detailData = await detailResponse.json();
    
    if (!detailData.success || !detailData.data) {
      throw new Error('Vendor not found');
    }

    const vendor = detailData.data;
    const email = vendor.Email;
    const vendorName = vendor.VendorName || vendor.BusinessPartnerName || 'Unknown';

    console.log(`📧 Vendor details from API:`);
    console.log(`   Name: ${vendorName}`);
    console.log(`   Email: ${email}`);

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Vendor has no email address in SAP. Please add email in SAP first.' 
      });
    }

    // Check if vendor exists in local DB (for tracking)
    let dbVendor = await prisma.vendors.findUnique({
      where: { supplierCode: vendorId }
    });

    if (!dbVendor) {
      dbVendor = await prisma.vendors.create({
        data: {
          supplierCode: vendorId,
          supplierName: vendorName,
          email: email,
          status: 'active',
          city: vendor.City || null,
          country: vendor.Country || null,
          gstn: vendor.GSTN || null
        }
      });
      console.log(`✅ Created vendor in local DB: ${vendorName}`);
    }

    // Generate temp password and invitation token
    const tempPassword = crypto.randomBytes(4).toString('hex').toUpperCase();
    console.log(`🔑 Temp password generated: ${tempPassword}`);
    
    const hashedTempPassword = await bcrypt.hash(tempPassword, 10);
    const invitationToken = crypto.randomBytes(32).toString('hex');

    // Create or update credentials with temp password
    const credentials = await prisma.vendor_credentials.upsert({
      where: { vendorId: dbVendor.id },
      update: {
        username: vendorId,
        tempPassword: hashedTempPassword,
        isTempPassword: true,
        lastLoginAt: null
      },
      create: {
        username: vendorId,
        password: 'PLACEHOLDER_PASSWORD', // Placeholder until vendor sets their own password
        tempPassword: hashedTempPassword,
        isTempPassword: true,
        vendor: {
          connect: { id: dbVendor.id }
        }
      }
    });
    console.log(`✅ Credentials created/updated with temp password`);

    // Expire old invitations
    await prisma.vendor_invitations.updateMany({
      where: {
        vendorId: dbVendor.id,
        status: { in: ['pending', 'sent'] }
      },
      data: { status: 'expired' }
    });

    // Create new invitation
    const invitation = await prisma.vendor_invitations.create({
      data: {
        vendorId: dbVendor.id,
        email: email,
        username: vendorId,
        tempPassword: hashedTempPassword,
        invitationToken: invitationToken,
        status: 'sent',
        sentAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });
    console.log(`✅ Invitation created with token: ${invitationToken.substring(0, 10)}...`);

    // Send invitation email with login link
    const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/vendor-login`;
    
    await emailService.sendVendorInvitation(
      email,
      vendorName,
      vendorId,
      invitationLink,
      tempPassword
    );

    console.log(`✅ Invitation email sent to ${email}`);

    res.json({
      success: true,
      message: `Invitation sent to ${vendorName}`,
      data: {
        vendorId: vendorId,
        vendorName: vendorName,
        email: email,
        tempPassword: tempPassword,
        invitationId: invitation.id
      }
    });

  } catch (error: any) {
    console.error('❌ Error sending invitation:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send invitation'
    });
  }
});

// Bulk invite
router.post('/bulk-invite', authMiddleware, async (req, res) => {
  try {
    const { vendorIds } = req.body;
    
    if (!vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
      return res.status(400).json({ success: false, error: 'No vendor IDs provided' });
    }

    console.log(`📤 Sending bulk invitations to ${vendorIds.length} vendors`);

    const results = [];
    let successCount = 0;
    let failCount = 0;
    const errors = [];

    for (const vendorId of vendorIds) {
      try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        const detailResponse = await fetch(
          `http://localhost:3001/api/sap/vendors/complete/${vendorId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!detailResponse.ok) {
          failCount++;
          errors.push(`Vendor ${vendorId}: Failed to fetch details`);
          results.push({ vendorId, success: false, error: 'Failed to fetch vendor details' });
          continue;
        }

        const detailData = await detailResponse.json();
        
        if (!detailData.success || !detailData.data) {
          failCount++;
          errors.push(`Vendor ${vendorId}: Not found`);
          results.push({ vendorId, success: false, error: 'Vendor not found' });
          continue;
        }

        const vendor = detailData.data;
        const email = vendor.Email;
        const vendorName = vendor.VendorName || vendor.BusinessPartnerName || 'Unknown';

        if (!email) {
          failCount++;
          errors.push(`Vendor ${vendorId}: No email address`);
          results.push({ vendorId, success: false, error: 'No email address' });
          continue;
        }

        // Create/update vendor in DB
        let dbVendor = await prisma.vendors.findUnique({
          where: { supplierCode: vendorId }
        });

        if (!dbVendor) {
          dbVendor = await prisma.vendors.create({
            data: {
              supplierCode: vendorId,
              supplierName: vendorName,
              email: email,
              status: 'active',
              city: vendor.City || null,
              country: vendor.Country || null,
              gstn: vendor.GSTN || null
            }
          });
        }

        // Generate temp password
        const tempPassword = crypto.randomBytes(4).toString('hex').toUpperCase();
        const hashedTempPassword = await bcrypt.hash(tempPassword, 10);
        const invitationToken = crypto.randomBytes(32).toString('hex');

        // Create/update credentials
        await prisma.vendor_credentials.upsert({
          where: { vendorId: dbVendor.id },
          update: {
            username: vendorId,
            tempPassword: hashedTempPassword,
            isTempPassword: true
          },
          create: {
            username: vendorId,
            password: 'PLACEHOLDER_PASSWORD',
            tempPassword: hashedTempPassword,
            isTempPassword: true,
            vendor: {
              connect: { id: dbVendor.id }
            }
          }
        });

        // Create invitation
        await prisma.vendor_invitations.updateMany({
          where: {
            vendorId: dbVendor.id,
            status: { in: ['pending', 'sent'] }
          },
          data: { status: 'expired' }
        });

        await prisma.vendor_invitations.create({
          data: {
            vendorId: dbVendor.id,
            email: email,
            username: vendorId,
            tempPassword: hashedTempPassword,
            invitationToken: invitationToken,
            status: 'sent',
            sentAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        });

        const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/vendor-login`;
        
        await emailService.sendVendorInvitation(
          email,
          vendorName,
          vendorId,
          invitationLink,
          tempPassword
        );

        successCount++;
        results.push({ vendorId, success: true, vendorName, email, tempPassword });

      } catch (err: any) {
        console.error(`❌ Error processing vendor ${vendorId}:`, err.message);
        failCount++;
        errors.push(`Vendor ${vendorId}: ${err.message}`);
        results.push({ vendorId, success: false, error: err.message });
      }
    }

    console.log(`✅ Bulk invite complete: ${successCount} sent, ${failCount} failed`);

    res.json({
      success: true,
      message: `Sent ${successCount} invitations, ${failCount} failed`,
      data: {
        successCount,
        failCount,
        errors,
        results
      }
    });

  } catch (error: any) {
    console.error('❌ Error in bulk invite:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send invitations'
    });
  }
});

export default router;
