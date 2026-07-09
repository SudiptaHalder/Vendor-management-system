const nodemailer = require('nodemailer');
require('dotenv').config();

async function testSMTP() {
  console.log('📧 Testing SMTP Configuration...');
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_PORT:', process.env.SMTP_PORT);
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_PASS exists:', !!process.env.SMTP_PASS);
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
  console.log('---');

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.verify();
    console.log('✅ SMTP Connection Verified!');
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: '✅ SMTP Test - Vendor Management',
      html: '<h1>✅ SMTP is Working!</h1><p>Your email configuration is correct.</p><p>Timestamp: ' + new Date().toISOString() + '</p>',
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('📧 Check your inbox at:', process.env.SMTP_USER);
  } catch (err) {
    console.error('❌ SMTP Test Failed:');
    console.error('Error:', err.message);
    if (err.code === 'EAUTH') {
      console.error('\n💡 Authentication failed!');
      console.error('Make sure you\'re using an App Password, not your regular Gmail password.');
      console.error('Generate one at: https://myaccount.google.com/apppasswords');
    }
  }
}

testSMTP();
