import { prisma } from '@vendor-management/database';
import { syncPurchaseOrders } from './syncPurchaseOrders';
import { syncMaterialDocuments } from './syncMaterialDocuments';

// Try to import invoices, but handle if it fails
let syncInvoices: any = null;
try {
  const module = require('./syncInvoices');
  syncInvoices = module.syncInvoices;
  console.log('✅ Invoice sync module loaded');
} catch (e) {
  console.log('⚠️ Invoice sync module not available, skipping');
}

export interface SyncResult {
  purchaseOrders: { synced: number; updated: number; failed: number; total: number };
  invoices: { synced: number; updated: number; failed: number; total: number };
  materialDocuments: { synced: number; updated: number; failed: number; total: number };
  totalDuration: number;
  timestamp: Date;
  status: string;
}

export async function syncAll(): Promise<SyncResult> {
  const startTime = Date.now();
  
  console.log('🚀 =========================================');
  console.log('🚀 Starting FULL SAP DATA SYNCHRONIZATION');
  console.log('🚀 =========================================');

  try {
    // Start with POs and Material Docs
    const tasks: Promise<any>[] = [
      syncPurchaseOrders(),
      syncMaterialDocuments()
    ];

    // Add invoices only if available
    let invoiceResult = { synced: 0, updated: 0, failed: 0, total: 0 };
    let invoiceStatus = 'skipped';
    
    if (syncInvoices) {
      try {
        invoiceResult = await syncInvoices();
        invoiceStatus = 'success';
        console.log('✅ Invoice sync completed');
      } catch (invoiceError: any) {
        console.log('⚠️ Invoice sync failed, continuing with POs and Material Docs');
        invoiceStatus = 'failed';
        invoiceResult = { synced: 0, updated: 0, failed: 1, total: 0 };
      }
    }

    const results = await Promise.all(tasks);
    
    const poResult = results[0];
    const materialResult = results[1];

    const totalDuration = Date.now() - startTime;

    console.log('📊 =========================================');
    console.log('📊 SAP SYNC COMPLETE');
    console.log(`   Purchase Orders:   +${poResult.synced} new, ${poResult.updated} updated, ${poResult.failed} failed`);
    console.log(`   Invoices:          +${invoiceResult.synced} new, ${invoiceResult.updated} updated, ${invoiceResult.failed} failed (${invoiceStatus})`);
    console.log(`   Material Docs:     +${materialResult.synced} new, ${materialResult.updated} updated, ${materialResult.failed} failed`);
    console.log(`   Total duration:    ${(totalDuration / 1000).toFixed(2)} seconds`);
    console.log('📊 =========================================');

    // Determine overall status - only fail if POs or Material Docs fail
    const hasFailures = poResult.failed > 0 || materialResult.failed > 0;
    const status = hasFailures ? 'partial' : 'success';

    await prisma.sap_sync_logs.create({
      data: {
        syncType: 'full_sync',
        direction: 'inbound',
        status: status,
        recordsProcessed: poResult.synced + invoiceResult.synced + materialResult.synced,
        recordsFailed: poResult.failed + invoiceResult.failed + materialResult.failed,
        syncData: {
          purchaseOrders: poResult,
          invoices: invoiceResult,
          materialDocuments: materialResult,
          durationMs: totalDuration,
          invoiceStatus: invoiceStatus
        },
        completedAt: new Date(),
        triggeredBy: 'admin'
      }
    });

    return {
      purchaseOrders: poResult,
      invoices: invoiceResult,
      materialDocuments: materialResult,
      totalDuration,
      timestamp: new Date(),
      status: status
    };
  } catch (error: any) {
    console.error('❌ FULL SAP SYNC FAILED:', error.message);

    await prisma.sap_sync_logs.create({
      data: {
        syncType: 'full_sync',
        direction: 'inbound',
        status: 'failed',
        errorDetails: error.message,
        completedAt: new Date(),
        triggeredBy: 'admin'
      }
    });

    throw error;
  }
}
