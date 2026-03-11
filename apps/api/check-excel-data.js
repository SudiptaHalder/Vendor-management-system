const XLSX = require('xlsx')
const path = require('path')
const fs = require('fs')

const uploadDir = path.join(__dirname, 'uploads')
const files = fs.readdirSync(uploadDir).filter(f => f.endsWith('.xlsx'))

if (files.length === 0) {
  console.log('❌ No Excel files found')
  process.exit(1)
}

const latestFile = files.sort().reverse()[0]
const filePath = path.join(uploadDir, latestFile)

console.log('📂 Checking file:', latestFile)

const workbook = XLSX.readFile(filePath)
const sheetName = workbook.SheetNames[0]
const worksheet = workbook.Sheets[sheetName]

const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

console.log(`Total rows: ${data.length}`)
console.log('Headers:', data[0])

// Check for PO 1700001959
for (let i = 1; i < data.length; i++) {
  const row = data[i]
  if (row[3] === '1700001959') { // PO No. column
    console.log(`\n🔍 Found PO 1700001959 at row ${i + 1}:`)
    console.log(`  PO No.: ${row[3]}`)
    console.log(`  Material Code: ${row[7]}`)
    console.log(`  Rate: ${row[11]}`)
    console.log(`  Quantity: ${row[12]}`)
  }
}
