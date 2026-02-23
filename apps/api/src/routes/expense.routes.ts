import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { z } from 'zod'

const router = Router()

// Validation schemas - WITH NOTES
const createExpenseSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  expenseDate: z.string(),
  vendorId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  workOrderId: z.string().optional().nullable(),
  receiptUrl: z.string().optional().nullable(),
  receiptNumber: z.string().optional().nullable(),
  isBillable: z.boolean().default(false),
  billableClient: z.string().optional().nullable(),
  status: z.string().default('pending'),
  notes: z.string().optional().nullable() // ✅ KEPT - now it exists in DB
})

// Generate Expense Number
const generateExpenseNumber = async () => {
  const year = new Date().getFullYear()
  const count = await prisma.expenses.count({
    where: {
      createdAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1)
      }
    }
  })
  return `EXP-${year}-${(count + 1).toString().padStart(5, '0')}`
}

// GET all expenses
router.get('/', async (req, res) => {
  try {
    const { category, projectId, vendorId, status, startDate, endDate } = req.query
    
    const where: any = {
      deletedAt: null
    }
    
    if (category) where.category = category
    if (projectId) where.projectId = projectId
    if (vendorId) where.vendorId = vendorId
    if (status) where.status = status
    if (startDate) where.expenseDate = { gte: new Date(startDate as string) }
    if (endDate) where.expenseDate = { ...where.expenseDate, lte: new Date(endDate as string) }

    const expenses = await prisma.expenses.findMany({
      where,
      include: {
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
        workOrder: {
          select: {
            id: true,
            workOrderNumber: true,
            title: true
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
        expenseDate: 'desc'
      }
    })

    res.json({
      success: true,
      data: expenses
    })
  } catch (error) {
    console.error('Error fetching expenses:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch expenses'
    })
  }
})

// GET single expense
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const expense = await prisma.expenses.findUnique({
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

    if (!expense || expense.deletedAt) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found'
      })
    }

    res.json({
      success: true,
      data: expense
    })
  } catch (error) {
    console.error('Error fetching expense:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch expense'
    })
  }
})

// POST create expense - WITH NOTES
router.post('/', async (req, res) => {
  try {
    console.log('Creating expense:', JSON.stringify(req.body, null, 2))
    
    const validated = createExpenseSchema.parse(req.body)
    
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }

    // Get user's company
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { companyId: true }
    })

    const expenseNumber = await generateExpenseNumber()

    const expense = await prisma.expenses.create({
      data: {
        expenseNumber,
        category: validated.category,
        description: validated.description,
        amount: validated.amount,
        currency: validated.currency,
        expenseDate: new Date(validated.expenseDate),
        vendorId: validated.vendorId || null,
        projectId: validated.projectId || null,
        workOrderId: validated.workOrderId || null,
        receiptUrl: validated.receiptUrl || null,
        receiptNumber: validated.receiptNumber || null,
        isBillable: validated.isBillable,
        billableClient: validated.billableClient || null,
        status: validated.status,
        notes: validated.notes || null, // ✅ NOW WORKS - field exists in DB
        createdById: userId,
        companyId: user?.companyId || null
      }
    })

    console.log('✅ Expense created:', expense.expenseNumber)
    
    res.status(201).json({
      success: true,
      data: expense
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
    console.error('Error creating expense:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create expense',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// PUT update expense - WITH NOTES
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const validated = createExpenseSchema.partial().parse(req.body)
    
    const userId = (req as any).user?.id

    const expense = await prisma.expenses.update({
      where: { id },
      data: {
        category: validated.category,
        description: validated.description,
        amount: validated.amount,
        currency: validated.currency,
        expenseDate: validated.expenseDate ? new Date(validated.expenseDate) : undefined,
        vendorId: validated.vendorId,
        projectId: validated.projectId,
        workOrderId: validated.workOrderId,
        receiptUrl: validated.receiptUrl,
        receiptNumber: validated.receiptNumber,
        isBillable: validated.isBillable,
        billableClient: validated.billableClient,
        status: validated.status,
        notes: validated.notes, // ✅ NOW WORKS
        ...(validated.status === 'approved' && userId ? {
          approvedById: userId,
          approvedAt: new Date()
        } : {}),
        ...(validated.status === 'rejected' ? {
          rejectionReason: req.body.rejectionReason
        } : {})
      }
    })

    res.json({
      success: true,
      data: expense
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    console.error('Error updating expense:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update expense'
    })
  }
})

// DELETE expense (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    await prisma.expenses.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting expense:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete expense'
    })
  }
})

export default router