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

// Excel date parser
const parseExcelDate = (dateValue: any): Date | null => {
  if (!dateValue && dateValue !== 0) return null;
  
  try {
    if (typeof dateValue === 'number') {
      const excelEpoch = new Date(1899, 11, 31);
      const days = dateValue - 1;
      const date = new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
      
      const year = date.getFullYear();
      if (year >= 2000 && year <= 2100) {
        return date;
      }
      return null;
    }
    
    if (typeof dateValue === 'string') {
      const parts = dateValue.split('/');
      if (parts.length === 3) {
        const month = parseInt(parts[0]);
        const day = parseInt(parts[1]);
        let year = parseInt(parts[2]);
        
        if (year < 100) year = 2000 + year;
        
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 2000 && year <= 2100) {
          return new Date(year, month - 1, day);
        }
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
    
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
    
    if (data.length < 2) {
      throw new Error('File has no data rows')
    }
    
    const headers = data[0] as string[]
    console.log('📋 Found headers:', headers.filter(h => h).map(h => `"${h}"`))
    
    const rows = data.slice(1) as any[][]
    
    const records = []
    for (const row of rows) {
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

    const userId = (req as any).user?.id || (req as any).user?.userId
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    console.log(`📝 Processing ${records.length} records...`)

    for (const [index, record] of records.entries()) {
      try {
        // Extract data
        const email = record['Email']?.trim()
        const supplierCode = record['Supplier Code']?.toString().trim()
        const supplierName = record['Supplier Name']?.trim()
        const plantCode = record['Plant code']?.toString().trim()
        const poNumber = record['PO No.']?.toString().trim()
        
        const poCreateDate = parseExcelDate(record['PO Creat. Date'])
        const poAmendDate = parseExcelDate(record['PO Amendt. Date'])
        
        const materialCode = record['Material Code']?.toString().trim()
        const materialDesc = record['Material Description']?.trim()
        const lineItem = record['Line Item'] ? parseInt(record['Line Item']) : null
        const orderUnit = record['Order Unit']?.trim()
        
        const rateStr = record['Rate']?.toString().replace(/,/g, '') || '0'
        const rate = parseFloat(rateStr) || 0
        
        const quantityStr = record['Invoice Quantity']?.toString().replace(/,/g, '') || '0'
        const quantity = parseFloat(quantityStr) || 0
        
        if (!supplierCode || !supplierName) {
          summary.errors.push(`Row ${index + 2}: Missing supplier code or name`)
          continue
        }

        // ========== VENDOR: CREATE OR UPDATE (WITH EMAIL UPDATE) ==========
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
          console.log(`✅ New vendor created: ${supplierName} (${supplierCode}) with email: ${vendor.email}`)

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
        } else {
          // Check if email needs to be updated
          const updates: any = {}
          
          if (vendor.email !== email) {
            updates.email = email
            console.log(`📧 Email change detected for ${supplierCode}: "${vendor.email}" -> "${email}"`)
          }
          
          // Also check if other fields need updating
          if (vendor.supplierName !== supplierName) {
            updates.supplierName = supplierName
            console.log(`📝 Name change detected for ${supplierCode}: "${vendor.supplierName}" -> "${supplierName}"`)
          }
          
          if (vendor.plantCode !== plantCode) {
            updates.plantCode = plantCode
            console.log(`🏭 Plant code change detected for ${supplierCode}: "${vendor.plantCode}" -> "${plantCode}"`)
          }
          
          // Apply updates if any
          if (Object.keys(updates).length > 0) {
            await prisma.vendors.update({
              where: { id: vendor.id },
              data: updates
            })
            summary.vendorsUpdated++
            console.log(`🔄 Updated vendor ${supplierCode} with ${Object.keys(updates).length} change(s)`)
          } else {
            console.log(`⏭️ Vendor ${supplierCode} unchanged`)
          }
        }

        // ========== PURCHASE ORDER: Create if doesn't exist ==========
        if (poNumber) {
          let purchaseOrder = await prisma.purchase_orders.findUnique({
            where: { poNumber }
          })

          if (!purchaseOrder) {
            purchaseOrder = await prisma.purchase_orders.create({
              data: {
                poNumber,
                vendorId: vendor.id,
                poCreateDate: poCreateDate,
                poAmendDate: poAmendDate,
                status: 'draft'
              }
            })
            summary.purchaseOrders++
            console.log(`✅ New PO created: ${poNumber}`)
          }

          // ========== LINE ITEM: Create if doesn't exist ==========
          if (materialCode) {
            const existingItem = await prisma.purchase_order_line_items.findFirst({
              where: {
                purchaseOrderId: purchaseOrder.id,
                materialCode: materialCode,
                lineNumber: lineItem || 1
              }
            })

            if (!existingItem) {
              await prisma.purchase_order_line_items.create({
                data: {
                  purchaseOrderId: purchaseOrder.id,
                  lineNumber: lineItem || 1,
                  materialDesc: materialDesc || '',
                  materialCode: materialCode,
                  orderUnit: orderUnit || 'EA',
                  rate: rate,
                  invoiceQuantity: quantity
                }
              })
              summary.lineItems++
              console.log(`✅ New line item: ${materialCode} for PO ${poNumber}`)
            }
          }
        }

        // ========== RAW DATA: Store for audit ==========
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

    console.log('📊 Upload Summary:', {
      totalRows: summary.totalRows,
      vendorsCreated: summary.vendorsCreated,
      vendorsUpdated: summary.vendorsUpdated,
      newPOs: summary.purchaseOrders,
      newLineItems: summary.lineItems,
      invitationsSent: summary.invitationsSent,
      errors: summary.errors.length
    })

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