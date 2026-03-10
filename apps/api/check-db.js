const { prisma } = require('@vendor-management/database')

async function main() {
  console.log('🔍 DATABASE CHECK\n')

  // 1. Check vendors
  const vendors = await prisma.vendors.findMany()
  console.log(`✅ Vendors: ${vendors.length}`)
  vendors.forEach(v => {
    console.log(`   - ${v.supplierName} (${v.supplierCode})`)
  })

  // 2. Check vendor_upload_data (raw Excel data)
  const uploads = await prisma.vendor_upload_data.findMany()
  console.log(`\n📤 Uploaded Records: ${uploads.length}`)
  if (uploads.length > 0) {
    console.log('   First record:', {
      supplierCode: uploads[0].supplierCode,
      poNumber: uploads[0].poNumber,
      materialCode: uploads[0].materialCode
    })
  }

  // 3. Check purchase orders
  const pos = await prisma.purchase_orders.findMany()
  console.log(`\n📦 Purchase Orders: ${pos.length}`)
  if (pos.length > 0) {
    pos.forEach(po => {
      console.log(`   - ${po.poNumber}`)
    })
  } else {
    console.log('   ❌ No purchase orders found!')
  }

  // 4. Check line items
  const items = await prisma.purchase_order_line_items.findMany()
  console.log(`\n📋 Line Items: ${items.length}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
