import { Router } from 'express';
import { vendorMiddleware } from '../../middleware/vendor.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
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

// Gate-verification lookup: scan the barcode (SAP DeliveryDocument number),
// fetch the delivery LIVE from SAP (never from our own DB) so a vendor can't
// forge what the gateman sees - the only way to fake this is to fake SAP itself.
router.get('/verify/:deliveryDocument', authMiddleware, async (req, res) => {
  try {
    // Strip anything that isn't alphanumeric before it goes anywhere near
    // the SAP URL - a stray quote/space (mistyped, or copy-pasted from
    // somewhere that quoted the value) breaks OData's string literal syntax
    // and SAP rejects it with a generic "Malformed URI literal syntax".
    const deliveryDocument = req.params.deliveryDocument.replace(/[^a-zA-Z0-9]/g, '');

    if (!deliveryDocument) {
      return res.status(400).json({ success: false, error: 'Invalid delivery document number scanned' });
    }

    const sapAuth = SAPAuth.getInstance();
    const client = sapAuth.getClient();

    const response = await client.get(
      `/sap/opu/odata/sap/API_INBOUND_DELIVERY_SRV;v=0002/A_InbDeliveryHeader('${deliveryDocument}')`,
      { params: { $format: 'json', $expand: 'to_DeliveryDocumentItem' } }
    );

    const header = response.data.d;
    if (!header) {
      return res.status(404).json({ success: false, error: 'No delivery found for this barcode' });
    }

    const items = header.to_DeliveryDocumentItem?.results || [];

    // header.OrderID is not populated by SAP for deliveries created with a
    // ReferenceSDDocument - the real PO number only lives on each item.
    const poNumber = items[0]?.ReferenceSDDocument || null;

    res.json({
      success: true,
      data: {
        deliveryDocument: header.DeliveryDocument,
        supplier: header.Supplier,
        vehicleNo: header.BillOfLading || null,
        supplierReference: header.DeliveryDocumentBySupplier || null,
        deliveryDate: header.DeliveryDate,
        poNumber,
        lineItems: items.map((item: any) => ({
          poItemNumber: item.ReferenceSDDocumentItem,
          materialCode: item.Material,
          quantity: item.ActualDeliveryQuantity,
          uom: item.DeliveryQuantityUnit
        }))
      }
    });
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return res.status(404).json({ success: false, error: 'No delivery found for this barcode' });
    }
    console.error(
      'Error verifying delivery:',
      JSON.stringify(error?.response?.data || { message: error.message }, null, 2)
    );
    res.status(500).json({
      success: false,
      error: error?.response?.data?.error?.message?.value || error.message || 'Failed to verify delivery'
    });
  }
});

export default router;
