import { Router } from 'express';
import { vendorMiddleware } from '../../middleware/vendor.middleware';
import { SAPAuth } from '../../services/sap/shared/sapAuth';
import { createInboundDeliveryFromEDI } from '../../services/sap/inboundDeliveryService';

const router = Router();

// Submit a manual EDI as an SAP Inbound Delivery (ASN) against a PO.
// Price/invoice fields entered by the vendor stay local only - this SAP
// API is a logistics document with no price fields (see inboundDeliveryService).
router.post('/submit', vendorMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;
    const vendor = (req as any).vendor;
    const vendorId = user?.username || vendor?.supplierCode;

    if (!vendorId) {
      return res.status(401).json({ success: false, error: 'Not authenticated - No vendor ID' });
    }

    const { poNumber, vehicleNo, invoiceNo, lineItems } = req.body;

    if (!poNumber || !Array.isArray(lineItems) || lineItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'poNumber and at least one line item are required'
      });
    }

    // Re-fetch the PO from SAP server-side - never trust client-supplied
    // material/uom/plant for a write. Also re-verifies PO ownership.
    const sapAuth = SAPAuth.getInstance();
    const client = sapAuth.getClient();

    const poResponse = await client.get(
      `/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrder('${poNumber}')`,
      { params: { $format: 'json', $expand: 'to_PurchaseOrderItem' } }
    );

    const po = poResponse.data.d;
    if (!po) {
      return res.status(404).json({ success: false, error: 'Purchase order not found' });
    }
    if (po.Supplier !== vendorId) {
      console.warn(`⚠️ Vendor ${vendorId} tried to submit EDI against PO ${poNumber} belonging to ${po.Supplier}`);
      return res.status(403).json({ success: false, error: 'Access denied - This PO does not belong to you' });
    }

    const sapLineItems = po.to_PurchaseOrderItem?.results || [];

    const resolvedLineItems = lineItems.map((li: any) => {
      const sapItem = sapLineItems.find((s: any) => s.PurchaseOrderItem === li.poItemNumber);
      if (!sapItem) {
        throw new Error(`Line item ${li.poItemNumber} not found on PO ${poNumber}`);
      }

      const quantity = Number(li.quantity);
      if (!quantity || quantity <= 0) {
        throw new Error(`Invalid quantity for line item ${li.poItemNumber}`);
      }
      if (quantity > Number(sapItem.OrderQuantity)) {
        throw new Error(`Quantity ${quantity} for line item ${li.poItemNumber} exceeds PO quantity ${sapItem.OrderQuantity}`);
      }

      return {
        poItemNumber: sapItem.PurchaseOrderItem,
        materialCode: sapItem.Material,
        uom: sapItem.OrderUnit,
        quantity,
        plantCode: po.Plant || null
      };
    });

    const result = await createInboundDeliveryFromEDI({
      supplierCode: vendorId,
      poNumber,
      vehicleNo,
      supplierReference: invoiceNo,
      lineItems: resolvedLineItems
    });

    console.log(`✅ Created SAP Inbound Delivery ${result.deliveryDocument} for vendor ${vendorId}, PO ${poNumber}`);

    res.json({
      success: true,
      data: {
        deliveryDocument: result.deliveryDocument
      }
    });
  } catch (error: any) {
    // console.error truncates nested objects by default - stringify fully so
    // SAP's errordetails array (often more specific than the top-level
    // message) actually shows up in the logs.
    console.error(
      'Error submitting EDI / creating inbound delivery:',
      JSON.stringify(error?.response?.data || { message: error.message }, null, 2)
    );
    res.status(500).json({
      success: false,
      error: error?.response?.data?.error?.message?.value || error.message || 'Failed to submit EDI to SAP'
    });
  }
});

export default router;
