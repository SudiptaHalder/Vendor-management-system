import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { z } from 'zod'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

const router = Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads')
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  }
})

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ]
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type') as any, false)
    }
  }
})

// Validation schemas
const createDocumentSchema = z.object({
  entityType: z.string(),
  entityId: z.string(),
  name: z.string().min(1, 'Document name is required'),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  version: z.number().default(1),
  expiryDate: z.string().optional().nullable(),
  isConfidential: z.boolean().default(false),
  vendorId: z.string().optional().nullable()
})

// ============ DOCUMENTS ============

// GET all documents
router.get('/', async (req, res) => {
  try {
    const { entityType, entityId, vendorId, category, search } = req.query
    
    const where: any = {
      deletedAt: null
    }
    
    if (entityType) where.entityType = entityType
    if (entityId) where.entityId = entityId
    if (vendorId) where.vendorId = vendorId
    if (category) where.category = category
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { fileName: { contains: search, mode: 'insensitive' } }
      ]
    }

    const documents = await prisma.documents.findMany({
      where,
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        vendor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    })

    res.json({
      success: true,
      data: documents
    })
  } catch (error) {
    console.error('Error fetching documents:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch documents'
    })
  }
})

// GET single document
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const document = await prisma.documents.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        vendor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!document || document.deletedAt) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      })
    }

    res.json({
      success: true,
      data: document
    })
  } catch (error) {
    console.error('Error fetching document:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch document'
    })
  }
})

// POST create document (with file upload)
router.post('/', upload.single('file'), async (req, res) => {
  try {
    console.log('Uploading document:', req.body)
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      })
    }

    const validated = createDocumentSchema.parse(JSON.parse(req.body.data))
    
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { companyId: true }
    })

    // Check if this is a new version
    if (validated.version > 1) {
      // Set previous versions as not latest
      await prisma.documents.updateMany({
        where: {
          entityType: validated.entityType,
          entityId: validated.entityId,
          name: validated.name,
          isLatest: true
        },
        data: { isLatest: false }
      })
    }

    const document = await prisma.documents.create({
      data: {
        entityType: validated.entityType,
        entityId: validated.entityId,
        name: validated.name,
        description: validated.description,
        fileUrl: `/uploads/${req.file.filename}`,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        category: validated.category,
        version: validated.version,
        isLatest: true,
        expiryDate: validated.expiryDate ? new Date(validated.expiryDate) : null,
        isConfidential: validated.isConfidential,
        vendorId: validated.vendorId || null,
        uploadedById: userId,
        companyId: user?.companyId || null
      }
    })

    console.log('✅ Document uploaded:', document.id)
    
    res.status(201).json({
      success: true,
      data: document
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors)
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    console.error('Error uploading document:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to upload document',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// GET download document
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params

    const document = await prisma.documents.findUnique({
      where: { id }
    })

    if (!document || document.deletedAt) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      })
    }

    const filePath = path.join(__dirname, '../../', document.fileUrl)
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found on server'
      })
    }

    res.download(filePath, document.fileName)
  } catch (error) {
    console.error('Error downloading document:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to download document'
    })
  }
})

// PUT update document metadata
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, category, expiryDate, isConfidential } = req.body

    const document = await prisma.documents.update({
      where: { id },
      data: {
        name,
        description,
        category,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isConfidential
      }
    })

    res.json({
      success: true,
      data: document
    })
  } catch (error) {
    console.error('Error updating document:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update document'
    })
  }
})

// DELETE document (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    await prisma.documents.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    res.json({
      success: true,
      message: 'Document deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting document:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete document'
    })
  }
})

export default router