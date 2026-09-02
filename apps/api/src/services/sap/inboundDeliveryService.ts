import { SAPAuth } from './shared/sapAuth';

// SAP_COM_0106 - Inbound Delivery / ASN integration
const INBOUND_DELIVERY_BASE = '/sap/opu/odata/sap/API_INBOUND_DELIVERY_SRV;v=0002';

export interface CreateAsnLineItem {
  poItemNumber: string; // SAP PurchaseOrderItem, e.g. '10'
  materialCode: string;
  uom: string;
  quantity: number;
  plantCode?: string | null;
}

export interface CreateAsnParams {
  supplierCode: string;
  poNumber: string;
  vehicleNo?: string;
  supplierReference?: string; // vendor's own document number (e.g. their invoice/challan no.)
  lineItems: CreateAsnLineItem[];
}

export interface CreateAsnResult {
  deliveryDocument: string;
  raw: any;
}

/**
 * Creates an Inbound Delivery (ASN) in SAP with reference to a Purchase Order.
 *
 * Deliberately does NOT send price/amount fields - this API is a logistics
 * document (quantities only). Pricing already lives on the PO in SAP; if the
 * vendor's entered price/total needs to reach SAP too, that's a separate
 * Supplier Invoice API integration, not this one.
 */
export async function createInboundDeliveryFromEDI(params: CreateAsnParams): Promise<CreateAsnResult> {
  const { supplierCode, poNumber, vehicleNo, supplierReference, lineItems } = params;

  if (!lineItems || lineItems.length === 0) {
    throw new Error('At least one line item is required');
  }

  const payload: Record<string, any> = {
    Supplier: supplierCode,
    to_DeliveryDocumentItem: {
      results: lineItems.map((item) => ({
        ReferenceSDDocument: poNumber,
        ReferenceSDDocumentItem: item.poItemNumber,
        Material: item.materialCode,
        ActualDeliveryQuantity: String(item.quantity),
        DeliveryQuantityUnit: item.uom,
        ...(item.plantCode ? { Plant: item.plantCode } : {})
      }))
    }
  };

  // BillOfLading is the closest field SAP's create schema actually accepts
  // for a transport reference - MeansOfTransport exists on read but is not
  // settable at creation. Confirm with the SAP team if a dedicated field
  // for vehicle number exists elsewhere.
  if (vehicleNo) {
    payload.BillOfLading = vehicleNo;
  }

  // "External delivery/ASN number as known by the supplier" - the closest
  // fit for the vendor's own reference number.
  if (supplierReference) {
    payload.DeliveryDocumentBySupplier = supplierReference;
  }

  const sapAuth = SAPAuth.getInstance();
  // No $format on writes - SAP OData rejects system query options on POST;
  // JSON is already negotiated via the Accept header on the shared client.
  const response = await sapAuth.postWithCsrf<any>(
    `${INBOUND_DELIVERY_BASE}/A_InbDeliveryHeader`,
    payload
  );

  const deliveryDocument = response?.d?.DeliveryDocument;
  if (!deliveryDocument) {
    throw new Error('SAP did not return a DeliveryDocument number for the created ASN');
  }

  return { deliveryDocument, raw: response };
}
