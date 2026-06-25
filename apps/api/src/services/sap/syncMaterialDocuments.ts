import { prisma } from '@vendor-management/database';
import { sapClient } from './sapClient';
import { parseSAPDate } from '../../utils/dateParser';

interface SAPMaterialDocument {
  MaterialDocument: string;
  MaterialDocumentYear: string;
  DocumentDate: string;
  PostingDate: string;
  CreatedByUser: string;
  CompanyCode: string;
  to_MaterialDocumentItem?: {
    results: SAPMaterialDocumentItem[];
  };
}

interface SAPMaterialDocumentItem {
  MaterialDocument: string;
  MaterialDocumentItem: string;
  Material: string;
  Plant: string;
  StorageLocation: string;
  QuantityInEntryUnit: number;
  EntryUnit: string;
  PurchaseOrder: string;
  PurchaseOrderItem: string;
  GoodsMovementType: string;
  IsCompletelyDelivered: boolean;
}

export async function syncMaterialDocuments(): Promise<{ synced: number; updated: number; failed: number; total: number }> {
  console.log('�� Syncing Material Documents from SAP...');

  try {
    const response = await sapClient.get('/sap/opu/odata/sap/API_MATERIAL_DOCUMENT_SRV/A_MaterialDocumentHeader', {
      params: {
        $format: 'json',
        $top: 100,
        $expand: 'to_MaterialDocumentItem',
        $orderby: 'DocumentDate desc'
      }
    });

    const documents = response.d?.results || [];
    console.log(`📊 Found ${documents.length} material documents`);

    let synced = 0;
    let updated = 0;
    let failed = 0;

    for (const doc of documents) {
      try {
        const docData = {
          sapId: doc.MaterialDocument,
          documentNumber: doc.MaterialDocument,
          documentDate: parseSAPDate(doc.DocumentDate),
          postingDate: parseSAPDate(doc.PostingDate),
          companyCode: doc.CompanyCode || '',
          sapPayload: JSON.stringify(doc),
          syncedAt: new Date()
        };

        const existingDoc = await prisma.sap_material_documents.findFirst({
          where: { sapId: doc.MaterialDocument }
        });

        if (existingDoc) {
          await prisma.sap_material_documents.update({
            where: { id: existingDoc.id },
            data: docData
          });
          updated++;
        } else {
          await prisma.sap_material_documents.create({
            data: docData
          });
          synced++;
        }
      } catch (error: any) {
        failed++;
        console.error(`Failed to sync material document ${doc.MaterialDocument}:`, error.message);
      }
    }

    console.log(`✅ Material Document sync complete: ${synced} new, ${updated} updated, ${failed} failed`);
    return { synced, updated, failed, total: documents.length };
  } catch (error: any) {
    console.error('❌ Error syncing material documents:', error);
    throw error;
  }
}
