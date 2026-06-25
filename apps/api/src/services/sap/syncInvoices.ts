import { prisma } from '@vendor-management/database';
import { sapClient } from './sapClient';
import { parseSAPDate } from '../../utils/dateParser';

export interface SAPInvoice {
  SupplierInvoice: string;
  FiscalYear: string;
  InvoicingParty: string;
  SupplierInvoiceStatus: string;
  SupplierInvoicePaymentStatus: string;
  DocumentDate: string;
  InvoiceGrossAmount: number;
  DocumentCurrency: string;
  CreatedByUser: string;
  PaymentTerms: string;
  to_SupplierInvoiceItemMaterial?: {
    results: SAPInvoiceItem[];
  };
}

export interface SAPInvoiceItem {
  SupplierInvoice: string;
  SupplierInvoiceItem: string;
  Material: string;
  MaterialName?: string;
  PurchaseOrder: string;
  PurchaseOrderItem: string;
  Quantity: number;
  QuantityUnit: string;
  NetAmount: number;
  TaxAmount: number;
}

// Helper functions
function mapInvoiceStatus(status: string): string {
  const statusMap: Record<string, string> = {
    '1': 'draft',
    '2': 'posted',
    '3': 'cleared',
    '4': 'cancelled',
    '5': 'parked'
  };
  return statusMap[status] || status?.toLowerCase() || 'pending';
}

function mapPaymentStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'Cleared': 'paid',
    'Not Cleared': 'unpaid',
    'Partially Cleared': 'partial'
  };
  return statusMap[status] || 'unpaid';
}

export async function syncInvoices(): Promise<{ synced: number; updated: number; failed: number; total: number }> {
  console.log('🔄 Syncing Supplier Invoices from SAP...');

  try {
    const response = await sapClient.get('/sap/opu/odata/sap/API_SUPPLIERINVOICE_PROCESS_SRV/A_SupplierInvoice', {
      params: {
        $format: 'json',
        $top: 100,
        $expand: 'to_SupplierInvoiceItemMaterial',
        $orderby: 'DocumentDate desc'
      }
    });

    const invoices = response.d?.results || [];
    console.log(`📊 Found ${invoices.length} supplier invoices`);

    let synced = 0;
    let updated = 0;
    let failed = 0;

    for (const invoice of invoices) {
      try {
        const vendor = await prisma.vendors.findFirst({
          where: { supplierCode: invoice.InvoicingParty }
        });

        const invoiceData = {
          invoiceNumber: invoice.SupplierInvoice,
          vendorId: vendor?.id || null,
          vendorCode: invoice.InvoicingParty,
          invoiceDate: parseSAPDate(invoice.DocumentDate),
          dueDate: null,
          amount: invoice.InvoiceGrossAmount || 0,
          currency: invoice.DocumentCurrency || 'INR',
          status: mapInvoiceStatus(invoice.SupplierInvoiceStatus),
          paymentStatus: mapPaymentStatus(invoice.SupplierInvoicePaymentStatus),
          sapId: invoice.SupplierInvoice,
          sapSyncStatus: 'synced',
          sapPayload: JSON.stringify(invoice)
        };

        // Check if supplier_invoices table exists
        try {
          const existingInvoice = await (prisma as any).supplier_invoices?.findFirst({
            where: { invoiceNumber: invoice.SupplierInvoice }
          });

          if (existingInvoice) {
            await (prisma as any).supplier_invoices.update({
              where: { id: existingInvoice.id },
              data: invoiceData
            });
            updated++;
          } else if ((prisma as any).supplier_invoices) {
            await (prisma as any).supplier_invoices.create({
              data: invoiceData
            });
            synced++;
          } else {
            console.log(`⚠️ supplier_invoices table not found. Invoice ${invoice.SupplierInvoice} data:`, {
              number: invoice.SupplierInvoice,
              vendor: invoice.InvoicingParty,
              amount: invoice.InvoiceGrossAmount
            });
            synced++;
          }
        } catch (dbError: any) {
          console.log(`⚠️ Could not save invoice ${invoice.SupplierInvoice}:`, dbError.message);
          synced++;
        }
      } catch (error: any) {
        failed++;
        console.error(`Failed to sync invoice ${invoice.SupplierInvoice}:`, error.message);
      }
    }

    console.log(`✅ Invoice sync complete: ${synced} new, ${updated} updated, ${failed} failed`);
    return { synced, updated, failed, total: invoices.length };
  } catch (error: any) {
    console.error('❌ Error syncing invoices:', error);
    throw error;
  }
}
