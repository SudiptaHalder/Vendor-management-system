import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { z } from 'zod'

const router = Router()

const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  color: z.string().default('blue'),
  icon: z.string().optional().default('Package')
})

// Get all categories - NO COMPANY ID REQUIRED
router.get('/', async (req, res, next) => {
  try {
    console.log('📁 Fetching all categories')
    
    const categories = await prisma.categories.findMany({
      where: {
        deletedAt: null
      },
      orderBy: {
        name: 'asc'
      }
    })

    console.log(`Found ${categories.length} categories`)
    res.json({
      success: true,
      data: categories
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    next(error)
  }
})

// Create category - NO COMPANY ID REQUIRED
router.post('/', async (req, res, next) => {
  try {
    console.log('📁 Creating category:', req.body)

    const validated = createCategorySchema.parse(req.body)
    
    // Create category without companyId (null is allowed)
    const category = await prisma.categories.create({
      data: {
        name: validated.name,
        description: validated.description || null,
        color: validated.color,
        icon: validated.icon,
        companyId: null, // Explicitly set to null for super admin
        vendorCount: 0
      }
    })

    console.log('✅ Category created:', category.id)
    res.status(201).json({
      success: true,
      data: category
    })
  } catch (error) {
    console.error('Error creating category:', error)
    next(error)
  }
})

// Update category
router.put('/:id', async (req, res, next) => {
  try {
    const categoryId = req.params.id
    const validated = createCategorySchema.partial().parse(req.body)

    const category = await prisma.categories.update({
      where: { id: categoryId },
      data: validated
    })

    console.log('✅ Category updated:', category.id)
    res.json({
      success: true,
      data: category
    })
  } catch (error) {
    console.error('Error updating category:', error)
    next(error)
  }
})

// Delete category
router.delete('/:id', async (req, res, next) => {
  try {
    const categoryId = req.params.id

    // Check if category has vendors
    const vendorsInCategory = await prisma.vendors.count({
      where: {
        categoryId,
        deletedAt: null
      }
    })

    if (vendorsInCategory > 0) {
      return res.status(409).json({
        success: false,
        error: `Cannot delete category with ${vendorsInCategory} vendors. Please reassign or delete vendors first.`
      })
    }

    // Soft delete
    await prisma.categories.update({
      where: { id: categoryId },
      data: { deletedAt: new Date() }
    })

    console.log('✅ Category deleted:', categoryId)
    res.json({
      success: true,
      message: 'Category deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting category:', error)
    next(error)
  }
})

export default router
