import * as XLSX from 'xlsx'
import * as path from 'path'
import * as fs from 'fs'

// This will test the parsing logic
const uploadDir = path.join(__dirname, 'uploads');
const files = fs.readdirSync(uploadDir).filter(f => f.endsWith('.xlsx'));

if (files.length === 0) {
  console.log('No Excel files found');
  process.exit(1);
}

console.log('📊 Excel files found:', files);

const latestFile = files.sort().reverse()[0];
const filePath = path.join(uploadDir, latestFile);

console.log('Testing file:', latestFile);
console.log('Full path:', filePath);

try {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  console.log('Sheet name:', sheetName);
  
  const worksheet = workbook.Sheets[sheetName];
  
  // Get data as array of arrays
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
  
  console.log(`Total rows in file: ${data.length}`);
  
  if (data.length < 2) {
    console.log('❌ Not enough rows (need at least header + 1 data row)');
    process.exit(1);
  }
  
  // First row is headers
  const headers = data[0];
  console.log('\n📋 Headers (row 1):');
  headers.forEach((h: any, i: number) => {
    if (h) console.log(`  [${i}]: "${h}"`);
  });
  
  // Count non-empty rows after header
  let dataRows = 0;
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    // Check if row has any non-empty value
    const hasData = row.some(cell => 
      cell !== null && 
      cell !== undefined && 
      cell !== '' && 
      cell !== ' '
    );
    if (hasData) {
      dataRows++;
      if (dataRows === 1) {
        console.log('\n📝 First data row (row 2):');
        headers.forEach((header: any, idx: number) => {
          if (header) {
            const value = row[idx];
            console.log(`  ${header}: "${value}" (type: ${typeof value})`);
          }
        });
      }
    }
  }
  
  console.log(`\n✅ Total data rows with content: ${dataRows}`);
  
} catch (error) {
  console.error('Error reading Excel:', error);
}
