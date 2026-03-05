import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🔐 Setting up vendor portal access...')

  // Get all active vendors
  const vendors = await prisma.vendors.findMany({
    where: {
      status: 'active',
      portalEnabled: false
    }
  })

  console.log(`Found ${vendors.length} vendors to enable portal access`)

  for (const vendor of vendors) {
    // Create a vendor email based on company name
    const vendorEmail = `vendor.${vendor.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@portal.com`
    const plainPassword = 'vendor123' // Simple password for demo
    
    const hashedPassword = await bcrypt.hash(plainPassword, 10)

    // Create portal access
    await prisma.vendor_portal_access.create({
      data: {
        vendorId: vendor.id,
        email: vendorEmail,
        password: hashedPassword,
        isActive: true,
        accessLevel: 'standard',
        canViewInvoices: true,
        canSubmitInvoices: true,
        canViewPayments: true,
        canViewPOs: true,
        canSubmitQuotes: true,
        canViewContracts: true,
        canUploadDocs: true
      }
    })

    // Update vendor to enable portal
    await prisma.vendors.update({
      where: { id: vendor.id },
      data: { portalEnabled: true }
    })

    console.log(`✅ Enabled portal for ${vendor.name}`)
    console.log(`   Email: ${vendorEmail}`)
    console.log(`   Password: ${plainPassword}`)
    console.log('---')
  }

  // Also check if there's a pending vendor that should have portal
  const pendingVendor = await prisma.vendors.findFirst({
    where: {
      status: 'pending',
      portalEnabled: false
    }
  })

  if (pendingVendor) {
    console.log(`\n⚠️  Pending vendor found: ${pendingVendor.name}`)
    console.log('Approve this vendor first in the Approvals page, then run this script again to enable portal.')
  }

  console.log('\n✅ Vendor portal setup complete!')
  console.log('\n📝 Vendor Login Credentials:')
  console.log('============================')
  
  const enabledVendors = await prisma.vendors.findMany({
    where: { portalEnabled: true },
    include: { portalAccess: true }
  })

  for (const vendor of enabledVendors) {
    if (vendor.portalAccess) {
      console.log(`\n🏢 ${vendor.name}`)
      console.log(`   Email: ${vendor.portalAccess.email}`)
      console.log(`   Password: vendor123`)
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Setup failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
