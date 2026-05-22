import { prisma } from '@vendor-management/database';
import { SAPAuth } from './sapAuth';
import { SyncResult, SyncStatus } from './sapTypes';
import { parseSAPDate, safeDate } from './sapDateParser';

export class SAPSyncService {
  private sapClient;
  private sapAuth: SAPAuth;
  private isSyncing: boolean = false;

  constructor() {
    this.sapAuth = SAPAuth.getInstance();
    this.sapClient = this.sapAuth.getClient();
  }

  async syncMaterialDocuments(vendorCode?: string): Promise<SyncResult> {
    const syncId = `mat_doc_${Date.now()}`;
    let recordsSynced = 0;
    let recordsFailed = 0;
    const errors = [];

    // Only sync if SAP is enabled
    if (process.env.SAP_ENABLED !== 'true') {
      console.log('ℹ️ SAP is disabled, skipping sync');
      return {
        success: true,
        recordsSynced: 0,
        recordsFailed: 0,
        errors: [],
        syncId
      };
    }

    try {
      console.log('🔄 Starting SAP material document sync...');
      
      // Build OData query with proper format
      const params: any = {
        $top: 100,
        $orderby: 'DocumentDate desc'
      };

      if (vendorCode) {
        params.$filter = `VendorCode eq '${vendorCode}'`;
      }

      // Use the proper OData endpoint
      const endpoint = '/sap/opu/odata/sap/API_MATERIAL_DOCUMENT_SRV/A_MaterialDocumentHeader';
      
      console.log(`📡 Fetching from SAP OData endpoint: ${endpoint}`);
      console.log(`   Query params:`, params);
      
      const response = await this.sapAuth.makeODataRequest(endpoint, params);
      
      // Parse OData response
      const documents = response.d?.results || [];
      console.log(`📊 Found ${documents.length} material documents from SAP`);

      // Create sync log
      const log = await prisma.sap_sync_logs.create({
        data: {
          syncType: 'material_document',
          direction: 'inbound',
          status: 'pending',
          startedAt: new Date(),
          triggeredBy: 'auto_sync'
        }
      });

      for (const doc of documents) {
        try {
          // Parse SAP dates
          const documentDate = parseSAPDate(doc.DocumentDate);
          const postingDate = parseSAPDate(doc.PostingDate);
          const creationDate = parseSAPDate(doc.CreationDate);
          
          if (!documentDate || !postingDate) {
            console.warn(`Invalid dates for document ${doc.MaterialDocument}: DocumentDate=${doc.DocumentDate}, PostingDate=${doc.PostingDate}`);
          }
          
          // Map SAP fields to local schema
          const mappedDoc = {
            sapId: doc.MaterialDocument,
            documentNumber: doc.MaterialDocument,
            documentDate: documentDate || new Date(),
            postingDate: postingDate || new Date(),
            companyCode: doc.CompanyCode || '',
            plant: doc.Plant || '',
            materialCode: doc.Material || '',
            materialName: doc.MaterialName || doc.Material || '',
            quantity: doc.Quantity || 0,
            unit: doc.Unit || '',
            vendorCode: doc.VendorCode || '',
            vendorName: doc.VendorName || '',
            purchaseOrderNumber: doc.PurchaseOrder || '',
            amount: doc.Amount || 0,
            currency: doc.Currency || 'INR',
            sapPayload: JSON.stringify(doc)
          };

          // Find local vendor by supplier code
          const vendor = await prisma.vendors.findFirst({
            where: { supplierCode: mappedDoc.vendorCode }
          });

          if (vendor) {
            mappedDoc.vendorCode = vendor.supplierCode;
          }

          // Find purchase order
          const purchaseOrder = mappedDoc.purchaseOrderNumber 
            ? await prisma.purchase_orders.findFirst({
                where: { poNumber: mappedDoc.purchaseOrderNumber }
              })
            : null;

          if (purchaseOrder) {
            mappedDoc.purchaseOrderId = purchaseOrder.id;
          }

          // Upsert material document
          await prisma.sap_material_documents.upsert({
            where: { sapId: mappedDoc.sapId },
            update: {
              ...mappedDoc,
              updatedAt: new Date()
            },
            create: {
              ...mappedDoc,
              createdAt: new Date()
            }
          });

          recordsSynced++;
          console.log(`✅ Synced document: ${doc.MaterialDocument} - Vendor: ${doc.VendorCode}`);
        } catch (error) {
          recordsFailed++;
          errors.push({
            id: doc.MaterialDocument,
            error: error.message,
            timestamp: new Date()
          });
          console.error(`❌ Failed to sync document ${doc.MaterialDocument}:`, error.message);
        }
      }

      // Update sync log
      await prisma.sap_sync_logs.update({
        where: { id: log.id },
        data: {
          status: recordsFailed === 0 ? 'success' : 'partial',
          recordsProcessed: recordsSynced,
          recordsFailed: recordsFailed,
          errorDetails: errors.length > 0 ? JSON.stringify(errors) : null,
          completedAt: new Date()
        }
      });

      console.log(`✅ Sync complete: ${recordsSynced} synced, ${recordsFailed} failed`);
      
      return {
        success: recordsFailed === 0,
        recordsSynced,
        recordsFailed,
        errors,
        syncId,
        logId: log.id
      };
    } catch (error) {
      console.error('❌ SAP sync error:', error);
      return {
        success: false,
        recordsSynced: 0,
        recordsFailed: 1,
        errors: [{ id: syncId, error: error.message, timestamp: new Date() }],
        syncId
      };
    }
  }

  async getSyncStatus(): Promise<SyncStatus> {
    try {
      const lastSync = await prisma.sap_sync_logs.findFirst({
        where: { status: 'success' },
        orderBy: { completedAt: 'desc' }
      });

      const pendingFailed = await prisma.sap_failed_syncs.count({
        where: { status: 'pending' }
      });

      const syncedPOs = await prisma.purchase_orders.count({
        where: { sapSyncStatus: 'synced' }
      });

      const failedPOs = await prisma.purchase_orders.count({
        where: { sapSyncStatus: 'failed' }
      });

      return {
        status: pendingFailed > 0 ? 'pending' : 'completed',
        lastSyncAt: lastSync?.completedAt || undefined,
        nextSyncAt: new Date(Date.now() + (parseInt(process.env.SAP_SYNC_INTERVAL) || 300000)),
        recordsProcessed: syncedPOs,
        failedRecords: failedPOs,
        pendingRetries: pendingFailed
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return {
        status: 'failed',
        recordsProcessed: 0,
        failedRecords: 0,
        pendingRetries: 0
      };
    }
  }

  startBackgroundSync(): void {
    if (process.env.SAP_ENABLED !== 'true') {
      console.log('ℹ️ SAP is disabled, background sync not started');
      return;
    }

    // Test connection before starting background sync
    this.sapAuth.testConnection().then((result) => {
      if (result.success) {
        console.log('✅ SAP connection verified, starting background sync');
        const interval = parseInt(process.env.SAP_SYNC_INTERVAL) || 300000;
        console.log(`🔄 Starting SAP background sync every ${interval / 1000} seconds`);
        
        setInterval(async () => {
          if (!this.isSyncing) {
            this.isSyncing = true;
            console.log('🔄 Running SAP background sync...');
            try {
              await this.syncMaterialDocuments();
              console.log('✅ SAP background sync completed');
            } catch (error) {
              console.error('❌ SAP background sync failed:', error);
            } finally {
              this.isSyncing = false;
            }
          }
        }, interval);
      } else {
        console.error('❌ SAP connection test failed - background sync not started');
        console.error('   Check SAP configuration and credentials');
      }
    });
  }
}
