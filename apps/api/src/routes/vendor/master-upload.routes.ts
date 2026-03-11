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
    cb(null, 'master-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
})

// Helper to clean and convert values
const cleanValue = (value: any): string | null => {
  if (value === null || value === undefined) return null
  const str = value.toString().trim()
  return str === '' ? null : str
}

const toBoolean = (value: any): boolean | null => {
  if (value === null || value === undefined) return null
  const str = value.toString().toLowerCase().trim()
  if (str === 'yes' || str === 'true' || str === '1' || str === 'x') return true
  if (str === 'no' || str === 'false' || str === '0' || str === '') return false
  return null
}

// Upload master data endpoint - NOW AT ROOT (/)
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    console.log('📤 Vendor master upload request received')
    console.log('Request headers:', req.headers)
    console.log('File:', req.file)
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const filePath = req.file.path
    console.log('File saved to:', filePath)

    // Read Excel file
    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // Get data as array of arrays
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
    
    if (data.length < 2) {
      return res.status(400).json({ error: 'File has no data rows' })
    }

    const headers = data[0] as string[]
    console.log('Headers:', headers)

    const rows = data.slice(1)
    const summary = {
      totalRows: rows.length,
      created: 0,
      updated: 0,
      errors: [] as string[]
    }

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      if (!row || !row[0]) continue // Skip empty rows or rows without supplier code

      try {
        // Build data object dynamically from headers
        const rowData: any = {}
        headers.forEach((header, index) => {
          if (header && row[index] !== undefined) {
            rowData[header] = row[index]
          }
        })

        const supplierCode = cleanValue(rowData['Supplier Code'])
        const supplierName = cleanValue(rowData['Supplier Name'])

        if (!supplierCode || !supplierName) {
          summary.errors.push(`Row ${i + 2}: Missing Supplier Code or Name`)
          continue
        }

        // Check if vendor exists in vendors table
        let vendor = await prisma.vendors.findUnique({
          where: { supplierCode }
        })

        if (!vendor) {
          // Create basic vendor first
          vendor = await prisma.vendors.create({
            data: {
              supplierCode,
              supplierName,
              email: cleanValue(rowData['E-Mail Address']) || `${supplierCode.toLowerCase()}@vendorflow.com`,
              status: 'active'
            }
          })
          summary.created++
          console.log(`✅ Created new vendor: ${supplierCode}`)
        }

        // Prepare master data - only include fields that have values
        const masterData: any = {
          supplierCode,
          supplierName
        }

        // Map Excel columns to database fields
        const fieldMappings: { [key: string]: string } = {
          'Company Code': 'companyCode',
          'Supplier Acct Group': 'supplierAcctGroup',
          'Country/Region Name': 'countryName',
          'City': 'city',
          'Bank Name': 'bankName',
          'Bank Account': 'bankAccount',
          'Tax Number': 'taxNumber',
          'Posting Block': 'postingBlock',
          'Purchasing Block': 'purchasingBlock',
          'Payment Methods': 'paymentMethods',
          'Deletion Flag': 'deletionFlag',
          'Created By': 'createdBy',
          'Account Holder': 'accountHolder',
          'Accounting Clerk': 'accountingClerk',
          'Accounting Clerk Tel': 'accountingClerkTel',
          'Address': 'address',
          'Alternative Payee': 'alternativePayee',
          'Alternative Payee CC': 'alternativePayeeCC',
          'Authorization': 'authorization',
          'Automatic PO': 'automaticPO',
          'Bank Control Key': 'bankControlKey',
          'Bank Country/Region': 'bankCountry',
          'Bank Key': 'bankKey',
          'BP Bank Account': 'bpBankAccount',
          'BP PO Box Dvtg City': 'bpPOBoxDvtgCity',
          'BP Type': 'bpType',
          'Branch Code': 'branchCode',
          'Branch Description': 'branchDescription',
          'Business Partner': 'businessPartner',
          'Check Double Invoice': 'checkDoubleInvoice',
          'Clerk Fax No': 'clerkFaxNo',
          'Country/Region Key': 'countryKey',
          'Created On': 'createdOn',
          'Default Branch': 'defaultBranch',
          'E-Mail Address': 'email',
          'Fax Number': 'faxNumber',
          'GR-Based Inv. Verif.': 'grBasedInvVerif',
          'IBAN': 'iban',
          'Incoterms': 'incoterms',
          'Incoterms (Part 2)': 'incotermsPart2',
          'Internet Add.': 'internetAdd',
          'Item Payment Block': 'itemPaymentBlock',
          'Liable for VAT': 'liableForVAT',
          'Minority Indicator': 'minorityIndicator',
          'Natural Person': 'naturalPerson',
          'Order Currency': 'orderCurrency',
          'Payment Block': 'paymentBlock',
          'Planning Group': 'planningGroup',
          'Postal Code': 'postalCode',
          'Previous Account No.': 'previousAccountNo',
          'Purch. Organization': 'purchOrganization',
          'Purchasing Group': 'purchasingGroup',
          'Recon. Account': 'reconAccount',
          'Reference Details': 'referenceDetails',
          'Region': 'region',
          'Release Group': 'releaseGroup',
          'Search Term 1': 'searchTerm1',
          'Search Term 2': 'searchTerm2',
          'Sort key': 'sortKey',
          'Street': 'street',
          'Street 2': 'street2',
          'Street 3': 'street3',
          'Street 4': 'street4',
          'Street 5': 'street5',
          'Supplier Full Name': 'supplierFullName',
          'SWIFT / BIC': 'swiftBic',
          'Tax Number 1': 'taxNumber1',
          'Tax Number 2': 'taxNumber2',
          'Tax Number 3': 'taxNumber3',
          'Tax Number 4': 'taxNumber4',
          'Tax Number 5': 'taxNumber5',
          'Tax Number at Auth.': 'taxNumberAtAuth',
          'Tax Number Category': 'taxNumberCategory',
          'Tax Number Type': 'taxNumberType',
          'Tax Type': 'taxType',
          'Tax Type Name': 'taxTypeName',
          'Telephone 1': 'telephone1',
          'Telephone 2': 'telephone2',
          'Terms of Payts Key CoCode': 'termsOfPaytsKeyCoCode',
          'Terms Of Payts Key PO': 'termsOfPaytsKeyPO',
          'Trading Partner No.': 'tradingPartnerNo',
          'WTax C/R Key': 'wTaxCRKey'
        }

        // Apply mappings
        for (const [excelField, dbField] of Object.entries(fieldMappings)) {
          if (rowData[excelField] !== undefined && rowData[excelField] !== '') {
            // Handle boolean fields
            if (dbField.includes('Block') || dbField.includes('Flag') || 
                dbField.includes('Verif') || dbField.includes('VAT') || 
                dbField.includes('Person') || dbField.includes('Invoice') ||
                dbField === 'automaticPO' || dbField === 'deletionFlag' ||
                dbField === 'postingBlock' || dbField === 'purchasingBlock' ||
                dbField === 'checkDoubleInvoice' || dbField === 'grBasedInvVerif' ||
                dbField === 'liableForVAT' || dbField === 'naturalPerson' ||
                dbField === 'itemPaymentBlock' || dbField === 'paymentBlock') {
              const boolVal = toBoolean(rowData[excelField])
              if (boolVal !== null) {
                masterData[dbField] = boolVal
              }
            }
            // Handle date fields
            else if (dbField === 'createdOn') {
              if (rowData[excelField]) {
                const date = new Date(rowData[excelField])
                if (!isNaN(date.getTime())) {
                  masterData[dbField] = date
                }
              }
            }
            // Handle string fields
            else {
              masterData[dbField] = cleanValue(rowData[excelField])
            }
          }
        }

        // Upsert master data
        const existing = await prisma.vendorMaster.findUnique({
          where: { supplierCode }
        })

        if (existing) {
          await prisma.vendorMaster.update({
            where: { supplierCode },
            data: masterData
          })
          summary.updated++
          console.log(`🔄 Updated master data for: ${supplierCode}`)
        } else {
          await prisma.vendorMaster.create({
            data: masterData
          })
          summary.created++
          console.log(`✅ Created master data for: ${supplierCode}`)
        }

      } catch (err: any) {
        console.error(`Error processing row ${i + 2}:`, err)
        summary.errors.push(`Row ${i + 2}: ${err.message}`)
      }
    }

    // Clean up uploaded file
    try {
      fs.unlinkSync(filePath)
      console.log('✅ Cleaned up file:', filePath)
    } catch (err) {
      console.log('Could not delete temp file:', err)
    }

    console.log('📊 Master Upload Summary:', summary)
    res.json({
      success: true,
      data: summary
    })

  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Upload failed: ' + (error as Error).message })
  }
})

export default router
