import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { VendorService } from '../services/sap/odata/vendorService';

const router = Router();
const vendorService = new VendorService();

// Get vendor metrics
router.get('/vendor-metrics', authMiddleware, async (req, res) => {
  try {
    const metrics = await vendorService.getVendorMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all vendors with pagination and search
router.get('/vendors', authMiddleware, async (req, res) => {
  try {
    const { search, status, city, limit = 50, offset = 0 } = req.query;
    
    let vendors;
    if (search) {
      vendors = await vendorService.searchVendors(search as string, {
        status: status as string,
        city: city as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });
    } else {
      const allVendors = await vendorService.searchVendors('', {
        status: status as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });
      vendors = allVendors;
    }
    
    res.json({ success: true, data: vendors, count: vendors.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get vendor by ID
router.get('/vendors/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await vendorService.getVendorById(id);
    
    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }
    
    res.json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get vendor by supplier code
router.get('/vendors/code/:supplierCode', authMiddleware, async (req, res) => {
  try {
    const { supplierCode } = req.params;
    const vendor = await vendorService.getVendorByCode(supplierCode);
    
    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }
    
    res.json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sync all vendors from SAP
router.post('/sync-vendors', authMiddleware, async (req, res) => {
  try {
    const result = await vendorService.syncVendorsFromSAP();
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sync single vendor from SAP
router.post('/sync-vendors/:supplierCode', authMiddleware, async (req, res) => {
  try {
    const { supplierCode } = req.params;
    const result = await vendorService.syncSingleVendor(supplierCode);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search vendors
router.get('/vendors/search/:term', authMiddleware, async (req, res) => {
  try {
    const { term } = req.params;
    const { status, city, limit, offset } = req.query;
    
    const vendors = await vendorService.searchVendors(term, {
      status: status as string,
      city: city as string,
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0
    });
    
    res.json({ success: true, data: vendors, count: vendors.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

// Search vendors
router.get('/vendors/search/:term', authMiddleware, async (req, res) => {
  try {
    const { term } = req.params;
    const vendors = await vendorService.searchVendors(term);
    res.json({ success: true, data: vendors, count: vendors.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
