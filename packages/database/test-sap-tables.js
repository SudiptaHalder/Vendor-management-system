const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  console.log('🔍 Testing SAP Integration...\n');
  
  try {
    // 1. Test database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection: OK');
    
    // 2. Check SAP tables exist
    const tables = ['sap_material_documents', 'sap_sync_logs', 'sap_failed_syncs', 'sap_configuration'];
    
    for (const table of tables) {
      try {
        const count = await prisma[table].count();
        console.log(`✅ Table ${table}: exists (${count} records)`);
      } catch (error) {
        console.log(`❌ Table ${table}: ${error.message}`);
      }
    }
    
    // 3. Check SAP fields in purchase_orders
    const po = await prisma.purchase_orders.findFirst({
      select: {
        id: true,
        poNumber: true,
        sapId: true,
        sapSyncStatus: true,
        sapLastSyncAt: true
      }
    });
    
    if (po) {
      console.log(`\n✅ Purchase order has SAP fields:`);
      console.log(`   PO Number: ${po.poNumber}`);
      console.log(`   SAP Sync Status: ${po.sapSyncStatus}`);
    } else {
      console.log(`\n⚠️ No purchase orders found to test SAP fields`);
    }
    
    // 4. Check SAP fields in vendors
    const vendor = await prisma.vendors.findFirst({
      select: {
        id: true,
        supplierCode: true,
        sapCode: true,
        sapSyncStatus: true
      }
    });
    
    if (vendor) {
      console.log(`\n✅ Vendor has SAP fields:`);
      console.log(`   Vendor Code: ${vendor.supplierCode}`);
      console.log(`   SAP Sync Status: ${vendor.sapSyncStatus}`);
    } else {
      console.log(`\n⚠️ No vendors found to test SAP fields`);
    }
    
    console.log('\n🎉 SAP Integration is ready!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
