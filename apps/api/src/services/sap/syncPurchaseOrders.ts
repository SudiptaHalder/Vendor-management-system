import { prisma } from '@vendor-management/database';
import { sapClient } from './sapClient';
import { parseSAPDate } from '../../utils/dateParser';

interface SAPPurchaseOrder {
  PurchaseOrder: string;
  Supplier: string;
  SupplierName?: string;
  DocumentCurrency: string;
  PurchaseOrderStatus: string;
  PurchaseOrderDate: string;
  CreatedByUser: string;
  TotalAmount?: number;
  to_PurchaseOrderItem?: {
    results: SAPPurchaseOrderItem[];
  };
}

interface SAPPurchaseOrderItem {
  PurchaseOrder: string;
  PurchaseOrderItem: string;
  Material: string;
  MaterialName?: string;
  Plant: string;
  OrderQuantity: number;
  OrderUnit: string;
  NetPriceAmount: number;
  DeliveryDate: string;
  Status: string;
}

export async function syncPurchaseOrders(): Promise<{ synced: number; updated: number; failed: number; total: number }> {
  console.log('🔄 Syncing Purchase Orders from SAP...');

  try {
    const response = await sapClient.get('/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrder', {
      params: {
        $format: 'json',
        $top: 100,
        $expand: 'to_PurchaseOrderItem',
        $orderby: 'PurchaseOrderDate desc'
      }
    });

    const orders = response.d?.results || [];
    console.log(`📊 Found ${orders.length} purchase orders`);

    let synced = 0;
    let updated = 0;
    let failed = 0;

    for (const order of orders) {
      try {
        // Find or create vendor by supplier code
        let vendor = await prisma.vendors.findFirst({
          where: { supplierCode: order.Supplier }
        });

        // If vendor doesn't exist, create a placeholder
        if (!vendor) {
          console.log(`⚠️ Vendor ${order.Supplier} not found, creating placeholder`);
          vendor = await prisma.vendors.create({
            data: {
              supplierCode: order.Supplier,
              supplierName: order.SupplierName || `Vendor ${order.Supplier}`,
              status: 'active',
              sapSyncStatus: 'pending'
            }
          });
        }

        const poCreateDate = parseSAPDate(order.PurchaseOrderDate);

        const poData: any = {
          poNumber: order.PurchaseOrder,
          vendorId: vendor.id,
          poCreateDate: poCreateDate,
          totalAmount: order.TotalAmount || 0,
          currency: order.DocumentCurrency || 'INR',
          status: order.PurchaseOrderStatus?.toLowerCase() || 'open',
          sapId: order.PurchaseOrder,
          sapSyncStatus: 'synced',
          sapLastSyncAt: new Date(),
          sapPayload: JSON.stringify(order)
        };

        const existingPO = await prisma.purchase_orders.findFirst({
          where: { poNumber: order.PurchaseOrder }
        });

        if (existingPO) {
          await prisma.purchase_orders.update({
            where: { id: existingPO.id },
            data: poData
          });
          updated++;
        } else {
          await prisma.purchase_orders.create({
            data: poData
          });
          synced++;
        }
      } catch (error: any) {
        failed++;
        console.error(`Failed to sync PO ${order.PurchaseOrder}:`, error.message);
      }
    }

    console.log(`✅ PO sync complete: ${synced} new, ${updated} updated, ${failed} failed`);
    return { synced, updated, failed, total: orders.length };
  } catch (error: any) {
    console.error('❌ Error syncing purchase orders:', error);
    throw error;
  }
}
