import { prisma } from '@vendor-management/database'

async function testConnection() {
  try {
    console.log('Testing database connection...')
    
    // Test query
    const result = await prisma.$queryRaw`SELECT 1+1 as result`
    console.log('✅ Database connection successful:', result)
    
    // Check if we can access models
    const companies = await prisma.company.count()
    console.log(`✅ Prisma models accessible. Companies count: ${companies}`)
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
