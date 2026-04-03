import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import XLSX from 'xlsx'
import { authMiddleware } from '../../middleware/auth.middleware'

const router = Router()

const uploadDir = path.join(__dirname, '../../../uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'master-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

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

router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    console.log('📤 Vendor Master Upload')
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const workbook = XLSX.readFile(req.file.path)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]
    
    if (data.length < 2) throw new Error('No data rows')
    
    const headers = data[0]
    const rows = data.slice(1)
    const summary = { totalRows: rows.length, created: 0, updated: 0, errors: [] as string[] }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      if (!row || !row[0]) continue

      try {
        const rowData: any = {}
        headers.forEach((h, idx) => { if (h && row[idx] !== undefined) rowData[h] = row[idx] })

        const supplierCode = cleanValue(rowData['Supplier Code'])
        const supplierName = cleanValue(rowData['Supplier Name'])

        if (!supplierCode || !supplierName) {
          summary.errors.push(`Row ${i + 2}: Missing Supplier Code or Name`)
          continue
        }

        let vendor = await prisma.vendors.findUnique({ where: { supplierCode } })

        if (!vendor) {
          vendor = await prisma.vendors.create({
            data: {
              supplierCode,
              supplierName,
              email: cleanValue(rowData['E-Mail Address']) || `${supplierCode.toLowerCase()}@vendorflow.com`,
              status: 'active'
            }
          })
          summary.created++
        }

        const masterData: any = { supplierCode, supplierName }

        const fieldMappings: Record<string, string> = {
          'Company Code': 'companyCode', 'Supplier Acct Group': 'supplierAcctGroup',
          'Country/Region Name': 'countryName', 'City': 'city', 'Bank Name': 'bankName',
          'Bank Account': 'bankAccount', 'Tax Number': 'taxNumber', 'Posting Block': 'postingBlock',
          'Purchasing Block': 'purchasingBlock', 'Payment Methods': 'paymentMethods',
          'Deletion Flag': 'deletionFlag', 'Created By': 'createdBy', 'Account Holder': 'accountHolder',
          'Accounting Clerk': 'accountingClerk', 'Accounting Clerk Tel': 'accountingClerkTel',
          'Address': 'address', 'Alternative Payee': 'alternativePayee',
          'Alternative Payee CC': 'alternativePayeeCC', 'Authorization': 'authorization',
          'Automatic PO': 'automaticPO', 'Bank Control Key': 'bankControlKey',
          'Bank Country/Region': 'bankCountry', 'Bank Key': 'bankKey', 'BP Bank Account': 'bpBankAccount',
          'BP PO Box Dvtg City': 'bpPOBoxDvtgCity', 'BP Type': 'bpType', 'Branch Code': 'branchCode',
          'Branch Description': 'branchDescription', 'Business Partner': 'businessPartner',
          'Check Double Invoice': 'checkDoubleInvoice', 'Clerk Fax No': 'clerkFaxNo',
          'Country/Region Key': 'countryKey', 'Created On': 'createdOn', 'Default Branch': 'defaultBranch',
          'E-Mail Address': 'email', 'Fax Number': 'faxNumber', 'GR-Based Inv. Verif.': 'grBasedInvVerif',
          'IBAN': 'iban', 'Incoterms': 'incoterms', 'Incoterms (Part 2)': 'incotermsPart2',
          'Internet Add.': 'internetAdd', 'Item Payment Block': 'itemPaymentBlock',
          'Liable for VAT': 'liableForVAT', 'Minority Indicator': 'minorityIndicator',
          'Natural Person': 'naturalPerson', 'Order Currency': 'orderCurrency',
          'Payment Block': 'paymentBlock', 'Planning Group': 'planningGroup', 'Postal Code': 'postalCode',
          'Previous Account No.': 'previousAccountNo', 'Purch. Organization': 'purchOrganization',
          'Purchasing Group': 'purchasingGroup', 'Recon. Account': 'reconAccount',
          'Reference Details': 'referenceDetails', 'Region': 'region', 'Release Group': 'releaseGroup',
          'Search Term 1': 'searchTerm1', 'Search Term 2': 'searchTerm2', 'Sort key': 'sortKey',
          'Street': 'street', 'Street 2': 'street2', 'Street 3': 'street3', 'Street 4': 'street4',
          'Street 5': 'street5', 'Supplier Full Name': 'supplierFullName', 'SWIFT / BIC': 'swiftBic',
          'Tax Number 1': 'taxNumber1', 'Tax Number 2': 'taxNumber2', 'Tax Number 3': 'taxNumber3',
          'Tax Number 4': 'taxNumber4', 'Tax Number 5': 'taxNumber5',
          'Tax Number at Auth.': 'taxNumberAtAuth', 'Tax Number Category': 'taxNumberCategory',
          'Tax Number Type': 'taxNumberType', 'Tax Type': 'taxType', 'Tax Type Name': 'taxTypeName',
          'Telephone 1': 'telephone1', 'Telephone 2': 'telephone2',
          'Terms of Payts Key CoCode': 'termsOfPaytsKeyCoCode', 'Terms Of Payts Key PO': 'termsOfPaytsKeyPO',
          'Trading Partner No.': 'tradingPartnerNo', 'WTax C/R Key': 'wTaxCRKey'
        }

        for (const [excelField, dbField] of Object.entries(fieldMappings)) {
          if (rowData[excelField] !== undefined && rowData[excelField] !== '') {
            if (dbField.includes('Block') || dbField.includes('Flag') || dbField.includes('Verif') ||
                dbField.includes('VAT') || dbField.includes('Person') || dbField.includes('Invoice') ||
                dbField === 'automaticPO' || dbField === 'deletionFlag' || dbField === 'postingBlock' ||
                dbField === 'purchasingBlock' || dbField === 'checkDoubleInvoice' ||
                dbField === 'grBasedInvVerif' || dbField === 'liableForVAT' ||
                dbField === 'naturalPerson' || dbField === 'itemPaymentBlock' || dbField === 'paymentBlock') {
              const boolVal = toBoolean(rowData[excelField])
              if (boolVal !== null) masterData[dbField] = boolVal
            } else if (dbField === 'createdOn') {
              if (rowData[excelField]) {
                const date = new Date(rowData[excelField])
                if (!isNaN(date.getTime())) masterData[dbField] = date
              }
            } else {
              masterData[dbField] = cleanValue(rowData[excelField])
            }
          }
        }

        const existing = await prisma.vendorMaster.findUnique({ where: { supplierCode } })
        
        if (existing) {
          await prisma.vendorMaster.update({ where: { supplierCode }, data: masterData })
          summary.updated++
        } else {
          await prisma.vendorMaster.create({ data: masterData })
          summary.created++
        }

      } catch (err: any) {
        summary.errors.push(`Row ${i + 2}: ${err.message}`)
      }
    }

    fs.unlinkSync(req.file.path)
    res.json({ success: true, data: summary })

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Upload failed' })
  }
})

export default router
