import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import multer from 'multer'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import path from 'path'
import fs from 'fs'
import XLSX from 'xlsx'

const router = Router()

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../../uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
})

// Generate temporary password
const generateTempPassword = () => {
  return crypto.randomBytes(4).toString('hex') // 8 character password
}

// Parse Excel file
const parseExcel = (filePath: string) => {
  try {
    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    
    if (data.length < 2) {
      throw new Error('File has no data rows')
    }
    
    // Get headers from first row
    const headers = data[0] as string[]
    const rows = data.slice(1) as any[][]
    
    // Convert to array of objects
    const records = rows.map(row => {
      const record: any = {}
      headers.forEach((header, index) => {
        record[header] = row[index]?.toString() || ''
      })
      return record
    }).filter(record => Object.values(record).some(val => val !== ''))
    
    return records
  } catch (error) {
    console.error('Excel parsing error:', error)
    throw error
  }
}

// Parse TSV/CSV file
const parseTSV = (filePath: string) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      throw new Error('File has no data rows')
    }
    
    const headers = lines[0].split('\t').map(h => h.trim())
    
    const records = []
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue
      
      const values = lines[i].split('\t').map(v => v.trim())
      const record: any = {}
      headers.forEach((header, index) => {
        record[header] = values[index] || ''
      })
      records.push(record)
    }
    
    return records
  } catch (error) {
    console.error('TSV parsing error:', error)
    throw error
  }
}

// Upload file endpoint
router.post('/', upload.single('file'), async (req, res) => {
  try {
    console.log('📤 Upload request received')
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    console.log('File uploaded:', req.file.originalname)
    
    const fileId = path.basename(req.file.path)
    res.json({ 
      success: true, 
      fileId,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Upload failed: ' + (error as Error).message })
  }
})

// Process uploaded data
router.post('/process/:fileId', async (req, res) => {
  const { fileId } = req.params
  const { fileName } = req.body
  const filePath = path.join(__dirname, '../../../uploads', fileId)

  try {
    console.log('⚙️ Processing file:', fileName)
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' })
    }

    // Parse based on file extension
    let records = []
    const ext = path.extname(fileName).toLowerCase()
    
    console.log('File extension:', ext)
    
    if (ext === '.xlsx' || ext === '.xls') {
      records = parseExcel(filePath)
    } else {
      records = parseTSV(filePath)
    }
    
    console.log(`Parsed ${records.length} records`)

    const summary = {
      totalRows: records.length,
      vendorsCreated: 0,
      vendorsUpdated: 0,
      purchaseOrders: 0,
      lineItems: 0,
      invitationsSent: 0,
      errors: [] as string[]
    }

    const vendorMap = new Map() // supplierCode -> vendorId
    const poMap = new Map() // poNumber -> poId

    // Get current user ID from request
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    // Process each record
    for (const [index, record] of records.entries()) {
      try {
        const supplierCode = record['Supplier Code']?.trim()
        const supplierName = record['Supplier Name']?.trim()
        const poNumber = record['PO Nor']?.trim()
        
        if (!supplierCode || !supplierName) {
          summary.errors.push(`Row ${index + 2}: Missing supplier code or name`)
          continue
        }

        // Check if vendor exists
        let vendorId = vendorMap.get(supplierCode)
        
        if (!vendorId) {
          const existingVendor = await prisma.vendors.findFirst({
            where: {
              OR: [
                { registrationNumber: supplierCode },
                { name: { contains: supplierName, mode: 'insensitive' } }
              ]
            }
          })

          if (existingVendor) {
            vendorId = existingVendor.id
            summary.vendorsUpdated++
          } else {
            // Create new vendor
            const newVendor = await prisma.vendors.create({
              data: {
                name: supplierName,
                registrationNumber: supplierCode,
                status: 'pending',
                tags: ['imported']
              }
            })
            vendorId = newVendor.id
            summary.vendorsCreated++

            // Generate temp password and create invitation
            const tempPassword = generateTempPassword()
            const hashedPassword = await bcrypt.hash(tempPassword, 10)
            const invitationToken = crypto.randomBytes(32).toString('hex')
            
            // Create vendor email
            const vendorEmail = `${supplierCode.toLowerCase()}@vendorflow.com`
            
            console.log(`Vendor ${supplierName} created with temp password: ${tempPassword}`)
            
            await prisma.vendor_invitations.create({
              data: {
                vendorId: newVendor.id,
                email: vendorEmail,
                tempPassword: hashedPassword,
                invitationToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
              }
            })
            summary.invitationsSent++
          }
          vendorMap.set(supplierCode, vendorId)
        }

        // Handle Purchase Order
        if (poNumber) {
          let poId = poMap.get(poNumber)
          
          if (!poId) {
            // Check if PO exists
            const existingPO = await prisma.purchase_orders.findUnique({
              where: { poNumber }
            })

            if (existingPO) {
              poId = existingPO.id
            } else {
              // Parse dates
              let poCreateDate = null
              let poAmendDate = null
              
              if (record['PO Creat. Date']) {
                poCreateDate = new Date(record['PO Creat. Date'])
              }
              if (record['PO Amendt. Date']) {
                poAmendDate = new Date(record['PO Amendt. Date'])
              }

              // Create new PO
              const newPO = await prisma.purchase_orders.create({
                data: {
                  poNumber,
                  vendorId,
                  title: `Purchase Order ${poNumber}`,
                  orderDate: poCreateDate || new Date(),
                  expectedDate: poAmendDate,
                  status: 'draft',
                  createdById: userId
                }
              })
              poId = newPO.id
              summary.purchaseOrders++
            }
            poMap.set(poNumber, poId)
          }

          // Create line item if material exists
          if (record['Material Code']) {
            const rate1 = parseFloat(record['Rate 1']) || 0
            const quantity = parseFloat(record['Invoice Quantity']) || 0
            
            await prisma.purchase_order_line_items.create({
              data: {
                purchaseOrderId: poId,
                lineNumber: parseInt(record['Line Item']) || 1,
                description: record['Material Description'] || '',
                sku: record['Material Code'],
                quantity: quantity,
                unit: record['Order Unit'] || 'EA',
                unitPrice: rate1,
                total: rate1 * quantity
              }
            })
            summary.lineItems++
          }
        }

        // Store raw data
        await prisma.uploaded_vendor_data.create({
          data: {
            supplierCode,
            supplierName,
            plantCode: record['Plant code'],
            poNumber,
            poCreateDate: record['PO Creat. Date'] ? new Date(record['PO Creat. Date']) : null,
            poAmendDate: record['PO Amendt. Date'] ? new Date(record['PO Amendt. Date']) : null,
            materialCode: record['Material Code'],
            materialDesc: record['Material Description'],
            lineItem: parseInt(record['Line Item']) || null,
            orderUnit: record['Order Unit'],
            rate1: parseFloat(record['Rate 1']) || null,
            rate2: parseFloat(record['Rate 2']) || null,
            invoiceQuantity: parseFloat(record['Invoice Quantity']) || null,
            vendorId,
            uploadedById: userId,
            fileName: fileName,
            rowNumber: index + 2
          }
        })

      } catch (err: any) {
        summary.errors.push(`Row ${index + 2}: ${err.message}`)
      }
    }

    // Clean up uploaded file
    try {
      fs.unlinkSync(filePath)
    } catch (err) {
      console.log('Could not delete temp file:', err)
    }

    res.json({
      success: true,
      data: summary
    })

  } catch (error) {
    console.error('Processing error:', error)
    res.status(500).json({ error: 'Processing failed: ' + (error as Error).message })
  }
})

// Get vendor data by supplier code
router.get('/vendor/:supplierCode', async (req, res) => {
  try {
    const { supplierCode } = req.params
    
    const vendorData = await prisma.uploaded_vendor_data.findMany({
      where: { supplierCode },
      include: {
        vendor: true,
        purchaseOrder: {
          include: {
            lineItems: true
          }
        }
      },
      orderBy: {
        poCreateDate: 'desc'
      }
    })

    res.json({
      success: true,
      data: vendorData
    })
  } catch (error) {
    console.error('Error fetching vendor data:', error)
    res.status(500).json({ error: 'Failed to fetch vendor data' })
  }
})

// Get purchase order details
router.get('/po/:poNumber', async (req, res) => {
  try {
    const { poNumber } = req.params
    
    const poData = await prisma.purchase_orders.findUnique({
      where: { poNumber },
      include: {
        vendor: true,
        lineItems: {
          orderBy: {
            lineNumber: 'asc'
          }
        }
      }
    })

    res.json({
      success: true,
      data: poData
    })
  } catch (error) {
    console.error('Error fetching PO data:', error)
    res.status(500).json({ error: 'Failed to fetch PO data' })
  }
})

export default router
