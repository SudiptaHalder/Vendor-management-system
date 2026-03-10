import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('Admin@123', 10)
  
  const admin = await prisma.users.update({
    where: { email: 'superadmin@vendorflow.com' },
    data: { password: hashedPassword }
  })

  console.log('✅ Superadmin password reset!')
  console.log('Email:', admin.email)
  console.log('New password hash:', admin.password)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
