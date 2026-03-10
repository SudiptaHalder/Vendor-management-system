import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const email = 'superadmin@vendorflow.com'
  const password = 'Admin@123'
  
  console.log('Testing login for:', email)
  
  const user = await prisma.users.findUnique({
    where: { email }
  })
  
  if (!user) {
    console.log('❌ User not found')
    return
  }
  
  console.log('✅ User found')
  console.log('Stored password hash:', user.password)
  
  const isValid = await bcrypt.compare(password, user.password || '')
  console.log('Password comparison result:', isValid)
  
  if (isValid) {
    console.log('✅ Login would succeed!')
  } else {
    console.log('❌ Login would fail - password mismatch')
    
    // Generate correct hash for reference
    const correctHash = await bcrypt.hash(password, 10)
    console.log('Correct hash for this password:', correctHash)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
