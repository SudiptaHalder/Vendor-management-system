import * as XLSX from 'xlsx'
import * as path from 'path'
import * as fs from 'fs'

// Look for Excel files specifically
const uploadDir = path.join(__dirname, 'uploads');
const files = fs.readdirSync(uploadDir)
  .filter(f => f.endsWith('.xlsx') || f.endsWith('.xls'));

console.log('📊 Excel files found:', files);

if (files.length === 0) {
  console.log('No Excel files found. Looking at all files:');
  const allFiles = fs.readdirSync(uploadDir);
  console.log(allFiles);
  process.exit(1);
}

// Check the most recent Excel file
const latestExcel = files.sort().reverse()[0];
const filePath = path.join(uploadDir, latestExcel);

console.log('\n📂 Checking Excel file:', latestExcel);
console.log('Full path:', filePath);

try {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  console.log('📊 Sheet name:', sheetName);
  
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  console.log(`Total rows in file (including header): ${data.length}`);
  
  if (data.length > 0) {
    console.log('\n📋 Headers (first row):');
    const headers = data[0] as any[];
    headers.forEach((h, i) => {
      console.log(`  [${i}]: "${h}"`);
    });
    
    console.log('\n📝 First data row (row 2):');
    if (data.length > 1) {
      const firstRow = data[1] as any[];
      firstRow.forEach((cell, i) => {
        console.log(`  [${i}] "${headers[i] || 'Unknown'}": "${cell}"`);
      });
    } else {
      console.log('  No data rows found!');
    }
    
    console.log(`\nTotal data rows: ${data.length - 1}`);
  }
  
} catch (error) {
  console.error('Error reading Excel:', error);
}
