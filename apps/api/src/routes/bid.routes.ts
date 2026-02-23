import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { z } from 'zod'

const router = Router()

// Validation schemas
const createBidSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.string().default('public_tender'),
  openDate: z.string(),
  closeDate: z.string(),
  estimatedValue: z.number().optional(),
  currency: z.string().default('USD'),
  requirements: z.string().optional(),
  evaluationCriteria: z.string().optional(),
  eligibilityCriteria: z.string().optional(),
  documentUrls: z.array(z.string()).default([])
})

// Generate Bid Number
const generateBidNumber = async () => {
  const year = new Date().getFullYear()
  const count = await prisma.bids.count({
    where: {
      createdAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1)
      }
    }
  })
  return `BID-${year}-${(count + 1).toString().padStart(5, '0')}`
}

// GET all bids
router.get('/', async (req, res) => {
  try {
    const bids = await prisma.bids.findMany({
      where: {
        deletedAt: null
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Add submission counts
    const bidsWithCounts = await Promise.all(
      bids.map(async (bid) => {
        const count = await prisma.bid_submissions.count({
          where: { bidId: bid.id }
        })
        return {
          ...bid,
          _count: { submissions: count }
        }
      })
    )

    res.json({
      success: true,
      data: bidsWithCounts
    })
  } catch (error) {
    console.error('Error fetching bids:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bids'
    })
  }
})

// GET single bid - FIXED WITH BETTER ERROR HANDLING
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    console.log('Fetching bid:', id)
    
    // Get the bid
    const bid = await prisma.bids.findUnique({
      where: { id }
    })

    if (!bid) {
      return res.status(404).json({
        success: false,
        error: 'Bid not found'
      })
    }

    if (bid.deletedAt) {
      return res.status(404).json({
        success: false,
        error: 'Bid not found'
      })
    }

    // Try to get created by - but don't fail if user doesn't exist
    let createdBy = null
    try {
      createdBy = await prisma.users.findUnique({
        where: { id: bid.createdById },
        select: {
          id: true,
          name: true,
          email: true
        }
      })
    } catch (userError) {
      console.error('Error fetching user, continuing without user data:', userError)
    }

    // Get submissions - with error handling
    let submissions = []
    try {
      submissions = await prisma.bid_submissions.findMany({
        where: {
          bidId: id,
          deletedAt: null
        },
        include: {
          vendor: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }
        },
        orderBy: {
          submittedAt: 'desc'
        }
      })
    } catch (submissionsError) {
      console.error('Error fetching submissions, continuing without submissions:', submissionsError)
    }

    // If createdBy is null, provide a fallback
    const responseData = {
      ...bid,
      createdBy: createdBy || { 
        id: bid.createdById,
        name: 'Unknown User', 
        email: 'unknown@example.com' 
      },
      submissions: submissions || []
    }

    res.json({
      success: true,
      data: responseData
    })
  } catch (error) {
    console.error('Error fetching bid:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bid',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// POST create bid
router.post('/', async (req, res) => {
  try {
    const validated = createBidSchema.parse(req.body)
    
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }

    const bidNumber = await generateBidNumber()

    const bid = await prisma.bids.create({
      data: {
        bidNumber,
        title: validated.title,
        description: validated.description || null,
        type: validated.type,
        status: 'draft',
        openDate: new Date(validated.openDate),
        closeDate: new Date(validated.closeDate),
        estimatedValue: validated.estimatedValue || null,
        currency: validated.currency,
        requirements: validated.requirements || null,
        evaluationCriteria: validated.evaluationCriteria || null,
        eligibilityCriteria: validated.eligibilityCriteria || null,
        documentUrls: validated.documentUrls,
        createdById: userId,
        companyId: null
      }
    })

    res.status(201).json({
      success: true,
      data: bid
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    console.error('Error creating bid:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create bid'
    })
  }
})

// PUT update bid
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const validated = createBidSchema.partial().parse(req.body)

    const bid = await prisma.bids.update({
      where: { id },
      data: {
        title: validated.title,
        description: validated.description,
        type: validated.type,
        openDate: validated.openDate ? new Date(validated.openDate) : undefined,
        closeDate: validated.closeDate ? new Date(validated.closeDate) : undefined,
        estimatedValue: validated.estimatedValue,
        currency: validated.currency,
        requirements: validated.requirements,
        evaluationCriteria: validated.evaluationCriteria,
        eligibilityCriteria: validated.eligibilityCriteria,
        documentUrls: validated.documentUrls
      }
    })

    res.json({
      success: true,
      data: bid
    })
  } catch (error) {
    console.error('Error updating bid:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update bid'
    })
  }
})

// POST publish bid
router.post('/:id/publish', async (req, res) => {
  try {
    const { id } = req.params

    const bid = await prisma.bids.update({
      where: { id },
      data: {
        status: 'published'
      }
    })

    res.json({
      success: true,
      data: bid
    })
  } catch (error) {
    console.error('Error publishing bid:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to publish bid'
    })
  }
})

// DELETE bid (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    await prisma.bids.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    res.json({
      success: true,
      message: 'Bid deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting bid:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete bid'
    })
  }
})

export default router