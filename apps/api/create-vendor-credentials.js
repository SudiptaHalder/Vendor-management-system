const { prisma } = require('@vendor-management/database')
const bcrypt = require('bcrypt')

async function main() {
  const supplierCode = '100107' // Change this to any vendor code
  const password = '12345678'
  
  const vendor = await prisma.vendors.findUnique({
    where: { supplierCode }
  })
  
  if (!vendor) {
    console.log('Vendor not found')
    return
  }
  
  const hashedPassword = await bcrypt.hash(password, 10)
  
  await prisma.vendor_credentials.upsert({
    where: { vendorId: vendor.id },
    update: {
      password: hashedPassword,
      isTempPassword: false,
      passwordChangedAt: new Date()
    },
    create: {
      vendorId: vendor.id,
      username: supplierCode,
      password: hashedPassword,
      isTempPassword: false,
      isActive: true
    }
  })
  
  console.log(`✅ Credentials created for ${vendor.supplierName} (${supplierCode})`)
  console.log(`Username: ${supplierCode}`)
  console.log(`Password: ${password}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
