const { prisma } = require('@vendor-management/database')

async function main() {
  console.log('🔧 Creating missing line items...\n')

  // Get all upload data that has material codes (not empty)
  const uploads = await prisma.vendor_upload_data.findMany({
    where: {
      materialCode: {
        not: ''
      },
      poNumber: {
        not: ''
      }
    }
  })

  console.log(`Found ${uploads.length} upload records with materials\n`)

  let created = 0
  let skipped = 0
  let noPo = 0

  for (const upload of uploads) {
    // Find the corresponding PO
    const po = await prisma.purchase_orders.findUnique({
      where: { poNumber: upload.poNumber }
    })

    if (!po) {
      noPo++
      continue
    }

    // Check if line item already exists using materialCode (not sku)
    const existing = await prisma.purchase_order_line_items.findFirst({
      where: {
        purchaseOrderId: po.id,
        materialCode: upload.materialCode
      }
    })

    if (!existing) {
      // Calculate total
      const rate = upload.rate || 0
      const quantity = upload.invoiceQuantity || 0
      const total = rate * quantity

      // Create line item - using correct field names
      await prisma.purchase_order_line_items.create({
        data: {
          purchaseOrderId: po.id,
          lineNumber: upload.lineItem || 1,
          materialDesc: upload.materialDesc || '',
          materialCode: upload.materialCode,
          orderUnit: upload.orderUnit || 'EA',
          rate: rate,
          invoiceQuantity: quantity
          // Note: total might be calculated in the schema or we can add it if needed
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
  console.log(`   Total upload records: ${uploads.length}`)
  console.log(`   Created: ${created} line items`)
  console.log(`   Skipped (already existed): ${skipped}`)
  console.log(`   Skipped (no PO found): ${noPo}`)

  // Verify final count
  const finalCount = await prisma.purchase_order_line_items.count()
  console.log(`\n📋 Total line items now: ${finalCount}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
