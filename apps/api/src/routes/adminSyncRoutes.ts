import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { prisma } from '@vendor-management/database';
import { syncAll } from '../services/sap/syncAll';
import { syncPurchaseOrders } from '../services/sap/syncPurchaseOrders';
import { syncInvoices } from '../services/sap/syncInvoices';
import { syncMaterialDocuments } from '../services/sap/syncMaterialDocuments';

const router = Router();

// Test endpoint
router.get('/test', authMiddleware, async (req, res) => {
  res.json({ success: true, message: 'Admin sync routes are working!' });
});

// Full sync all
router.post('/all', authMiddleware, async (req, res) => {
  try {
    console.log('📡 Full sync triggered by admin');
    const result = await syncAll();
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Full sync error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sync only purchase orders
router.post('/purchase-orders', authMiddleware, async (req, res) => {
  try {
    const result = await syncPurchaseOrders();
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sync only invoices
router.post('/invoices', authMiddleware, async (req, res) => {
  try {
    const result = await syncInvoices();
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sync only material documents
router.post('/material-documents', authMiddleware, async (req, res) => {
  try {
    const result = await syncMaterialDocuments();
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get sync status
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const lastSync = await prisma.sap_sync_logs.findFirst({
      where: { syncType: 'full_sync' },
      orderBy: { completedAt: 'desc' }
    });
    
    const totalVendors = await prisma.vendors.count();
    const totalPOs = await prisma.purchase_orders.count();
    const totalMaterialDocs = await prisma.sap_material_documents.count();
    
    // Get the status - if last sync is null or failed, show appropriate message
    let status = 'unknown';
    let lastSyncTime = null;
    let lastSyncStatus = 'unknown';
    
    if (lastSync) {
      lastSyncTime = lastSync.completedAt;
      lastSyncStatus = lastSync.status || 'unknown';
      // If invoice was skipped but POs and Material Docs succeeded, mark as success
      if (lastSync.syncData?.invoiceStatus === 'skipped' && lastSync.status === 'success') {
        status = 'success (invoices skipped)';
      } else {
        status = lastSyncStatus;
      }
    }
    
    res.json({
      success: true,
      data: {
        lastSync: lastSyncTime,
        lastSyncStatus: lastSyncStatus,
        status: status,
        counts: {
          vendors: totalVendors,
          purchaseOrders: totalPOs,
          materialDocuments: totalMaterialDocs
        }
      }
    });
  } catch (error: any) {
    console.error('Status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
