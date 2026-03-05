import { prisma } from '@vendor-management/database'
import bcrypt from 'bcrypt'

async function createSuperAdmin() {
  try {
    console.log('🚀 Creating super admin user...')
    
    // Delete existing if any
    await prisma.users.deleteMany({
      where: { email: 'superadmin@vendorflow.com' }
    })
    
    const hashedPassword = await bcrypt.hash('Admin@123', 10)
    
    const superAdmin = await prisma.users.create({
      data: {
        email: 'superadmin@vendorflow.com',
        password: hashedPassword,
        name: 'Super Admin',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'super_admin',
        isActive: true,
        emailVerified: new Date()
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
