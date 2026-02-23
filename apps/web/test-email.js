const nodemailer = require('nodemailer');

async function testEmail() {
  // Create test account
  const testAccount = await nodemailer.createTestAccount();
  console.log('Test account created:', testAccount.user);

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });

  // Send test email
  const info = await transporter.sendMail({
    from: '"Test" <test@example.com>',
    to: 'test@example.com',
    subject: 'Hello from VendorFlow',
    text: 'This is a test email',
    html: '<b>This is a test email</b>'
  });

  console.log('✅ Email sent!');
  console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
}

testEmail().catch(console.error);
