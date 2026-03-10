const { PrismaClient } = require('@vendor-management/database')
const { Resend } = require('resend')
require('dotenv').config()

const prisma = new PrismaClient()
const resend = new Resend(process.env.RESEND_API_KEY)

async function main() {
  console.log('📧 Sending vendor invitations via Resend...\n')

  // Get all pending invitations
  const invitations = await prisma.vendor_invitations.findMany({
    where: { status: 'pending' },
    include: { vendor: true }
  })

  console.log(`Found ${invitations.length} pending invitations\n`)

  for (const invite of invitations) {
    console.log(`Sending to ${invite.vendor.supplierName} (${invite.email})...`)
    
    const loginUrl = `${process.env.FRONTEND_URL}/vendor-login?token=${invite.invitationToken}`
    
    try {
      const { data, error } = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'VendorFlow <noreply@resend.dev>',
        to: [invite.email],
        subject: 'Welcome to VendorFlow - Your Vendor Portal Access',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to VendorFlow</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to VendorFlow!</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd; border-top: none;">
              <p style="font-size: 16px;">Dear <strong>${invite.vendor.supplierName}</strong>,</p>
              
              <p style="font-size: 16px;">Your vendor portal has been created. You can now access your account using the credentials below:</p>
              
              <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                <p style="margin: 5px 0;"><strong>Username:</strong> <code style="background: #f0f0f0; padding: 3px 6px; border-radius: 4px;">${invite.username}</code></p>
                <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <em>Please check your secure invitation</em></p>
              </div>
              
              <p style="font-size: 16px;">Click the button below to set up your account:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${loginUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Set Up Your Account</a>
              </div>
              
              <p style="font-size: 14px; color: #666;">Or copy this link to your browser:</p>
              <p style="font-size: 14px; background: #f0f0f0; padding: 10px; border-radius: 5px; word-break: break-all;">${loginUrl}</p>
              
              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #856404;">
                  <strong>⚠️ Important:</strong> This invitation link will expire on <strong>${new Date(invite.expiresAt).toLocaleString()}</strong>.
                  Please set up your account before it expires.
                </p>
              </div>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              
              <p style="font-size: 14px; color: #666; text-align: center;">
                If you didn't request this invitation, please ignore this email.<br>
                &copy; 2026 VendorFlow. All rights reserved.
              </p>
            </div>
          </body>
          </html>
        `
      })

      if (error) {
        console.error(`❌ Resend error for ${invite.email}:`, error)
        continue
      }

      console.log(`✅ Email sent! ID: ${data.id}`)
      
      // Update invitation status
      await prisma.vendor_invitations.update({
        where: { id: invite.id },
        data: { 
          status: 'sent',
          sentAt: new Date()
        }
      })
      
      console.log('---')
      
    } catch (error) {
      console.error(`❌ Failed to send to ${invite.email}:`, error.message)
    }
  }

  console.log('\n✅ All invitations processed!')
  
  // Summary
  const updatedInvitations = await prisma.vendor_invitations.findMany({
    where: { status: 'sent' }
  })
  
  console.log(`\n📊 Summary: ${updatedInvitations.length} invitations sent successfully`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
