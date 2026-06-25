import { prisma } from '@vendor-management/database';

export class ReconciliationEngine {
  async reconcilePurchaseOrder(poId: string): Promise<any> {
    const purchaseOrder = await prisma.purchase_orders.findUnique({
      where: { id: poId },
      include: { lineItems: true }
    });

    if (!purchaseOrder) return { error: 'PO not found' };

    // Get goods receipts for this PO
    const goodsReceipts = await prisma.sap_material_documents.findMany({
      where: { purchaseOrderNumber: purchaseOrder.poNumber }
    });

    // Calculate received quantities
    const receivedByItem = new Map();
    goodsReceipts.forEach(gr => {
      // Parse line items from payload if needed
      const itemKey = gr.materialCode;
      const current = receivedByItem.get(itemKey) || 0;
      receivedByItem.set(itemKey, current + (gr.quantity || 0));
    });

    // Compare ordered vs received
    const reconciliation = purchaseOrder.lineItems.map(item => ({
      materialCode: item.materialCode,
      orderedQuantity: item.quantity,
      receivedQuantity: receivedByItem.get(item.materialCode) || 0,
      pendingQuantity: (item.quantity || 0) - (receivedByItem.get(item.materialCode) || 0),
      status: (item.quantity || 0) === (receivedByItem.get(item.materialCode) || 0) 
        ? 'completed' 
        : (receivedByItem.get(item.materialCode) || 0) > 0 
          ? 'partial' 
          : 'pending'
    }));

    return {
      poNumber: purchaseOrder.poNumber,
      vendorId: purchaseOrder.vendorId,
      reconciliation,
      overallStatus: reconciliation.every(r => r.status === 'completed') 
        ? 'fully_delivered' 
        : reconciliation.some(r => r.status === 'partial') 
          ? 'partially_delivered' 
          : 'no_delivery'
    };
  }

  async getERPReconciliationSummary(): Promise<any> {
    const purchaseOrders = await prisma.purchase_orders.findMany({
      include: { lineItems: true }
    });

    const summaries = [];
    for (const po of purchaseOrders) {
      const reconciliation = await this.reconcilePurchaseOrder(po.id);
      summaries.push(reconciliation);
    }

    return {
      totalPOs: purchaseOrders.length,
      fullyDelivered: summaries.filter(s => s.overallStatus === 'fully_delivered').length,
      partiallyDelivered: summaries.filter(s => s.overallStatus === 'partially_delivered').length,
      noDelivery: summaries.filter(s => s.overallStatus === 'no_delivery').length,
      details: summaries
    };
  }
}
