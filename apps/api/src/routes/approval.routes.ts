import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { z } from 'zod'

const router = Router()

// Get all pending approvals
router.get('/', async (req, res, next) => {
  try {
    console.log('📋 Fetching pending approvals')
    
    const pendingVendors = await prisma.vendors.findMany({
      where: {
        status: 'pending',
        deletedAt: null
      },
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`Found ${pendingVendors.length} pending approvals`)
    
    res.json({
      success: true,
      data: pendingVendors
    })
  } catch (error) {
    console.error('Error fetching approvals:', error)
    next(error)
  }
})

// Get approval stats
router.get('/stats', async (req, res, next) => {
  try {
    const [pending, approved, rejected] = await Promise.all([
      prisma.vendors.count({ where: { status: 'pending', deletedAt: null } }),
      prisma.vendors.count({ where: { status: 'active', deletedAt: null } }),
      prisma.vendors.count({ where: { status: 'rejected', deletedAt: null } })
    ])

    res.json({
      success: true,
      data: {
        pending,
        approved,
        rejected,
        total: pending + approved + rejected
      }
    })
  } catch (error) {
    console.error('Error fetching approval stats:', error)
    next(error)
  }
})

// Approve vendor
router.put('/:id/approve', async (req, res, next) => {
  try {
    const vendorId = req.params.id
    const { notes } = req.body

    console.log(`✅ Approving vendor: ${vendorId}`)

    const vendor = await prisma.vendors.update({
      where: { id: vendorId },
      data: {
        status: 'active',
        notes: notes ? `Approved: ${notes}` : 'Approved'
      },
      include: {
        category: true
      }
    })

    // Create activity log
    await prisma.activity_logs.create({
      data: {
        action: 'approved',
        entityType: 'vendor',
        entityId: vendor.id,
        entityName: vendor.name,
        userId: req.user?.id || 'system',
        userEmail: req.user?.email || 'system@vendorflow.com',
        userName: req.user?.name || 'System',
        companyId: null,
        newData: { status: 'active', notes }
      }
    })

    console.log(`✅ Vendor approved: ${vendor.name}`)
    
    res.json({
      success: true,
      data: vendor,
      message: 'Vendor approved successfully'
    })
  } catch (error) {
    console.error('Error approving vendor:', error)
    next(error)
  }
})

// Reject vendor
router.put('/:id/reject', async (req, res, next) => {
  try {
    const vendorId = req.params.id
    const { notes } = req.body

    console.log(`❌ Rejecting vendor: ${vendorId}`)

    if (!notes) {
      return res.status(400).json({
        success: false,
        error: 'Rejection reason is required'
      })
    }

    const vendor = await prisma.vendors.update({
      where: { id: vendorId },
      data: {
        status: 'rejected',
        notes: `Rejected: ${notes}`
      },
      include: {
        category: true
      }
    })

    // Create activity log
    await prisma.activity_logs.create({
      data: {
        action: 'rejected',
        entityType: 'vendor',
        entityId: vendor.id,
        entityName: vendor.name,
        userId: req.user?.id || 'system',
        userEmail: req.user?.email || 'system@vendorflow.com',
        userName: req.user?.name || 'System',
        companyId: null,
        newData: { status: 'rejected', notes }
      }
    })

    console.log(`❌ Vendor rejected: ${vendor.name}`)
    
    res.json({
      success: true,
      data: vendor,
      message: 'Vendor rejected successfully'
    })
  } catch (error) {
    console.error('Error rejecting vendor:', error)
    next(error)
  }
})

// Bulk approve
router.put('/bulk-approve', async (req, res, next) => {
  try {
    const { ids } = req.body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Vendor IDs are required'
      })
    }

    const result = await prisma.vendors.updateMany({
      where: {
        id: { in: ids },
        status: 'pending'
      },
      data: {
        status: 'active'
      }
    })

    console.log(`✅ Bulk approved ${result.count} vendors`)

    res.json({
      success: true,
      data: { count: result.count },
      message: `${result.count} vendors approved successfully`
    })
  } catch (error) {
    console.error('Error bulk approving vendors:', error)
    next(error)
  }
})

// Get single approval detail
router.get('/:id', async (req, res, next) => {
  try {
    const vendorId = req.params.id

    const vendor = await prisma.vendors.findUnique({
      where: { id: vendorId },
      include: {
        category: true
      }
    })

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      })
    }

    res.json({
      success: true,
      data: vendor
    })
  } catch (error) {
    console.error('Error fetching vendor:', error)
    next(error)
  }
})

export default router
