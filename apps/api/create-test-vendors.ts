import { prisma } from '@vendor-management/database'

async function createTestVendors() {
  try {
    console.log('Creating test vendors with pending status...')

    const vendors = [
      {
        name: 'ABC Construction Supplies',
        email: 'contact@abcconstruction.com',
        phone: '555-123-4567',
        contactPerson: 'John Builder',
        status: 'pending'
      },
      {
        name: 'Tech Solutions Inc',
        email: 'info@techsolutions.com',
        phone: '555-987-6543',
        contactPerson: 'Sarah Tech',
        status: 'pending'
      },
      {
        name: 'Office Essentials Co',
        email: 'orders@officeessentials.com',
        phone: '555-456-7890',
        contactPerson: 'Mike Office',
        status: 'pending'
      }
    ]

    for (const vendor of vendors) {
      const created = await prisma.vendors.create({
        data: {
          ...vendor,
          companyId: null
        }
      })
      console.log(`✅ Created: ${created.name} (${created.id})`)
    }

    console.log('\n🎉 Test vendors created successfully!')
  } catch (error) {
    console.error('Error creating test vendors:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestVendors()
