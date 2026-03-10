const { prisma } = require('@vendor-management/database')

async function main() {
  // Check a specific PO that should have a date
  const poNumber = '1700001959' // Change this to any PO number from your data
  
  const po = await prisma.purchase_orders.findUnique({
    where: { poNumber }
  })
  
  console.log(`📦 PO: ${poNumber}`)
  console.log('===================')
  console.log('poCreateDate:', po?.poCreateDate)
  console.log('poAmendDate:', po?.poAmendDate)
  
  // Check the raw upload data for this PO
  const uploads = await prisma.vendor_upload_data.findMany({
    where: { poNumber },
    take: 1
  })
  
  if (uploads.length > 0) {
    console.log('\n📤 Raw upload data:')
    console.log('poCreateDate from upload:', uploads[0].poCreateDate)
    console.log('poAmendDate from upload:', uploads[0].poAmendDate)
    console.log('Raw PO Creat. Date value:', uploads[0].poCreateDate)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
