import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import multer from 'multer'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import path from 'path'
import fs from 'fs'
import XLSX from 'xlsx'

const router = Router()

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads')
console.log('📁 Upload directory:', uploadDir)

if (!fs.existsSync(uploadDir)) {
  console.log('📁 Creating upload directory...')
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'file-' + uniqueSuffix + path.extname(file.originalname))
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

// Safe date parser for mm/dd/yyyy format
const parseMMDDYYYY = (dateStr: any): Date | null => {
  if (!dateStr) return null;
  
  try {
    // Handle Excel serial numbers
    if (typeof dateStr === 'number') {
      const date = new Date((dateStr - 25569) * 86400 * 1000);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        if (year >= 2000 && year <= 2100) {
          return date;
        }
      }
      return null;
    }
    
    // Convert to string and clean
    const cleanStr = dateStr.toString().trim();
    
    // Try mm/dd/yyyy format
    const parts = cleanStr.split('/');
    if (parts.length === 3) {
      const month = parseInt(parts[0]);
      const day = parseInt(parts[1]);
      let year = parseInt(parts[2]);
      
      // Handle 2-digit years (24 -> 2024)
      if (year < 100) {
        year = 2000 + year;
      }
      
      // Validate ranges
      if (month >= 1 && month <= 12 && 
          day >= 1 && day <= 31 && 
          year >= 2000 && year <= 2100) {
        return new Date(year, month - 1, day);
      }
    }
    
    return null;
    
  } catch (e) {
    return null;
  }
}

// Parse Excel file
const parseExcel = (filePath: string) => {
  try {
    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // Get data as array of arrays
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
    
    if (data.length < 2) {
      throw new Error('File has no data rows')
    }
    
    // First row contains headers
    const headers = data[0] as string[]
    console.log('📋 Found headers:', headers.filter(h => h).map(h => `"${h}"`))
    
    // Data starts from row 2
    const rows = data.slice(1) as any[][]
    
    // Convert to array of objects
    const records = []
    for (const row of rows) {
      // Skip empty rows
      if (!row.some(cell => cell !== null && cell !== undefined && cell !== '')) {
        continue
      }
      
      const record: any = {}
      headers.forEach((header, index) => {
        if (header && header.toString().trim()) {
          const cleanHeader = header.toString().trim()
          let value = row[index]
          
          if (value === null || value === undefined) {
            value = ''
          } else if (typeof value === 'object') {
            value = value.toString()
          } else {
            value = value.toString().trim()
          }
          
          record[cleanHeader] = value
        }
      })
      
      if (Object.values(record).some(val => val !== '')) {
        records.push(record)
      }
    }
    
    console.log(`📊 Parsed ${records.length} records`)
    return records
  } catch (error) {
    console.error('Excel parsing error:', error)
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

    console.log('✅ File uploaded successfully:', req.file.originalname)
    
    const fileId = req.file.filename
    res.json({ 
      success: true, 
      fileId,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size
    })
  } catch (error) {
    console.error('❌ Upload error:', error)
    res.status(500).json({ error: 'Upload failed: ' + (error as Error).message })
  }
})

// Process uploaded data
router.post('/process/:fileId', async (req, res) => {
  const { fileId } = req.params
  const { fileName } = req.body
  const filePath = path.join(__dirname, '../../uploads', fileId)

  console.log('⚙️ Processing file:', fileName)

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' })
    }

    // Parse Excel file
    const records = parseExcel(filePath)
    console.log(`✅ Parsed ${records.length} records`)

    const summary = {
      totalRows: records.length,
      vendorsCreated: 0,
      vendorsUpdated: 0,
      purchaseOrders: 0,
      lineItems: 0,
      invitationsSent: 0,
      errors: [] as string[]
    }

    // Get current user ID from request
    const userId = (req as any).user?.id || (req as any).user?.userId
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    console.log(`📝 Processing ${records.length} records...`)

    // Process each record
    for (const [index, record] of records.entries()) {
      try {
        // Extract data matching your EXACT Excel headers
        const email = record['Email']?.trim()
        const supplierCode = record['Supplier Code']?.toString().trim()
        const supplierName = record['Supplier Name']?.trim()
        const plantCode = record['Plant code']?.toString().trim()
        const poNumber = record['PO No.']?.toString().trim()
        
        // Parse dates using mm/dd/yyyy format
        const poCreateDate = parseMMDDYYYY(record['PO Creat. Date'])
        const poAmendDate = parseMMDDYYYY(record['PO Amendt. Date'])
        
        const materialCode = record['Material Code']?.toString().trim()
        const materialDesc = record['Material Description']?.trim()
        const lineItem = record['Line Item'] ? parseInt(record['Line Item']) : null
        const orderUnit = record['Order Unit']?.trim()
        
        // Handle Rate (remove commas and convert to number)
        const rateStr = record['Rate']?.toString().replace(/,/g, '') || '0'
        const rate = parseFloat(rateStr) || 0
        
        // Handle Invoice Quantity
        const quantityStr = record['Invoice Quantity']?.toString().replace(/,/g, '') || '0'
        const quantity = parseFloat(quantityStr) || 0
        
        if (!supplierCode || !supplierName) {
          summary.errors.push(`Row ${index + 2}: Missing supplier code or name`)
          continue
        }

        // ========== VENDOR: Create or Update ==========
        let vendor = await prisma.vendors.findUnique({
          where: { supplierCode }
        })

        if (!vendor) {
          // Create new vendor
          vendor = await prisma.vendors.create({
            data: {
              supplierCode,
              supplierName,
              email: email || `${supplierCode.toLowerCase()}@vendorflow.com`,
              plantCode,
              status: 'active'
            }
          })
          summary.vendorsCreated++

          // Generate temp password and invitation for new vendor
          const tempPassword = generateTempPassword()
          const hashedPassword = await bcrypt.hash(tempPassword, 10)
          const invitationToken = crypto.randomBytes(32).toString('hex')
          
          await prisma.vendor_invitations.create({
            data: {
              vendorId: vendor.id,
              email: email || `${supplierCode.toLowerCase()}@vendorflow.com`,
              username: supplierCode,
              tempPassword: hashedPassword,
              invitationToken,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
          })
          summary.invitationsSent++
          console.log(`✅ New vendor created: ${supplierName}`)
        } else {
          summary.vendorsUpdated++
        }

        // ========== PURCHASE ORDER: Create if doesn't exist ==========
        if (poNumber) {
          let purchaseOrder = await prisma.purchase_orders.findUnique({
            where: { poNumber }
          })

          if (!purchaseOrder) {
            // Create PO without title field (matches your schema)
            purchaseOrder = await prisma.purchase_orders.create({
              data: {
                poNumber,
                vendorId: vendor.id,
                poCreateDate: poCreateDate,
                poAmendDate: poAmendDate,
                status: 'draft',
                createdAt: new Date(),
                updatedAt: new Date()
              }
            })
            summary.purchaseOrders++
            console.log(`✅ New PO created: ${poNumber}`)
          }

          // ========== LINE ITEM: Create if doesn't exist ==========
          if (materialCode && quantity > 0) {
            // Check if line item already exists
            const existingItem = await prisma.purchase_order_line_items.findFirst({
              where: {
                purchaseOrderId: purchaseOrder.id,
                sku: materialCode,
                lineNumber: lineItem || 1
              }
            })

            if (!existingItem) {
              await prisma.purchase_order_line_items.create({
                data: {
                  purchaseOrderId: purchaseOrder.id,
                  lineNumber: lineItem || 1,
                  description: materialDesc || '',
                  sku: materialCode,
                  quantity: quantity,
                  unit: orderUnit || 'EA',
                  unitPrice: rate,
                  total: rate * quantity
                }
              })
              summary.lineItems++
            }
          }
        }

        // ========== RAW DATA: Store for audit ==========
        // Check if this exact row already exists
        const existingUpload = await prisma.vendor_upload_data.findFirst({
          where: {
            supplierCode,
            poNumber,
            materialCode,
            lineItem: lineItem || null
          }
        })

        if (!existingUpload) {
          await prisma.vendor_upload_data.create({
            data: {
              email,
              supplierCode,
              supplierName,
              plantCode,
              poNumber,
              poCreateDate,
              poAmendDate,
              materialCode,
              materialDesc,
              lineItem,
              orderUnit,
              rate,
              invoiceQuantity: quantity,
              vendorId: vendor.id,
              uploadedById: userId,
              fileName: fileName,
              rowNumber: index + 2,
              status: 'processed'
            }
          })
        }

        if ((index + 1) % 10 === 0) {
          console.log(`✅ Processed ${index + 1}/${records.length} records`)
        }

      } catch (err: any) {
        console.error(`Error processing row ${index + 2}:`, err)
        summary.errors.push(`Row ${index + 2}: ${err.message}`)
      }
    }

    // Clean up uploaded file
    try {
      fs.unlinkSync(filePath)
      console.log('✅ Cleaned up file:', filePath)
    } catch (err) {
      console.log('Could not delete temp file:', err)
    }

    console.log('📊 Upload Summary:', summary)
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
    
    const vendorData = await prisma.vendor_upload_data.findMany({
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

// Get purchase order details by PO number
router.get('/po/:poNumber', async (req, res) => {
  try {
    const { poNumber } = req.params
    
    const poData = await prisma.purchase_orders.findUnique({
      where: { poNumber },
      include: {
        vendor: true,
        lineItems: true
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
