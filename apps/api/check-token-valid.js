const { prisma } = require('@vendor-management/database')
const jwt = require('jsonwebtoken')

async function main() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2ZW5kb3JJZCI6ImNtbWwwaG96MjAwMDN2MG5pMzE4OWZuemwiLCJ1c2VybmFtZSI6IjEwMDEwMyIsInR5cGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NzMyNTE4OTYsImV4cCI6MTc3Mzg1NjY5Nn0.1WUsU95NwUdgDVKx2liHJSCORc0Xmh24JsR7njxUL-I'
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key')
    console.log('✅ Token is valid')
    console.log('Decoded:', decoded)
    
    const vendor = await prisma.vendors.findUnique({
      where: { id: decoded.vendorId }
    })
    
    if (vendor) {
      console.log('✅ Vendor exists:', vendor.supplierName)
    } else {
      console.log('❌ Vendor not found for ID:', decoded.vendorId)
    }
  } catch (err) {
    console.error('❌ Token invalid:', err.message)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
