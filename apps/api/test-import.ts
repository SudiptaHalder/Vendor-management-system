import { prisma } from '@vendor-management/database'

async function test() {
  console.log('🔍 Testing database import...')
  try {
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Import successful! Database connected:', result)
    return true
  } catch (error) {
    console.error('❌ Import failed:', error)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

test()
  .then(success => {
    if (success) {
      console.log('🎉 Database package is working correctly!')
      process.exit(0)
    } else {
      console.log('💥 Database package is NOT working!')
      process.exit(1)
    }
  })
