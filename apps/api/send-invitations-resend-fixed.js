const { PrismaClient } = require('@vendor-management/database')
const { Resend } = require('resend')
require('dotenv').config()

const prisma = new PrismaClient()
const resend = new Resend(process.env.RESEND_API_KEY)

// Helper function to delay between sends
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function main() {
  console.log('📧 Sending vendor invitations via Resend...\n')

  // Get all pending invitations
  const invitations = await prisma.vendor_invitations.findMany({
    where: { status: 'pending' },
    include: { vendor: true }
  })

  console.log(`Found ${invitations.length} pending invitations\n`)

  let successCount = 0
  let failCount = 0

  for (let i = 0; i < invitations.length; i++) {
    const invite = invitations[i]
    
    console.log(`[${i + 1}/${invitations.length}] Sending to ${invite.vendor.supplierName} (${invite.email})...`)
    
    const loginUrl = `${process.env.FRONTEND_URL}/vendor-login?token=${invite.invitationToken}`
    
    // Create a simple HTML email
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to VendorFlow!</h2>
        <p>Dear ${invite.vendor.supplierName},</p>
        <p>Your vendor portal has been created. Here are your login credentials:</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Username:</strong> ${invite.username}</p>
          <p><strong>Temporary Password:</strong> [Check your secure invitation]</p>
        </div>
        
        <p>Click the link below to set up your account:</p>
        <p><a href="${loginUrl}" style="color: #2563eb;">${loginUrl}</a></p>
        
        <p>This link expires on ${new Date(invite.expiresAt).toLocaleString()}</p>
        
        <hr style="margin: 30px 0;">
        <p style="color: #6b7280; font-size: 14px;">VendorFlow - Vendor Management System</p>
      </div>
    `
    
    try {
      // Add delay between sends to avoid rate limiting (500ms = 2 per second)
      if (i > 0) await delay(500)
      
      const { data, error } = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'VendorFlow <onboarding@resend.dev>',
        to: [invite.email],
        subject: `Welcome to VendorFlow - ${invite.vendor.supplierName}`,
        html: html
      })

      if (error) {
        console.error(`❌ Error:`, error)
        failCount++
        continue
      }

      console.log(`✅ Sent! Email ID: ${data.id}`)
      
      // Update invitation status
      await prisma.vendor_invitations.update({
        where: { id: invite.id },
        data: { 
          status: 'sent',
          sentAt: new Date()
        }
      })
      
      successCount++
      console.log('---')
      
    } catch (error) {
      console.error(`❌ Failed:`, error.message)
      failCount++
    }
  }

  console.log('\n✅ Done!')
  console.log(`📊 Summary: ${successCount} sent successfully, ${failCount} failed`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
