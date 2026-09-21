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

  return {
    id: sa.SchedulingAgreement,
    poNumber: sa.SchedulingAgreement,
    poType: sa.PurchasingDocumentType || 'Scheduling Agreement',
    plantCode: items[0]?.Plant || null,
    poCreateDate: sa.PurchasingDocumentOrderDate || null,
    poAmendDate: null,
    expectedDate: null,
    deliveredDate: null,
    status: mapSchedulingAgreementStatus(sa.SchedulingAgreementStatus),
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
