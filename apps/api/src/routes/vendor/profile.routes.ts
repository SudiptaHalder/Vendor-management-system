import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { z } from 'zod'

const router = Router()

const profileSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  contactPerson: z.string().optional(),
  contactPersonRole: z.string().optional(),
  contactPersonEmail: z.string().email().optional(),
  contactPersonPhone: z.string().optional()
})

// Get vendor profile
router.get('/', async (req, res) => {
  try {
    const vendorId = (req as any).user?.vendorId
    
    const vendor = await prisma.vendors.findUnique({
      where: { id: vendorId },
      include: {
        portalAccess: true,
        ratings: true
      }
    })

    res.json({
      success: true,
      data: vendor
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

// Update vendor profile
router.put('/', async (req, res) => {
  try {
    const vendorId = (req as any).user?.vendorId
    const updates = profileSchema.parse(req.body)
    
    const vendor = await prisma.vendors.update({
      where: { id: vendorId },
      data: updates
    })

    // Log activity
    await prisma.vendor_activity_logs.create({
      data: {
        vendorId,
        action: 'profile_updated',
        entityType: 'profile',
        details: { updates: Object.keys(updates) }
      }
    })

    // Notify admins
    const admins = await prisma.users.findMany({
      where: { role: 'admin' }
    })
    
    for (const admin of admins) {
      await prisma.notifications.create({
        data: {
          type: 'profile_update',
          title: 'Vendor Profile Updated',
          message: `${vendor.name} updated their profile`,
          entityType: 'vendor',
          entityId: vendorId,
          userId: admin.id
        }
      })
    }

    res.json({
      success: true,
      data: vendor
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

export default router
