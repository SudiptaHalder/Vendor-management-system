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

const latestFile = files.sort().reverse()[0];
const filePath = path.join(uploadDir, latestFile);

console.log('Testing file:', latestFile);

try {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Use header: 1 to get raw data
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  console.log(`Total rows: ${data.length}`);
  
  if (data.length < 2) {
    console.log('Not enough rows');
    process.exit(1);
  }
  
  // First row is headers
  const headers = data[0] as string[];
  console.log('\n📋 Headers (row 1):');
  headers.forEach((h, i) => {
    if (h) console.log(`  [${i}]: "${h}"`);
  });
  
  // Data starts from row 2
  console.log('\n📝 First data row (row 2):');
  const firstRow = data[1] as any[];
  headers.forEach((header, i) => {
    if (header) {
      const value = firstRow[i];
      console.log(`  ${header}: "${value}" (type: ${typeof value})`);
    }
  });
  
  // Count total data rows
  const dataRows = data.slice(1).filter((row: any[]) => 
    row.some(cell => cell !== null && cell !== undefined && cell !== '')
  );
  
  console.log(`\n✅ Total data rows with content: ${dataRows.length}`);
  
} catch (error) {
  console.error('Error:', error);
}
