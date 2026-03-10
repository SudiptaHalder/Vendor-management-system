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
    include: { vendor: true },
    orderBy: { email: 'asc' }
  })

  console.log(`Total pending invitations: ${invitations.length}`)

  // Group by email address
  const emailsMap = new Map()
  
  for (const invite of invitations) {
    const email = invite.email.toLowerCase()
    if (!emailsMap.has(email)) {
      emailsMap.set(email, [])
    }
    emailsMap.get(email).push(invite)
  }

  console.log(`Unique email addresses: ${emailsMap.size}\n`)

  let successCount = 0
  let failCount = 0
  let emailIndex = 0

  // Send one email per unique email address
  for (const [email, vendorInvites] of emailsMap.entries()) {
    emailIndex++
    console.log(`[${emailIndex}/${emailsMap.size}] Sending to: ${email}`)
    console.log(`   Includes ${vendorInvites.length} vendors:`)
    
    // List all vendors for this email
    vendorInvites.forEach(inv => {
      console.log(`   - ${inv.vendor.supplierName} (${inv.vendor.supplierCode})`)
    })

    // Create a combined email with all vendors for this email
    const vendorList = vendorInvites.map(inv => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${inv.vendor.supplierName}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><code>${inv.username}</code></td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><a href="${process.env.FRONTEND_URL}/vendor-login?token=${inv.invitationToken}" style="color: #2563eb;">Login Link</a></td>
      </tr>
    `).join('')

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to VendorFlow!</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
          <p style="font-size: 16px;">Hello,</p>
          
          <p style="font-size: 16px;">The following vendor accounts have been created for you:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Vendor Name</th>
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Username</th>
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Login Link</th>
              </tr>
            </thead>
            <tbody>
              ${vendorList}
            </tbody>
          </table>
          
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;">
              <strong>⚠️ Important:</strong> Each login link is unique to each vendor and will expire on 
              <strong>${new Date(vendorInvites[0].expiresAt).toLocaleString()}</strong>.
            </p>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            You can manage all vendors from your VendorFlow dashboard.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            VendorFlow - Vendor Management System<br>
            This is an automated message, please do not reply.
          </p>
        </div>
      </div>
    `

    try {
      // Add delay between emails to avoid rate limiting
      if (emailIndex > 1) await delay(1000) // 1 second delay between unique emails
      
      const { data, error } = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'VendorFlow <onboarding@resend.dev>',
        to: [email],
        subject: `VendorFlow - ${vendorInvites.length} New Vendor Account${vendorInvites.length > 1 ? 's' : ''} Created`,
        html: html
      })

      if (error) {
        console.error(`❌ Error for ${email}:`, error)
        failCount++
        continue
      }

      console.log(`✅ Email sent! ID: ${data.id}`)
      
      // Update ALL invitations for this email to 'sent'
      for (const invite of vendorInvites) {
        await prisma.vendor_invitations.update({
          where: { id: invite.id },
          data: { 
            status: 'sent',
            sentAt: new Date()
          }
        })
      }
      
      successCount++
      console.log('---')
      
    } catch (error) {
      console.error(`❌ Failed for ${email}:`, error.message)
      failCount++
    }
  }

  console.log('\n✅ Done!')
  console.log(`📊 Summary:`)
  console.log(`   - Emails sent: ${successCount}`)
  console.log(`   - Failed: ${failCount}`)
  console.log(`   - Total vendors processed: ${invitations.length}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
