import { SAPAuth } from './shared/sapAuth';

// SAP_COM_0103 - Purchase Scheduling Agreement Integration. Uses a separate
// technical user (SCHED_USER / SCHED_SYS) - VMS_USER is not authorized here.
const SCHED_AGRMT_BASE = '/sap/opu/odata/sap/API_SCHED_AGRMT_PROCESS_SRV';

function getClient() {
  return SAPAuth.getSchedInstance().getClient();
}

// Scheduling agreements ("open POs") use a 55-prefixed number series in this
// system, reused every month, unlike close-quantity POs which are one-time.
export function isSchedulingAgreementNumber(poNumber: string): boolean {
  return /^55/.test(poNumber);
}

export interface ScheduleLineItem {
  id: string; // "{SchedulingAgreementItem}-{ScheduleLine}", e.g. "10-1"
  lineNumber: number;
  schedulingAgreementItem: string;
  scheduleLine: string;
  materialCode: string | null;
  materialDesc: string | null;
  uom: string | null;
  quantity: number; // this schedule line's planned quantity for its month
  receivedQty: number; // already delivered against this schedule line
  pendingQty: number;
  unitPrice: number;
  totalAmount: number;
  deliveryDate: string | null;
  status: string;
}

export interface TransformedSchedulingAgreement {
  id: string;
  poNumber: string; // the SchedulingAgreement number - reused as "poNumber" so the frontend's existing PO shape works unchanged
  poType: string;
  plantCode: string | null;
  poCreateDate: string | null;
  poAmendDate: string | null;
  expectedDate: string | null;
  deliveredDate: string | null;
  status: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  lineItems: ScheduleLineItem[];
  supplier: string;
  isSchedulingAgreement: true;
}

function mapSchedulingAgreementStatus(status: string): string {
  const map: Record<string, string> = {
    '01': 'pending',
    '04': 'approved',
    '09': 'cancelled'
  };
  return map[status] || 'pending';
}

function parseSAPNumber(value: any): number {
  const n = parseFloat(value);
  return isNaN(n) ? 0 : n;
}

function transformSchedulingAgreement(sa: any): TransformedSchedulingAgreement {
  const items = sa.to_SchedgAgrmtItm?.results || [];
  const lineItems: ScheduleLineItem[] = [];

  for (const item of items) {
    const scheduleLines = item.to_SchAgrmtSchLine?.results || [];
    const netPrice = parseSAPNumber(item.NetPriceAmount);

    for (const line of scheduleLines) {
      const planned = parseSAPNumber(line.ScheduleLineOrderQuantity);
      const delivered = parseSAPNumber(line.PrevDelivQtyOfScheduleLine);
      const pending = Math.max(planned - delivered, 0);

      lineItems.push({
        id: `${item.SchedulingAgreementItem}-${line.ScheduleLine}`,
        lineNumber: parseInt(item.SchedulingAgreementItem, 10) || 0,
        schedulingAgreementItem: item.SchedulingAgreementItem,
        scheduleLine: line.ScheduleLine,
        materialCode: item.Material || null,
        materialDesc: item.PurchasingDocumentItemText || item.Material || null,
        uom: line.OrderQuantityUnit || item.OrderQuantityUnit || null,
        quantity: planned,
        receivedQty: delivered,
        pendingQty: pending,
        unitPrice: netPrice,
        totalAmount: netPrice * planned,
        deliveryDate: line.ScheduleLineDeliveryDate || null,
        status: pending <= 0 && planned > 0 ? 'completed' : 'pending'
      });
    }
  }

  // If every schedule line across every item has been fully delivered,
  // show the agreement as "completed" rather than trusting the raw status
  // code - PrevDelivQtyOfScheduleLine is a real, confirmed-accurate field,
  // unlike some status codes that don't reliably reflect delivery state.
  const allLinesDelivered = lineItems.length > 0 && lineItems.every((li) => li.pendingQty <= 0);

  return {
    id: sa.SchedulingAgreement,
    poNumber: sa.SchedulingAgreement,
    poType: sa.PurchasingDocumentType || 'Scheduling Agreement',
    plantCode: items[0]?.Plant || null,
    poCreateDate: sa.PurchasingDocumentOrderDate || null,
    poAmendDate: null,
    expectedDate: null,
    deliveredDate: null,
    status: allLinesDelivered ? 'completed' : mapSchedulingAgreementStatus(sa.SchedulingAgreementStatus),
    subtotal: 0,
    taxAmount: 0,
    totalAmount: parseSAPNumber(sa.TargetAmount),
    currency: sa.DocumentCurrency || 'INR',
    lineItems,
    supplier: sa.Supplier,
    isSchedulingAgreement: true
  };
}

export async function getSchedulingAgreementsForSupplier(supplierCode: string): Promise<TransformedSchedulingAgreement[]> {
  const client = getClient();
  const response = await client.get(`${SCHED_AGRMT_BASE}/A_SchAgrmtHeader`, {
    params: {
      $format: 'json',
      $filter: `Supplier eq '${supplierCode}'`,
      $expand: 'to_SchedgAgrmtItm/to_SchAgrmtSchLine',
      $top: 200
    }
  });

  const results = response.data.d?.results || [];
  return results.map(transformSchedulingAgreement);
}

export async function getSchedulingAgreementByNumber(saNumber: string): Promise<TransformedSchedulingAgreement | null> {
  const client = getClient();
  const response = await client.get(`${SCHED_AGRMT_BASE}/A_SchAgrmtHeader('${saNumber}')`, {
    params: {
      $format: 'json',
      $expand: 'to_SchedgAgrmtItm/to_SchAgrmtSchLine'
    }
  });

  const sa = response.data.d;
  if (!sa) return null;
  return transformSchedulingAgreement(sa);
}

export interface AmendmentRecord {
  schedulingAgreement: string;
  schedulingAgreementItem: string;
  supplier: string | null;
  material: string | null;
  materialDesc: string | null;
  oldPrice: number;
  newPrice: number;
  percentChange: number | null;
  amendmentDate: string | null;
  oldDate: string | null;
}

/**
 * Price amendments are a custom mechanism specific to scheduling agreements
 * (YY1_OldPrice_PDI / YY1_NewPrice_SA_PDI on the item, populated only once
 * a price has actually been changed - default is "0.00"/null, confirmed
 * against live data). This has no equivalent on close-quantity POs.
 */
export async function getScheduleAgreementAmendments(): Promise<AmendmentRecord[]> {
  const client = getClient();

  const itemsResponse = await client.get(`${SCHED_AGRMT_BASE}/A_SchAgrmtItem`, {
    params: {
      $format: 'json',
      $filter: 'YY1_NewPrice_SA_PDI gt 0.00m',
      $top: 500
    }
  });

  const items = itemsResponse.data.d?.results || [];
  if (items.length === 0) {
    return [];
  }

  // Supplier lives on the header, not the item - look up each unique
  // agreement number found (no nav property from item back to header).
  const saNumbers: string[] = Array.from(new Set(items.map((i: any) => i.SchedulingAgreement as string)));
  const headers = await Promise.all(
    saNumbers.map((saNumber: string) =>
      client
        .get(`${SCHED_AGRMT_BASE}/A_SchAgrmtHeader('${saNumber}')`, { params: { $format: 'json' } })
        .then((r: any) => r.data.d)
        .catch(() => null)
    )
  );
  const headerBySA = new Map<string, any>();
  headers.forEach((h: any) => {
    if (h) headerBySA.set(h.SchedulingAgreement, h);
  });

  return items.map((item: any) => {
    const oldPrice = parseSAPNumber(item.YY1_OldPrice_PDI);
    const newPrice = parseSAPNumber(item.YY1_NewPrice_SA_PDI);
    const header = headerBySA.get(item.SchedulingAgreement);

    return {
      schedulingAgreement: item.SchedulingAgreement,
      schedulingAgreementItem: item.SchedulingAgreementItem,
      supplier: header?.Supplier || null,
      material: item.Material || null,
      materialDesc: item.PurchasingDocumentItemText || item.Material || null,
      oldPrice,
      newPrice,
      percentChange: oldPrice > 0 ? ((newPrice - oldPrice) / oldPrice) * 100 : null,
      amendmentDate: item.YY1_AmmendmentDate_SA_PDI || null,
      oldDate: item.YY1_OldDate_SA_PDI || null
    };
  });
}
