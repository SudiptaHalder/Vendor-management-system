import { Router } from 'express'
import { prisma } from '@vendor-management/database'

const router = Router()

// Get pending approvals
router.get('/', async (req, res) => {
  try {
    console.log('📋 Fetching pending approvals')
    
    const pendingVendors = await prisma.vendors.findMany({
      where: {
        status: 'pending'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json({
      success: true,
      data: pendingVendors
    })
  } catch (error) {
    console.error('Error fetching approvals:', error)
    res.status(500).json({ error: 'Failed to fetch approvals' })
  }
})

// Approve vendor
router.post('/vendor/:id/approve', async (req, res) => {
  try {
    const { id } = req.params
    
    const vendor = await prisma.vendors.update({
      where: { id },
      data: { status: 'active' }
    })

    res.json({
      success: true,
      data: vendor,
      message: 'Vendor approved successfully'
    })
  } catch (error) {
    console.error('Error approving vendor:', error)
    res.status(500).json({ error: 'Failed to approve vendor' })
  }
})

// Reject vendor
router.post('/vendor/:id/reject', async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body
    
    const vendor = await prisma.vendors.update({
      where: { id },
      data: { 
        status: 'rejected'
      }
    })

    res.json({
      success: true,
      data: vendor,
      message: 'Vendor rejected successfully'
    })
  } catch (error) {
    console.error('Error rejecting vendor:', error)
    res.status(500).json({ error: 'Failed to reject vendor' })
  }
})

export default router
