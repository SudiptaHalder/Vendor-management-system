import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import multer from 'multer'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import path from 'path'
import fs from 'fs'
import XLSX from 'xlsx'
import { authMiddleware } from '../../middleware/auth.middleware'

const router = Router()

// ============================================
// GET PURCHASE ORDERS FOR VENDOR (FIXED)
// ============================================
router.get('/', authMiddleware, async (req, res) => {
  try {
    const vendorId = (req as any).user?.vendorId
    
    console.log('📦 Fetching POs for vendorId:', vendorId)
    
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor not authenticated' })
    }
    
    // Get all POs for this vendor
    const purchaseOrders = await prisma.purchase_orders.findMany({
      where: { vendorId: vendorId },
      orderBy: { poCreateDate: 'desc' }
    })
    
    console.log(`Found ${purchaseOrders.length} POs`)
    
    // For each PO, get line items
    const ordersWithLineItems = []
    
    for (const po of purchaseOrders) {
      const lineItems = await prisma.po_line_items.findMany({
        where: { purchaseOrderId: po.id },
        orderBy: { lineNumber: 'asc' }
      })
      
      console.log(`PO ${po.poNumber}: ${lineItems.length} line items found`)
      
      // Format line items
      const formattedLineItems = lineItems.map(item => ({
        id: item.id,
        lineNumber: item.lineNumber,
        materialCode: item.materialCode,
        materialDesc: item.materialDesc,
        uom: item.uom,
        quantity: item.quantity ? Number(item.quantity) : null,
        receivedQty: item.receivedQty ? Number(item.receivedQty) : null,
        pendingQty: item.pendingQty ? Number(item.pendingQty) : null,
        unitPrice: item.unitPrice ? Number(item.unitPrice) : null,
        discountPercent: item.discountPercent ? Number(item.discountPercent) : null,
        discountAmount: item.discountAmount ? Number(item.discountAmount) : null,
        taxableValue: item.taxableValue ? Number(item.taxableValue) : null,
        gstPercent: item.gstPercent ? Number(item.gstPercent) : null,
        sgstPercent: item.sgstPercent ? Number(item.sgstPercent) : null,
        cgstPercent: item.cgstPercent ? Number(item.cgstPercent) : null,
        igstPercent: item.igstPercent ? Number(item.igstPercent) : null,
        gstAmount: item.gstAmount ? Number(item.gstAmount) : null,
        totalAmount: item.totalAmount ? Number(item.totalAmount) : null,
        status: item.status
      }))
      
      ordersWithLineItems.push({
        id: po.id,
        poNumber: po.poNumber,
        poType: po.poType,
        plantCode: po.plantCode,
        subDivisionCode: po.subDivisionCode,
        plantName: po.plantName,
        poCreateDate: po.poCreateDate,
        poAmendDate: po.poAmendDate,
        expectedDate: po.expectedDate,
        deliveredDate: po.deliveredDate,
        status: po.status,
        subtotal: po.subtotal ? Number(po.subtotal) : null,
        taxAmount: po.taxAmount ? Number(po.taxAmount) : null,
        totalAmount: po.totalAmount ? Number(po.totalAmount) : null,
        currency: po.currency,
        lineItems: formattedLineItems
      })
    }
    
    console.log(`✅ Returning ${ordersWithLineItems.length} POs with line items`)
    
    res.json({
      success: true,
      data: ordersWithLineItems
    })
  } catch (error) {
    console.error('Error fetching purchase orders:', error)
    res.status(500).json({ error: 'Failed to fetch purchase orders' })
  }
})

// ============================================
// DEBUG ENDPOINT - Test direct line item fetch
// ============================================
router.get('/debug-direct', authMiddleware, async (req, res) => {
  try {
    const vendorId = (req as any).user?.vendorId
    
    console.log('🔍 Debug - vendorId:', vendorId)
    
    // Get first PO
    const po = await prisma.purchase_orders.findFirst({
      where: { vendorId: vendorId }
    })
    
    if (!po) {
      return res.json({ 
        error: 'No PO found for this vendor',
        vendorId: vendorId
      })
    }
    
    console.log('Found PO:', po.poNumber, 'ID:', po.id)
    
    // Get line items
    const lineItems = await prisma.po_line_items.findMany({
      where: { purchaseOrderId: po.id }
    })
    
    console.log(`Found ${lineItems.length} line items for PO ${po.poNumber}`)
    
    res.json({
      success: true,
      poId: po.id,
      poNumber: po.poNumber,
      lineItemsCount: lineItems.length,
      lineItems: lineItems.map(item => ({
        id: item.id,
        materialCode: item.materialCode,
        uom: item.uom,
        quantity: item.quantity ? Number(item.quantity) : null,
        unitPrice: item.unitPrice ? Number(item.unitPrice) : null,
        totalAmount: item.totalAmount ? Number(item.totalAmount) : null
      }))
    })
  } catch (error) {
    console.error('Debug error:', error)
    res.status(500).json({ error: String(error) })
  }
})

// ============================================
// GET SINGLE PO BY NUMBER
// ============================================
router.get('/po/:poNumber', authMiddleware, async (req, res) => {
  try {
    const { poNumber } = req.params
    const vendorId = (req as any).user?.vendorId
    
    const po = await prisma.purchase_orders.findFirst({
      where: { 
        poNumber: poNumber,
        vendorId: vendorId
      }
    })
    
    if (!po) {
      return res.status(404).json({ error: 'Purchase order not found' })
    }
    
    const lineItems = await prisma.po_line_items.findMany({
      where: { purchaseOrderId: po.id },
      orderBy: { lineNumber: 'asc' }
    })
    
    const formattedLineItems = lineItems.map(item => ({
      id: item.id,
      lineNumber: item.lineNumber,
      materialCode: item.materialCode,
      materialDesc: item.materialDesc,
      uom: item.uom,
      quantity: item.quantity ? Number(item.quantity) : null,
      unitPrice: item.unitPrice ? Number(item.unitPrice) : null,
      totalAmount: item.totalAmount ? Number(item.totalAmount) : null,
      gstPercent: item.gstPercent ? Number(item.gstPercent) : null,
      sgstPercent: item.sgstPercent ? Number(item.sgstPercent) : null,
      cgstPercent: item.cgstPercent ? Number(item.cgstPercent) : null,
      igstPercent: item.igstPercent ? Number(item.igstPercent) : null
    }))
    
    res.json({
      success: true,
      data: {
        ...po,
        subtotal: po.subtotal ? Number(po.subtotal) : null,
        totalAmount: po.totalAmount ? Number(po.totalAmount) : null,
        lineItems: formattedLineItems
      }
    })
  } catch (error) {
    console.error('Error fetching PO:', error)
    res.status(500).json({ error: 'Failed to fetch purchase order' })
  }
})

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads')
console.log('📁 Upload directory:', uploadDir)

try {
  if (!fs.existsSync(uploadDir)) {
    console.log('📁 Creating upload directory...')
    fs.mkdirSync(uploadDir, { recursive: true })
  }
} catch (error: any) {
  console.warn('⚠️ Could not create uploads directory (expected on serverless):', error.message)
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
  limits: { fileSize: 10 * 1024 * 1024 }
})

// Generate temporary password
const generateTempPassword = () => {
  return crypto.randomBytes(4).toString('hex')
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

// Helper to parse number with commas
const parseNumber = (value: any): number | null => {
  if (!value && value !== 0) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/,/g, '').replace(/%/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }
  return null;
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
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
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
router.post('/process/:fileId', authMiddleware, async (req, res) => {
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
        const email = record['Email']?.trim()
        const supplierCode = record['Supplier Code']?.toString().trim()
        const supplierName = record['Supplier Name']?.trim()
        const subDivisionCode = record['Sub- Division Code']?.toString().trim()
        const plantName = record['Plant Name']?.trim()
        const poNumber = record['PO No.']?.toString().trim()
        
        const poCreateDate = parseExcelDate(record['PO Creat. Date']) || parseExcelDate(record['PO Create Date'])        
        const materialCode = record['Material Code']?.toString().trim()
        const materialDesc = record['Material Description']?.toString().trim()
        const lineItem = record['Line Item'] ? parseInt(record['Line Item']) : null
        const orderUnit = record['Order Unit']?.trim()
        const orderQty = parseNumber(record['Order Qty'])
        const invoiceQuantity = parseNumber(record['Invoice Quantity'])
        
        const rate = parseNumber(record['Rate'])
        const totalPrice = parseNumber(record['Total Price'])
        
        const sgstPercent = parseNumber(record['SGST %'])
        const cgstPercent = parseNumber(record['CGST %'])
        const igstPercent = parseNumber(record['IGST %'])
        const sgstAmount = parseNumber(record['SGST Amt'])
        const cgstAmount = parseNumber(record['CGST Amt'])
        const igstAmount = parseNumber(record['IGST Amt'])
        
        const finalTotalPrice = totalPrice || (rate && orderQty ? rate * orderQty : null)
        const totalGstPercent = (sgstPercent || 0) + (cgstPercent || 0) + (igstPercent || 0)
        const totalAmount = finalTotalPrice ? finalTotalPrice * (1 + totalGstPercent / 100) : null
        
        if (!supplierCode || !supplierName) {
          summary.errors.push(`Row ${index + 2}: Missing supplier code or name`)
          continue
        }

        let vendor = await prisma.vendors.findUnique({
          where: { supplierCode }
        })

        if (!vendor) {
          vendor = await prisma.vendors.create({
            data: {
              supplierCode,
              supplierName,
              email: email || `${supplierCode.toLowerCase()}@vendorflow.com`,
              status: 'active'
            }
          })
          summary.vendorsCreated++
          console.log(`✅ New vendor created: ${supplierName} (${supplierCode})`)

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
        }

        let purchaseOrder = null
        if (poNumber) {
          purchaseOrder = await prisma.purchase_orders.findUnique({
            where: { poNumber }
          })
          
          if (!purchaseOrder) {
            purchaseOrder = await prisma.purchase_orders.create({
              data: {
                poNumber,
                vendorId: vendor.id,
                subDivisionCode: subDivisionCode,
                plantName: plantName,
                plantCode: subDivisionCode,
                poType: 'Standard',
                poCreateDate: poCreateDate,
                status: 'pending',
                createdById: userId,
                subtotal: finalTotalPrice,
                totalAmount: totalAmount,
                currency: 'INR'
              }
            })
            summary.purchaseOrders++
            console.log(`✅ New PO created: ${poNumber}`)
          }
        }

        if (purchaseOrder && materialCode) {
          const existingItem = await prisma.po_line_items.findFirst({
            where: {
              purchaseOrderId: purchaseOrder.id,
              materialCode: materialCode
            }
          })

          if (!existingItem) {
            await prisma.po_line_items.create({
              data: {
                purchaseOrderId: purchaseOrder.id,
                lineNumber: lineItem || 1,
                materialCode: materialCode,
                materialDesc: materialDesc,
                uom: orderUnit,
                quantity: orderQty,
                invoiceQuantity: invoiceQuantity || orderQty,
                unitPrice: rate,
                totalPrice: finalTotalPrice,
                gstPercent: totalGstPercent,
                sgstPercent: sgstPercent,
                cgstPercent: cgstPercent,
                igstPercent: igstPercent,
                sgstAmount: sgstAmount,
                cgstAmount: cgstAmount,
                igstAmount: igstAmount,
                totalAmount: totalAmount,
                status: 'pending'
              }
            })
            summary.lineItems++
            console.log(`✅ New line item: ${materialCode} for PO ${poNumber}`)
          }
        }

        await prisma.vendor_upload_data.create({
          data: {
            email,
            supplierCode,
            supplierName,
            plantCode: subDivisionCode,
            poNumber,
            poCreateDate,
            materialCode,
            materialDesc,
            lineItem,
            orderUnit,
            rate,
            invoiceQuantity: invoiceQuantity || orderQty,
            vendorId: vendor.id,
            poId: purchaseOrder?.id,
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
// TEST ENDPOINT - Put this at the very top
router.get('/test', (req, res) => {
  res.json({ message: 'Route is working!' })
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

export default router