import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { z } from 'zod'

const router = Router()

const createVendorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().optional(),
  categoryId: z.string().optional(),
  paymentTerms: z.string().optional().default('net30'),
  currency: z.string().optional().default('USD'),
  contactPerson: z.string().optional(),
  contactPersonRole: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional().default('USA'),
  postalCode: z.string().optional(),
  taxId: z.string().optional(),
  registrationNumber: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional().default([])
})

// Get all vendors
router.get('/', async (req, res, next) => {
  try {
    console.log('👥 Fetching all vendors')

    const vendors = await prisma.vendors.findMany({
      where: {
        deletedAt: null
      },
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`Found ${vendors.length} vendors`)
    res.json({
      success: true,
      data: vendors
    })
  } catch (error) {
    console.error('Error fetching vendors:', error)
    next(error)
  }
})

// Create vendor - Status is PENDING by default
router.post('/', async (req, res, next) => {
  try {
    console.log('👥 Creating vendor:', req.body)

    const validated = createVendorSchema.parse(req.body)
    
    const vendor = await prisma.vendors.create({
      data: {
        name: validated.name,
        email: validated.email || null,
        phone: validated.phone || null,
        website: validated.website || null,
        categoryId: validated.categoryId || null,
        paymentTerms: validated.paymentTerms,
        currency: validated.currency,
        contactPerson: validated.contactPerson || null,
        contactPersonRole: validated.contactPersonRole || null,
        address: validated.address || null,
        city: validated.city || null,
        state: validated.state || null,
        country: validated.country,
        postalCode: validated.postalCode || null,
        taxId: validated.taxId || null,
        registrationNumber: validated.registrationNumber || null,
        notes: validated.notes || null,
        tags: validated.tags || [],
        status: 'pending', // IMPORTANT: Set to pending, not active
        companyId: null
      }
    })

    // Update category vendor count
    if (validated.categoryId) {
      await prisma.categories.update({
        where: { id: validated.categoryId },
        data: {
          vendorCount: {
            increment: 1
          }
        }
      })
    }

    console.log('✅ Vendor created with status: pending', vendor.id)
    res.status(201).json({
      success: true,
      data: vendor
    })
  } catch (error) {
    console.error('Error creating vendor:', error)
    next(error)
  }
})

// Delete vendor
router.delete('/:id', async (req, res, next) => {
  try {
    const vendorId = req.params.id

    const vendor = await prisma.vendors.findUnique({
      where: { id: vendorId }
    })

    if (vendor?.categoryId) {
      await prisma.categories.update({
        where: { id: vendor.categoryId },
        data: {
          vendorCount: {
            decrement: 1
          }
        }
      })
    }

    await prisma.vendors.update({
      where: { id: vendorId },
      data: { deletedAt: new Date() }
    })

    console.log('✅ Vendor deleted:', vendorId)
    res.json({
      success: true,
      message: 'Vendor deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting vendor:', error)
    next(error)
  }
})

export default router
