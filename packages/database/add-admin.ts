import { prisma } from '@vendor-management/database'
import bcrypt from 'bcrypt'

async function addAdmin() {
  const hashedPassword = await bcrypt.hash('Admin@123', 10)
  
  const admin = await prisma.users.create({
    data: {
      email: 'superadmin@vendorflow.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'super_admin',
      isActive: true
    }
  })
  
  console.log('✅ Admin created:')
  console.log('📧 Email:', admin.email)
  console.log('🔑 Password: Admin@123')
}

addAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
