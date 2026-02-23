import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { z } from 'zod'

const router = Router()

// Validation schemas
const createQuoteSchema = z.object({
  rfqId: z.string().min(1),
  vendorId: z.string().min(1),
  validUntil: z.string().optional(),
  subtotal: z.number().positive(),
  taxAmount: z.number().default(0),
  taxRate: z.number().optional(),
  discount: z.number().default(0),
  discountType: z.string().optional(),
  shippingCost: z.number().default(0),
  total: z.number().positive(),
  currency: z.string().default('USD'),
  notes: z.string().optional(),
  terms: z.string().optional(),
  deliveryTime: z.number().optional(),
  warranty: z.string().optional(),
  attachmentUrls: z.array(z.string()).default([]),
  lineItems: z.array(z.object({
    lineNumber: z.number(),
    description: z.string().min(1),
    quantity: z.number().positive(),
    unit: z.string().optional(),
    unitPrice: z.number().positive(),
    total: z.number().positive(),
    notes: z.string().optional()
  }))
})

const updateQuoteStatusSchema = z.object({
  status: z.enum(['draft', 'submitted', 'under_review', 'accepted', 'rejected', 'expired'])
})

const acceptQuoteSchema = z.object({
  createPurchaseOrder: z.boolean().default(true),
  notes: z.string().optional()
})

// Generate Quote Number
const generateQuoteNumber = async () => {
  const year = new Date().getFullYear()
  const count = await prisma.quotes.count({
    where: {
      createdAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1)
      }
    }
  })
  return `Q-${year}-${(count + 1).toString().padStart(5, '0')}`
}

// GET all quotes
router.get('/', async (req, res, next) => {
  try {
    console.log('📋 Fetching all quotes')
    
    const quotes = await prisma.quotes.findMany({
      where: {
        deletedAt: null
      },
      include: {
        rfq: {
          select: {
            id: true,
            rfqNumber: true,
            title: true
          }
        },
        vendor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        lineItems: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`Found ${quotes.length} quotes`)
    res.json({
      success: true,
      data: quotes
    })
  } catch (error) {
    console.error('Error fetching quotes:', error)
    next(error)
  }
})

// GET single quote
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    
    const quote = await prisma.quotes.findUnique({
      where: { id },
      include: {
        rfq: true,
        vendor: true,
        lineItems: {
          orderBy: {
            lineNumber: 'asc'
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!quote || quote.deletedAt) {
      return res.status(404).json({
        success: false,
        error: 'Quote not found'
      })
    }

    res.json({
      success: true,
      data: quote
    })
  } catch (error) {
    console.error('Error fetching quote:', error)
    next(error)
  }
})

// POST create quote
router.post('/', async (req, res, next) => {
  try {
    console.log('📋 Creating quote:', req.body)

    const validated = createQuoteSchema.parse(req.body)
    
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }

    const quoteNumber = await generateQuoteNumber()

    const quote = await prisma.quotes.create({
      data: {
        quoteNumber,
        rfqId: validated.rfqId,
        vendorId: validated.vendorId,
        validUntil: validated.validUntil ? new Date(validated.validUntil) : null,
        subtotal: validated.subtotal,
        taxAmount: validated.taxAmount,
        taxRate: validated.taxRate,
        discount: validated.discount,
        discountType: validated.discountType,
        shippingCost: validated.shippingCost,
        total: validated.total,
        currency: validated.currency,
        notes: validated.notes,
        terms: validated.terms,
        deliveryTime: validated.deliveryTime,
        warranty: validated.warranty,
        attachmentUrls: validated.attachmentUrls,
        createdById: userId,
        status: 'submitted',
        companyId: null,
        lineItems: {
          create: validated.lineItems.map(item => ({
            lineNumber: item.lineNumber,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            total: item.total,
            notes: item.notes
          }))
        }
      },
      include: {
        lineItems: true,
        rfq: true,
        vendor: true
      }
    })

    // Update RFQ recipient status to 'responded'
    await prisma.rfq_recipients.updateMany({
      where: {
        rfqId: validated.rfqId,
        vendorId: validated.vendorId
      },
      data: {
        status: 'responded',
        respondedAt: new Date()
      }
    })

    console.log('✅ Quote created:', quote.quoteNumber)
    res.status(201).json({
      success: true,
      data: quote
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Validation error:', error.errors)
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    console.error('Error creating quote:', error)
    next(error)
  }
})

// PUT update quote status
router.put('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params
    const validated = updateQuoteStatusSchema.parse(req.body)

    const quote = await prisma.quotes.update({
      where: { id },
      data: {
        status: validated.status
      },
      include: {
        rfq: true,
        vendor: true
      }
    })

    // If quote is accepted, update RFQ status
    if (validated.status === 'accepted') {
      await prisma.rfqs.update({
        where: { id: quote.rfqId },
        data: { 
          status: 'awarded',
          awardedDate: new Date()
        }
      })
    }

    console.log('✅ Quote status updated:', quote.quoteNumber, '->', validated.status)
    res.json({
      success: true,
      data: quote
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    console.error('Error updating quote status:', error)
    next(error)
  }
})

// POST accept quote (with optional PO creation)
router.post('/:id/accept', async (req, res, next) => {
  try {
    const { id } = req.params
    const validated = acceptQuoteSchema.parse(req.body)
    
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update quote status
      const quote = await tx.quotes.update({
        where: { id },
        data: {
          status: 'accepted'
        },
        include: {
          rfq: true,
          vendor: true,
          lineItems: true
        }
      })

      // Update RFQ status
      await tx.rfqs.update({
        where: { id: quote.rfqId },
        data: {
          status: 'awarded',
          awardedDate: new Date()
        }
      })

      // Create purchase order if requested
      let purchaseOrder = null
      if (validated.createPurchaseOrder) {
        // Generate PO number
        const year = new Date().getFullYear()
        const poCount = await tx.purchase_orders.count({
          where: {
            createdAt: {
              gte: new Date(year, 0, 1),
              lt: new Date(year + 1, 0, 1)
            }
          }
        })
        const poNumber = `PO-${year}-${(poCount + 1).toString().padStart(5, '0')}`

        purchaseOrder = await tx.purchase_orders.create({
          data: {
            poNumber,
            vendorId: quote.vendorId,
            rfqId: quote.rfqId,
            quoteId: quote.id,
            title: `PO from Quote ${quote.quoteNumber}`,
            status: 'draft',
            orderDate: new Date(),
            subtotal: quote.subtotal,
            taxAmount: quote.taxAmount,
            discount: quote.discount,
            shippingCost: quote.shippingCost,
            total: quote.total,
            currency: quote.currency,
            notes: validated.notes || `Created from accepted quote ${quote.quoteNumber}`,
            createdById: userId,
            companyId: null,
            lineItems: {
              create: quote.lineItems.map((item, index) => ({
                lineNumber: index + 1,
                description: item.description,
                quantity: item.quantity,
                unit: item.unit,
                unitPrice: item.unitPrice,
                total: item.total,
                notes: item.notes
              }))
            }
          }
        })
      }

      return { quote, purchaseOrder }
    })

    console.log('✅ Quote accepted:', result.quote.quoteNumber)
    res.json({
      success: true,
      data: result,
      message: validated.createPurchaseOrder ? 'Quote accepted and purchase order created' : 'Quote accepted'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    console.error('Error accepting quote:', error)
    next(error)
  }
})

// DELETE quote (soft delete)
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    await prisma.quotes.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    console.log('✅ Quote deleted:', id)
    res.json({
      success: true,
      message: 'Quote deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting quote:', error)
    next(error)
  }
})

export default router