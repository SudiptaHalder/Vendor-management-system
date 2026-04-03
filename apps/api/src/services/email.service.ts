import nodemailer from 'nodemailer'

interface SendInvitationData {
  email: string
  supplierName: string
  supplierCode: string
  tempPassword: string
  invitationToken: string
}

class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    console.log('📧 Initializing Email Service...')

    // ✅ FORCE GMAIL SMTP (NO ETHEREAL)
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // smtp.gmail.com
      port: Number(process.env.SMTP_PORT), // 587
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    console.log('📧 Using SMTP:', process.env.SMTP_HOST)
    console.log('📧 Email User:', process.env.SMTP_USER)
  }

  async sendVendorInvitation(data: SendInvitationData) {
    try {
      const invitationUrl = `${process.env.FRONTEND_URL}/vendor/setup-password?token=${data.invitationToken}`

      const html = `
        <h2>Welcome to VendorFlow</h2>
        <p>Hello ${data.supplierName},</p>
        <p>You have been invited to VendorFlow portal.</p>

        <p><strong>Login Details:</strong></p>
        <ul>
          <li><b>Username:</b> ${data.supplierCode}</li>
          <li><b>Temporary Password:</b> ${data.tempPassword}</li>
        </ul>

        <p>
          <a href="${invitationUrl}" 
             style="padding:10px 20px;background:#4CAF50;color:white;text-decoration:none;">
             Setup Your Account
          </a>
        </p>

        <p>This link will expire in 7 days.</p>
      `

      const info = await this.transporter.sendMail({
        from: `"VendorFlow" <${process.env.SMTP_USER}>`,
        to: data.email,
        subject: 'Welcome to VendorFlow - Vendor Invitation',
        html,
      })

      console.log('📧 EMAIL SENT SUCCESSFULLY')
      console.log('📧 Message ID:', info.messageId)

      return { success: true }

    } catch (error: any) {
      console.error('❌ EMAIL ERROR:', error)
      return { success: false, error: error.message }
    }
  }
}

export const emailService = new EmailService()