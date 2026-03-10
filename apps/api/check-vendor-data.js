const { prisma } = require('@vendor-management/database')

async function main() {
  const supplierCode = '100103'
  
  console.log(`🔍 Checking data for vendor: ${supplierCode}\n`)
  
  // Check if vendor exists
  const vendor = await prisma.vendors.findUnique({
    where: { supplierCode }
  })
  
  if (!vendor) {
    console.log('❌ Vendor not found')
    return
  }
  
  console.log('✅ Vendor found:', vendor.supplierName)
  console.log('   ID:', vendor.id)
  console.log('   Email:', vendor.email)
  
  // Check upload data for this vendor
  const uploads = await prisma.vendor_upload_data.findMany({
    where: { supplierCode },
    orderBy: { poCreateDate: 'desc' }
  })
  
  console.log(`\n📤 Upload records: ${uploads.length}`)
  if (uploads.length > 0) {
    console.log('\nSample records:')
    uploads.slice(0, 3).forEach((u, i) => {
      console.log(`\n  Record ${i+1}:`)
      console.log(`    PO: ${u.poNumber}`)
      console.log(`    Material: ${u.materialCode} - ${u.materialDesc}`)
      console.log(`    Quantity: ${u.invoiceQuantity} ${u.orderUnit}`)
      console.log(`    Rate: ${u.rate}`)
      console.log(`    Date: ${u.poCreateDate}`)
    })
  } else {
    console.log('❌ No upload records found!')
  }
  
  // Check purchase orders for this vendor
  const pos = await prisma.purchase_orders.findMany({
    where: { vendorId: vendor.id },
    include: { lineItems: true }
  })
  
  console.log(`\n📦 Purchase Orders: ${pos.length}`)
  if (pos.length > 0) {
    pos.forEach((po, i) => {
      console.log(`\n  PO ${i+1}: ${po.poNumber}`)
      console.log(`    Created: ${po.poCreateDate}`)
      console.log(`    Line Items: ${po.lineItems.length}`)
      if (po.lineItems.length > 0) {
        console.log(`    First item: ${po.lineItems[0].sku} - ${po.lineItems[0].description}`)
      }
    })
  } else {
    console.log('❌ No purchase orders found!')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
