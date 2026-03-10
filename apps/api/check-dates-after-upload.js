const { prisma } = require('@vendor-management/database')

async function main() {
  // Check a few POs that should have dates
  const poNumbers = ['1200000161', '5500001189', '5500001277']
  
  for (const poNumber of poNumbers) {
    const po = await prisma.purchase_orders.findUnique({
      where: { poNumber }
    })
    
    if (po) {
      console.log(`\n📦 PO: ${poNumber}`)
      console.log(`   Create Date: ${po.poCreateDate}`)
      console.log(`   Amend Date: ${po.poAmendDate}`)
      
      if (po.poCreateDate) {
        const date = new Date(po.poCreateDate)
        console.log(`   Formatted: ${date.toLocaleDateString()}`)
      }
    }
  }
  
  // Check raw upload data
  const uploads = await prisma.vendor_upload_data.findFirst({
    where: { poNumber: '1200000161' }
  })
  
  if (uploads) {
    console.log('\n📤 Raw upload data:')
    console.log(`   Create Date: ${uploads.poCreateDate}`)
    console.log(`   Amend Date: ${uploads.poAmendDate}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
