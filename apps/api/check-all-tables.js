const { prisma } = require('@vendor-management/database')

async function main() {
  console.log('='.repeat(60))
  console.log('📊 DATABASE INVENTORY REPORT')
  console.log('='.repeat(60))

  // 1. Check Vendors table
  const vendorCount = await prisma.vendors.count()
  console.log(`\n🏢 VENDORS: ${vendorCount}`)
  if (vendorCount > 0) {
    const vendors = await prisma.vendors.findMany({
      take: 5,
      select: {
        supplierCode: true,
        supplierName: true,
        email: true,
        status: true
      }
    })
    console.log('   Sample vendors:')
    vendors.forEach(v => {
      console.log(`   - ${v.supplierCode}: ${v.supplierName} (${v.email})`)
    })
  }

  // 2. Check Purchase Orders table
  const poCount = await prisma.purchase_orders.count()
  console.log(`\n📦 PURCHASE ORDERS: ${poCount}`)
  if (poCount > 0) {
    const pos = await prisma.purchase_orders.findMany({
      take: 5,
      include: {
        vendor: {
          select: { supplierName: true }
        }
      }
    })
    console.log('   Sample POs:')
    pos.forEach(po => {
      console.log(`   - ${po.poNumber} | Vendor: ${po.vendor?.supplierName} | Status: ${po.status}`)
    })
  }

  // 3. Check Line Items table
  const lineItemCount = await prisma.purchase_order_line_items.count()
  console.log(`\n📋 LINE ITEMS: ${lineItemCount}`)
  if (lineItemCount > 0) {
    const items = await prisma.purchase_order_line_items.findMany({
      take: 5,
      include: {
        purchaseOrder: {
          select: { poNumber: true }
        }
      }
    })
    console.log('   Sample line items:')
    items.forEach(item => {
      console.log(`   - PO: ${item.purchaseOrder?.poNumber} | Material: ${item.sku} | Qty: ${item.quantity} | Rate: ${item.unitPrice}`)
    })
  }

  // 4. Check Upload Data table
  const uploadCount = await prisma.vendor_upload_data.count()
  console.log(`\n📤 UPLOADED DATA: ${uploadCount}`)
  if (uploadCount > 0) {
    const uploads = await prisma.vendor_upload_data.findMany({
      take: 5,
      include: {
        vendor: {
          select: { supplierName: true }
        }
      }
    })
    console.log('   Sample upload records:')
    uploads.forEach(u => {
      console.log(`   - Vendor: ${u.vendor?.supplierName} | PO: ${u.poNumber} | Material: ${u.materialCode}`)
    })
  }

  // 5. Check Vendor Credentials
  const credCount = await prisma.vendor_credentials.count()
  console.log(`\n🔐 VENDOR CREDENTIALS: ${credCount}`)

  // 6. Check Invitations
  const inviteCount = await prisma.vendor_invitations.count()
  console.log(`\n📧 INVITATIONS: ${inviteCount}`)
  if (inviteCount > 0) {
    const invites = await prisma.vendor_invitations.findMany({
      take: 5,
      include: {
        vendor: {
          select: { supplierName: true }
        }
      }
    })
    console.log('   Sample invitations:')
    invites.forEach(i => {
      console.log(`   - ${i.vendor?.supplierName} | Email: ${i.email} | Status: ${i.status}`)
    })
  }

  console.log('\n' + '='.repeat(60))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
