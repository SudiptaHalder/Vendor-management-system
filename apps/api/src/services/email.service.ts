// import nodemailer from 'nodemailer';
// import { Transporter } from 'nodemailer';

// interface EmailOptions {
//   to: string | string[];
//   subject: string;
//   html: string;
//   text?: string;
//   from?: string;
//   cc?: string | string[];
//   bcc?: string | string[];
//   attachments?: any[];
// }

// class EmailService {
//   private transporter: Transporter | null = null;
//   private fromEmail: string;

//   constructor() {
//     this.fromEmail = process.env.EMAIL_FROM || process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@example.com';
//     this.initTransporter();
//   }

//   private initTransporter() {
//     const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
//     const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587');
//     const user = process.env.SMTP_USER || process.env.EMAIL_USER;
//     const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

//     if (!host || !user || !pass) {
//       console.warn('⚠️ Email credentials not configured. Emails will not be sent.');
//       console.warn('   Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env');
//       return;
//     }

//     console.log(`📧 Initializing Email Service...`);
//     console.log(`📧 Using SMTP: ${host}:${port}`);
//     console.log(`📧 Email User: ${user}`);

//     this.transporter = nodemailer.createTransport({
//       host: host,
//       port: port,
//       secure: port === 465,
//       auth: {
//         user: user,
//         pass: pass,
//       },
//       tls: {
//         rejectUnauthorized: false,
//       },
//       debug: process.env.NODE_ENV === 'development',
//     });

//     // Verify connection
//     this.transporter.verify((error) => {
//       if (error) {
//         console.error('❌ Email SMTP connection failed:', error.message);
//       } else {
//         console.log('✅ Email SMTP connection verified successfully');
//       }
//     });
//   }

//   async sendEmail(options: EmailOptions): Promise<any> {
//     if (!this.transporter) {
//       console.error('❌ Email transporter not initialized');
//       throw new Error('Email service not configured');
//     }

//     const from = options.from || this.fromEmail;

//     console.log(`📧 Sending email to: ${options.to}`);
//     console.log(`   Subject: ${options.subject}`);
//     console.log(`   From: ${from}`);

//     try {
//       const mailOptions = {
//         from: from,
//         to: options.to,
//         subject: options.subject,
//         html: options.html,
//         text: options.text || options.html.replace(/<[^>]*>/g, ''),
//         cc: options.cc,
//         bcc: options.bcc,
//         attachments: options.attachments,
//       };

//       const info = await this.transporter.sendMail(mailOptions);
//       console.log(`✅ Email sent successfully! Message ID: ${info.messageId}`);
//       return info;
//     } catch (error: any) {
//       console.error('❌ Failed to send email:', error.message);
//       throw error;
//     }
//   }

//   async sendVendorInvitation(
//     email: string,
//     vendorName: string,
//     vendorCode: string,
//     invitationLink: string
//   ): Promise<void> {
//     const html = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Vendor Portal Invitation</title>
//         <style>
//           body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
//           .header { background: #1a56db; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
//           .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
//           .button { display: inline-block; background: #1a56db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
//           .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
//           .code { background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-family: monospace; }
//         </style>
//       </head>
//       <body>
//         <div class="header">
//           <h1>Vendor Portal Invitation</h1>
//         </div>
//         <div class="content">
//           <p>Dear <strong>${vendorName}</strong>,</p>
//           <p>You have been invited to join the Vendor Management Portal.</p>
//           <p><strong>Vendor Code:</strong> <span class="code">${vendorCode}</span></p>
//           <p>Click the button below to set up your account:</p>
//           <p style="text-align: center;">
//             <a href="${invitationLink}" class="button">Accept Invitation</a>
//           </p>
//           <p style="font-size: 14px; color: #6b7280;">
//             Or copy and paste this link into your browser:<br>
//             <span style="word-break: break-all;">${invitationLink}</span>
//           </p>
//           <p style="font-size: 14px; color: #6b7280;">
//             This invitation will expire in <strong>7 days</strong>.
//           </p>
//           <p style="font-size: 14px; margin-top: 20px;">
//             If you did not request this invitation, please ignore this email.
//           </p>
//         </div>
//         <div class="footer">
//           <p>&copy; ${new Date().getFullYear()} Vendor Management System. All rights reserved.</p>
//           <p>This is an automated message, please do not reply to this email.</p>
//         </div>
//       </body>
//       </html>
//     `;

//     const text = `
//       Vendor Portal Invitation

//       Dear ${vendorName},

//       You have been invited to join the Vendor Management Portal.
//       Vendor Code: ${vendorCode}

//       Click the link below to set up your account:
//       ${invitationLink}

//       This invitation will expire in 7 days.

//       If you did not request this invitation, please ignore this email.

//       ---
//       ${new Date().getFullYear()} Vendor Management System
//     `;

//     await this.sendEmail({
//       to: email,
//       subject: `Vendor Portal Invitation - ${vendorName}`,
//       html,
//       text,
//     });
//   }

//   async sendPasswordReset(email: string, resetLink: string): Promise<void> {
//     const html = `
//       <h1>Password Reset Request</h1>
//       <p>You requested to reset your password. Click the link below to reset it:</p>
//       <a href="${resetLink}">${resetLink}</a>
//       <p>This link will expire in 1 hour.</p>
//       <p>If you did not request this, please ignore this email.</p>
//     `;

//     await this.sendEmail({
//       to: email,
//       subject: 'Password Reset Request',
//       html,
//     });
//   }

//   async sendWelcomeEmail(email: string, name: string): Promise<void> {
//     const html = `
//       <h1>Welcome to Vendor Portal!</h1>
//       <p>Dear ${name},</p>
//       <p>Your account has been created successfully. You can now log in to the vendor portal.</p>
//       <p>If you have any questions, please contact support.</p>
//     `;

//     await this.sendEmail({
//       to: email,
//       subject: 'Welcome to Vendor Portal',
//       html,
//     });
//   }
// }

// // Export singleton instance
// export const emailService = new EmailService();
// export default emailService;

import nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: any[];
}

class EmailService {
  private transporter: Transporter | null = null;
  private fromEmail: string;
  private isInitialized: boolean = false;

  constructor() {
    this.fromEmail = process.env.EMAIL_FROM || process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@example.com';
    this.initTransporter();
  }

  private initTransporter() {
    const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
    const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587');
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

    if (!host || !user || !pass) {
      console.warn('⚠️ Email credentials not configured. Emails will not be sent.');
      console.warn('   Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env');
      return;
    }

    console.log(`📧 Initializing Email Service...`);
    console.log(`📧 Using SMTP: ${host}:${port}`);
    console.log(`📧 Email User: ${user}`);
    console.log(`📧 From Email: ${this.fromEmail}`);

    this.transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: port === 465,
      auth: {
        user: user,
        pass: pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
      debug: process.env.NODE_ENV === 'development',
    });

    // Verify connection
    this.transporter.verify((error) => {
      if (error) {
        console.error('❌ Email SMTP connection failed:', error.message);
        this.isInitialized = false;
      } else {
        console.log('✅ Email SMTP connection verified successfully');
        this.isInitialized = true;
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<any> {
    if (!this.transporter || !this.isInitialized) {
      console.error('❌ Email transporter not initialized');
      throw new Error('Email service not configured or connection failed');
    }

    const from = options.from || this.fromEmail;

    console.log(`📧 Sending email to: ${options.to}`);
    console.log(`   Subject: ${options.subject}`);
    console.log(`   From: ${from}`);

    try {
      const mailOptions = {
        from: from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html),
        cc: options.cc,
        bcc: options.bcc,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully! Message ID: ${info.messageId}`);
      
      // Log recipient count
      const recipients = Array.isArray(options.to) ? options.to.length : 1;
      console.log(`   📬 Sent to ${recipients} recipient(s)`);
      
      return info;
    } catch (error: any) {
      console.error('❌ Failed to send email:', error.message);
      
      // Check for specific errors
      if (error.code === 'EAUTH') {
        console.error('   💡 Authentication failed. Check your SMTP credentials.');
      } else if (error.code === 'ECONNECTION') {
        console.error('   💡 Connection failed. Check your internet connection and SMTP host.');
      } else if (error.code === 'ESOCKET') {
        console.error('   💡 Socket error. Check your firewall settings.');
      }
      
      throw error;
    }
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

async sendVendorInvitation(
  email: string,
  vendorName: string,
  vendorCode: string,
  invitationLink: string,
  tempPassword?: string  // Add optional password parameter
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Vendor Portal Invitation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a56db; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #1a56db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
        .code { background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-weight: bold; }
        .credentials { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin: 16px 0; }
        .credentials-label { font-weight: bold; color: #166534; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Vendor Portal Invitation</h1>
      </div>
      <div class="content">
        <p>Dear <strong>${vendorName}</strong>,</p>
        <p>You have been invited to join the Vendor Management Portal.</p>
        <p><strong>Vendor Code:</strong> <span class="code">${vendorCode}</span></p>
        
        ${tempPassword ? `
        <div class="credentials">
          <p><span class="credentials-label">🔑 Temporary Password:</span></p>
          <p style="font-size: 24px; font-weight: bold; color: #166534; letter-spacing: 2px; text-align: center;">
            ${tempPassword}
          </p>
          <p style="font-size: 12px; color: #6b7280; text-align: center; margin-top: 8px;">
            Please use this password to log in. You will be prompted to change it.
          </p>
        </div>
        ` : ''}

        <p>Click the button below to set up your account:</p>
        <p style="text-align: center;">
          <a href="${invitationLink}" class="button">Accept Invitation</a>
        </p>
        <p style="font-size: 14px; color: #6b7280;">
          Or copy and paste this link into your browser:<br>
          <span style="word-break: break-all;">${invitationLink}</span>
        </p>
        <p style="font-size: 14px; color: #6b7280;">
          This invitation will expire in <strong>7 days</strong>.
        </p>
        ${tempPassword ? `
        <p style="font-size: 14px; color: #6b7280; margin-top: 16px;">
          <strong>Security Tip:</strong> For security reasons, please change your password after first login.
        </p>
        ` : ''}
        <p style="font-size: 14px; margin-top: 20px;">
          If you did not request this invitation, please ignore this email.
        </p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Vendor Management System. All rights reserved.</p>
        <p>This is an automated message, please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Vendor Portal Invitation

    Dear ${vendorName},

    You have been invited to join the Vendor Management Portal.
    Vendor Code: ${vendorCode}

    ${tempPassword ? `
    🔑 Temporary Password: ${tempPassword}
    Please use this password to log in. You will be prompted to change it.
    ` : ''}

    Click the link below to set up your account:
    ${invitationLink}

    This invitation will expire in 7 days.

    ${tempPassword ? 'For security reasons, please change your password after first login.' : ''}

    If you did not request this invitation, please ignore this email.

    ---
    ${new Date().getFullYear()} Vendor Management System
  `;

  await this.sendEmail({
    to: email,
    subject: `Vendor Portal Invitation - ${vendorName}`,
    html,
    text,
  });
}

  async sendPasswordReset(email: string, resetLink: string): Promise<void> {
    const html = `
      <h1>Password Reset Request</h1>
      <p>You requested to reset your password. Click the link below to reset it:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html,
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const html = `
      <h1>Welcome to Vendor Portal!</h1>
      <p>Dear ${name},</p>
      <p>Your account has been created successfully. You can now log in to the vendor portal.</p>
      <p>If you have any questions, please contact support.</p>
      <p>Best regards,<br>Vendor Management Team</p>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Welcome to Vendor Portal',
      html,
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;
