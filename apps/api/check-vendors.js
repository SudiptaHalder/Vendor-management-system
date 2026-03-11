const { prisma } = require('@vendor-management/database')

async function main() {
  const vendors = await prisma.vendors.findMany({
    include: {
      credentials: true
    }
  })
  
  console.log('📋 Vendors with credentials:\n')
  vendors.forEach(v => {
    console.log(`${v.supplierName} (${v.supplierCode})`)
    if (v.credentials) {
      console.log(`  ✅ Has credentials`)
      console.log(`  Username: ${v.credentials.username}`)
      console.log(`  Last Login: ${v.credentials.lastLoginAt || 'Never'}`)
    } else {
      console.log(`  ❌ No credentials set`)
    }
    console.log('---')
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
