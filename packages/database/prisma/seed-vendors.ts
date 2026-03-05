import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting vendor profile seeding...')

  // Get the super admin user
  const superAdmin = await prisma.users.findUnique({
    where: { email: 'superadmin@vendorflow.com' }
  })

  if (!superAdmin) {
    console.log('❌ Super admin not found. Please run create-super-admin.ts first.')
    return
  }

  console.log('✅ Found super admin:', superAdmin.email)

  // Get or create a default company
  let company = await prisma.companies.findFirst()
  
  if (!company) {
    company = await prisma.companies.create({
      data: {
        name: 'VendorFlow Demo Company',
        subdomain: 'democompany',
        plan: 'enterprise',
        settings: { demo: true },
        features: { all: true }
      }
    })
    console.log('✅ Created default company')
  }

  // ========================================
  // DELETE EXISTING DATA IN CORRECT ORDER
  // ========================================
  console.log('\n🗑️ Cleaning up existing data...')

  // Delete in reverse order of dependencies
  await prisma.$transaction([
    prisma.activity_logs.deleteMany(),
    prisma.notifications.deleteMany(),
    prisma.documents.deleteMany(),
    prisma.payments.deleteMany(),
    prisma.invoice_line_items.deleteMany(),
    prisma.invoices.deleteMany(),
    prisma.expenses.deleteMany(),
    prisma.budget_items.deleteMany(),
    prisma.goods_receipt_line_items.deleteMany(),
    prisma.goods_receipts.deleteMany(),
    prisma.bid_submissions.deleteMany(),
    prisma.bids.deleteMany(),
    prisma.quote_line_items.deleteMany(),
    prisma.quotes.deleteMany(),
    prisma.rfq_recipients.deleteMany(),
    prisma.rfq_line_items.deleteMany(),
    prisma.rfqs.deleteMany(),
    prisma.purchase_order_line_items.deleteMany(),
    prisma.purchase_orders.deleteMany(),
    prisma.contract_amendments.deleteMany(),
    prisma.contracts.deleteMany(),
    prisma.project_vendors.deleteMany(),
    prisma.work_orders.deleteMany(),
    prisma.resource_assignments.deleteMany(),
    prisma.resources.deleteMany(),
    prisma.schedule_items.deleteMany(),
    prisma.schedules.deleteMany(),
    prisma.projects.deleteMany(),
    prisma.vendor_ratings.deleteMany(),
    prisma.vendor_portal_access.deleteMany(),
    prisma.vendors.deleteMany(),
    prisma.categories.deleteMany()
  ])

  console.log('✅ Cleanup complete')

  // ========================================
  // CREATE CATEGORIES
  // ========================================
  console.log('\n📁 Creating categories...')
  
  const categories = await prisma.categories.createManyAndReturn({
    data: [
      {
        name: 'Electrical',
        description: 'Electrical supplies, wiring, and equipment',
        color: 'yellow',
        icon: 'Zap',
        companyId: company.id
      },
      {
        name: 'Plumbing',
        description: 'Plumbing fixtures, pipes, and supplies',
        color: 'blue',
        icon: 'Droplet',
        companyId: company.id
      },
      {
        name: 'HVAC',
        description: 'Heating, ventilation, and air conditioning',
        color: 'orange',
        icon: 'Thermometer',
        companyId: company.id
      },
      {
        name: 'Lumber',
        description: 'Wood, plywood, and building materials',
        color: 'green',
        icon: 'TreePine',
        companyId: company.id
      },
      {
        name: 'Concrete',
        description: 'Concrete, cement, and masonry',
        color: 'gray',
        icon: 'Square',
        companyId: company.id
      },
      {
        name: 'Tools',
        description: 'Power tools, hand tools, and equipment',
        color: 'red',
        icon: 'Wrench',
        companyId: company.id
      },
      {
        name: 'Safety',
        description: 'Safety equipment, PPE, and gear',
        color: 'orange',
        icon: 'Shield',
        companyId: company.id
      },
      {
        name: 'Office Supplies',
        description: 'Office supplies and stationery',
        color: 'purple',
        icon: 'PenTool',
        companyId: company.id
      }
    ]
  })

  console.log(`✅ Created ${categories.length} categories`)

  // ========================================
  // CREATE VENDORS WITH COMPLETE PROFILES
  // ========================================
  console.log('\n🏢 Creating vendor profiles...')

  const vendors = await Promise.all([
    // Vendor 1: City Electrical Supply
    prisma.vendors.create({
      data: {
        name: 'City Electrical Supply',
        email: 'sales@cityelectrical.com',
        phone: '+1 (212) 555-1234',
        website: 'https://www.cityelectrical.com',
        taxId: '12-3456789',
        registrationNumber: 'VEND-ELEC-001',
        status: 'active',
        rating: 5,
        reviewCount: 24,
        address: '123 Electric Ave',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001',
        contactPerson: 'Robert Brown',
        contactPersonRole: 'Sales Manager',
        contactPersonEmail: 'robert.brown@cityelectrical.com',
        contactPersonPhone: '+1 (212) 555-1235',
        businessType: 'corporation',
        yearEstablished: 1995,
        employeeCount: 150,
        annualRevenue: 25000000,
        paymentTerms: 'net30',
        currency: 'USD',
        creditLimit: 500000,
        notes: 'Premium electrical supplier for commercial projects',
        tags: ['electrical', 'preferred', 'commercial'],
        certified: true,
        preferred: true,
        companyId: company.id,
        categoryId: categories[0].id
      }
    }),

    // Vendor 2: Metro Plumbing Supply
    prisma.vendors.create({
      data: {
        name: 'Metro Plumbing Supply',
        email: 'info@metroplumbing.com',
        phone: '+1 (718) 555-2345',
        website: 'https://www.metroplumbing.com',
        taxId: '23-4567890',
        registrationNumber: 'VEND-PLUMB-001',
        status: 'active',
        rating: 4,
        reviewCount: 18,
        address: '456 Pipe St',
        city: 'Brooklyn',
        state: 'NY',
        country: 'USA',
        postalCode: '11201',
        contactPerson: 'Maria Garcia',
        contactPersonRole: 'Account Manager',
        contactPersonEmail: 'maria.garcia@metroplumbing.com',
        contactPersonPhone: '+1 (718) 555-2346',
        businessType: 'llc',
        yearEstablished: 2005,
        employeeCount: 75,
        annualRevenue: 12000000,
        paymentTerms: 'net30',
        currency: 'USD',
        creditLimit: 250000,
        notes: 'Reliable plumbing supplier with good pricing',
        tags: ['plumbing', 'reliable', 'mid-size'],
        certified: true,
        preferred: false,
        companyId: company.id,
        categoryId: categories[1].id
      }
    }),

    // Vendor 3: Empire Lumber Co
    prisma.vendors.create({
      data: {
        name: 'Empire Lumber Co',
        email: 'orders@empirelumber.com',
        phone: '+1 (516) 555-3456',
        website: 'https://www.empirelumber.com',
        taxId: '34-5678901',
        registrationNumber: 'VEND-LUMBER-001',
        status: 'active',
        rating: 5,
        reviewCount: 32,
        address: '789 Wood Rd',
        city: 'Queens',
        state: 'NY',
        country: 'USA',
        postalCode: '11354',
        contactPerson: 'David Kim',
        contactPersonRole: 'Sales Director',
        contactPersonEmail: 'david.kim@empirelumber.com',
        contactPersonPhone: '+1 (516) 555-3457',
        businessType: 'corporation',
        yearEstablished: 1985,
        employeeCount: 200,
        annualRevenue: 45000000,
        paymentTerms: 'net45',
        currency: 'USD',
        creditLimit: 1000000,
        notes: 'Largest lumber supplier in the region',
        tags: ['lumber', 'preferred', 'bulk'],
        certified: true,
        preferred: true,
        companyId: company.id,
        categoryId: categories[3].id
      }
    }),

    // Vendor 4: Precision Tools Inc
    prisma.vendors.create({
      data: {
        name: 'Precision Tools Inc',
        email: 'sales@precisiontools.com',
        phone: '+1 (631) 555-4567',
        website: 'https://www.precisiontools.com',
        taxId: '45-6789012',
        registrationNumber: 'VEND-TOOLS-001',
        status: 'active',
        rating: 4,
        reviewCount: 15,
        address: '321 Tool Blvd',
        city: 'Long Island',
        state: 'NY',
        country: 'USA',
        postalCode: '11788',
        contactPerson: 'James Wilson',
        contactPersonRole: 'Sales Rep',
        contactPersonEmail: 'james.wilson@precisiontools.com',
        contactPersonPhone: '+1 (631) 555-4568',
        businessType: 'llc',
        yearEstablished: 2010,
        employeeCount: 50,
        annualRevenue: 8000000,
        paymentTerms: 'net15',
        currency: 'USD',
        creditLimit: 100000,
        notes: 'High-quality power tools and equipment',
        tags: ['tools', 'power-tools', 'equipment'],
        certified: false,
        preferred: false,
        companyId: company.id,
        categoryId: categories[5].id
      }
    }),

    // Vendor 5: Safety First Gear
    prisma.vendors.create({
      data: {
        name: 'Safety First Gear',
        email: 'info@safetyfirst.com',
        phone: '+1 (914) 555-5678',
        website: 'https://www.safetyfirst.com',
        taxId: '56-7890123',
        registrationNumber: 'VEND-SAFETY-001',
        status: 'pending',
        rating: 0,
        reviewCount: 0,
        address: '555 Safety Lane',
        city: 'White Plains',
        state: 'NY',
        country: 'USA',
        postalCode: '10601',
        contactPerson: 'Patricia Lee',
        contactPersonRole: 'Owner',
        contactPersonEmail: 'patricia.lee@safetyfirst.com',
        contactPersonPhone: '+1 (914) 555-5679',
        businessType: 'sole_proprietor',
        yearEstablished: 2022,
        employeeCount: 5,
        annualRevenue: 500000,
        paymentTerms: 'net30',
        currency: 'USD',
        creditLimit: 25000,
        notes: 'New vendor specializing in safety equipment',
        tags: ['safety', 'ppe', 'new'],
        certified: false,
        preferred: false,
        companyId: company.id,
        categoryId: categories[6].id
      }
    }),

    // Vendor 6: HVAC Solutions Pro
    prisma.vendors.create({
      data: {
        name: 'HVAC Solutions Pro',
        email: 'info@hvacpro.com',
        phone: '+1 (845) 555-6789',
        website: 'https://www.hvacpro.com',
        taxId: '67-8901234',
        registrationNumber: 'VEND-HVAC-001',
        status: 'active',
        rating: 5,
        reviewCount: 12,
        address: '888 Climate Ave',
        city: 'Yonkers',
        state: 'NY',
        country: 'USA',
        postalCode: '10701',
        contactPerson: 'Michael Chen',
        contactPersonRole: 'Operations Manager',
        contactPersonEmail: 'michael.chen@hvacpro.com',
        contactPersonPhone: '+1 (845) 555-6790',
        businessType: 'corporation',
        yearEstablished: 2008,
        employeeCount: 85,
        annualRevenue: 15000000,
        paymentTerms: 'net30',
        currency: 'USD',
        creditLimit: 300000,
        notes: 'Specialized in commercial HVAC systems',
        tags: ['hvac', 'commercial', 'installation'],
        certified: true,
        preferred: true,
        companyId: company.id,
        categoryId: categories[2].id
      }
    }),

    // Vendor 7: Concrete Masters
    prisma.vendors.create({
      data: {
        name: 'Concrete Masters',
        email: 'dispatch@concretemasters.com',
        phone: '+1 (914) 555-7890',
        website: 'https://www.concretemasters.com',
        taxId: '78-9012345',
        registrationNumber: 'VEND-CONCRETE-001',
        status: 'active',
        rating: 4,
        reviewCount: 9,
        address: '999 Foundation Rd',
        city: 'Mount Vernon',
        state: 'NY',
        country: 'USA',
        postalCode: '10550',
        contactPerson: 'Robert Johnson',
        contactPersonRole: 'Project Coordinator',
        contactPersonEmail: 'r.johnson@concretemasters.com',
        contactPersonPhone: '+1 (914) 555-7891',
        businessType: 'llc',
        yearEstablished: 2012,
        employeeCount: 40,
        annualRevenue: 6000000,
        paymentTerms: 'net30',
        currency: 'USD',
        creditLimit: 150000,
        notes: 'Specializes in poured concrete and foundations',
        tags: ['concrete', 'foundation', 'construction'],
        certified: true,
        preferred: false,
        companyId: company.id,
        categoryId: categories[4].id
      }
    }),

    // Vendor 8: Office Direct Supply
    prisma.vendors.create({
      data: {
        name: 'Office Direct Supply',
        email: 'orders@officedirect.com',
        phone: '+1 (516) 555-8901',
        website: 'https://www.officedirect.com',
        taxId: '89-0123456',
        registrationNumber: 'VEND-OFFICE-001',
        status: 'active',
        rating: 3,
        reviewCount: 6,
        address: '777 Stationery Way',
        city: 'Garden City',
        state: 'NY',
        country: 'USA',
        postalCode: '11530',
        contactPerson: 'Susan Miller',
        contactPersonRole: 'Account Executive',
        contactPersonEmail: 'susan.miller@officedirect.com',
        contactPersonPhone: '+1 (516) 555-8902',
        businessType: 'corporation',
        yearEstablished: 2000,
        employeeCount: 120,
        annualRevenue: 20000000,
        paymentTerms: 'net15',
        currency: 'USD',
        creditLimit: 50000,
        notes: 'General office supplies, average delivery times',
        tags: ['office', 'supplies', 'stationery'],
        certified: false,
        preferred: false,
        companyId: company.id,
        categoryId: categories[7].id
      }
    })
  ])

  console.log(`✅ Created ${vendors.length} vendor profiles`)

  // ========================================
  // CREATE VENDOR RATINGS
  // ========================================
  console.log('\n⭐ Adding vendor ratings...')

  await prisma.vendor_ratings.createMany({
    data: [
      {
        rating: 5,
        comment: 'Excellent quality and always on time. Great communication.',
        category: 'quality',
        vendorId: vendors[0].id,
        userId: superAdmin.id
      },
      {
        rating: 5,
        comment: 'Best electrical supplier in the city. Highly recommended.',
        category: 'delivery',
        vendorId: vendors[0].id,
        userId: superAdmin.id
      },
      {
        rating: 4,
        comment: 'Good quality products, pricing could be better.',
        category: 'price',
        vendorId: vendors[1].id,
        userId: superAdmin.id
      },
      {
        rating: 5,
        comment: 'Excellent lumber quality and competitive pricing.',
        category: 'quality',
        vendorId: vendors[2].id,
        userId: superAdmin.id
      },
      {
        rating: 5,
        comment: 'Bulk orders handled efficiently. Great for large projects.',
        category: 'delivery',
        vendorId: vendors[2].id,
        userId: superAdmin.id
      },
      {
        rating: 4,
        comment: 'Tools are good quality, but shipping takes a bit long.',
        category: 'delivery',
        vendorId: vendors[3].id,
        userId: superAdmin.id
      },
      {
        rating: 5,
        comment: 'Excellent HVAC expertise and installation support.',
        category: 'quality',
        vendorId: vendors[5].id,
        userId: superAdmin.id
      },
      {
        rating: 4,
        comment: 'Concrete quality is consistent, good for foundations.',
        category: 'quality',
        vendorId: vendors[6].id,
        userId: superAdmin.id
      },
      {
        rating: 3,
        comment: 'Office supplies are standard, delivery sometimes delayed.',
        category: 'delivery',
        vendorId: vendors[7].id,
        userId: superAdmin.id
      }
    ]
  })

  console.log('✅ Added vendor ratings')

  // ========================================
  // UPDATE CATEGORY VENDOR COUNTS
  // ========================================
  console.log('\n📊 Updating category vendor counts...')

  for (const category of categories) {
    const count = await prisma.vendors.count({
      where: {
        categoryId: category.id,
        deletedAt: null
      }
    })
    
    await prisma.categories.update({
      where: { id: category.id },
      data: { vendorCount: count }
    })
  }

  console.log('✅ Updated category vendor counts')

  // ========================================
  // DISPLAY SUMMARY
  // ========================================
  console.log('\n' + '='.repeat(50))
  console.log('📊 VENDOR PROFILE SUMMARY')
  console.log('='.repeat(50))
  
  console.log('\n📁 Categories:')
  for (const cat of categories) {
    const updated = await prisma.categories.findUnique({
      where: { id: cat.id }
    })
    console.log(`  • ${cat.name}: ${updated?.vendorCount || 0} vendors`)
  }

  console.log('\n🏢 Vendors by Status:')
  const statusCounts = await prisma.vendors.groupBy({
    by: ['status'],
    _count: true,
    where: { deletedAt: null }
  })
  for (const item of statusCounts) {
    console.log(`  • ${item.status}: ${item._count}`)
  }

  console.log('\n⭐ Ratings:')
  const ratingCounts = await prisma.vendor_ratings.groupBy({
    by: ['rating'],
    _count: true
  })
  for (let i = 1; i <= 5; i++) {
    const count = ratingCounts.find(r => r.rating === i)?._count || 0
    console.log(`  • ${i} star: ${count}`)
  }

  console.log('\n' + '='.repeat(50))
  console.log('✅ Vendor profile seeding complete!')
  console.log('='.repeat(50))
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
