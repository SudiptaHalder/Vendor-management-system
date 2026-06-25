import { SAPAuth } from './sapAuth';

export class SAPLiveDataService {
  private sapClient;

  constructor() {
    this.sapClient = SAPAuth.getInstance().getClient();
  }

  async getLiveMaterialDocumentsCount(): Promise<number> {
    try {
      const response = await this.sapClient.get(
        '/sap/opu/odata/sap/API_MATERIAL_DOCUMENT_SRV/A_MaterialDocumentHeader',
        {
          params: {
            $format: 'json',
            $top: 1,
            $inlinecount: 'allpages'
          }
        }
      );
      
      // Get total count from SAP response
      const count = response.data.d?.__count || response.data.d?.results?.length || 0;
      return parseInt(count);
    } catch (error) {
      console.error('Error fetching live SAP document count:', error);
      return 0;
    }
  }

  async getLiveMaterialDocuments(limit: number = 10): Promise<any[]> {
    try {
      const response = await this.sapClient.get(
        '/sap/opu/odata/sap/API_MATERIAL_DOCUMENT_SRV/A_MaterialDocumentHeader',
        {
          params: {
            $format: 'json',
            $top: limit,
            $orderby: 'DocumentDate desc'
          }
        }
      );
      
      return response.data.d?.results || [];
    } catch (error) {
      console.error('Error fetching live SAP documents:', error);
      return [];
    }
  }

  async getLiveVendorsCount(): Promise<number> {
    try {
      // Try to fetch vendors from SAP Business Partner API
      const response = await this.sapClient.get(
        '/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner',
        {
          params: {
            $format: 'json',
            $top: 1,
            $inlinecount: 'allpages',
            $filter: "BusinessPartnerCategory eq '2'" // Category 2 = Suppliers/Vendors
          }
        }
      );
      
      const count = response.data.d?.__count || 0;
      return parseInt(count);
    } catch (error) {
      console.error('Error fetching live SAP vendors count:', error);
      return 0;
    }
  }

  async getLivePurchaseOrdersCount(): Promise<number> {
    try {
      const response = await this.sapClient.get(
        '/sap/opu/odata/sap/API_PURCHASE_ORDER_PROCESS_SRV/A_PurchaseOrder',
        {
          params: {
            $format: 'json',
            $top: 1,
            $inlinecount: 'allpages'
          }
        }
      );
      
      const count = response.data.d?.__count || 0;
      return parseInt(count);
    } catch (error) {
      console.error('Error fetching live SAP purchase orders count:', error);
      return 0;
    }
  }

  async getLiveDashboardData(): Promise<any> {
    const [materialDocsCount, vendorsCount, purchaseOrdersCount, recentDocs] = await Promise.all([
      this.getLiveMaterialDocumentsCount(),
      this.getLiveVendorsCount(),
      this.getLivePurchaseOrdersCount(),
      this.getLiveMaterialDocuments(5)
    ]);

    return {
      success: true,
      data: {
        totalMaterialDocuments: materialDocsCount,
        totalVendors: vendorsCount,
        totalPurchaseOrders: purchaseOrdersCount,
        recentDocuments: recentDocs,
        source: 'SAP S/4HANA Cloud - Live Data',
        lastFetched: new Date().toISOString()
      }
    };
  }
}
