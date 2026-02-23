import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { z } from 'zod'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const router = Router()

// Configure multer for logo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../uploads/logos')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WEBP are allowed.') as any, false)
    }
  }
})

// Validation schemas
const updateCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  subdomain: z.string().optional().nullable(),
  website: z.string().url().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
  registrationNumber: z.string().optional().nullable()
})

// GET company by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const company = await prisma.companies.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true
          }
        }
      }
    })

    if (!company || company.deletedAt) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      })
    }

    res.json({
      success: true,
      data: company
    })
  } catch (error) {
    console.error('Error fetching company:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company'
    })
  }
})

// PUT update company
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const validated = updateCompanySchema.parse(req.body)

    const company = await prisma.companies.update({
      where: { id },
      data: {
        name: validated.name,
        subdomain: validated.subdomain,
        website: validated.website,
        phone: validated.phone,
        email: validated.email,
        address: validated.address,
        city: validated.city,
        state: validated.state,
        country: validated.country,
        postalCode: validated.postalCode,
        taxId: validated.taxId,
        registrationNumber: validated.registrationNumber
      }
    })

    res.json({
      success: true,
      data: company
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    console.error('Error updating company:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update company'
    })
  }
})

// POST upload logo
router.post('/:id/logo', upload.single('logo'), async (req, res) => {
  try {
    const { id } = req.params

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      })
    }

    const logoUrl = `/uploads/logos/${req.file.filename}`

    const company = await prisma.companies.update({
      where: { id },
      data: { logo: logoUrl }
    })

    res.json({
      success: true,
      data: { logoUrl: company.logo }
    })
  } catch (error) {
    console.error('Error uploading logo:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to upload logo'
    })
  }
})

// GET company settings
router.get('/:id/settings', async (req, res) => {
  try {
    const { id } = req.params

    const company = await prisma.companies.findUnique({
      where: { id },
      select: {
        settings: true,
        features: true,
        plan: true,
        planStatus: true
      }
    })

    res.json({
      success: true,
      data: company
    })
  } catch (error) {
    console.error('Error fetching company settings:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company settings'
    })
  }
})

// PUT update company settings
router.put('/:id/settings', async (req, res) => {
  try {
    const { id } = req.params
    const { settings, features } = req.body

    const company = await prisma.companies.update({
      where: { id },
      data: {
        settings: settings || undefined,
        features: features || undefined
      }
    })

    res.json({
      success: true,
      data: {
        settings: company.settings,
        features: company.features
      }
    })
  } catch (error) {
    console.error('Error updating company settings:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update company settings'
    })
  }
})

export default router