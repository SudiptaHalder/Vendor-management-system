import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const admin = await prisma.users.findUnique({
    where: { email: 'superadmin@vendorflow.com' }
  })

  if (admin) {
    console.log('✅ Superadmin found!')
    console.log('ID:', admin.id)
    console.log('Email:', admin.email)
    console.log('Name:', admin.name)
    console.log('Role:', admin.role)
    console.log('Password hash:', admin.password)
    console.log('Password length:', admin.password?.length)
    
    // Test password
    const isValid = await bcrypt.compare('Admin@123', admin.password || '')
    console.log('Password valid:', isValid)
    
    // If invalid, generate new hash
    if (!isValid) {
      const newHash = await bcrypt.hash('Admin@123', 10)
      console.log('New hash would be:', newHash)
    }
  } else {
    console.log('❌ Superadmin NOT found!')
    
    // List all users
    const users = await prisma.users.findMany({
      select: { email: true }
    })
    console.log('Available users:', users)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
