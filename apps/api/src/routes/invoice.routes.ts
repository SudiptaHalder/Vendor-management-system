import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { z } from 'zod'

const router = Router()

// Validation schemas
const createInvoiceSchema = z.object({
  vendorId: z.string().min(1, 'Vendor is required'),
  projectId: z.string().optional().nullable(),
  workOrderId: z.string().optional().nullable(),
  contractId: z.string().optional().nullable(),
  purchaseOrderId: z.string().optional().nullable(),
  reference: z.string().optional().nullable(),
  type: z.string().default('service'),
  status: z.string().default('draft'),
  issueDate: z.string(),
  dueDate: z.string().optional().nullable(),
  subtotal: z.number().positive(),
  taxAmount: z.number().default(0),
  taxRate: z.number().optional().nullable(),
  discount: z.number().default(0),
  discountType: z.string().optional().nullable(),
  shippingCost: z.number().default(0),
  total: z.number().positive(),
  currency: z.string().default('USD'),
  paymentTerms: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  lineItems: z.array(z.object({
    id: z.string().optional(),
    lineNumber: z.number(),
    description: z.string(),
    quantity: z.number().positive(),
    unit: z.string().optional().nullable(),
    unitPrice: z.number().positive(),
    discountPercent: z.number().optional().default(0),
    discountAmount: z.number().optional().default(0),
    taxRate: z.number().optional().default(0),
    taxAmount: z.number().optional().default(0),
    total: z.number().positive(),
    poLineItemId: z.string().optional().nullable()
  }))
})

// Generate Invoice Number
const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear()
  const count = await prisma.invoices.count({
    where: {
      createdAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1)
      }
    }
  })
  return `INV-${year}-${(count + 1).toString().padStart(5, '0')}`
}

// GET all invoices
router.get('/', async (req, res) => {
  try {
    const { status, vendorId, projectId, startDate, endDate } = req.query
    
    const where: any = {
      deletedAt: null
    }
    
    if (status) where.status = status
    if (vendorId) where.vendorId = vendorId
    if (projectId) where.projectId = projectId
    if (startDate) where.issueDate = { gte: new Date(startDate as string) }
    if (endDate) where.issueDate = { ...where.issueDate, lte: new Date(endDate as string) }

 const invoices = await prisma.invoices.findMany({
  where,
  select: {  // Use select instead of include to specify exact fields
    id: true,
    invoiceNumber: true,
    vendorId: true,
    vendor: {
      select: {
        id: true,
        name: true,
        email: true
      }
    },
    project: {
      select: {
        id: true,
        name: true,
        projectNumber: true
      }
    },
    total: true,
    balance: true,  // ✅ THIS IS CRITICAL - MISSING FROM YOUR CODE
    currency: true,
    dueDate: true,
    status: true,
    issueDate: true,
    _count: {
      select: {
        payments: true,
        lineItems: true
      }
    }
  },
  orderBy: {
    issueDate: 'desc'
  }
})

    res.json({
      success: true,
      data: invoices
    })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoices'
    })
  }
})

// GET single invoice
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const invoice = await prisma.invoices.findUnique({
      where: { id },
      include: {
        vendor: true,
        project: {
          select: {
            id: true,
            name: true,
            projectNumber: true
          }
        },
        workOrder: {
          select: {
            id: true,
            workOrderNumber: true,
            title: true
          }
        },
        contract: {
          select: {
            id: true,
            contractNumber: true,
            title: true
          }
        },
        purchaseOrder: {
          select: {
            id: true,
            poNumber: true,
            title: true
          }
        },
        lineItems: {
          orderBy: {
            lineNumber: 'asc'
          }
        },
        payments: {
          where: {
            deletedAt: null
          },
          orderBy: {
            paymentDate: 'desc'
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!invoice || invoice.deletedAt) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      })
    }

    res.json({
      success: true,
      data: invoice
    })
  } catch (error) {
    console.error('Error fetching invoice:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoice'
    })
  }
})

// POST create invoice
router.post('/', async (req, res) => {
  try {
    console.log('Creating invoice:', JSON.stringify(req.body, null, 2))
    
    const validated = createInvoiceSchema.parse(req.body)
    
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { companyId: true }
    })

    const invoiceNumber = await generateInvoiceNumber()

    const invoice = await prisma.invoices.create({
      data: {
        invoiceNumber,
        vendorId: validated.vendorId,
        projectId: validated.projectId,
        workOrderId: validated.workOrderId,
        contractId: validated.contractId,
        purchaseOrderId: validated.purchaseOrderId,
        reference: validated.reference,
        type: validated.type,
        status: validated.status,
        issueDate: new Date(validated.issueDate),
        dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
        subtotal: validated.subtotal,
        taxAmount: validated.taxAmount,
        taxRate: validated.taxRate,
        discount: validated.discount,
        discountType: validated.discountType,
        shippingCost: validated.shippingCost,
        total: validated.total,
        currency: validated.currency,
        paymentTerms: validated.paymentTerms,
        notes: validated.notes,
        balance: validated.total, // Initially balance equals total
        createdById: userId,
        companyId: user?.companyId || null,
        approvalStatus: 'pending',
        lineItems: {
          create: validated.lineItems.map(item => ({
            lineNumber: item.lineNumber,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            discountPercent: item.discountPercent,
            discountAmount: item.discountAmount,
            taxRate: item.taxRate,
            taxAmount: item.taxAmount,
            total: item.total,
            poLineItemId: item.poLineItemId
          }))
        }
      }
    })

    console.log('✅ Invoice created:', invoice.invoiceNumber)
    
    res.status(201).json({
      success: true,
      data: invoice
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors)
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    console.error('Error creating invoice:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create invoice'
    })
  }
})

// ============ ADD THIS PUT ROUTE FOR UPDATING INVOICES ============
// PUT update invoice
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    console.log('Updating invoice:', id, JSON.stringify(req.body, null, 2))
    
    const validated = createInvoiceSchema.parse(req.body)
    
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Delete existing line items
      await tx.invoice_line_items.deleteMany({
        where: { invoiceId: id }
      })

      // Update invoice
      const invoice = await tx.invoices.update({
        where: { id },
        data: {
          vendorId: validated.vendorId,
          projectId: validated.projectId,
          workOrderId: validated.workOrderId,
          contractId: validated.contractId,
          purchaseOrderId: validated.purchaseOrderId,
          reference: validated.reference,
          type: validated.type,
          status: validated.status,
          issueDate: new Date(validated.issueDate),
          dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
          subtotal: validated.subtotal,
          taxAmount: validated.taxAmount,
          taxRate: validated.taxRate,
          discount: validated.discount,
          discountType: validated.discountType,
          shippingCost: validated.shippingCost,
          total: validated.total,
          currency: validated.currency,
          paymentTerms: validated.paymentTerms,
          notes: validated.notes,
          // Only update balance if invoice is not paid
          ...(validated.status !== 'paid' && { balance: validated.total })
        }
      })

      // Create new line items
      await tx.invoice_line_items.createMany({
        data: validated.lineItems.map(item => ({
          invoiceId: id,
          lineNumber: item.lineNumber,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent || 0,
          discountAmount: item.discountAmount || 0,
          taxRate: item.taxRate || 0,
          taxAmount: item.taxAmount || 0,
          total: item.total,
          poLineItemId: item.poLineItemId
        }))
      })

      return invoice
    })

    console.log('✅ Invoice updated:', result.invoiceNumber)
    
    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors)
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    console.error('Error updating invoice:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update invoice',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// PUT update invoice status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const invoice = await prisma.invoices.update({
      where: { id },
      data: { status }
    })

    res.json({
      success: true,
      data: invoice
    })
  } catch (error) {
    console.error('Error updating invoice status:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update invoice status'
    })
  }
})

// DELETE invoice (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    await prisma.invoices.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete invoice'
    })
  }
})

export default router