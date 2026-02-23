import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { z } from 'zod'

const router = Router()

// Validation schemas
const updateSubscriptionSchema = z.object({
  plan: z.string(),
  interval: z.enum(['month', 'year']).default('month')
})

const updatePaymentMethodSchema = z.object({
  paymentMethodId: z.string()
})

// GET subscription details
router.get('/subscription', async (req, res) => {
  try {
    const userId = (req as any).user?.id
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { companyId: true }
    })

    const company = await prisma.companies.findUnique({
      where: { id: user?.companyId },
      select: {
        plan: true,
        planStatus: true,
        trialEndsAt: true,
        subscriptionId: true
      }
    })

    // Mock subscription data for now
    // In production, this would come from Stripe/Paddle/etc
    const subscription = {
      plan: company?.plan || 'free',
      status: company?.planStatus || 'active',
      trialEndsAt: company?.trialEndsAt,
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      amount: company?.plan === 'professional' ? 99 : company?.plan === 'enterprise' ? 299 : 0,
      currency: 'USD',
      interval: 'month'
    }

    res.json({
      success: true,
      data: subscription
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscription'
    })
  }
})

// PUT update subscription plan
router.put('/subscription', async (req, res) => {
  try {
    const validated = updateSubscriptionSchema.parse(req.body)
    const userId = (req as any).user?.id
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { companyId: true }
    })

    // In production, this would update Stripe subscription
    await prisma.companies.update({
      where: { id: user?.companyId },
      data: {
        plan: validated.plan,
        planStatus: 'active'
      }
    })

    res.json({
      success: true,
      message: 'Subscription updated successfully'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    console.error('Error updating subscription:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update subscription'
    })
  }
})

// GET payment methods
router.get('/payment-methods', async (req, res) => {
  try {
    // Mock payment methods
    // In production, this would fetch from Stripe
    const paymentMethods = [
      {
        id: 'pm_1',
        type: 'card',
        brand: 'visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2026,
        isDefault: true
      }
    ]

    res.json({
      success: true,
      data: paymentMethods
    })
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment methods'
    })
  }
})

// POST add payment method
router.post('/payment-methods', async (req, res) => {
  try {
    const { paymentMethodId } = req.body

    // In production, this would add payment method to Stripe
    res.json({
      success: true,
      message: 'Payment method added successfully'
    })
  } catch (error) {
    console.error('Error adding payment method:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to add payment method'
    })
  }
})

// PUT set default payment method
router.put('/payment-methods/:id/default', async (req, res) => {
  try {
    const { id } = req.params

    // In production, this would set default in Stripe
    res.json({
      success: true,
      message: 'Default payment method updated'
    })
  } catch (error) {
    console.error('Error setting default payment method:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to set default payment method'
    })
  }
})

// DELETE payment method
router.delete('/payment-methods/:id', async (req, res) => {
  try {
    const { id } = req.params

    // In production, this would remove from Stripe
    res.json({
      success: true,
      message: 'Payment method removed successfully'
    })
  } catch (error) {
    console.error('Error removing payment method:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to remove payment method'
    })
  }
})

// GET invoices
router.get('/invoices', async (req, res) => {
  try {
    // Mock invoices
    // In production, this would fetch from Stripe
    const invoices = [
      {
        id: 'inv_1',
        number: 'INV-2026-001',
        date: '2026-02-13',
        amount: 99,
        status: 'paid',
        pdfUrl: null
      },
      {
        id: 'inv_2',
        number: 'INV-2026-002',
        date: '2026-01-13',
        amount: 99,
        status: 'paid',
        pdfUrl: null
      },
      {
        id: 'inv_3',
        number: 'INV-2026-003',
        date: '2025-12-13',
        amount: 99,
        status: 'paid',
        pdfUrl: null
      }
    ]

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

// GET invoice PDF
router.get('/invoices/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params

    // In production, this would fetch PDF from Stripe
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${id}.pdf"`)
    
    // Mock PDF buffer
    const pdfBuffer = Buffer.from('Mock PDF content')
    res.send(pdfBuffer)
  } catch (error) {
    console.error('Error fetching invoice PDF:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoice PDF'
    })
  }
})

// GET usage statistics
router.get('/usage', async (req, res) => {
  try {
    const userId = (req as any).user?.id
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { companyId: true }
    })

    // Get usage statistics
    const [
      vendorCount,
      userCount,
      projectCount,
      invoiceCount
    ] = await Promise.all([
      prisma.vendors.count({ where: { companyId: user?.companyId, deletedAt: null } }),
      prisma.users.count({ where: { companyId: user?.companyId, deletedAt: null } }),
      prisma.projects.count({ where: { companyId: user?.companyId, deletedAt: null } }),
      prisma.invoices.count({ where: { companyId: user?.companyId, deletedAt: null } })
    ])

    res.json({
      success: true,
      data: {
        vendors: vendorCount,
        users: userCount,
        projects: projectCount,
        invoices: invoiceCount,
        storage: Math.floor(Math.random() * 10) + ' GB' // Mock storage usage
      }
    })
  } catch (error) {
    console.error('Error fetching usage:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch usage'
    })
  }
})

export default router