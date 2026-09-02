// import { Router } from 'express';
// import { vendorMiddleware } from '../../middleware/vendor.middleware';
// import { SAPAuth } from '../../services/sap/shared/sapAuth';

// const router = Router();

// // Get vendor's purchase orders from SAP
// router.get('/', vendorMiddleware, async (req, res) => {
//   try {
//     const vendorId = (req as any).user?.username; // vendor's supplier code
    
//     if (!vendorId) {
//       return res.status(401).json({ 
//         success: false, 
//         error: 'Not authenticated' 
//       });
//     }

//     console.log(`📦 Fetching purchase orders from SAP for vendor: ${vendorId}`);

//     const sapAuth = SAPAuth.getInstance();
//     const client = sapAuth.getClient();

//     // Fetch purchase orders from SAP for this specific vendor
//     const response = await client.get(
//       '/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrder',
//       {
//         params: {
//           $format: 'json',
//           $filter: `Supplier eq '${vendorId}'`,
//           $expand: 'to_PurchaseOrderItem',
//           $orderby: 'PurchaseOrderDate desc',
//           $top: 200
//         }
//       }
//     );

//     const orders = response.data.d?.results || [];
    
//     // Transform SAP data to match our interface
//     const transformedOrders = orders.map((po: any) => {
//       const lineItems = po.to_PurchaseOrderItem?.results || [];
      
//       return {
//         id: po.PurchaseOrder,
//         poNumber: po.PurchaseOrder,
//         poType: po.PurchaseOrderType || 'Standard',
//         plantCode: po.Plant || null,
//         poCreateDate: po.PurchaseOrderDate || null,
//         poAmendDate: po.LastChangeDate || null,
//         expectedDate: null,
//         deliveredDate: null,
//         status: mapSAPStatus(po.PurchaseOrderStatus),
//         subtotal: po.TotalAmount || 0,
//         taxAmount: 0,
//         totalAmount: po.TotalAmount || 0,
//         currency: po.DocumentCurrency || 'INR',
//         lineItems: lineItems.map((item: any) => ({
//           id: item.PurchaseOrderItem || '',
//           lineNumber: parseInt(item.PurchaseOrderItem) || 0,
//           materialCode: item.Material || null,
//           materialDesc: item.PurchaseOrderItemText || item.Material || null,
//           uom: item.OrderUnit || null,
//           quantity: item.OrderQuantity || null,
//           receivedQty: null,
//           pendingQty: null,
//           unitPrice: item.NetPriceAmount || null,
//           discountPercent: null,
//           discountAmount: null,
//           taxableValue: null,
//           gstPercent: null,
//           sgstPercent: null,
//           cgstPercent: null,
//           igstPercent: null,
//           gstAmount: null,
//           totalAmount: item.NetPriceAmount ? item.NetPriceAmount * (item.OrderQuantity || 0) : 0,
//           status: item.Status || 'pending'
//         }))
//       };
//     });

//     console.log(`✅ Found ${transformedOrders.length} purchase orders for vendor ${vendorId}`);

//     res.json({
//       success: true,
//       data: transformedOrders,
//       source: 'SAP Live',
//       count: transformedOrders.length
//     });

//   } catch (error: any) {
//     console.error('Error fetching vendor POs from SAP:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Failed to fetch purchase orders'
//     });
//   }
// });

// // Get single PO details from SAP
// router.get('/:poNumber', vendorMiddleware, async (req, res) => {
//   try {
//     const vendorId = (req as any).user?.username;
//     const { poNumber } = req.params;
    
//     if (!vendorId) {
//       return res.status(401).json({ 
//         success: false, 
//         error: 'Not authenticated' 
//       });
//     }

//     console.log(`📦 Fetching PO ${poNumber} from SAP for vendor: ${vendorId}`);

//     const sapAuth = SAPAuth.getInstance();
//     const client = sapAuth.getClient();

//     const response = await client.get(
//       `/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrder('${poNumber}')`,
//       {
//         params: {
//           $format: 'json',
//           $expand: 'to_PurchaseOrderItem'
//         }
//       }
//     );

//     const po = response.data.d;
    
//     if (!po) {
//       return res.status(404).json({
//         success: false,
//         error: 'Purchase order not found'
//       });
//     }

//     // Verify this PO belongs to the vendor
//     if (po.Supplier !== vendorId) {
//       return res.status(403).json({
//         success: false,
//         error: 'Access denied'
//       });
//     }

//     const lineItems = po.to_PurchaseOrderItem?.results || [];
    
//     const transformedPO = {
//       id: po.PurchaseOrder,
//       poNumber: po.PurchaseOrder,
//       poType: po.PurchaseOrderType || 'Standard',
//       plantCode: po.Plant || null,
//       poCreateDate: po.PurchaseOrderDate || null,
//       poAmendDate: po.LastChangeDate || null,
//       expectedDate: null,
//       deliveredDate: null,
//       status: mapSAPStatus(po.PurchaseOrderStatus),
//       subtotal: po.TotalAmount || 0,
//       taxAmount: 0,
//       totalAmount: po.TotalAmount || 0,
//       currency: po.DocumentCurrency || 'INR',
//       lineItems: lineItems.map((item: any) => ({
//         id: item.PurchaseOrderItem || '',
//         lineNumber: parseInt(item.PurchaseOrderItem) || 0,
//         materialCode: item.Material || null,
//         materialDesc: item.PurchaseOrderItemText || item.Material || null,
//         uom: item.OrderUnit || null,
//         quantity: item.OrderQuantity || null,
//         receivedQty: null,
//         pendingQty: null,
//         unitPrice: item.NetPriceAmount || null,
//         discountPercent: null,
//         discountAmount: null,
//         taxableValue: null,
//         gstPercent: null,
//         sgstPercent: null,
//         cgstPercent: null,
//         igstPercent: null,
//         gstAmount: null,
//         totalAmount: item.NetPriceAmount ? item.NetPriceAmount * (item.OrderQuantity || 0) : 0,
//         status: item.Status || 'pending'
//       }))
//     };

//     res.json({
//       success: true,
//       data: transformedPO,
//       source: 'SAP Live'
//     });

//   } catch (error: any) {
//     console.error('Error fetching PO from SAP:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Failed to fetch purchase order'
//     });
//   }
// });

// // Helper to map SAP status
// function mapSAPStatus(status: string): string {
//   const statusMap: Record<string, string> = {
//     '1': 'pending',
//     '2': 'approved',
//     '3': 'approved',
//     '4': 'completed',
//     '5': 'cancelled',
//     '6': 'completed',
//     'open': 'pending',
//     'closed': 'completed',
//     'cancelled': 'cancelled'
//   };
//   return statusMap[status] || 'pending';
// }

// export default router;

import { Router } from 'express';
import { vendorMiddleware } from '../../middleware/vendor.middleware';
import { SAPAuth } from '../../services/sap/shared/sapAuth';

const router = Router();

// Get vendor's purchase orders from SAP
router.get('/', vendorMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;
    const vendor = (req as any).vendor;
    const vendorId = user?.username || vendor?.supplierCode;
    
    console.log(`📦 Fetching purchase orders from SAP for vendor: ${vendorId}`);

    if (!vendorId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authenticated - No vendor ID' 
      });
    }

    const sapAuth = SAPAuth.getInstance();
    const client = sapAuth.getClient();

    // Fetch purchase orders from SAP for this specific vendor
    const response = await client.get(
      '/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrder',
      {
        params: {
          $format: 'json',
          $filter: `Supplier eq '${vendorId}'`,
          $expand: 'to_PurchaseOrderItem',
          $orderby: 'PurchaseOrderDate desc',
          $top: 200
        }
      }
    );

    const orders = response.data.d?.results || [];
    
    console.log(`📦 Found ${orders.length} purchase orders for vendor ${vendorId}`);

    // Transform SAP data to match our interface
    const transformedOrders = orders.map((po: any) => {
      const lineItems = po.to_PurchaseOrderItem?.results || [];
      
      return {
        id: po.PurchaseOrder,
        poNumber: po.PurchaseOrder,
        poType: po.PurchaseOrderType || 'Standard',
        plantCode: po.Plant || null,
        poCreateDate: po.PurchaseOrderDate || null,
        poAmendDate: po.LastChangeDate || null,
        expectedDate: po.DeliveryDate || null,
        deliveredDate: null,
        status: mapSAPStatus(po.PurchaseOrderStatus),
        subtotal: po.TotalAmount || 0,
        taxAmount: 0,
        totalAmount: po.TotalAmount || 0,
        currency: po.DocumentCurrency || 'INR',
        lineItems: lineItems.map((item: any) => ({
          id: item.PurchaseOrderItem || '',
          lineNumber: parseInt(item.PurchaseOrderItem) || 0,
          materialCode: item.Material || null,
          materialDesc: item.PurchaseOrderItemText || item.Material || null,
          uom: item.OrderUnit || null,
          quantity: item.OrderQuantity || null,
          receivedQty: item.QuantityDelivered || null,
          pendingQty: item.OrderQuantity && item.QuantityDelivered ? 
            item.OrderQuantity - item.QuantityDelivered : null,
          unitPrice: item.NetPriceAmount || null,
          discountPercent: null,
          discountAmount: null,
          taxableValue: null,
          gstPercent: null,
          sgstPercent: null,
          cgstPercent: null,
          igstPercent: null,
          gstAmount: null,
          totalAmount: item.NetPriceAmount ? item.NetPriceAmount * (item.OrderQuantity || 0) : 0,
          status: item.Status || 'pending'
        }))
      };
    });

    res.json({
      success: true,
      data: transformedOrders,
      source: 'SAP Live',
      count: transformedOrders.length,
      vendorId: vendorId
    });

  } catch (error: any) {
    console.error('Error fetching vendor POs from SAP:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch purchase orders'
    });
  }
});

// Get single PO details from SAP
router.get('/:poNumber', vendorMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;
    const vendor = (req as any).vendor;
    const vendorId = user?.username || vendor?.supplierCode;
    const { poNumber } = req.params;
    
    if (!vendorId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authenticated' 
      });
    }

    console.log(`📦 Fetching PO ${poNumber} from SAP for vendor: ${vendorId}`);

    const sapAuth = SAPAuth.getInstance();
    const client = sapAuth.getClient();

    const response = await client.get(
      `/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrder('${poNumber}')`,
      {
        params: {
          $format: 'json',
          $expand: 'to_PurchaseOrderItem'
        }
      }
    );

    const po = response.data.d;
    
    if (!po) {
      return res.status(404).json({
        success: false,
        error: 'Purchase order not found'
      });
    }

    // Verify this PO belongs to the vendor
    if (po.Supplier !== vendorId) {
      console.warn(`⚠️ Vendor ${vendorId} tried to access PO ${poNumber} belonging to ${po.Supplier}`);
      return res.status(403).json({
        success: false,
        error: 'Access denied - This PO does not belong to you'
      });
    }

    const lineItems = po.to_PurchaseOrderItem?.results || [];
    
    const transformedPO = {
      id: po.PurchaseOrder,
      poNumber: po.PurchaseOrder,
      poType: po.PurchaseOrderType || 'Standard',
      plantCode: po.Plant || null,
      poCreateDate: po.PurchaseOrderDate || null,
      poAmendDate: po.LastChangeDate || null,
      expectedDate: po.DeliveryDate || null,
      deliveredDate: null,
      status: mapSAPStatus(po.PurchaseOrderStatus),
      subtotal: po.TotalAmount || 0,
      taxAmount: 0,
      totalAmount: po.TotalAmount || 0,
      currency: po.DocumentCurrency || 'INR',
      lineItems: lineItems.map((item: any) => ({
        id: item.PurchaseOrderItem || '',
        lineNumber: parseInt(item.PurchaseOrderItem) || 0,
        materialCode: item.Material || null,
        materialDesc: item.PurchaseOrderItemText || item.Material || null,
        uom: item.OrderUnit || null,
        quantity: item.OrderQuantity || null,
        receivedQty: item.QuantityDelivered || null,
        pendingQty: item.OrderQuantity && item.QuantityDelivered ? 
          item.OrderQuantity - item.QuantityDelivered : null,
        unitPrice: item.NetPriceAmount || null,
        discountPercent: null,
        discountAmount: null,
        taxableValue: null,
        gstPercent: null,
        sgstPercent: null,
        cgstPercent: null,
        igstPercent: null,
        gstAmount: null,
        totalAmount: item.NetPriceAmount ? item.NetPriceAmount * (item.OrderQuantity || 0) : 0,
        status: item.Status || 'pending'
      }))
    };

    res.json({
      success: true,
      data: transformedPO,
      source: 'SAP Live'
    });

  } catch (error: any) {
    console.error('Error fetching PO from SAP:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch purchase order'
    });
  }
});

// Helper to map SAP status
function mapSAPStatus(status: string): string {
  const statusMap: Record<string, string> = {
    '1': 'pending',
    '2': 'approved',
    '3': 'approved',
    '4': 'completed',
    '5': 'cancelled',
    '6': 'completed',
    'open': 'pending',
    'closed': 'completed',
    'cancelled': 'cancelled'
  };
  return statusMap[status] || 'pending';
}

export default router;
