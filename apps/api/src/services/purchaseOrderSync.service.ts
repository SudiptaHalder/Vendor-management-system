// apps/api/src/services/purchaseOrderSync.service.ts

import { prisma } from '@vendor-management/database';
import { SAPSyncService } from './sap/sapSyncService';

export class PurchaseOrderSyncService {
  private sapSyncService: SAPSyncService;

  constructor() {
    this.sapSyncService = new SAPSyncService();
  }

  async updatePurchaseOrderWithSync(id: string, updateData: any, userId: string) {
    // Update local database first
    const updatedPO = await prisma.purchase_orders.update({
      where: { id },
      data: {
        ...updateData,
        sapSyncStatus: 'pending',
        updatedAt: new Date()
      }
    });

    // Async push to SAP
    this.sapSyncService.pushPurchaseOrderToSAP(id).catch(error => {
      console.error(`Failed to sync PO ${id} to SAP:`, error);
    });

    return updatedPO;
  }

  async getPurchaseOrdersWithSyncStatus(vendorId: string) {
    const orders = await prisma.purchase_orders.findMany({
      where: { vendorId },
      include: {
        lineItems: true,
        vendor: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return orders.map(order => ({
      ...order,
      syncInfo: {
        status: order.sapSyncStatus,
        lastSyncAt: order.sapLastSyncAt,
        hasError: !!order.sapError,
        errorMessage: order.sapError,
        retryCount: order.sapRetryCount
      }
    }));
  }
}