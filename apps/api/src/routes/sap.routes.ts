import { Router } from 'express';
import { SAPSyncService } from '../services/sap/sapSyncService';
import { SAPAuth } from '../services/sap/sapAuth';
import { authMiddleware } from '../middleware/auth.middleware';
import { prisma } from '@vendor-management/database';

const router = Router();
const syncService = new SAPSyncService();

// ============= PUBLIC ROUTES (No authentication required) =============

// Debug endpoint - Returns detailed SAP connection info (PUBLIC for testing)
router.get('/debug', async (req, res) => {
  try {
    const sapAuth = SAPAuth.getInstance();
    const connectionTest = await sapAuth.testConnection();
    
    const debugInfo = {
      config: {
        sapEnabled: process.env.SAP_ENABLED === 'true',
        baseUrl: process.env.SAP_BASE_URL ? 'configured' : 'missing',
        username: process.env.SAP_USERNAME ? 'configured' : 'missing',
        password: process.env.SAP_PASSWORD ? 'configured' : 'missing',
        client: process.env.SAP_CLIENT || 'default',
        language: process.env.SAP_LANGUAGE || 'default',
        apiEndpoint: process.env.SAP_MATERIAL_DOCUMENT_API || 'default'
      },
      connection: connectionTest,
      lastSync: await prisma.sap_sync_logs.findFirst({
        orderBy: { startedAt: 'desc' },
        select: {
          status: true,
          startedAt: true,
          completedAt: true,
          recordsProcessed: true,
          recordsFailed: true,
          errorDetails: true
        }
      }),
      syncStats: {
        totalMaterialDocs: await prisma.sap_material_documents.count(),
        syncedPOs: await prisma.purchase_orders.count({
          where: { sapSyncStatus: 'synced' }
        }),
        failedPOs: await prisma.purchase_orders.count({
          where: { sapSyncStatus: 'failed' }
        }),
        pendingSyncs: await prisma.sap_failed_syncs.count({
          where: { status: 'pending' }
        })
      },
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: debugInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test endpoint (PUBLIC)
router.get('/test', async (req, res) => {
  try {
    const sapAuth = SAPAuth.getInstance();
    const testResult = await sapAuth.testConnection();
    
    res.json({
      success: testResult.success,
      message: testResult.message,
      details: testResult.details,
      sapEnabled: process.env.SAP_ENABLED === 'true'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============= PROTECTED ROUTES (Authentication required) =============

// Get sync status
router.get('/sync/status', authMiddleware, async (req, res) => {
  try {
    const status = await syncService.getSyncStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Trigger manual sync
router.post('/sync/trigger', authMiddleware, async (req, res) => {
  try {
    const { vendorCode } = req.body;
    const result = await syncService.syncMaterialDocuments(vendorCode);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get sync logs
router.get('/logs', authMiddleware, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const logs = await prisma.sap_sync_logs.findMany({
      take: parseInt(limit),
      skip: parseInt(offset),
      orderBy: { startedAt: 'desc' }
    });
    
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get material documents
router.get('/material-documents', authMiddleware, async (req, res) => {
  try {
    const { vendorCode, limit = 100 } = req.query;
    
    const where: any = {};
    if (vendorCode) where.vendorCode = vendorCode;
    
    const documents = await prisma.sap_material_documents.findMany({
      where,
      take: parseInt(limit),
      orderBy: { documentDate: 'desc' }
    });
    
    res.json({ success: true, data: documents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

// ============= LIVE SAP DATA ENDPOINTS (Direct from SAP) =============

// Get live dashboard data directly from SAP
router.get('/live/dashboard', authMiddleware, async (req, res) => {
  try {
    const { SAPLiveDataService } = require('../services/sap/sapLiveDataService');
    const liveDataService = new SAPLiveDataService();
    const data = await liveDataService.getLiveDashboardData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Failed to fetch live data from SAP'
    });
  }
});

// Get live material documents count
router.get('/live/material-documents/count', authMiddleware, async (req, res) => {
  try {
    const { SAPLiveDataService } = require('../services/sap/sapLiveDataService');
    const liveDataService = new SAPLiveDataService();
    const count = await liveDataService.getLiveMaterialDocumentsCount();
    res.json({ success: true, data: { count, source: 'SAP Live' } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get live vendors count from SAP
router.get('/live/vendors/count', authMiddleware, async (req, res) => {
  try {
    const { SAPLiveDataService } = require('../services/sap/sapLiveDataService');
    const liveDataService = new SAPLiveDataService();
    const count = await liveDataService.getLiveVendorsCount();
    res.json({ success: true, data: { count, source: 'SAP Live' } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
