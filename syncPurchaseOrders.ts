import { prisma } from '@vendor-management/database';
import { sapClient } from './sapClient';

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

export async function syncPurchaseOrders() {
  console.log('🔄 Syncing Purchase Orders from SAP...');
  
  try {
    // Fetch purchase orders with line items
    const response = await sapClient.get('/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrder', {
      params: {
        $format: 'json',
        $top: 1000,
        $expand: 'to_PurchaseOrderItem',
        $orderby: 'PurchaseOrderDate desc'
      }
    });

    const orders = response.data.d?.results || [];
    console.log(`📊 Found ${orders.length} purchase orders`);

    let synced = 0;
    let updated = 0;
    let failed = 0;

    for (const order of orders) {
      try {
        // Find vendor by supplier code
        const vendor = await prisma.vendors.findFirst({
          where: { supplierCode: order.Supplier }
        });

        const poData = {
          poNumber: order.PurchaseOrder,
          vendorId: vendor?.id,
          poCreateDate: order.PurchaseOrderDate ? new Date(order.PurchaseOrderDate) : null,
          totalAmount: order.TotalAmount || 0,
          currency: order.DocumentCurrency || 'INR',
          status: order.PurchaseOrderStatus?.toLowerCase() || 'open',
          sapId: order.PurchaseOrder,
          sapSyncStatus: 'synced',
          sapLastSyncAt: new Date(),
          sapPayload: JSON.stringify(order)
        };

        // Upsert purchase order
        const existingPO = await prisma.purchase_orders.findFirst({
          where: { poNumber: order.PurchaseOrder }
        });

        let purchaseOrder;
        if (existingPO) {
          purchaseOrder = await prisma.purchase_orders.update({
            where: { id: existingPO.id },
            data: poData
          });
          updated++;
        } else {
          purchaseOrder = await prisma.purchase_orders.create({
            data: poData
          });
          synced++;
        }

        // Sync line items
        if (order.to_PurchaseOrderItem?.results) {
          for (const item of order.to_PurchaseOrderItem.results) {
            try {
              const itemData = {
                purchaseOrderId: purchaseOrder.id,
                lineNumber: parseInt(item.PurchaseOrderItem),
                materialCode: item.Material,
                materialDesc: item.MaterialName,
                quantity: item.OrderQuantity || 0,
                uom: item.OrderUnit,
                unitPrice: item.NetPriceAmount || 0,
                totalPrice: (item.OrderQuantity || 0) * (item.NetPriceAmount || 0),
                expectedDate: item.DeliveryDate ? new Date(item.DeliveryDate) : null,
                status: item.Status?.toLowerCase() || 'pending'
              };

              const existingItem = await prisma.po_line_items.findFirst({
                where: {
                  purchaseOrderId: purchaseOrder.id,
                  lineNumber: itemData.lineNumber
                }
              });

              if (existingItem) {
                await prisma.po_line_items.update({
                  where: { id: existingItem.id },
                  data: itemData
                });
              } else {
                await prisma.po_line_items.create({
                  data: itemData
                });
              }
            } catch (itemError) {
              console.error(`Failed to sync line item ${item.PurchaseOrderItem}:`, itemError.message);
            }
          }
        }
      } catch (error) {
        failed++;
        console.error(`Failed to sync PO ${order.PurchaseOrder}:`, error.message);
      }
    }

    console.log(`✅ PO sync complete: ${synced} new, ${updated} updated, ${failed} failed`);
    return { synced, updated, failed, total: orders.length };
  } catch (error) {
    console.error('❌ Error syncing purchase orders:', error);
    throw error;
  }
}
