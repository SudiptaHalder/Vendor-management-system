const axios = require('axios');
require('dotenv').config();

const baseURL = process.env.SAP_BASE_URL;
const username = process.env.SAP_USERNAME;

console.log('�� Testing SAP connection...');
console.log('Username:', username);
console.log('Base URL:', baseURL);
console.log('Current password from .env exists:', !!process.env.SAP_PASSWORD);
console.log('Password length:', process.env.SAP_PASSWORD?.length || 0);

// Try the current password
async function testCurrentPassword() {
  try {
    console.log('\n📤 Testing with current password...');
    const response = await axios.get(
      '/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner',
      {
        baseURL: baseURL,
        auth: { 
          username: username, 
          password: process.env.SAP_PASSWORD 
        },
        params: { '$format': 'json', '$top': 1 },
        headers: {
          'sap-client': process.env.SAP_CLIENT || '100',
          'sap-language': process.env.SAP_LANGUAGE || 'EN'
        },
        timeout: 10000
      }
    );
    console.log('✅✅✅ SUCCESS! Current password works!');
    console.log('Status:', response.status);
    console.log('Has data:', !!response.data);
  } catch (err) {
    console.log('❌ Failed with current password');
    console.log('Status:', err.response?.status);
    console.log('Message:', err.message);
    
    // Try with double backslash
    try {
      console.log('\n📤 Testing with double backslash...');
      const password2 = 'C%YMljF=]hhNowQ2%]aC\\\\RyEq6SFCl=hT)]Gimu&';
      const response2 = await axios.get(
        '/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner',
        {
          baseURL: baseURL,
          auth: { username, password: password2 },
          params: { '$format': 'json', '$top': 1 },
          headers: {
            'sap-client': process.env.SAP_CLIENT || '100',
            'sap-language': process.env.SAP_LANGUAGE || 'EN'
          },
          timeout: 10000
        }
      );
      console.log('✅✅✅ SUCCESS! Double backslash works!');
      console.log('Status:', response2.status);
      console.log('\n📝 Use this password in .env:');
      console.log('SAP_PASSWORD=' + password2);
    } catch (err2) {
      console.log('❌ Failed with double backslash');
      console.log('Status:', err2.response?.status);
      
      // Try URL encoded
      try {
        console.log('\n📤 Testing with URL encoded...');
        const password3 = 'C%25YMljF%3D%5DhhNowQ2%25%5DaCRyEq6SFCl%3DhT)%5DGimu%26';
        const response3 = await axios.get(
          '/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner',
          {
            baseURL: baseURL,
            auth: { username, password: password3 },
            params: { '$format': 'json', '$top': 1 },
            headers: {
              'sap-client': process.env.SAP_CLIENT || '100',
              'sap-language': process.env.SAP_LANGUAGE || 'EN'
            },
            timeout: 10000
          }
        );
        console.log('✅✅✅ SUCCESS! URL encoded works!');
        console.log('Status:', response3.status);
        console.log('\n📝 Use this password in .env:');
        console.log('SAP_PASSWORD=' + password3);
      } catch (err3) {
        console.log('❌ Failed with URL encoded');
        console.log('Status:', err3.response?.status);
        
        console.log('\n❌ All password formats failed.');
        console.log('💡 The password might be incorrect or expired.');
        console.log('   Please verify with your SAP administrator.');
        console.log('   Or check if the user VMS_USER is locked.');
      }
    }
  }
}

testCurrentPassword();
