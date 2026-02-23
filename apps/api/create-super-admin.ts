import { prisma } from '@vendor-management/database'
import bcrypt from 'bcrypt'

async function createSuperAdmin() {
  try {
    console.log('🚀 Creating super admin user...')
    
    // Check if super admin already exists
    const existing = await prisma.users.findUnique({
      where: { email: 'superadmin@vendorflow.com' }
    })

    if (existing) {
      console.log('✅ Super admin already exists:')
      console.log('📧 Email:', existing.email)
      console.log('👤 Name:', existing.name)
      console.log('🆔 ID:', existing.id)
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Admin@123', 10)

    // Create super admin user
    const superAdmin = await prisma.users.create({
      data: {
        email: 'superadmin@vendorflow.com',
        password: hashedPassword,
        name: 'Super Admin',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'super_admin',
        isActive: true,
        emailVerified: new Date(),
        companyId: null,
        notificationSettings: {
          email: true,
          push: true,
          inApp: true
        }
      }
    })

    console.log('\n✅ SUPER ADMIN CREATED SUCCESSFULLY!')
    console.log('=================================')
    console.log('📧 Email:    superadmin@vendorflow.com')
    console.log('🔑 Password: Admin@123')
    console.log('🆔 ID:      ', superAdmin.id)
    console.log('👤 Role:     super_admin')
    console.log('=================================\n')

  } catch (error) {
    console.error('❌ Error creating super admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSuperAdmin()
