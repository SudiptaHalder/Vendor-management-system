import { prisma } from '@vendor-management/database'

export class NotificationService {
  
  // Notify vendor about invoice status change
  static async notifyInvoiceStatusChange(invoiceId: string, status: string) {
    const invoice = await prisma.invoices.findUnique({
      where: { id: invoiceId },
      include: { vendor: true }
    })

    if (!invoice || !invoice.vendor) return

    await prisma.vendor_notifications.create({
      data: {
        vendorId: invoice.vendorId,
        type: 'invoice_status',
        title: `Invoice ${status}`,
        message: `Your invoice ${invoice.invoiceNumber} has been marked as ${status}`,
        data: { invoiceId, invoiceNumber: invoice.invoiceNumber, status }
      }
    })
  }

  // Notify vendor about new purchase order
  static async notifyNewPurchaseOrder(poId: string) {
    const po = await prisma.purchase_orders.findUnique({
      where: { id: poId },
      include: { vendor: true }
    })

    if (!po || !po.vendor) return

    await prisma.vendor_notifications.create({
      data: {
        vendorId: po.vendorId,
        type: 'new_order',
        title: 'New Purchase Order',
        message: `You have a new purchase order: ${po.poNumber}`,
        data: { poId, poNumber: po.poNumber }
      }
    })
  }

  // Notify vendor about payment received
  static async notifyPaymentReceived(invoiceId: string) {
    const invoice = await prisma.invoices.findUnique({
      where: { id: invoiceId },
      include: { vendor: true }
    })

    if (!invoice || !invoice.vendor) return

    await prisma.vendor_notifications.create({
      data: {
        vendorId: invoice.vendorId,
        type: 'payment_received',
        title: 'Payment Received',
        message: `Payment of ${invoice.currency} ${invoice.total} has been received for invoice ${invoice.invoiceNumber}`,
        data: { invoiceId, invoiceNumber: invoice.invoiceNumber, amount: invoice.total }
      }
    })
  }

  // Notify admin about vendor activity
  static async notifyAdminVendorActivity(vendorId: string, action: string, details: any) {
    const vendor = await prisma.vendors.findUnique({
      where: { id: vendorId }
    })

    if (!vendor) return

    const admins = await prisma.users.findMany({
      where: { role: 'admin' }
    })

    for (const admin of admins) {
      await prisma.notifications.create({
        data: {
          type: 'vendor_activity',
          title: `Vendor Activity: ${vendor.name}`,
          message: action,
          entityType: 'vendor',
          entityId: vendorId,
          data: details,
          userId: admin.id
        }
      })
    }
  }
}
