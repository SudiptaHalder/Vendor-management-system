import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { sapSyncOrchestrator } from '../services/sap/syncAll';

const router = Router();

// Trigger full sync (all modules)
router.post('/sync/all', authMiddleware, async (req, res) => {
  try {
    const result = await sapSyncOrchestrator.syncAll();
    res.json({
      success: true,
      data: result,
      message: 'Full SAP sync completed successfully'
    });
  } catch (error) {
    console.error('Full sync error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Full SAP sync failed'
    });
  }
});

// Sync only purchase orders
router.post('/sync/purchase-orders', authMiddleware, async (req, res) => {
  try {
    const result = await sapSyncOrchestrator.syncIndividual('purchase_orders');
    res.json({
      success: true,
      data: result,
      message: 'Purchase order sync completed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Sync only invoices
router.post('/sync/invoices', authMiddleware, async (req, res) => {
  try {
    const result = await sapSyncOrchestrator.syncIndividual('invoices');
    res.json({
      success: true,
      data: result,
      message: 'Invoice sync completed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Sync only material documents
router.post('/sync/material-documents', authMiddleware, async (req, res) => {
  try {
    const result = await sapSyncOrchestrator.syncIndividual('material_documents');
    res.json({
      success: true,
      data: result,
      message: 'Material document sync completed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get sync status
router.get('/sync/status', authMiddleware, async (req, res) => {
  try {
    const lastSync = await prisma.sap_sync_logs.findFirst({
      where: { syncType: 'full_sync', status: 'success' },
      orderBy: { completedAt: 'desc' }
    });
    
    const pendingFailed = await prisma.sap_failed_syncs.count({
      where: { status: 'pending' }
    });
    
    res.json({
      success: true,
      data: {
        lastSync: lastSync,
        pendingRetries: pendingFailed,
        isHealthy: pendingFailed === 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
