import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { z } from 'zod'

const router = Router()

// Validation schemas
const createBudgetItemSchema = z.object({
  fiscalYear: z.number().int(),
  category: z.string().min(1, 'Category is required'),
  description: z.string(),
  plannedAmount: z.number().positive(),
  currency: z.string().default('USD'),
  periodStart: z.string(),
  periodEnd: z.string(),
  status: z.string().default('active'),
  projectId: z.string().optional().nullable()
})

// ============ BUDGET SUMMARY ============

// GET budget summary
router.get('/budget-summary', async (req, res) => {
  try {
    const { fiscalYear } = req.query
    const year = fiscalYear ? parseInt(fiscalYear as string) : new Date().getFullYear()

    const budgetItems = await prisma.budget_items.findMany({
      where: {
        fiscalYear: year,
        deletedAt: null
      }
    })

    // If no budget items, return empty summary
    if (budgetItems.length === 0) {
      return res.json({
        success: true,
        data: {
          fiscalYear: year,
          totalPlanned: 0,
          totalActual: 0,
          totalCommitted: 0,
          totalVariance: 0,
          variancePercentage: 0,
          byCategory: {}
        }
      })
    }

    // Calculate totals
    const totalPlanned = budgetItems.reduce((sum, item) => sum + Number(item.plannedAmount), 0)
    const totalActual = budgetItems.reduce((sum, item) => sum + Number(item.actualAmount), 0)
    const totalCommitted = budgetItems.reduce((sum, item) => sum + Number(item.committedAmount), 0)
    const totalVariance = totalPlanned - totalActual

    // Group by category
    const byCategory = budgetItems.reduce((acc: any, item) => {
      if (!acc[item.category]) {
        acc[item.category] = {
          planned: 0,
          actual: 0,
          committed: 0,
          variance: 0
        }
      }
      acc[item.category].planned += Number(item.plannedAmount)
      acc[item.category].actual += Number(item.actualAmount)
      acc[item.category].committed += Number(item.committedAmount)
      acc[item.category].variance += Number(item.plannedAmount) - Number(item.actualAmount)
      return acc
    }, {})

    res.json({
      success: true,
      data: {
        fiscalYear: year,
        totalPlanned,
        totalActual,
        totalCommitted,
        totalVariance,
        variancePercentage: totalPlanned > 0 ? (totalVariance / totalPlanned) * 100 : 0,
        byCategory
      }
    })
  } catch (error) {
    console.error('Error fetching budget summary:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch budget summary'
    })
  }
})

// ============ BUDGET ITEMS ============

// GET all budget items
router.get('/budget-items', async (req, res) => {
  try {
    const { fiscalYear, projectId, category } = req.query
    
    const where: any = {
      deletedAt: null
    }
    
    if (fiscalYear) where.fiscalYear = parseInt(fiscalYear as string)
    if (projectId) where.projectId = projectId
    if (category) where.category = category

    const budgetItems = await prisma.budget_items.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            projectNumber: true
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
      },
      orderBy: [
        { fiscalYear: 'desc' },
        { category: 'asc' }
      ]
    })

    // Calculate variance for each item
    const itemsWithVariance = budgetItems.map(item => {
      const variance = Number(item.plannedAmount) - Number(item.actualAmount)
      const variancePercent = item.plannedAmount > 0 
        ? (variance / Number(item.plannedAmount)) * 100 
        : 0

      return {
        ...item,
        variance,
        variancePercent
      }
    })

    res.json({
      success: true,
      data: itemsWithVariance
    })
  } catch (error) {
    console.error('Error fetching budget items:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch budget items'
    })
  }
})

// GET single budget item
router.get('/budget-items/:id', async (req, res) => {
  try {
    const { id } = req.params

    const budgetItem = await prisma.budget_items.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            projectNumber: true
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

    if (!budgetItem || budgetItem.deletedAt) {
      return res.status(404).json({
        success: false,
        error: 'Budget item not found'
      })
    }

    // Calculate variance
    const variance = Number(budgetItem.plannedAmount) - Number(budgetItem.actualAmount)
    const variancePercent = budgetItem.plannedAmount > 0 
      ? (variance / Number(budgetItem.plannedAmount)) * 100 
      : 0

    res.json({
      success: true,
      data: {
        ...budgetItem,
        variance,
        variancePercent
      }
    })
  } catch (error) {
    console.error('Error fetching budget item:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch budget item'
    })
  }
})

// POST create budget item
router.post('/budget-items', async (req, res) => {
  try {
    console.log('Creating budget item:', JSON.stringify(req.body, null, 2))
    
    const validated = createBudgetItemSchema.parse(req.body)
    
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

    const budgetItem = await prisma.budget_items.create({
      data: {
        fiscalYear: validated.fiscalYear,
        category: validated.category,
        description: validated.description,
        plannedAmount: validated.plannedAmount,
        actualAmount: 0,
        committedAmount: 0,
        currency: validated.currency,
        periodStart: new Date(validated.periodStart),
        periodEnd: new Date(validated.periodEnd),
        status: validated.status,
        projectId: validated.projectId || null,
        createdById: userId,
        companyId: user?.companyId || null
      }
    })

    console.log('✅ Budget item created')
    
    res.status(201).json({
      success: true,
      data: budgetItem
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
    console.error('Error creating budget item:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create budget item',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// PUT update budget item
router.put('/budget-items/:id', async (req, res) => {
  try {
    const { id } = req.params
    const validated = createBudgetItemSchema.partial().parse(req.body)

    const budgetItem = await prisma.budget_items.update({
      where: { id },
      data: {
        fiscalYear: validated.fiscalYear,
        category: validated.category,
        description: validated.description,
        plannedAmount: validated.plannedAmount,
        currency: validated.currency,
        periodStart: validated.periodStart ? new Date(validated.periodStart) : undefined,
        periodEnd: validated.periodEnd ? new Date(validated.periodEnd) : undefined,
        status: validated.status,
        projectId: validated.projectId
      }
    })

    res.json({
      success: true,
      data: budgetItem
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    console.error('Error updating budget item:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update budget item'
    })
  }
})

// DELETE budget item (soft delete)
router.delete('/budget-items/:id', async (req, res) => {
  try {
    const { id } = req.params

    await prisma.budget_items.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    res.json({
      success: true,
      message: 'Budget item deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting budget item:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete budget item'
    })
  }
})

export default router