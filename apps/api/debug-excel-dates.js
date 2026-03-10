const XLSX = require('xlsx')
const path = require('path')
const fs = require('fs')

// Find the most recent Excel file
const uploadDir = path.join(__dirname, 'uploads')
const files = fs.readdirSync(uploadDir).filter(f => f.endsWith('.xlsx'))

if (files.length === 0) {
  console.log('No Excel files found')
  process.exit(1)
}

const latestFile = files.sort().reverse()[0]
const filePath = path.join(uploadDir, latestFile)

console.log('📂 Checking file:', latestFile)

const workbook = XLSX.readFile(filePath)
const sheetName = workbook.SheetNames[0]
const worksheet = workbook.Sheets[sheetName]

// Get data as array of arrays
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

console.log(`\nTotal rows: ${data.length}`)

// Headers
const headers = data[0]
console.log('\nHeaders:', headers)

// Check first 5 data rows for dates
console.log('\n📅 First 5 rows date values:')
for (let i = 1; i < Math.min(6, data.length); i++) {
  const row = data[i]
  console.log(`\nRow ${i + 1}:`)
  console.log(`  PO No.: ${row[3]}`) // PO No. column
  console.log(`  PO Creat. Date: ${row[4]} (${typeof row[4]})`)
  console.log(`  PO Amendt. Date: ${row[5]} (${typeof row[5]})`)
}

// Also check if any dates exist at all
console.log('\n📊 Date Statistics:')
let dateCount = 0
let totalRows = data.length - 1

for (let i = 1; i < data.length; i++) {
  if (data[i][4]) dateCount++
}

console.log(`Rows with PO Create Date: ${dateCount} out of ${totalRows}`)
