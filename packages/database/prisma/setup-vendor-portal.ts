import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🔐 Setting up vendor portal access...\n')

  // Get all active vendors
  const vendors = await prisma.vendors.findMany({
    where: {
      status: 'active'
    }
  })

  console.log(`Found ${vendors.length} active vendors\n`)

  if (vendors.length === 0) {
    console.log('❌ No active vendors found. Please create vendors first.')
    return
  }

  for (const vendor of vendors) {
    // Create vendor email based on company name
    const vendorEmail = `vendor.${vendor.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@portal.com`
    const password = 'vendor123'
    const hashedPassword = await bcrypt.hash(password, 10)

    // Check if portal access already exists
    const existing = await prisma.vendor_portal_access.findUnique({
      where: { vendorId: vendor.id }
    })

    if (existing) {
      console.log(`⚠️  Portal access already exists for ${vendor.name}`)
      console.log(`   Email: ${existing.email}`)
      console.log(`   Password: vendor123`)
      console.log('---')
      continue
    }

    // Create portal access
    const portalAccess = await prisma.vendor_portal_access.create({
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

    console.log(`✅ Portal access created for ${vendor.name}`)
    console.log(`   Email: ${portalAccess.email}`)
    console.log(`   Password: vendor123`)
    console.log('---')
  }

  // Show summary
  const portalVendors = await prisma.vendors.findMany({
    where: { portalEnabled: true },
    include: { portalAccess: true }
  })

  console.log('\n📊 Summary of vendors with portal access:')
  portalVendors.forEach(v => {
    if (v.portalAccess) {
      console.log(`• ${v.name}: ${v.portalAccess.email} / vendor123`)
    }
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
