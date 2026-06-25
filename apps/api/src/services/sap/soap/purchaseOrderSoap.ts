import { SOAPClient } from './soapClient';
import { prisma } from '@vendor-management/database';
import { SAPLogger } from '../shared/sapLogger';

export class PurchaseOrderSOAPService {
  private soapClient;

  constructor() {
    this.soapClient = new SOAPClient();
  }

  async syncPurchaseOrders(dateFrom?: string, dateTo?: string): Promise<any> {
    const startTime = Date.now();
    let synced = 0;
    let failed = 0;

    try {
      console.log('🔄 Syncing purchase orders from SAP via SOAP...');
      
      const fromDate = dateFrom || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const toDate = dateTo || new Date().toISOString().split('T')[0];
      
      // Build SOAP request for purchase orders
      const soapBody = `
        <GetPurchaseOrderList xmlns="http://sap.com/xi/WebService">
          <DateRange>
            <FromDate>${fromDate}</FromDate>
            <ToDate>${toDate}</ToDate>
          </DateRange>
        </GetPurchaseOrderList>
      `;
      
      const envelope = this.soapClient.buildSOAPEnvelope(soapBody);
      
      const result = await this.soapClient.sendSOAPRequest(
        '/sap/bc/srt/scs_ext/sap/purchaseorderrequest_in_v2',
        envelope,
        'http://sap.com/xi/WebService/GetPurchaseOrderList'
      );
      
      // Parse the SOAP response
      const purchaseOrders = this.parsePurchaseOrderResponse(result);
      
      console.log(`📊 Found ${purchaseOrders.length} purchase orders in SAP`);
      
      for (const po of purchaseOrders) {
        try {
          // Find vendor by SAP code
          const vendor = await prisma.vendors.findFirst({
            where: { sapCode: po.vendorCode }
          });
          
          // Create or update purchase order
          const poData = {
            poNumber: po.poNumber,
            poType: po.poType || 'Standard',
            plantCode: po.plantCode,
            vendorId: vendor?.id,
            poCreateDate: po.createDate ? new Date(po.createDate) : null,
            poAmendDate: po.amendDate ? new Date(po.amendDate) : null,
            expectedDate: po.deliveryDate ? new Date(po.deliveryDate) : null,
            status: po.status || 'open',
            totalAmount: po.totalAmount,
            currency: po.currency || 'INR',
            sapId: po.sapId,
            sapSyncStatus: 'synced',
            sapLastSyncAt: new Date(),
            sapPayload: JSON.stringify(po),
            deliveryStatus: po.deliveryStatus || 'pending'
          };
          
          const existingPO = await prisma.purchase_orders.findFirst({
            where: { poNumber: po.poNumber }
          });
          
          if (existingPO) {
            await prisma.purchase_orders.update({
              where: { id: existingPO.id },
              data: poData
            });
          } else {
            await prisma.purchase_orders.create({
              data: poData
            });
          }
          
          // Sync line items
          if (po.lineItems && po.lineItems.length > 0) {
            for (const item of po.lineItems) {
              await prisma.po_line_items.upsert({
                where: { 
                  id: `${po.poNumber}_${item.lineNumber}` 
                },
                update: {
                  lineNumber: item.lineNumber,
                  materialCode: item.materialCode,
                  materialDesc: item.materialDesc,
                  quantity: item.quantity,
                  uom: item.uom,
                  unitPrice: item.unitPrice,
                  totalPrice: item.totalPrice,
                  expectedDate: item.deliveryDate ? new Date(item.deliveryDate) : null,
                  status: item.status || 'pending'
                },
                create: {
                  id: `${po.poNumber}_${item.lineNumber}`,
                  purchaseOrderId: existingPO?.id || '',
                  lineNumber: item.lineNumber,
                  materialCode: item.materialCode,
                  materialDesc: item.materialDesc,
                  quantity: item.quantity,
                  uom: item.uom,
                  unitPrice: item.unitPrice,
                  totalPrice: item.totalPrice,
                  expectedDate: item.deliveryDate ? new Date(item.deliveryDate) : null,
                  status: item.status || 'pending'
                }
              });
            }
          }
          
          synced++;
        } catch (error) {
          failed++;
          console.error(`Failed to sync PO ${po.poNumber}:`, error.message);
        }
      }
      
      await SAPLogger.logSync('purchase_order', 'inbound', 'success', {
        recordsProcessed: synced,
        recordsFailed: failed,
        duration: Date.now() - startTime
      });
      
      console.log(`✅ PO sync complete: ${synced} synced, ${failed} failed`);
      return { synced, failed, total: purchaseOrders.length };
      
    } catch (error) {
      console.error('Error syncing purchase orders:', error);
      await SAPLogger.logSync('purchase_order', 'inbound', 'failed', { error: error.message });
      throw error;
    }
  }
  
  private parsePurchaseOrderResponse(xmlData: any): any[] {
    // TODO: Implement actual XML parsing based on SAP's response structure
    // This is a placeholder - actual parsing depends on the SOAP response format
    try {
      // Check if response has the expected structure
      if (xmlData && xmlData['soap:Envelope'] && xmlData['soap:Envelope']['soap:Body']) {
        const body = xmlData['soap:Envelope']['soap:Body'];
        // Parse the actual PO data from the response
        // This needs to be customized based on actual SAP response
        console.log('SOAP response received, parsing POs...');
        return [];
      }
      return [];
    } catch (error) {
      console.error('Error parsing SOAP response:', error);
      return [];
    }
  }
}
