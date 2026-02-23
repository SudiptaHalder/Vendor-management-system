import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { z } from 'zod'

const router = Router()

// Validation schemas
const createPaymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice is required'),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  method: z.string().min(1, 'Payment method is required'),
  status: z.string().default('pending'),
  paymentDate: z.string(),
  transactionId: z.string().optional().nullable(),
  reference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  accountNumber: z.string().optional().nullable(),
  checkNumber: z.string().optional().nullable(),
  cardLast4: z.string().optional().nullable(),
  cardBrand: z.string().optional().nullable(),
  authorizationCode: z.string().optional().nullable()
})

// Generate Payment Number
const generatePaymentNumber = async () => {
  const year = new Date().getFullYear()
  const count = await prisma.payments.count({
    where: {
      createdAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1)
      }
    }
  })
  return `PAY-${year}-${(count + 1).toString().padStart(5, '0')}`
}

// GET all payments
router.get('/', async (req, res) => {
  try {
    const { invoiceId, status, startDate, endDate } = req.query
    
    const where: any = {
      deletedAt: null
    }
    
    if (invoiceId) where.invoiceId = invoiceId
    if (status) where.status = status
    if (startDate) where.paymentDate = { gte: new Date(startDate as string) }
    if (endDate) where.paymentDate = { ...where.paymentDate, lte: new Date(endDate as string) }

    const payments = await prisma.payments.findMany({
      where,
      include: {
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            total: true,
            balance: true,
            vendor: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        paymentDate: 'desc'
      }
    })

    res.json({
      success: true,
      data: payments
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payments'
    })
  }
})

// GET single payment
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const payment = await prisma.payments.findUnique({
      where: { id },
      include: {
        invoice: {
          include: {
            vendor: true
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

    if (!payment || payment.deletedAt) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      })
    }

    res.json({
      success: true,
      data: payment
    })
  } catch (error) {
    console.error('Error fetching payment:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment'
    })
  }
})

// POST create payment
router.post('/', async (req, res) => {
  try {
    console.log('Creating payment:', JSON.stringify(req.body, null, 2))
    
    const validated = createPaymentSchema.parse(req.body)
    
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

    const paymentNumber = await generatePaymentNumber()

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get the invoice
      const invoice = await tx.invoices.findUnique({
        where: { id: validated.invoiceId }
      })

      if (!invoice) {
        throw new Error('Invoice not found')
      }

      // Calculate new balance
      const newBalance = Number(invoice.balance) - validated.amount

      // Create payment
      const payment = await tx.payments.create({
        data: {
          paymentNumber,
          invoiceId: validated.invoiceId,
          amount: validated.amount,
          currency: validated.currency,
          method: validated.method,
          status: validated.status,
          paymentDate: new Date(validated.paymentDate),
          transactionId: validated.transactionId,
          reference: validated.reference,
          notes: validated.notes,
          bankName: validated.bankName,
          accountNumber: validated.accountNumber,
          checkNumber: validated.checkNumber,
          cardLast4: validated.cardLast4,
          cardBrand: validated.cardBrand,
          authorizationCode: validated.authorizationCode,
          createdById: userId,
          companyId: user?.companyId || null
        }
      })

      // Update invoice balance and status
      const invoiceStatus = newBalance <= 0 ? 'paid' : 'partially_paid'
      
      await tx.invoices.update({
        where: { id: validated.invoiceId },
        data: {
          balance: newBalance,
          status: invoiceStatus,
          paidDate: newBalance <= 0 ? new Date() : null
        }
      })

      return payment
    })

    console.log('✅ Payment created:', paymentNumber)
    
    res.status(201).json({
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
    console.error('Error creating payment:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create payment'
    })
  }
})

// DELETE payment (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    await prisma.payments.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    res.json({
      success: true,
      message: 'Payment deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting payment:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete payment'
    })
  }
})

export default router