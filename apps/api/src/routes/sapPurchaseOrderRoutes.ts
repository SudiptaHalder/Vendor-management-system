import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { SAPAuth } from '../services/sap/sapAuth';

const router = Router();

// Get purchase orders directly from SAP
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { limit = 200, search = '' } = req.query;
    const sapAuth = SAPAuth.getInstance();
    const client = sapAuth.getClient();

    let url = `/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrder?$expand=to_PurchaseOrderItem&$top=${limit}&$orderby=PurchaseOrderDate desc&$format=json`;
    
    if (search) {
      url += `&$filter=contains(PurchaseOrder, '${search}') or contains(Supplier, '${search}')`;
    }

    console.log(`📡 Fetching purchase orders from SAP: ${url}`);
    
    const response = await client.get(url);

    const orders = response.data.d?.results || [];
    console.log(`📊 Found ${orders.length} purchase orders`);

    const transformedOrders = orders.map((order: any) => ({
      PurchaseOrder: order.PurchaseOrder,
      Supplier: order.Supplier,
      SupplierName: order.SupplierName || '',
      PurchaseOrderDate: order.PurchaseOrderDate,
      TotalAmount: order.TotalAmount || 0,
      DocumentCurrency: order.DocumentCurrency || 'INR',
      PurchaseOrderStatus: order.PurchaseOrderStatus || 'open',
      to_PurchaseOrderItem: order.to_PurchaseOrderItem || { results: [] }
    }));

    res.json({
      success: true,
      data: transformedOrders,
      source: 'SAP Live',
      count: transformedOrders.length
    });
  } catch (error: any) {
    console.error('Error fetching purchase orders from SAP:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch purchase orders from SAP'
    });
  }
});

// Get single purchase order by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const sapAuth = SAPAuth.getInstance();
    const client = sapAuth.getClient();

    const response = await client.get(
      `/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrder('${id}')?$expand=to_PurchaseOrderItem&$format=json`
    );

    const order = response.data.d;
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Purchase order not found'
      });
    }

    res.json({
      success: true,
      data: order,
      source: 'SAP Live'
    });
  } catch (error: any) {
    console.error('Error fetching purchase order:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch purchase order'
    });
  }
});

export default router;
