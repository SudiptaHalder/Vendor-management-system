import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearPoData() {
  console.log('🗑️ Clearing PO data from problematic tables...')

  try {
    // Clear po_line_items (where data should be)
    console.log('📦 Clearing po_line_items...')
    const deletedLineItems = await prisma.po_line_items.deleteMany({})
    console.log(`✅ Deleted ${deletedLineItems.count} records from po_line_items`)

    // Clear purchase_orders
    console.log('📦 Clearing purchase_orders...')
    const deletedPOs = await prisma.purchase_orders.deleteMany({})
    console.log(`✅ Deleted ${deletedPOs.count} records from purchase_orders`)

    // Clear PO-related upload data only
    console.log('📦 Clearing vendor_upload_data (PO records only)...')
    const deletedUploads = await prisma.vendor_upload_data.deleteMany({
      where: {
        poNumber: { not: null }
      }
    })
    console.log(`✅ Deleted ${deletedUploads.count} upload records`)

    console.log('\n✨ Done! Tables cleared successfully.')
    console.log('You can now re-upload your PO file.')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

clearPoData()