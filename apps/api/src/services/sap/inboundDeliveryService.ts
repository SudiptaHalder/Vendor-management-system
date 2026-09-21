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

  // The create call above only sets ActualDeliveryQuantity. SAP treats
  // "Delivery Quantity" and "Put Away Quantity" as separate mandatory fields
  // that stay unset until explicitly confirmed - this action sets both to
  // the same value the vendor entered, in the item's sales unit (uom).
  const createdItems = response?.d?.to_DeliveryDocumentItem?.results || [];
  for (const requested of lineItems) {
    const createdItem = createdItems.find(
      (i: any) => i.ReferenceSDDocumentItem === requested.poItemNumber
    );
    if (!createdItem) {
      console.warn(`⚠️ Could not match created delivery item for PO item ${requested.poItemNumber} - skipping putaway/delivery quantity confirmation`);
      continue;
    }

    // This action requires an If-Match header with the item's current ETag
    // (SAP returns 428 Precondition Required without it). The create
    // response normally already carries it; fall back to a fresh GET if not.
    let etag = createdItem.__metadata?.etag;
    if (!etag) {
      const client = sapAuth.getClient();
      const itemResponse = await client.get(
        `${INBOUND_DELIVERY_BASE}/A_InbDeliveryItem(DeliveryDocument='${deliveryDocument}',DeliveryDocumentItem='${createdItem.DeliveryDocumentItem}')`
      );
      etag = itemResponse.headers['etag'];
    }

    await sapAuth.postWithCsrf<any>(
      `${INBOUND_DELIVERY_BASE}/PutawayOneItemWithSalesQuantity`,
      undefined,
      {
        headers: etag ? { 'If-Match': etag } : {},
        params: {
          ActualDeliveryQuantity: `${requested.quantity}M`,
          DeliveryDocument: `'${deliveryDocument}'`,
          DeliveryDocumentItem: `'${createdItem.DeliveryDocumentItem}'`,
          DeliveryQuantityUnit: `'${requested.uom}'`
        }
      },
      `${INBOUND_DELIVERY_BASE}/A_InbDeliveryHeader`
    );
  }

  return { deliveryDocument, raw: response };
}
