import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { z } from 'zod'

const router = Router()

// Validation schemas
const createContractSchema = z.object({
  vendorId: z.string().min(1, 'Vendor is required'),
  quoteId: z.string().optional(),
  projectId: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.string().default('purchase_contract'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  effectiveDate: z.string().optional(),
  value: z.number().optional(),
  currency: z.string().default('USD'),
  paymentTerms: z.string().optional(),
  billingCycle: z.string().optional(),
  autoRenew: z.boolean().default(false),
  renewalTerms: z.string().optional(),
  documentUrl: z.string().optional(),
  terms: z.string().optional(),
  specialTerms: z.string().optional()
})

// Generate Contract Number
const generateContractNumber = async () => {
  const year = new Date().getFullYear()
  const count = await prisma.contracts.count({
    where: {
      createdAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1)
      }
    }
  })
  return `CT-${year}-${(count + 1).toString().padStart(5, '0')}`
}

// GET all contracts
router.get('/', async (req, res, next) => {
  try {
    console.log('📋 Fetching all contracts')
    
    const contracts = await prisma.contracts.findMany({
      where: {
        deletedAt: null
      },
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`Found ${contracts.length} contracts`)
    res.json({
      success: true,
      data: contracts
    })
  } catch (error) {
    console.error('Error fetching contracts:', error)
    next(error)
  }
})

// GET single contract
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    
    const contract = await prisma.contracts.findUnique({
      where: { id },
      include: {
        vendor: true,
        quote: {
          select: {
            id: true,
            quoteNumber: true,
            total: true,
            currency: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            projectNumber: true
          }
        },
        signedByCompanyUser: {
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
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        amendments: {
          where: {
            deletedAt: null
          },
          orderBy: {
            effectiveDate: 'desc'
          }
        }
      }
    })

    if (!contract || contract.deletedAt) {
      return res.status(404).json({
        success: false,
        error: 'Contract not found'
      })
    }

    res.json({
      success: true,
      data: contract
    })
  } catch (error) {
    console.error('Error fetching contract:', error)
    next(error)
  }
})

// POST create contract
router.post('/', async (req, res, next) => {
  try {
    console.log('📋 Creating contract:', JSON.stringify(req.body, null, 2))

    const validated = createContractSchema.parse(req.body)
    
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }

    const contractNumber = await generateContractNumber()

    const contract = await prisma.contracts.create({
      data: {
        contractNumber,
        vendorId: validated.vendorId,
        quoteId: validated.quoteId || null,
        projectId: validated.projectId || null,
        title: validated.title,
        description: validated.description || null,
        type: validated.type,
        status: 'draft',
        startDate: validated.startDate ? new Date(validated.startDate) : null,
        endDate: validated.endDate ? new Date(validated.endDate) : null,
        effectiveDate: validated.effectiveDate ? new Date(validated.effectiveDate) : null,
        value: validated.value || null,
        currency: validated.currency,
        paymentTerms: validated.paymentTerms || null,
        billingCycle: validated.billingCycle || null,
        autoRenew: validated.autoRenew,
        renewalTerms: validated.renewalTerms || null,
        documentUrl: validated.documentUrl || null,
        terms: validated.terms || null,
        specialTerms: validated.specialTerms || null,
        createdById: userId,
        companyId: null,
        signedByVendor: false,
        signedByCompany: false,
        approvalStatus: 'pending'
      },
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
            name: true
          }
        }
      }
    })

    console.log('✅ Contract created:', contract.contractNumber)
    res.status(201).json({
      success: true,
      data: contract
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
    console.error('Error creating contract:', error)
    next(error)
  }
})

// POST sign contract
router.post('/:id/sign', async (req, res, next) => {
  try {
    const { id } = req.params
    const { signedBy } = req.body
    
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }

    // Get current contract to check vendor signature status
    const currentContract = await prisma.contracts.findUnique({
      where: { id },
      select: { signedByVendor: true }
    })

    const contract = await prisma.contracts.update({
      where: { id },
      data: {
        signedByCompany: true,
        signedByCompanyAt: new Date(),
        signedByCompanyUserId: userId,
        signedByCompanyUser: signedBy || 'Company Representative',
        status: currentContract?.signedByVendor ? 'active' : 'pending_signature',
        signedDate: currentContract?.signedByVendor ? new Date() : undefined
      }
    })

    console.log('✅ Contract signed:', contract.contractNumber)
    res.json({
      success: true,
      data: contract
    })
  } catch (error) {
    console.error('Error signing contract:', error)
    next(error)
  }
})

// DELETE contract (soft delete)
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    await prisma.contracts.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    console.log('✅ Contract deleted:', id)
    res.json({
      success: true,
      message: 'Contract deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting contract:', error)
    next(error)
  }
})

export default router