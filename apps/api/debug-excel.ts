import * as XLSX from 'xlsx'
import * as path from 'path'
import * as fs from 'fs'

// This will check the most recently uploaded file
const uploadDir = path.join(__dirname, 'uploads')
const files = fs.readdirSync(uploadDir)
  .filter(f => f.startsWith('file-'))
  .sort()
  .reverse();

if (files.length === 0) {
  console.log('No uploaded files found');
  process.exit(1);
}

const latestFile = files[0];
const filePath = path.join(uploadDir, latestFile);

console.log('📂 Checking file:', latestFile);
console.log('Full path:', filePath);

try {
  // Read the Excel file
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  console.log('📊 Sheet name:', sheetName);
  
  const worksheet = workbook.Sheets[sheetName];
  
  // Get data as array of arrays
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
