const { prisma } = require('@vendor-management/database')

async function main() {
  const vendorCode = '100103'
  
  console.log(`🔍 Checking data for vendor: ${vendorCode}\n`)
  
  const vendor = await prisma.vendors.findUnique({
    where: { supplierCode: vendorCode }
  })
  
  if (!vendor) {
    console.log('❌ Vendor not found')
    return
  }
  
  console.log(`✅ Vendor: ${vendor.supplierName} (${vendor.supplierCode})`)
  console.log(`Vendor ID: ${vendor.id}`)
  
  // Check purchase_orders table
  const pos = await prisma.purchase_orders.findMany({
    where: { vendorId: vendor.id }
  })
  
  console.log(`\n📦 Purchase Orders in 'purchase_orders' table: ${pos.length}`)
  if (pos.length > 0) {
    pos.forEach(po => {
      console.log(`   - ${po.poNumber}: ${po.status}`)
    })
  } else {
    console.log('   No purchase orders found in purchase_orders table')
  }
  
  // Check vendor_upload_data for this vendor
  const uploads = await prisma.vendor_upload_data.findMany({
    where: { supplierCode: vendorCode },
    orderBy: { poCreateDate: 'desc' }
  })
  
  console.log(`\n📤 Upload records in vendor_upload_data: ${uploads.length}`)
  if (uploads.length > 0) {
    const uniquePOs = [...new Set(uploads.map(u => u.poNumber))]
    console.log(`   Unique PO numbers: ${uniquePOs.length}`)
    uniquePOs.slice(0, 5).forEach(po => {
      console.log(`   - ${po}`)
    })
  } else {
    console.log('   No upload records found')
  }
  
  // Check purchase_order_line_items (legacy)
  const legacyItems = await prisma.purchase_order_line_items.findMany({
    where: {
      purchaseOrder: {
        vendorId: vendor.id
      }
    },
    include: {
      purchaseOrder: true
    }
  })
  
  console.log(`\n📋 Legacy line items: ${legacyItems.length}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
