import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    // Configure for development (use ethereal for testing)
    if (process.env.NODE_ENV === 'development') {
      // Create test account on ethereal.email
      nodemailer.createTestAccount().then(account => {
        this.transporter = nodemailer.createTransport({
          host: account.smtp.host,
          port: account.smtp.port,
          secure: account.smtp.secure,
          auth: {
            user: account.user,
            pass: account.pass
          }
        })
        console.log('📧 Email service configured with Ethereal')
      })
    } else {
      // Production email configuration
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      })
    }
  }

  async sendDemoRequestConfirmation(data: {
    email: string
    name: string
    company: string
    requestNumber: string
  }) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563eb, #1e40af); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">VendorFlow</h1>
          <p style="color: #e0e7ff; margin: 10px 0 0;">Demo Request Received</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #111827; margin-top: 0;">Hello ${data.name},</h2>
          
          <p style="color: #4b5563; line-height: 1.6;">
            Thank you for your interest in VendorFlow! We've received your demo request and our team will contact you within 24 hours to schedule a personalized walkthrough.
          </p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #111827; margin-top: 0; margin-bottom: 15px;">Request Summary</h3>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Request #:</strong> ${data.requestNumber}</p>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Company:</strong> ${data.company}</p>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Status:</strong> Pending Review</p>
          </div>
          
          <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #0369a1; margin-top: 0; margin-bottom: 10px;">What's Next?</h3>
            <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Our team will review your request</li>
              <li style="margin-bottom: 8px;">We'll contact you to schedule a 30-min demo</li>
              <li style="margin-bottom: 8px;">You'll get a personalized walkthrough of features relevant to your business</li>
            </ul>
          </div>
          
          <p style="color: #4b5563; line-height: 1.6;">
            In the meantime, feel free to explore our website or check out our blog for tips on vendor management.
          </p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 14px; margin: 0;">
              © ${new Date().getFullYear()} VendorFlow. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `

    return this.sendEmail({
      to: data.email,
      subject: `Demo Request Received - VendorFlow (${data.requestNumber})`,
      html
    })
  }

  async sendDemoRequestNotification(data: {
    requestNumber: string
    name: string
    email: string
    company: string
    phone?: string
    companySize?: string
    interests: string[]
    preferredDate?: Date
    preferredTime?: string
  }) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #111827;">New Demo Request</h2>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Request #:</strong> ${data.requestNumber}</p>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${data.name}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${data.email}</p>
          <p style="margin: 5px 0;"><strong>Company:</strong> ${data.company}</p>
          ${data.phone ? `<p style="margin: 5px 0;"><strong>Phone:</strong> ${data.phone}</p>` : ''}
          ${data.companySize ? `<p style="margin: 5px 0;"><strong>Company Size:</strong> ${data.companySize}</p>` : ''}
          ${data.interests.length > 0 ? `<p style="margin: 5px 0;"><strong>Interests:</strong> ${data.interests.join(', ')}</p>` : ''}
          ${data.preferredDate ? `<p style="margin: 5px 0;"><strong>Preferred Date:</strong> ${data.preferredDate.toLocaleDateString()}</p>` : ''}
          ${data.preferredTime ? `<p style="margin: 5px 0;"><strong>Preferred Time:</strong> ${data.preferredTime}</p>` : ''}
        </div>
        
        <p style="color: #4b5563;">
          <a href="${process.env.FRONTEND_URL}/admin/demo-requests/${data.requestNumber}" style="color: #2563eb;">View in Admin Panel</a>
        </p>
      </div>
    `

    return this.sendEmail({
      to: process.env.ADMIN_EMAIL || 'sales@vendorflow.com',
      subject: `New Demo Request: ${data.name} from ${data.company}`,
      html
    })
  }
private async sendEmail(options: EmailOptions) {
  try {
    const info = await this.transporter.sendMail({
      from: '"VendorFlow" <noreply@vendorflow.com>',
      ...options
    })

    // ✅ THIS WILL SHOW THE PREVIEW URL
    if (process.env.NODE_ENV === 'development') {
      const previewUrl = nodemailer.getTestMessageUrl(info)
      console.log('\n📧 ========== EMAIL SENT ==========')
      console.log(`📧 To: ${options.to}`)
      console.log(`📧 Subject: ${options.subject}`)
      console.log(`📧 Preview URL: ${previewUrl}`)
      console.log('📧 =================================\n')
    }

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}

}

export const emailService = new EmailService()