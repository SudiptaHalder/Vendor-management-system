import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import XLSX from 'xlsx'
import { authMiddleware } from '../../middleware/auth.middleware'
const router = Router()

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../../uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'po-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
})

// Helper to parse Excel date
const parseExcelDate = (dateValue: any): Date | null => {
  if (!dateValue && dateValue !== 0) return null;
  
  try {
    if (typeof dateValue === 'number') {
      const excelEpoch = new Date(1899, 11, 31);
      const days = dateValue - 1;
      const date = new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
      if (date.getFullYear() >= 2000 && date.getFullYear() <= 2100) {
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

// Parse Excel file with new headers
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

// Cache for tax codes and subdivisions
let taxCodeCache: Map<string, any> = new Map()
let subdivisionCache: Map<string, any> = new Map()

const loadTaxCodes = async () => {
  try {
    const taxCodes = await prisma.tax_codes.findMany()
    taxCodeCache.clear()
    taxCodes.forEach(tc => {
      taxCodeCache.set(tc.tax_code, {
        sgst_percent: tc.sgst_percent,
        cgst_percent: tc.cgst_percent,
        igst_percent: tc.igst_percent
      })
    })
    console.log(`✅ Loaded ${taxCodeCache.size} tax codes`)
  } catch (error) {
    console.error('Error loading tax codes:', error)
  }
}

const getTaxDetails = (taxCode: string) => {
  return taxCodeCache.get(taxCode) || null
}

const loadSubdivisions = async () => {
  try {
    const subdivisions = await prisma.sub_division_codes.findMany()
    subdivisionCache.clear()
    subdivisions.forEach(sd => {
      subdivisionCache.set(sd.sub_division_code, {
        plant_name: sd.plant_name
      })
    })
    console.log(`✅ Loaded ${subdivisionCache.size} subdivisions`)
  } catch (error) {
    console.error('Error loading subdivisions:', error)
  }
}

const getSubdivision = (subDivisionCode: string) => {
  return subdivisionCache.get(subDivisionCode) || null
}

// ============================================
// 1. UPLOAD PO FILE ENDPOINT
// ============================================
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    console.log('📤 PO Upload request received')
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

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

// ============================================
// 2. PROCESS PO DATA ENDPOINT
// ============================================
router.post('/process/:fileId', authMiddleware, async (req, res) => {
  const { fileId } = req.params
  const { fileName } = req.body
  const filePath = path.join(__dirname, '../../../uploads', fileId)

  console.log('⚙️ Processing PO file:', fileName)

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' })
    }

    // Load tax codes and subdivisions from database
    await loadTaxCodes()
    await loadSubdivisions()

    const records = parseExcel(filePath)
    console.log(`✅ Parsed ${records.length} records`)

    const summary = {
      totalRows: records.length,
      vendorsCreated: 0,
      vendorsUpdated: 0,
      purchaseOrders: 0,
      lineItems: 0,
      errors: [] as string[]
    }

    const userId = (req as any).user?.id || (req as any).user?.userId
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    const poMap = new Map() // poNumber -> poId

    for (const [index, record] of records.entries()) {
      try {
        // Extract data from Excel columns
        const email = record['Email']?.trim()
        const supplierCode = record['Supplier Code']?.toString().trim()
        const supplierName = record['Supplier Name']?.trim()
        const subDivisionCode = record['Sub- Division Code']?.toString().trim()
        const plantName = record['Plant Name']?.trim()
        const poNumber = record['PO No.']?.toString().trim()
        const poCreateDate = parseExcelDate(record['PO Creat. Date'])
        
        const materialCode = record['Material Code']?.toString().trim()
        const materialDesc = record['Material Description']?.trim()
        const lineItem = record['Line Item'] ? parseInt(record['Line Item']) : null
        const orderQty = parseNumber(record['Order Qty'])
        const orderUnit = record['Order Unit']?.trim()
        const invoiceQuantity = parseNumber(record['Invoice Quantity'])
        
        // Tax details - from Tax Code or direct columns
        const taxCode = record['Tax Code']?.trim()
        const taxDetails = getTaxDetails(taxCode)
        
        // Get tax percentages from tax code or direct from record
        let sgstPercent = taxDetails?.sgst_percent || parseNumber(record['SGST %'])
        let cgstPercent = taxDetails?.cgst_percent || parseNumber(record['CGST %'])
        let igstPercent = taxDetails?.igst_percent || parseNumber(record['IGST %'])
        
        // Parse amounts
        const rate = parseNumber(record['Rate'])
        const totalPrice = parseNumber(record['Total Price'])
        const sgstAmount = parseNumber(record['SGST Amt'])
        const cgstAmount = parseNumber(record['CGST Amt'])
        const igstAmount = parseNumber(record['IGST Amt'])
        
        // Calculate total if not provided
        const calculatedTotal = rate && orderQty ? rate * orderQty : null
        const finalTotalPrice = totalPrice || calculatedTotal
        
        if (!supplierCode || !supplierName) {
          summary.errors.push(`Row ${index + 2}: Missing supplier code or name`)
          continue
        }

        // ========== Create or Update Vendor ==========
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
        } else if (vendor.supplierName !== supplierName || vendor.email !== email) {
          await prisma.vendors.update({
            where: { id: vendor.id },
            data: {
              supplierName,
              email: email || vendor.email
            }
          })
          summary.vendorsUpdated++
          console.log(`🔄 Updated vendor: ${supplierName}`)
        }

        // ========== Get Plant Name from Sub-Division ==========
        let finalPlantName = plantName
        if (subDivisionCode && !plantName) {
          const subdivision = getSubdivision(subDivisionCode)
          if (subdivision) {
            finalPlantName = subdivision.plant_name
          }
        }

        // ========== Create or Update Purchase Order ==========
        let purchaseOrder = await prisma.purchase_orders.findUnique({
          where: { poNumber }
        })

        if (!purchaseOrder && poNumber) {
          purchaseOrder = await prisma.purchase_orders.create({
            data: {
              poNumber,
              vendorId: vendor.id,
              subDivisionCode,
              plantName: finalPlantName,
              poCreateDate,
              status: 'pending',
              createdById: userId
            }
          })
          summary.purchaseOrders++
          console.log(`✅ New PO created: ${poNumber}`)
        }

        // ========== Create Line Item ==========
        if (purchaseOrder && materialCode) {
          // Check if line item already exists
          const existingItem = await prisma.po_line_items.findFirst({
            where: {
              purchaseOrderId: purchaseOrder.id,
              materialCode,
              lineNumber: lineItem || 1
            }
          })

          if (!existingItem) {
            await prisma.po_line_items.create({
              data: {
                purchaseOrderId: purchaseOrder.id,
                lineNumber: lineItem || 1,
                materialCode,
                materialDesc,
                uom: orderUnit,
                quantity: orderQty,
                invoiceQuantity: invoiceQuantity || orderQty,
                unitPrice: rate,
                totalPrice: finalTotalPrice,
                taxCode,
                sgstPercent,
                cgstPercent,
                igstPercent,
                sgstAmount,
                cgstAmount,
                igstAmount,
                status: 'pending'
              }
            })
            summary.lineItems++
            console.log(`✅ New line item: ${materialCode} for PO ${poNumber}`)
          }
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

// ============================================
// 3. UPLOAD TAX CODES MASTER DATA
// ============================================
router.post('/tax-codes', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    console.log('📤 Tax Codes Upload request received')
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const filePath = req.file.path
    const records = parseExcel(filePath)
    
    let created = 0
    let updated = 0
    let errors: string[] = []
    
    for (const record of records) {
      try {
        const taxCode = record['Tax Code']?.trim()
        if (!taxCode) {
          errors.push('Missing Tax Code')
          continue
        }
        
        const sgstPercent = parseNumber(record['SGST %'])
        const cgstPercent = parseNumber(record['CGST %'])
        const igstPercent = parseNumber(record['IGST %'])
        
        const existing = await prisma.tax_codes.findUnique({
          where: { tax_code: taxCode }
        })
        
        if (existing) {
          await prisma.tax_codes.update({
            where: { tax_code: taxCode },
            data: { 
              sgst_percent: sgstPercent,
              cgst_percent: cgstPercent,
              igst_percent: igstPercent,
              updated_at: new Date()
            }
          })
          updated++
        } else {
          await prisma.tax_codes.create({
            data: { 
              tax_code: taxCode,
              sgst_percent: sgstPercent,
              cgst_percent: cgstPercent,
              igst_percent: igstPercent
            }
          })
          created++
        }
      } catch (err: any) {
        errors.push(`Error processing tax code: ${err.message}`)
      }
    }
    
    // Clean up
    try {
      fs.unlinkSync(filePath)
    } catch (err) {
      console.log('Could not delete temp file:', err)
    }
    
    console.log(`✅ Tax Codes processed: ${created} created, ${updated} updated, ${errors.length} errors`)
    
    res.json({
      success: true,
      data: { created, updated, errors, total: records.length }
    })
  } catch (error) {
    console.error('Tax codes upload error:', error)
    res.status(500).json({ error: 'Upload failed: ' + (error as Error).message })
  }
})

// ============================================
// 4. UPLOAD SUB-DIVISIONS MASTER DATA
// ============================================
router.post('/subdivisions', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    console.log('📤 Subdivisions Upload request received')
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const filePath = req.file.path
    const records = parseExcel(filePath)
    
    let created = 0
    let updated = 0
    let errors: string[] = []
    
    for (const record of records) {
      try {
        const subDivisionCode = record['Sub- Division Code']?.toString().trim()
        const plantName = record['Plant Name']?.trim()
        
        if (!subDivisionCode) {
          errors.push('Missing Sub-Division Code')
          continue
        }
        
        if (!plantName) {
          errors.push(`Missing Plant Name for ${subDivisionCode}`)
          continue
        }
        
        const existing = await prisma.sub_division_codes.findUnique({
          where: { sub_division_code: subDivisionCode }
        })
        
        if (existing) {
          await prisma.sub_division_codes.update({
            where: { sub_division_code: subDivisionCode },
            data: { 
              plant_name: plantName,
              updated_at: new Date()
            }
          })
          updated++
        } else {
          await prisma.sub_division_codes.create({
            data: { 
              sub_division_code: subDivisionCode,
              plant_name: plantName
            }
          })
          created++
        }
      } catch (err: any) {
        errors.push(`Error processing subdivision: ${err.message}`)
      }
    }
    
    // Clean up
    try {
      fs.unlinkSync(filePath)
    } catch (err) {
      console.log('Could not delete temp file:', err)
    }
    
    console.log(`✅ Subdivisions processed: ${created} created, ${updated} updated, ${errors.length} errors`)
    
    res.json({
      success: true,
      data: { created, updated, errors, total: records.length }
    })
  } catch (error) {
    console.error('Subdivisions upload error:', error)
    res.status(500).json({ error: 'Upload failed: ' + (error as Error).message })
  }
})

// ============================================
// 5. GET PURCHASE ORDERS FOR VENDOR (with line items)
// ============================================
router.get('/vendor/:vendorCode', authMiddleware, async (req, res) => {
  try {
    const { vendorCode } = req.params
    
    const vendor = await prisma.vendors.findUnique({
      where: { supplierCode: vendorCode }
    })
    
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' })
    }
    
    const purchaseOrders = await prisma.purchase_orders.findMany({
      where: { vendorId: vendor.id },
      include: {
        lineItems: true
      },
      orderBy: {
        poCreateDate: 'desc'
      }
    })
    
    res.json({
      success: true,
      data: purchaseOrders
    })
  } catch (error) {
    console.error('Error fetching purchase orders:', error)
    res.status(500).json({ error: 'Failed to fetch purchase orders' })
  }
})

// ============================================
// 6. GET SINGLE PURCHASE ORDER DETAILS
// ============================================
router.get('/:poNumber', authMiddleware, async (req, res) => {
  try {
    const { poNumber } = req.params
    
    const purchaseOrder = await prisma.purchase_orders.findUnique({
      where: { poNumber },
      include: {
        vendor: true,
        lineItems: true
      }
    })
    
    if (!purchaseOrder) {
      return res.status(404).json({ error: 'Purchase order not found' })
    }
    
    res.json({
      success: true,
      data: purchaseOrder
    })
  } catch (error) {
    console.error('Error fetching purchase order:', error)
    res.status(500).json({ error: 'Failed to fetch purchase order' })
  }
})

export default router
