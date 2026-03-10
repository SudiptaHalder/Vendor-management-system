import { Router } from 'express'
import { prisma } from '@vendor-management/database'

const router = Router()

// GET all vendors
router.get('/', async (req, res) => {
  try {
    console.log('👥 Fetching all vendors')
    
    const vendors = await prisma.vendors.findMany({
      where: {
        // Remove deletedAt since it doesn't exist
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json({
      success: true,
      data: vendors
    })
  } catch (error) {
    console.error('Error fetching vendors:', error)
    res.status(500).json({ error: 'Failed to fetch vendors' })
  }
})

// GET vendor by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const vendor = await prisma.vendors.findUnique({
      where: { id },
      include: {
        credentials: true,
        uploadRecords: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        purchaseOrders: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        invitations: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' })
    }

    res.json({
      success: true,
      data: vendor
    })
  } catch (error) {
    console.error('Error fetching vendor:', error)
    res.status(500).json({ error: 'Failed to fetch vendor' })
  }
})

// POST create new vendor
router.post('/', async (req, res) => {
  try {
    const { supplierCode, supplierName, email, plantCode, status } = req.body
    
    if (!supplierCode || !supplierName) {
      return res.status(400).json({ error: 'Supplier code and name are required' })
    }

    // Check if vendor already exists
    const existingVendor = await prisma.vendors.findUnique({
      where: { supplierCode }
    })

    if (existingVendor) {
      return res.status(400).json({ error: 'Vendor with this supplier code already exists' })
    }

    const vendor = await prisma.vendors.create({
      data: {
        supplierCode,
        supplierName,
        email,
        plantCode,
        status: status || 'pending'
      }
    })

    res.json({
      success: true,
      data: vendor,
      message: 'Vendor created successfully'
    })
  } catch (error) {
    console.error('Error creating vendor:', error)
    res.status(500).json({ error: 'Failed to create vendor' })
  }
})

// PUT update vendor
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { supplierName, email, plantCode, status } = req.body

    const vendor = await prisma.vendors.update({
      where: { id },
      data: {
        supplierName,
        email,
        plantCode,
        status
      }
    })

    res.json({
      success: true,
      data: vendor,
      message: 'Vendor updated successfully'
    })
  } catch (error) {
    console.error('Error updating vendor:', error)
    res.status(500).json({ error: 'Failed to update vendor' })
  }
})

// DELETE vendor (soft delete - just mark as inactive)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Instead of deleting, just mark as inactive
    const vendor = await prisma.vendors.update({
      where: { id },
      data: {
        status: 'inactive'
      }
    })

    res.json({
      success: true,
      message: 'Vendor deactivated successfully'
    })
  } catch (error) {
    console.error('Error deactivating vendor:', error)
    res.status(500).json({ error: 'Failed to deactivate vendor' })
  }
})

// GET vendor by supplier code
router.get('/code/:supplierCode', async (req, res) => {
  try {
    const { supplierCode } = req.params
    
    const vendor = await prisma.vendors.findUnique({
      where: { supplierCode },
      include: {
        credentials: true,
        uploadRecords: true,
        purchaseOrders: true,
        invitations: true
      }
    })

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' })
    }

    res.json({
      success: true,
      data: vendor
    })
  } catch (error) {
    console.error('Error fetching vendor by code:', error)
    res.status(500).json({ error: 'Failed to fetch vendor' })
  }
})

// GET vendors by status
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params
    
    const vendors = await prisma.vendors.findMany({
      where: { status },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json({
      success: true,
      data: vendors
    })
  } catch (error) {
    console.error('Error fetching vendors by status:', error)
    res.status(500).json({ error: 'Failed to fetch vendors' })
  }
})

export default router
