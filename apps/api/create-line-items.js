const { prisma } = require('@vendor-management/database')

async function main() {
  console.log('🔧 Creating missing line items...\n')

  // Get all upload data that has material codes and PO numbers
  const uploads = await prisma.vendor_upload_data.findMany({
    where: {
      materialCode: { not: null },
      poNumber: { not: null }
    },
    include: {
      purchaseOrder: true
    }
  })

  console.log(`Found ${uploads.length} upload records with materials\n`)

  let created = 0
  let skipped = 0

  for (const upload of uploads) {
    // Find the corresponding PO
    const po = await prisma.purchase_orders.findUnique({
      where: { poNumber: upload.poNumber }
    })

    if (!po) {
      console.log(`⚠️ PO not found: ${upload.poNumber}`)
      continue
    }

    // Check if line item already exists
    const existing = await prisma.purchase_order_line_items.findFirst({
      where: {
        purchaseOrderId: po.id,
        sku: upload.materialCode,
        lineNumber: upload.lineItem || 1
      }
    })

    if (!existing) {
      // Calculate total
      const rate = upload.rate || 0
      const quantity = upload.invoiceQuantity || 0
      const total = rate * quantity

      // Create line item
      await prisma.purchase_order_line_items.create({
        data: {
          purchaseOrderId: po.id,
          lineNumber: upload.lineItem || 1,
          description: upload.materialDesc || '',
          sku: upload.materialCode,
          quantity: quantity,
          unit: upload.orderUnit || 'EA',
          unitPrice: rate,
          total: total
        }
      })
      created++
      
      if (created % 10 === 0) {
        console.log(`   Progress: ${created} line items created...`)
      }
    } else {
      skipped++
    }
  }

  console.log(`\n📊 Summary:`)
  console.log(`   Created: ${created} line items`)
  console.log(`   Skipped: ${skipped} (already existed)`)

  // Verify final count
  const finalCount = await prisma.purchase_order_line_items.count()
  console.log(`\n📋 Total line items now: ${finalCount}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
