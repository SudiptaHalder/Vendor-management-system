import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { z } from 'zod'

const router = Router()

// Get all invoices for vendor
router.get('/', async (req, res) => {
  try {
    const vendorId = (req as any).user?.vendorId
    
    const invoices = await prisma.invoices.findMany({
      where: { vendorId },
      include: {
        lineItems: true,
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json({
      success: true,
      data: invoices
    })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    res.status(500).json({ error: 'Failed to fetch invoices' })
  }
})

// Get single invoice
router.get('/:id', async (req, res) => {
  try {
    const vendorId = (req as any).user?.vendorId
    const { id } = req.params
    
    const invoice = await prisma.invoices.findFirst({
      where: { id, vendorId },
      include: {
        lineItems: true,
        payments: true,
        purchaseOrder: true
      }
    })

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' })
    }

    // Log activity
    await prisma.vendor_activity_logs.create({
      data: {
        vendorId,
        action: 'invoice_viewed',
        entityType: 'invoice',
        entityId: id,
        details: { invoiceNumber: invoice.invoiceNumber }
      }
    })

    res.json({
      success: true,
      data: invoice
    })
  } catch (error) {
    console.error('Error fetching invoice:', error)
    res.status(500).json({ error: 'Failed to fetch invoice' })
  }
})

// Submit new invoice
router.post('/', async (req, res) => {
  try {
    const vendorId = (req as any).user?.vendorId
    const invoiceData = req.body

    // Generate invoice number
    const year = new Date().getFullYear()
    const count = await prisma.invoices.count({
      where: {
        createdAt: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1)
        }
      }
    })
    const invoiceNumber = `INV-${year}-${(count + 1).toString().padStart(4, '0')}`

    const invoice = await prisma.invoices.create({
      data: {
        invoiceNumber,
        vendorId,
        ...invoiceData,
        status: 'pending',
        createdById: vendorId // Will be handled by vendor
      }
    })

    // Create notification for admin
    await prisma.notifications.create({
      data: {
        type: 'new_invoice',
        title: 'New Invoice Submitted',
        message: `Vendor submitted invoice ${invoiceNumber}`,
        entityType: 'invoice',
        entityId: invoice.id,
        userId: (await prisma.users.findFirst({ where: { role: 'admin' } }))!.id
      }
    })

    // Log activity
    await prisma.vendor_activity_logs.create({
      data: {
        vendorId,
        action: 'invoice_submitted',
        entityType: 'invoice',
        entityId: invoice.id,
        details: { invoiceNumber }
      }
    })

    res.json({
      success: true,
      data: invoice
    })
  } catch (error) {
    console.error('Error creating invoice:', error)
    res.status(500).json({ error: 'Failed to create invoice' })
  }
})

export default router
