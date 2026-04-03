import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️ Clearing data from tables (keeping users and credentials)...\n')

  // Order matters - delete in correct order to avoid foreign key constraints
  
  // 1. Delete line items first
  console.log('Deleting line items...')
  const lineItems = await prisma.po_line_items.deleteMany({})
  console.log(`   Deleted ${lineItems.count} line items`)

  // 2. Delete purchase orders
  console.log('Deleting purchase orders...')
  const purchaseOrders = await prisma.purchase_orders.deleteMany({})
  console.log(`   Deleted ${purchaseOrders.count} purchase orders`)

  // 3. Delete vendor upload data
  console.log('Deleting vendor upload data...')
  const uploadData = await prisma.vendor_upload_data.deleteMany({})
  console.log(`   Deleted ${uploadData.count} upload records`)

  // 4. Delete vendor master data
  console.log('Deleting vendor master data...')
  const vendorMaster = await prisma.vendorMaster.deleteMany({})
  console.log(`   Deleted ${vendorMaster.count} vendor master records`)

  // 5. Delete vendor invitations
  console.log('Deleting vendor invitations...')
  const invitations = await prisma.vendor_invitations.deleteMany({})
  console.log(`   Deleted ${invitations.count} invitations`)

  // 6. Delete vendors (but keep users and credentials)
  console.log('Deleting vendors...')
  const vendors = await prisma.vendors.deleteMany({})
  console.log(`   Deleted ${vendors.count} vendors`)

  // Note: We are NOT deleting from users table
  // Note: We are NOT deleting from vendor_credentials table

  console.log('\n✅ Data cleared successfully!')
  console.log('   Users and credentials are preserved.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
