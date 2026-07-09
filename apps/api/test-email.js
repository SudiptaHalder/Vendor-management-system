const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  console.log('📧 Testing Email Configuration...');
  console.log('SMTP Host:', process.env.SMTP_HOST || process.env.EMAIL_HOST);
  console.log('SMTP Port:', process.env.SMTP_PORT || process.env.EMAIL_PORT);
  console.log('Email User:', process.env.SMTP_USER || process.env.EMAIL_USER);
  console.log('From Email:', process.env.FROM_EMAIL || process.env.EMAIL_FROM);
  console.log('---');

  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587');

  if (!user || !pass) {
    console.error('❌ Email credentials missing in .env');
    console.log('Please set:');
    console.log('SMTP_USER=your.email@gmail.com');
    console.log('SMTP_PASS=your_app_password');
    return;
  }

  console.log('Creating transporter with:');
  console.log(`  Host: ${host}`);
  console.log(`  Port: ${port}`);
  console.log(`  User: ${user}`);
  console.log(`  Password: ${'*'.repeat(pass.length)}`);

  const transporter = nodemailer.createTransport({
    host: host,
    port: port,
    secure: port === 465,
    auth: {
      user: user,
      pass: pass,
    },
    debug: true,
  });

  try {
    console.log('\n🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified!');

    const fromEmail = process.env.FROM_EMAIL || process.env.EMAIL_FROM || user;
    const toEmail = user; // Send to yourself

    console.log(`\n📤 Sending test email to: ${toEmail}`);
    console.log(`   From: ${fromEmail}`);

    const info = await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      subject: '✅ Test Email from Vendor Management System',
      html: `
        <h1>✅ Email Configuration Working!</h1>
        <p>This is a test email from your Vendor Management System.</p>
        <p>If you received this, your email configuration is working correctly!</p>
        <hr>
        <p><strong>Configuration:</strong></p>
        <ul>
          <li>Host: ${host}</li>
          <li>Port: ${port}</li>
          <li>User: ${user}</li>
          <li>From: ${fromEmail}</li>
        </ul>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `,
      text: `Test Email from Vendor Management System\n\nIf you received this, your email configuration is working!\n\nConfiguration:\nHost: ${host}\nPort: ${port}\nUser: ${user}\nFrom: ${fromEmail}\n\nTimestamp: ${new Date().toISOString()}`,
    });

    console.log('\n✅✅✅ EMAIL SENT SUCCESSFULLY!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    console.log(`\n📧 Please check your inbox at: ${toEmail}`);
    console.log('💡 If you don\'t see it, check your Spam/Junk folder.');
  } catch (error) {
    console.error('\n❌ Email test failed:');
    console.error('Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('\n💡 AUTHENTICATION FAILED!');
      console.error('For Gmail, you MUST use an App Password:');
      console.error('1. Go to: https://myaccount.google.com/apppasswords');
      console.error('2. Sign in with your Gmail');
      console.error('3. Select "Mail" as the app');
      console.error('4. Select "Mac" as the device');
      console.error('5. Click "Generate"');
      console.error('6. Copy the 16-character password');
      console.error('7. Update SMTP_PASS in .env');
    } else if (error.code === 'ECONNECTION') {
      console.error('\n💡 CONNECTION FAILED!');
      console.error('Check your internet connection and firewall.');
    }
  }
}

testEmail();
