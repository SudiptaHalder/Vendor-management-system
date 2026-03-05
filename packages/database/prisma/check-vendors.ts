import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking vendors in database...\n')
  
  const vendors = await prisma.vendors.findMany({
    include: {
      portalAccess: true
    }
  })
  
  console.log(`Found ${vendors.length} vendors:\n`)
  
  vendors.forEach((vendor, index) => {
    console.log(`${index + 1}. ${vendor.name}`)
    console.log(`   ID: ${vendor.id}`)
    console.log(`   Email: ${vendor.email}`)
    console.log(`   Status: ${vendor.status}`)
    console.log(`   Portal Enabled: ${vendor.portalEnabled}`)
    console.log(`   Portal Access: ${vendor.portalAccess ? 'Yes' : 'No'}`)
    if (vendor.portalAccess) {
      console.log(`   Portal Email: ${vendor.portalAccess.email}`)
    }
    console.log('---')
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
