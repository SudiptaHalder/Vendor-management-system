// apps/api/src/routes/sap/syncRoutes.ts

import { Router } from 'express';
import { SAPSyncService } from '../../services/sap/sapSyncService';
import { authenticateToken } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/roles';

const router = Router();
const syncService = new SAPSyncService();

// Trigger manual sync (Admin only)
router.post('/sync', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type, vendorCode } = req.body;
    
    let result;
    if (type === 'material_documents') {
      result = await syncService.syncMaterialDocuments(vendorCode);
    } else if (type === 'purchase_orders') {
      result = await syncService.syncPurchaseOrders(vendorCode);
    } else {
      // Sync all
      const [docsResult, poResult] = await Promise.all([
        syncService.syncMaterialDocuments(vendorCode),
        syncService.syncPurchaseOrders(vendorCode)
      ]);
      result = {
        materialDocuments: docsResult,
        purchaseOrders: poResult,
        totalSynced: docsResult.recordsSynced + poResult.recordsSynced
      };
    }
    
    res.json({
      success: true,
      data: result,
      message: 'Sync completed successfully'
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Sync failed',
      error: error.message
    });
  }
});

// Push local changes to SAP
router.post('/push', authenticateToken, async (req, res) => {
  try {
    const { recordId, type } = req.body;
    
    if (!recordId || !type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: recordId, type'
      });
    }
    
    const success = await syncService.pushToSAP(recordId, type);
    
    res.json({
      success,
      message: success ? 'Successfully pushed to SAP' : 'Failed to push to SAP'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Push failed',
      error: error.message
    });
  }
});

// Get sync status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const status = await syncService.getSyncStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get sync status',
      error: error.message
    });
  }
});

// Get sync logs
router.get('/logs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const logs = await prisma.syncLog.findMany({
      take: parseInt(limit),
      skip: parseInt(offset),
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      success: true,
      data: logs,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch logs',
      error: error.message
    });
  }
});

// Get failed syncs
router.get('/failed', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const failedItems = await prisma.failedSync.findMany({
      where: { status: 'pending' },
      orderBy: { nextRetryAt: 'asc' }
    });
    
    res.json({
      success: true,
      data: failedItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch failed syncs',
      error: error.message
    });
  }
});

// Retry failed sync
router.post('/retry/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const failedSync = await prisma.failedSync.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!failedSync) {
      return res.status(404).json({
        success: false,
        message: 'Failed sync record not found'
      });
    }
    
    const success = await syncService.pushToSAP(
      failedSync.recordId.toString(),
      failedSync.recordType
    );
    
    if (success) {
      await prisma.failedSync.update({
        where: { id: failedSync.id },
        data: {
          status: 'resolved',
          resolvedAt: new Date()
        }
      });
    }
    
    res.json({
      success,
      message: success ? 'Retry successful' : 'Retry failed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Retry failed',
      error: error.message
    });
  }
});

export default router;