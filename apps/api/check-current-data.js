const { prisma } = require('@vendor-management/database')

async function main() {
  // Check a specific PO that you're trying to update
  const poNumber = '1700001959' // Change this to the PO you're updating
  
  const po = await prisma.purchase_orders.findUnique({
    where: { poNumber },
    include: { 
      lineItems: true,
      vendor: true 
    }
  })
  
  if (po) {
    console.log(`📦 PO: ${po.poNumber}`)
    console.log(`Vendor: ${po.vendor.supplierName}`)
    console.log(`Line Items: ${po.lineItems.length}`)
    
    po.lineItems.forEach(item => {
      console.log(`\n  Material: ${item.materialCode}`)
      console.log(`  Description: ${item.materialDesc}`)
      console.log(`  Rate: ${item.rate}`)
      console.log(`  Quantity: ${item.invoiceQuantity}`)
    })
  } else {
    console.log('❌ PO not found')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
