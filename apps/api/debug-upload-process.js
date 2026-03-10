const { prisma } = require('@vendor-management/database')

async function main() {
  console.log('🔍 DEBUGGING UPLOAD PROCESS\n')
  
  // 1. Check all purchase orders
  const allPOs = await prisma.purchase_orders.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  })
  
  console.log(`📦 Recent POs (${allPOs.length}):`)
  allPOs.forEach(po => {
    console.log(`   ${po.poNumber}:`)
    console.log(`      Create Date: ${po.poCreateDate}`)
    console.log(`      Amend Date: ${po.poAmendDate}`)
    console.log(`      Created At: ${po.createdAt}`)
  })
  
  // 2. Check raw upload data for dates
  const uploads = await prisma.vendor_upload_data.findMany({
    where: {
      poCreateDate: { not: null }
    },
    take: 5
  })
  
  console.log(`\n📤 Uploads with dates (${uploads.length}):`)
  uploads.forEach(u => {
    console.log(`   PO: ${u.poNumber}`)
    console.log(`      Create Date: ${u.poCreateDate}`)
    console.log(`      Amend Date: ${u.poAmendDate}`)
  })
  
  // 3. Count total records
  const totalPOs = await prisma.purchase_orders.count()
  const totalUploads = await prisma.vendor_upload_data.count()
  
  console.log(`\n📊 Totals:`)
  console.log(`   Purchase Orders: ${totalPOs}`)
  console.log(`   Upload Records: ${totalUploads}`)
  
  // 4. Check for PO 1200000161 specifically
  const po161 = await prisma.purchase_orders.findUnique({
    where: { poNumber: '1200000161' }
  })
  
  if (po161) {
    console.log(`\n🔍 PO 1200000161 details:`)
    console.log(`   ID: ${po161.id}`)
    console.log(`   Create Date: ${po161.poCreateDate}`)
    console.log(`   Amend Date: ${po161.poAmendDate}`)
    console.log(`   Status: ${po161.status}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
