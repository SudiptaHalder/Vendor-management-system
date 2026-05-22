// apps/api/src/services/sap/sapMapper.ts

import { SAPMaterialDocument, SAPPurchaseOrder } from './sapTypes';

export class SAPMapper {
  
  static toLocalMaterialDocument(sapDoc: any): any {
    return {
      sapId: sapDoc.MaterialDocument,
      documentNumber: sapDoc.MaterialDocument,
      documentDate: new Date(sapDoc.DocumentDate),
      postingDate: new Date(sapDoc.PostingDate),
      companyCode: sapDoc.CompanyCode,
      plant: sapDoc.Plant,
      materialCode: sapDoc.Material,
      materialName: sapDoc.MaterialName || sapDoc.Material,
      quantity: parseFloat(sapDoc.Quantity),
      unit: sapDoc.Unit,
      vendorCode: sapDoc.VendorCode,
      vendorName: sapDoc.VendorName,
      purchaseOrderNumber: sapDoc.PurchaseOrder,
      amount: parseFloat(sapDoc.Amount),
      currency: sapDoc.Currency,
      sapSyncStatus: 'synced',
      sapLastSyncAt: new Date(),
      sapPayload: JSON.stringify(sapDoc)
    };
  }

  static toLocalPurchaseOrder(sapPO: any): any {
    return {
      sapId: sapP0.PurchaseOrderNumber,
      poNumber: sapPO.PurchaseOrderNumber,
      vendorCode: sapPO.VendorCode,
      documentDate: new Date(sapPO.DocumentDate),
      deliveryDate: new Date(sapPO.DeliveryDate),
      items: JSON.stringify(sapPO.Items),
      totalAmount: parseFloat(sapPO.TotalAmount),
      currency: sapPO.Currency,
      status: sapPO.Status,
      sapSyncStatus: 'synced',
      sapLastSyncAt: new Date(),
      sapPayload: JSON.stringify(sapPO)
    };
  }

  static toSAPPurchaseOrderUpdate(localPO: any): any {
    return {
      PurchaseOrderNumber: localPO.poNumber,
      Status: localPO.status,
      LastModified: new Date().toISOString(),
      // Add other fields that need to sync back to SAP
      DeliveryDate: localPO.deliveryDate?.toISOString(),
      Items: typeof localPO.items === 'string' 
        ? JSON.parse(localPO.items) 
        : localPO.items
    };
  }

  static transformMaterialDocumentResponse(data: any): SAPMaterialDocument[] {
    if (!data.d?.results) return [];
    
    return data.d.results.map((item: any) => ({
      MaterialDocument: item.MaterialDocument,
      DocumentDate: item.DocumentDate,
      PostingDate: item.PostingDate,
      CompanyCode: item.CompanyCode,
      Plant: item.Plant,
      Material: item.Material,
      Quantity: item.Quantity,
      Unit: item.Unit,
      VendorCode: item.VendorCode,
      VendorName: item.VendorName,
      PurchaseOrder: item.PurchaseOrder,
      Amount: item.Amount,
      Currency: item.Currency
    }));
  }
}