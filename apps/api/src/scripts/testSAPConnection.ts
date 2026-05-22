// apps/api/src/scripts/testSAPConnection.ts

import { SAPAuth } from '../services/sap/sapAuth';

async function testSAPConnection() {
  console.log('Testing SAP Connection...');
  
  const sapAuth = SAPAuth.getInstance();
  const isConnected = await sapAuth.testConnection();
  
  if (isConnected) {
    console.log('✓ SAP connection successful');
  } else {
    console.log('✗ SAP connection failed');
    console.log('Please check your credentials in .env file');
  }
  
  process.exit(0);
}

testSAPConnection();