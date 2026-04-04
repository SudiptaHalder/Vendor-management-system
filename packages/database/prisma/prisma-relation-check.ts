import { prisma } from '@vendor-management/database'

async function checkRelation() {
  try {
    console.log('🔍 Checking Prisma relation...\n')

    // 1️⃣ Get PO
    const po = await prisma.purchase_orders.findFirst({
      where: {
        poNumber: '5500000679'
      },
      include: {
        lineItems: true
      }
    })

    if (!po) {
      console.log('❌ PO not found')
      return
    }

    console.log('✅ PO FOUND:', po.poNumber)
    console.log('👉 PO ID:', po.id)

    // 2️⃣ Relation result
    console.log('\n📦 Prisma Relation Result:')
    console.log('lineItems count:', po.lineItems.length)

    // 3️⃣ Direct query result
    const directItems = await prisma.po_line_items.findMany({
      where: {
        purchaseOrderId: po.id
      }
    })

    console.log('\n📦 Direct DB Query Result:')
    console.log('direct count:', directItems.length)

    // 4️⃣ Compare
    console.log('\n🧠 FINAL DIAGNOSIS:')

    if (po.lineItems.length === 0 && directItems.length > 0) {
      console.log('❌ Prisma relation is BROKEN')
    } else if (po.lineItems.length > 0) {
      console.log('✅ Prisma relation is WORKING')
    } else {
      console.log('⚠️ No data found at all')
    }

    // 5️⃣ Print sample
    console.log('\n📄 SAMPLE DATA:')
    console.log('Relation item:', po.lineItems[0] || null)
    console.log('Direct item:', directItems[0] || null)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkRelation()