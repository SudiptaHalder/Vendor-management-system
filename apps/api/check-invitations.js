const { PrismaClient } = require('@prisma/client')

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
  }

  // Count by status
  const pending = invitations.filter(i => i.status === 'pending').length
  const sent = invitations.filter(i => i.status === 'sent').length
  const accepted = invitations.filter(i => i.status === 'accepted').length
  const expired = invitations.filter(i => i.status === 'expired').length

  console.log('\n' + '='.repeat(60))
  console.log('📊 Summary:')
  console.log(`   Pending: ${pending}`)
  console.log(`   Sent: ${sent}`)
  console.log(`   Accepted: ${accepted}`)
  console.log(`   Expired: ${expired}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
