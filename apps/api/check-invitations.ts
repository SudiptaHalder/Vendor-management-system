import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📧 Checking vendor invitations...\n')

  // Get all invitations with vendor details
  const invitations = await prisma.vendor_invitations.findMany({
    include: {
      vendor: true
    },
    orderBy: { createdAt: 'desc' }
  })

  console.log(`Total invitations: ${invitations.length}\n`)

  for (const invite of invitations) {
    console.log('='.repeat(60))
    console.log(`Vendor: ${invite.vendor.supplierName} (${invite.vendor.supplierCode})`)
    console.log(`Email: ${invite.email}`)
    console.log(`Username: ${invite.username}`)
    console.log(`Status: ${invite.status}`)
    console.log(`Created: ${invite.createdAt}`)
    console.log(`Sent at: ${invite.sentAt || 'Not sent yet'}`)
    console.log(`Accepted at: ${invite.acceptedAt || 'Not accepted'}`)
    console.log(`Expires: ${invite.expiresAt}`)
    console.log(`Token: ${invite.invitationToken}`)
    
    // Show temp password (first few chars for security)
    if (invite.tempPassword) {
      console.log(`Temp password hash: ${invite.tempPassword.substring(0, 20)}...`)
    }
  }

  // Count by status
  const statusCounts = {
    pending: invitations.filter(i => i.status === 'pending').length,
    sent: invitations.filter(i => i.status === 'sent').length,
    accepted: invitations.filter(i => i.status === 'accepted').length,
    expired: invitations.filter(i => i.status === 'expired').length
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 Summary:')
  console.log(`   Pending: ${statusCounts.pending}`)
  console.log(`   Sent: ${statusCounts.sent}`)
  console.log(`   Accepted: ${statusCounts.accepted}`)
  console.log(`   Expired: ${statusCounts.expired}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
