import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import multer from 'multer'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import path from 'path'
import fs from 'fs'
import { parse } from 'csv-parse/sync'

const router = Router()
const upload = multer({ dest: 'uploads/' })

// Generate temporary password
const generateTempPassword = () => {
  return crypto.randomBytes(4).toString('hex') // 8 character password
}

// Parse TSV file
const parseTSV = (filePath: string) => {
  const content = fs.readFileSync(filePath, 'utf-8')
  const records = parse(content, {
    delimiter: '\t',
    columns: true,
    skip_empty_lines: true,
    trim: true
  })
  return records
}

// Upload file endpoint
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const fileId = path.basename(req.file.path)
    res.json({ 
      success: true, 
      fileId,
      fileName: req.file.originalname 
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Upload failed' })
  }
})

// Process uploaded data
router.post('/process/:fileId', async (req, res) => {
  const { fileId } = req.params
  const filePath = path.join('uploads', fileId)

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' })
    }

    // Parse TSV file
    const records = parseTSV(filePath)
    
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
            
            // In production, send email here
            console.log(`Vendor ${supplierName} created with temp password: ${tempPassword}`)
            
            await prisma.vendor_invitations.create({
              data: {
                vendorId: newVendor.id,
                email: `${supplierCode.toLowerCase()}@vendorflow.com`, // Placeholder email
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
              // Create new PO
              const newPO = await prisma.purchase_orders.create({
                data: {
                  poNumber,
                  vendorId,
                  title: `Purchase Order ${poNumber}`,
                  status: 'draft',
                  createdById: (req as any).user?.id
                }
              })
              poId = newPO.id
              summary.purchaseOrders++
            }
            poMap.set(poNumber, poId)
          }

          // Create line item if material exists
          if (record['Material Code']) {
            await prisma.purchase_order_line_items.create({
              data: {
                purchaseOrderId: poId,
                lineNumber: parseInt(record['Line Item']) || 1,
                description: record['Material Description'] || '',
                sku: record['Material Code'],
                quantity: parseFloat(record['Invoice Quantity']) || 0,
                unit: record['Order Unit'] || 'EA',
                unitPrice: parseFloat(record['Rate 1']) || 0,
                total: (parseFloat(record['Rate 1']) || 0) * (parseFloat(record['Invoice Quantity']) || 0)
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
            uploadedById: (req as any).user?.id,
            fileName: path.basename(filePath),
            rowNumber: index + 2
          }
        })

      } catch (err: any) {
        summary.errors.push(`Row ${index + 2}: ${err.message}`)
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath)

    res.json({
      success: true,
      data: summary
    })

  } catch (error) {
    console.error('Processing error:', error)
    res.status(500).json({ error: 'Processing failed' })
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
