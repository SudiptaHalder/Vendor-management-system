import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { z } from 'zod'

const router = Router()

// Validation schemas
const createIntegrationSchema = z.object({
  name: z.string(),
  provider: z.string(),
  type: z.string(),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  settings: z.any().optional()
})

const updateIntegrationSchema = z.object({
  settings: z.any().optional(),
  isActive: z.boolean().optional()
})

// GET all integrations
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { companyId: true }
    })

    const integrations = await prisma.integrations.findMany({
      where: {
        companyId: user?.companyId,
        deletedAt: null
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json({
      success: true,
      data: integrations
    })
  } catch (error) {
    console.error('Error fetching integrations:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch integrations'
    })
  }
})

// GET single integration
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const integration = await prisma.integrations.findUnique({
      where: { id }
    })

    if (!integration || integration.deletedAt) {
      return res.status(404).json({
        success: false,
        error: 'Integration not found'
      })
    }

    res.json({
      success: true,
      data: integration
    })
  } catch (error) {
    console.error('Error fetching integration:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch integration'
    })
  }
})

// POST create integration
router.post('/', async (req, res) => {
  try {
    const validated = createIntegrationSchema.parse(req.body)
    
    const userId = (req as any).user?.id
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { companyId: true }
    })

    // Check if integration with same provider exists
    const existing = await prisma.integrations.findFirst({
      where: {
        companyId: user?.companyId,
        provider: validated.provider,
        deletedAt: null
      }
    })

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Integration with this provider already exists'
      })
    }

    const integration = await prisma.integrations.create({
      data: {
        name: validated.name,
        provider: validated.provider,
        type: validated.type,
        apiKey: validated.apiKey,
        apiSecret: validated.apiSecret,
        settings: validated.settings || {},
        isActive: true,
        companyId: user?.companyId
      }
    })

    res.status(201).json({
      success: true,
      data: integration
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    console.error('Error creating integration:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create integration'
    })
  }
})

// PUT update integration
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const validated = updateIntegrationSchema.parse(req.body)

    const integration = await prisma.integrations.update({
      where: { id },
      data: {
        settings: validated.settings,
        isActive: validated.isActive
      }
    })

    res.json({
      success: true,
      data: integration
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    console.error('Error updating integration:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update integration'
    })
  }
})

// POST toggle integration
router.post('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params
    const { isActive } = req.body

    const integration = await prisma.integrations.update({
      where: { id },
      data: { isActive }
    })

    res.json({
      success: true,
      data: integration
    })
  } catch (error) {
    console.error('Error toggling integration:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to toggle integration'
    })
  }
})

// POST sync integration
router.post('/:id/sync', async (req, res) => {
  try {
    const { id } = req.params

    const integration = await prisma.integrations.findUnique({
      where: { id }
    })

    if (!integration) {
      return res.status(404).json({
        success: false,
        error: 'Integration not found'
      })
    }

    // Update sync status
    await prisma.integrations.update({
      where: { id },
      data: {
        syncStatus: 'syncing',
        lastSyncAt: new Date()
      }
    })

    // TODO: Perform actual sync based on provider
    // This would call external APIs

    // Simulate sync delay
    setTimeout(async () => {
      await prisma.integrations.update({
        where: { id },
        data: {
          syncStatus: 'success'
        }
      })
    }, 2000)

    res.json({
      success: true,
      message: 'Sync started'
    })
  } catch (error) {
    console.error('Error syncing integration:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to sync integration'
    })
  }
})

// DELETE integration
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    await prisma.integrations.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    res.json({
      success: true,
      message: 'Integration disconnected successfully'
    })
  } catch (error) {
    console.error('Error disconnecting integration:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to disconnect integration'
    })
  }
})

// GET available integrations
router.get('/catalog/all', async (req, res) => {
  try {
    // Mock catalog of available integrations
    const catalog = [
      {
        id: 'slack',
        name: 'Slack',
        provider: 'slack',
        type: 'communication',
        description: 'Get notifications and updates in your Slack channels',
        icon: 'Slack',
        features: ['Channel notifications', 'Direct messages', 'File sharing']
      },
      {
        id: 'quickbooks',
        name: 'QuickBooks',
        provider: 'quickbooks',
        type: 'accounting',
        description: 'Sync invoices and payments with QuickBooks',
        icon: 'QuickBooks',
        features: ['Invoice sync', 'Payment reconciliation', 'Expense tracking']
      },
      {
        id: 'google_drive',
        name: 'Google Drive',
        provider: 'google_drive',
        type: 'storage',
        description: 'Store and access documents from Google Drive',
        icon: 'GoogleDrive',
        features: ['File storage', 'Document preview', 'Folder organization']
      },
      {
        id: 'teams',
        name: 'Microsoft Teams',
        provider: 'teams',
        type: 'communication',
        description: 'Collaborate and share updates in Microsoft Teams',
        icon: 'Teams',
        features: ['Channel posts', 'Meeting integration', 'File sharing']
      },
      {
        id: 'salesforce',
        name: 'Salesforce',
        provider: 'salesforce',
        type: 'crm',
        description: 'Sync vendor data with Salesforce CRM',
        icon: 'Salesforce',
        features: ['Contact sync', 'Opportunity tracking', 'Activity logging']
      },
      {
        id: 'zapier',
        name: 'Zapier',
        provider: 'zapier',
        type: 'automation',
        description: 'Connect with 5000+ apps via Zapier',
        icon: 'Zapier',
        features: ['Multi-app workflows', 'Custom zaps', 'Trigger actions']
      }
    ]

    res.json({
      success: true,
      data: catalog
    })
  } catch (error) {
    console.error('Error fetching catalog:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch catalog'
    })
  }
})

export default router