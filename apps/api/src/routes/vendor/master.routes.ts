import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { authMiddleware } from '../../middleware/auth.middleware'

const router = Router()

// Get vendor master data by supplier code
router.get('/:supplierCode', authMiddleware, async (req, res) => {
  try {
    const { supplierCode } = req.params
    
    const masterData = await prisma.vendorMaster.findUnique({
      where: { supplierCode }
    })
    
    res.json({
      success: true,
      data: masterData
    })
  } catch (error) {
    console.error('Error fetching vendor master:', error)
    res.status(500).json({ error: 'Failed to fetch vendor master data' })
  }
})

// Update vendor master data
router.put('/:supplierCode', authMiddleware, async (req, res) => {
  try {
    const { supplierCode } = req.params
    const data = req.body
    
    const masterData = await prisma.vendorMaster.upsert({
      where: { supplierCode },
      update: data,
      create: {
        supplierCode,
        ...data
      }
    })
    
    res.json({
      success: true,
      data: masterData
    })
  } catch (error) {
    console.error('Error updating vendor master:', error)
    res.status(500).json({ error: 'Failed to update vendor master data' })
  }
})

export default router