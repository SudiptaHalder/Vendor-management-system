import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import multer from 'multer'
import path from 'path'

const router = Router()
const upload = multer({ dest: 'uploads/' })

// Get all documents
router.get('/', async (req, res) => {
  try {
    const vendorId = (req as any).user?.vendorId
    
    const documents = await prisma.documents.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' }
    })

    res.json({
      success: true,
      data: documents
    })
  } catch (error) {
    console.error('Error fetching documents:', error)
    res.status(500).json({ error: 'Failed to fetch documents' })
  }
})

// Upload document
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const vendorId = (req as any).user?.vendorId
    const file = req.file
    const { category, description } = req.body

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const document = await prisma.documents.create({
      data: {
        name: file.originalname,
        description,
        fileUrl: `/uploads/${file.filename}`,
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
        category,
        entityType: 'vendor',
        entityId: vendorId,
        vendorId,
        uploadedById: vendorId
      }
    })

    // Log activity
    await prisma.vendor_activity_logs.create({
      data: {
        vendorId,
        action: 'document_uploaded',
        entityType: 'document',
        entityId: document.id,
        details: { fileName: file.originalname }
      }
    })

    res.json({
      success: true,
      data: document
    })
  } catch (error) {
    console.error('Error uploading document:', error)
    res.status(500).json({ error: 'Failed to upload document' })
  }
})

// Delete document
router.delete('/:id', async (req, res) => {
  try {
    const vendorId = (req as any).user?.vendorId
    const { id } = req.params
    
    const document = await prisma.documents.findFirst({
      where: { id, vendorId }
    })

    if (!document) {
      return res.status(404).json({ error: 'Document not found' })
    }

    await prisma.documents.delete({
      where: { id }
    })

    res.json({
      success: true,
      message: 'Document deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting document:', error)
    res.status(500).json({ error: 'Failed to delete document' })
  }
})

export default router
