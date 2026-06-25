import { prisma } from '@vendor-management/database';
import { sapClient } from './sapClient';

interface SAPInvoice {
  SupplierInvoice: string;
  SupplierInvoiceStatus: string;
  InvoicingParty: string;
  SupplierInvoiceDate: string;
  InvoiceGrossAmount: number;
  DocumentCurrency: string;
  CreatedByUser: string;
  PaymentStatus: string;
  DueDate: string;
  to_SupplierInvoiceItemMaterial?: {
    results: SAPInvoiceItem[];
  };
}

interface SAPInvoiceItem {
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

export async function syncInvoices(): Promise<{ synced: number; updated: number; failed: number; total: number }> {
  console.log('🔄 Syncing Supplier Invoices from SAP...');

  try {
    const response = await sapClient.get('/sap/opu/odata/sap/API_SUPPLIERINVOICE_PROCESS_SRV/A_SupplierInvoice', {
      params: {
        $format: 'json',
        $top: 1000,
        $expand: 'to_SupplierInvoiceItemMaterial',
        $orderby: 'SupplierInvoiceDate desc'
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

        try {
          const invoiceData = {
            invoiceNumber: invoice.SupplierInvoice,
            vendorId: vendor?.id,
            vendorCode: invoice.InvoicingParty,
            invoiceDate: invoice.SupplierInvoiceDate ? new Date(invoice.SupplierInvoiceDate) : null,
            dueDate: invoice.DueDate ? new Date(invoice.DueDate) : null,
            amount: invoice.InvoiceGrossAmount || 0,
            currency: invoice.DocumentCurrency || 'INR',
            status: invoice.SupplierInvoiceStatus?.toLowerCase() || 'pending',
            paymentStatus: invoice.PaymentStatus?.toLowerCase() || 'unpaid',
            sapId: invoice.SupplierInvoice,
            sapSyncStatus: 'synced',
            sapPayload: JSON.stringify(invoice)
          };

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
          }
        } catch (dbError) {
          console.log(`⚠️ Could not save invoice ${invoice.SupplierInvoice}:`, dbError.message);
        }
      } catch (error) {
        failed++;
        console.error(`Failed to sync invoice ${invoice.SupplierInvoice}:`, error.message);
      }
    }

    console.log(`✅ Invoice sync complete: ${synced} new, ${updated} updated, ${failed} failed`);
    return { synced, updated, failed, total: invoices.length };
  } catch (error) {
    console.error('❌ Error syncing invoices:', error);
    throw error;
  }
}
