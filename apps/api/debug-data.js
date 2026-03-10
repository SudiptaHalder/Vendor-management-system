const { prisma } = require('@vendor-management/database')

async function main() {
  console.log('📊 Checking all uploaded vendor data...\n')

  // Get all upload data
  const allData = await prisma.vendor_upload_data.findMany({
    include: {
      vendor: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  console.log(`Total records: ${allData.length}\n`)

  if (allData.length === 0) {
    console.log('❌ No uploaded data found!')
    return
  }

  // Group by supplier code
  const byVendor = new Map()
  allData.forEach(record => {
    if (!byVendor.has(record.supplierCode)) {
      byVendor.set(record.supplierCode, [])
    }
    byVendor.get(record.supplierCode).push(record)
  })

  console.log('Vendors with data:')
  for (const [code, records] of byVendor.entries()) {
    console.log(`\n�� Supplier Code: ${code}`)
    console.log(`   Vendor Name: ${records[0].supplierName}`)
    console.log(`   Records: ${records.length}`)
    console.log(`   Sample PO: ${records[0].poNumber}`)
    console.log(`   Created Date: ${records[0].poCreateDate}`)
  }

  // Check if purchase orders were created
  const purchaseOrders = await prisma.purchase_orders.findMany({
    include: {
      lineItems: true,
      vendor: true
    }
  })

  console.log(`\n📦 Purchase Orders in database: ${purchaseOrders.length}`)
  purchaseOrders.forEach(po => {
    console.log(`   - ${po.poNumber} (${po.vendor?.supplierName}): ${po.lineItems.length} line items`)
  })

  // Check vendors
  const vendors = await prisma.vendors.findMany({
    include: {
      credentials: true,
      invitations: true
    }
  })

  console.log(`\n🏢 Vendors in database: ${vendors.length}`)
  vendors.forEach(v => {
    console.log(`   - ${v.supplierName} (${v.supplierCode}): ${v.email}`)
    console.log(`     Credentials: ${v.credentials ? '✅' : '❌'}`)
    console.log(`     Invitations: ${v.invitations.length}`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
