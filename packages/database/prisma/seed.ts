import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clean up existing data (optional - comment out if you want to keep existing)
  console.log('Cleaning existing data...')
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
    prisma.categories.deleteMany(),
    prisma.team_members.deleteMany(),
    prisma.team_permissions.deleteMany(),
    prisma.team_roles.deleteMany(),
    prisma.role_permissions.deleteMany(),
    prisma.permissions.deleteMany(),
    prisma.roles.deleteMany(),
    prisma.teams.deleteMany(),
    prisma.users.deleteMany(),
    prisma.companies.deleteMany(),
    prisma.reports.deleteMany(),
    prisma.integrations.deleteMany(),
    prisma.demo_requests.deleteMany(),
  ])

  console.log('✅ Cleanup complete')

  // ========================================
  // CREATE COMPANY
  // ========================================
  const company = await prisma.companies.create({
    data: {
      name: 'ABC Construction Inc.',
      subdomain: 'abcconstruction',
      logo: 'https://via.placeholder.com/150',
      website: 'https://www.abcconstruction.com',
      phone: '+1 (555) 123-4567',
      email: 'info@abcconstruction.com',
      address: '123 Builder Ave',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postalCode: '10001',
      taxId: '12-3456789',
      registrationNumber: 'CON123456',
      plan: 'enterprise',
      planStatus: 'active',
      settings: { theme: 'light', timezone: 'America/New_York' },
      features: { vendors: true, procurement: true, projects: true, finance: true }
    }
  })
  console.log('✅ Created company:', company.name)

  // ========================================
  // CREATE USERS
  // ========================================
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const adminUser = await prisma.users.create({
    data: {
      email: 'admin@construction.com',
      password: hashedPassword,
      name: 'John Admin',
      firstName: 'John',
      lastName: 'Admin',
      phone: '+1 (555) 111-2222',
      title: 'Project Director',
      department: 'Management',
      role: 'admin',
      isActive: true,
      emailVerified: new Date(),
      companyId: company.id,
      preferences: { notifications: true, theme: 'dark' },
      notificationSettings: { email: true, push: true, inApp: true }
    }
  })

  const projectManager = await prisma.users.create({
    data: {
      email: 'sarah.manager@construction.com',
      password: hashedPassword,
      name: 'Sarah Johnson',
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '+1 (555) 222-3333',
      title: 'Project Manager',
      department: 'Projects',
      role: 'manager',
      isActive: true,
      emailVerified: new Date(),
      companyId: company.id,
      preferences: { notifications: true, theme: 'light' },
      notificationSettings: { email: true, push: true, inApp: true }
    }
  })

  const procurementOfficer = await prisma.users.create({
    data: {
      email: 'mike.procurement@construction.com',
      password: hashedPassword,
      name: 'Mike Wilson',
      firstName: 'Mike',
      lastName: 'Wilson',
      phone: '+1 (555) 333-4444',
      title: 'Procurement Officer',
      department: 'Procurement',
      role: 'member',
      isActive: true,
      emailVerified: new Date(),
      companyId: company.id,
      preferences: { notifications: true, theme: 'light' },
      notificationSettings: { email: true, push: true, inApp: true }
    }
  })

  const financeManager = await prisma.users.create({
    data: {
      email: 'lisa.finance@construction.com',
      password: hashedPassword,
      name: 'Lisa Chen',
      firstName: 'Lisa',
      lastName: 'Chen',
      phone: '+1 (555) 444-5555',
      title: 'Finance Manager',
      department: 'Finance',
      role: 'finance',
      isActive: true,
      emailVerified: new Date(),
      companyId: company.id,
      preferences: { notifications: true, theme: 'light' },
      notificationSettings: { email: true, push: true, inApp: true }
    }
  })

  console.log('✅ Created 4 users')

  // ========================================
  // CREATE CATEGORIES
  // ========================================
  const categories = await Promise.all([
    prisma.categories.create({
      data: {
        name: 'Electrical',
        description: 'Electrical supplies and equipment',
        color: 'yellow',
        icon: 'Zap',
        companyId: company.id
      }
    }),
    prisma.categories.create({
      data: {
        name: 'Plumbing',
        description: 'Plumbing fixtures and supplies',
        color: 'blue',
        icon: 'Droplet',
        companyId: company.id
      }
    }),
    prisma.categories.create({
      data: {
        name: 'HVAC',
        description: 'Heating, ventilation, and air conditioning',
        color: 'orange',
        icon: 'Thermometer',
        companyId: company.id
      }
    }),
    prisma.categories.create({
      data: {
        name: 'Lumber',
        description: 'Wood and building materials',
        color: 'green',
        icon: 'TreePine',
        companyId: company.id
      }
    }),
    prisma.categories.create({
      data: {
        name: 'Concrete',
        description: 'Concrete and masonry',
        color: 'gray',
        icon: 'Square',
        companyId: company.id
      }
    }),
    prisma.categories.create({
      data: {
        name: 'Tools',
        description: 'Power tools and equipment',
        color: 'red',
        icon: 'Wrench',
        companyId: company.id
      }
    }),
    prisma.categories.create({
      data: {
        name: 'Safety',
        description: 'Safety equipment and gear',
        color: 'orange',
        icon: 'Shield',
        companyId: company.id
      }
    }),
    prisma.categories.create({
      data: {
        name: 'Office Supplies',
        description: 'Office and administrative supplies',
        color: 'purple',
        icon: 'PenTool',
        companyId: company.id
      }
    })
  ])
  console.log('✅ Created 8 categories')

  // ========================================
  // CREATE VENDORS
  // ========================================
  const vendors = await Promise.all([
    prisma.vendors.create({
      data: {
        name: 'City Electrical Supply',
        email: 'sales@cityelectrical.com',
        phone: '+1 (555) 101-1111',
        website: 'https://cityelectrical.com',
        taxId: '12-3456789',
        registrationNumber: 'V12345',
        status: 'active',
        rating: 5,
        reviewCount: 12,
        address: '100 Electric Ave',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001',
        contactPerson: 'Robert Brown',
        contactPersonRole: 'Sales Manager',
        contactPersonEmail: 'robert@cityelectrical.com',
        contactPersonPhone: '+1 (555) 101-1112',
        businessType: 'corporation',
        yearEstablished: 2005,
        employeeCount: 50,
        annualRevenue: 5000000,
        paymentTerms: 'net30',
        currency: 'USD',
        creditLimit: 100000,
        notes: 'Preferred electrical supplier',
        tags: ['electrical', 'preferred'],
        certified: true,
        preferred: true,
        companyId: company.id,
        categoryId: categories[0].id // Electrical
      }
    }),
    prisma.vendors.create({
      data: {
        name: 'Metro Plumbing Supply',
        email: 'info@metroplumbing.com',
        phone: '+1 (555) 202-2222',
        website: 'https://metroplumbing.com',
        taxId: '23-4567890',
        registrationNumber: 'V23456',
        status: 'active',
        rating: 4,
        reviewCount: 8,
        address: '200 Pipe St',
        city: 'Brooklyn',
        state: 'NY',
        country: 'USA',
        postalCode: '11201',
        contactPerson: 'Maria Garcia',
        contactPersonRole: 'Account Manager',
        contactPersonEmail: 'maria@metroplumbing.com',
        contactPersonPhone: '+1 (555) 202-2223',
        businessType: 'llc',
        yearEstablished: 2010,
        employeeCount: 25,
        annualRevenue: 2000000,
        paymentTerms: 'net30',
        currency: 'USD',
        creditLimit: 50000,
        notes: 'Reliable plumbing supplier',
        tags: ['plumbing', 'reliable'],
        certified: true,
        preferred: false,
        companyId: company.id,
        categoryId: categories[1].id // Plumbing
      }
    }),
    prisma.vendors.create({
      data: {
        name: 'Empire Lumber Co',
        email: 'orders@empirelumber.com',
        phone: '+1 (555) 303-3333',
        website: 'https://empirelumber.com',
        taxId: '34-5678901',
        registrationNumber: 'V34567',
        status: 'active',
        rating: 5,
        reviewCount: 15,
        address: '300 Wood Rd',
        city: 'Queens',
        state: 'NY',
        country: 'USA',
        postalCode: '11354',
        contactPerson: 'David Kim',
        contactPersonRole: 'Sales Director',
        contactPersonEmail: 'david@empirelumber.com',
        contactPersonPhone: '+1 (555) 303-3334',
        businessType: 'corporation',
        yearEstablished: 1995,
        employeeCount: 100,
        annualRevenue: 10000000,
        paymentTerms: 'net45',
        currency: 'USD',
        creditLimit: 200000,
        notes: 'Best lumber prices in town',
        tags: ['lumber', 'preferred'],
        certified: true,
        preferred: true,
        companyId: company.id,
        categoryId: categories[3].id // Lumber
      }
    }),
    prisma.vendors.create({
      data: {
        name: 'Precision Tools Inc',
        email: 'sales@precisiontools.com',
        phone: '+1 (555) 404-4444',
        website: 'https://precisiontools.com',
        taxId: '45-6789012',
        registrationNumber: 'V45678',
        status: 'active',
        rating: 4,
        reviewCount: 6,
        address: '400 Tool Blvd',
        city: 'Bronx',
        state: 'NY',
        country: 'USA',
        postalCode: '10451',
        contactPerson: 'James Wilson',
        contactPersonRole: 'Sales Rep',
        contactPersonEmail: 'james@precisiontools.com',
        contactPersonPhone: '+1 (555) 404-4445',
        businessType: 'llc',
        yearEstablished: 2015,
        employeeCount: 15,
        annualRevenue: 1500000,
        paymentTerms: 'net15',
        currency: 'USD',
        creditLimit: 25000,
        notes: 'Quality power tools',
        tags: ['tools', 'power-tools'],
        certified: false,
        preferred: false,
        companyId: company.id,
        categoryId: categories[5].id // Tools
      }
    }),
    prisma.vendors.create({
      data: {
        name: 'Safety First Gear',
        email: 'info@safetyfirst.com',
        phone: '+1 (555) 505-5555',
        website: 'https://safetyfirst.com',
        taxId: '56-7890123',
        registrationNumber: 'V56789',
        status: 'pending',
        rating: 0,
        reviewCount: 0,
        address: '500 Safety Lane',
        city: 'Staten Island',
        state: 'NY',
        country: 'USA',
        postalCode: '10301',
        contactPerson: 'Patricia Lee',
        contactPersonRole: 'Owner',
        contactPersonEmail: 'patricia@safetyfirst.com',
        contactPersonPhone: '+1 (555) 505-5556',
        businessType: 'sole_proprietor',
        yearEstablished: 2022,
        employeeCount: 5,
        annualRevenue: 250000,
        paymentTerms: 'net30',
        currency: 'USD',
        creditLimit: 10000,
        notes: 'New vendor - under review',
        tags: ['safety', 'ppe'],
        certified: false,
        preferred: false,
        companyId: company.id,
        categoryId: categories[6].id // Safety
      }
    })
  ])
  console.log('✅ Created 5 vendors')

  // ========================================
  // CREATE PURCHASE ORDERS
  // ========================================
  const po1 = await prisma.purchase_orders.create({
    data: {
      poNumber: 'PO-2024-0001',
      title: 'Electrical Supplies - Tower Project',
      description: 'Electrical materials for downtown tower project',
      status: 'delivered',
      priority: 'high',
      orderDate: new Date('2024-01-15'),
      expectedDate: new Date('2024-02-01'),
      deliveredDate: new Date('2024-01-30'),
      shippingAddress: '123 Tower Plaza, New York, NY 10001',
      shippingMethod: 'Truck',
      subtotal: 12500.00,
      taxAmount: 1031.25,
      discount: 0,
      total: 13531.25,
      currency: 'USD',
      notes: 'Urgent - needed for floor 10-15 electrical work',
      terms: 'Net 30',
      approvalStatus: 'approved',
      approvedAt: new Date('2024-01-16'),
      createdById: procurementOfficer.id,
      vendorId: vendors[0].id,
      companyId: company.id,
      lineItems: {
        create: [
          {
            lineNumber: 1,
            description: '14/2 NM-B Wire (250ft)',
            sku: 'ELEC-14-2',
            quantity: 10,
            unit: 'roll',
            unitPrice: 85.50,
            total: 855.00,
            receivedQuantity: 10
          },
          {
            lineNumber: 2,
            description: 'GFCI Outlets - White',
            sku: 'ELEC-GFCI-W',
            quantity: 50,
            unit: 'each',
            unitPrice: 12.75,
            total: 637.50,
            receivedQuantity: 50
          },
          {
            lineNumber: 3,
            description: '200A Breaker Panel',
            sku: 'ELEC-PNL-200',
            quantity: 2,
            unit: 'each',
            unitPrice: 450.00,
            total: 900.00,
            receivedQuantity: 2
          },
          {
            lineNumber: 4,
            description: 'Conduit - 3/4" EMT (10ft)',
            sku: 'ELEC-CND-34',
            quantity: 100,
            unit: 'pieces',
            unitPrice: 8.25,
            total: 825.00,
            receivedQuantity: 100
          },
          {
            lineNumber: 5,
            description: 'Circuit Breakers - 20A',
            sku: 'ELEC-CB-20',
            quantity: 30,
            unit: 'each',
            unitPrice: 6.50,
            total: 195.00,
            receivedQuantity: 30
          }
        ]
      }
    }
  })

  const po2 = await prisma.purchase_orders.create({
    data: {
      poNumber: 'PO-2024-0002',
      title: 'Lumber Order - Residential Project',
      description: 'Framing lumber for 5 new residential units',
      status: 'shipped',
      priority: 'medium',
      orderDate: new Date('2024-02-10'),
      expectedDate: new Date('2024-02-25'),
      shippedDate: new Date('2024-02-20'),
      shippingAddress: '456 Residential Ave, Brooklyn, NY 11201',
      shippingMethod: 'Flatbed',
      trackingNumber: 'LUM-12345',
      subtotal: 18750.00,
      taxAmount: 0,
      discount: 937.50,
      total: 17812.50,
      currency: 'USD',
      notes: '5% volume discount applied',
      terms: 'Net 45',
      approvalStatus: 'approved',
      approvedAt: new Date('2024-02-11'),
      createdById: procurementOfficer.id,
      vendorId: vendors[2].id,
      companyId: company.id,
      lineItems: {
        create: [
          {
            lineNumber: 1,
            description: '2x4x8 SPF Studs',
            sku: 'LUM-2X4-8',
            quantity: 500,
            unit: 'pieces',
            unitPrice: 4.50,
            total: 2250.00,
            receivedQuantity: 0
          },
          {
            lineNumber: 2,
            description: '2x6x12 SPF Joists',
            sku: 'LUM-2X6-12',
            quantity: 300,
            unit: 'pieces',
            unitPrice: 8.75,
            total: 2625.00,
            receivedQuantity: 0
          },
          {
            lineNumber: 3,
            description: '4x8 Plywood Sheets (3/4")',
            sku: 'LUM-PLY-34',
            quantity: 100,
            unit: 'sheets',
            unitPrice: 42.00,
            total: 4200.00,
            receivedQuantity: 0
          },
          {
            lineNumber: 4,
            description: 'Pressure Treated 4x4x8',
            sku: 'LUM-PT-4X4',
            quantity: 50,
            unit: 'pieces',
            unitPrice: 12.50,
            total: 625.00,
            receivedQuantity: 0
          }
        ]
      }
    }
  })

  const po3 = await prisma.purchase_orders.create({
    data: {
      poNumber: 'PO-2024-0003',
      title: 'Plumbing Fixtures - Office Renovation',
      description: 'Bathroom fixtures for 3rd floor office renovation',
      status: 'sent',
      priority: 'medium',
      orderDate: new Date('2024-03-01'),
      expectedDate: new Date('2024-03-15'),
      shippingAddress: '789 Office Park, Manhattan, NY 10016',
      shippingMethod: 'Truck',
      subtotal: 8900.00,
      taxAmount: 734.25,
      discount: 445.00,
      total: 9189.25,
      currency: 'USD',
      notes: '5% early payment discount available',
      terms: 'Net 30',
      approvalStatus: 'approved',
      approvedAt: new Date('2024-03-02'),
      createdById: procurementOfficer.id,
      vendorId: vendors[1].id,
      companyId: company.id,
      lineItems: {
        create: [
          {
            lineNumber: 1,
            description: 'Commercial Toilets - White',
            sku: 'PLUMB-TOILET-C',
            quantity: 8,
            unit: 'each',
            unitPrice: 350.00,
            total: 2800.00
          },
          {
            lineNumber: 2,
            description: 'Sinks - Stainless Steel',
            sku: 'PLUMB-SINK-SS',
            quantity: 6,
            unit: 'each',
            unitPrice: 225.00,
            total: 1350.00
          },
          {
            lineNumber: 3,
            description: 'Faucets - Commercial',
            sku: 'PLUMB-FAUCET-C',
            quantity: 8,
            unit: 'each',
            unitPrice: 85.00,
            total: 680.00
          },
          {
            lineNumber: 4,
            description: 'Water Heaters - 50 Gal',
            sku: 'PLUMB-WH-50',
            quantity: 2,
            unit: 'each',
            unitPrice: 650.00,
            total: 1300.00
          }
        ]
      }
    }
  })
  console.log('✅ Created 3 purchase orders')

  // ========================================
  // CREATE CONTRACTS
  // ========================================
  const contract1 = await prisma.contracts.create({
    data: {
      contractNumber: 'CT-2024-001',
      title: 'Electrical Supply Agreement',
      description: 'Annual electrical supply contract',
      type: 'purchase_contract',
      status: 'active',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      value: 150000.00,
      currency: 'USD',
      paymentTerms: 'Net 30',
      billingCycle: 'monthly',
      autoRenew: true,
      terms: 'Standard terms and conditions apply',
      approvalStatus: 'approved',
      approvedAt: new Date('2023-12-15'),
      createdById: adminUser.id,
      vendorId: vendors[0].id,
      companyId: company.id
    }
  })

  const contract2 = await prisma.contracts.create({
    data: {
      contractNumber: 'CT-2024-002',
      title: 'Lumber Supply Framework',
      description: 'Framework agreement for lumber purchases',
      type: 'purchase_contract',
      status: 'active',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2025-01-31'),
      value: 250000.00,
      currency: 'USD',
      paymentTerms: 'Net 45',
      billingCycle: 'per_order',
      autoRenew: false,
      terms: 'Volume discounts apply',
      approvalStatus: 'approved',
      approvedAt: new Date('2024-01-20'),
      createdById: adminUser.id,
      vendorId: vendors[2].id,
      companyId: company.id
    }
  })
  console.log('✅ Created 2 contracts')

  // ========================================
  // CREATE PROJECTS
  // ========================================
  const project1 = await prisma.projects.create({
    data: {
      projectNumber: 'PRJ-2024-001',
      name: 'Downtown Tower Construction',
      description: '30-story commercial tower in downtown Manhattan',
      status: 'active',
      priority: 'high',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2025-06-30'),
      actualStartDate: new Date('2024-01-15'),
      location: '123 Tower Plaza',
      address: '123 Tower Plaza',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      budget: 50000000.00,
      actualCost: 8500000.00,
      currency: 'USD',
      progressPercent: 17,
      managerId: projectManager.id,
      createdById: adminUser.id,
      companyId: company.id
    }
  })

  const project2 = await prisma.projects.create({
    data: {
      projectNumber: 'PRJ-2024-002',
      name: 'Residential Complex - Phase 1',
      description: '5-building residential complex in Brooklyn',
      status: 'active',
      priority: 'medium',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2025-03-31'),
      actualStartDate: new Date('2024-02-01'),
      location: '456 Residential Ave',
      address: '456 Residential Ave',
      city: 'Brooklyn',
      state: 'NY',
      country: 'USA',
      budget: 25000000.00,
      actualCost: 5200000.00,
      currency: 'USD',
      progressPercent: 21,
      managerId: projectManager.id,
      createdById: adminUser.id,
      companyId: company.id
    }
  })

  const project3 = await prisma.projects.create({
    data: {
      projectNumber: 'PRJ-2024-003',
      name: 'Office Renovation - 3rd Floor',
      description: 'Complete renovation of 3rd floor office space',
      status: 'active',
      priority: 'medium',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-05-30'),
      actualStartDate: new Date('2024-03-01'),
      location: '789 Office Park',
      address: '789 Office Park',
      city: 'Manhattan',
      state: 'NY',
      country: 'USA',
      budget: 3500000.00,
      actualCost: 890000.00,
      currency: 'USD',
      progressPercent: 25,
      managerId: projectManager.id,
      createdById: adminUser.id,
      companyId: company.id
    }
  })
  console.log('✅ Created 3 projects')

  // ========================================
  // CREATE PROJECT VENDORS
  // ========================================
  await prisma.project_vendors.createMany({
    data: [
      {
        projectId: project1.id,
        vendorId: vendors[0].id,
        role: 'Electrical Contractor',
        contractValue: 1500000.00,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2025-06-30'),
        status: 'active'
      },
      {
        projectId: project1.id,
        vendorId: vendors[2].id,
        role: 'Lumber Supplier',
        contractValue: 2800000.00,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2025-06-30'),
        status: 'active'
      },
      {
        projectId: project2.id,
        vendorId: vendors[1].id,
        role: 'Plumbing Contractor',
        contractValue: 850000.00,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2025-03-31'),
        status: 'active'
      },
      {
        projectId: project2.id,
        vendorId: vendors[2].id,
        role: 'Lumber Supplier',
        contractValue: 1200000.00,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2025-03-31'),
        status: 'active'
      },
      {
        projectId: project3.id,
        vendorId: vendors[1].id,
        role: 'Plumbing Supplier',
        contractValue: 350000.00,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-05-30'),
        status: 'active'
      }
    ]
  })
  console.log('✅ Created 5 project-vendor assignments')

  // ========================================
  // CREATE WORK ORDERS - Fix: Remove createdById
  // ========================================
  await prisma.work_orders.createMany({
    data: [
      {
        workOrderNumber: 'WO-2024-001',
        title: 'Electrical Wiring - Floor 10',
        description: 'Install electrical wiring for floor 10 of tower project',
        status: 'completed',
        priority: 'high',
        type: 'electrical',
        requestedDate: new Date('2024-01-20'),
        scheduledDate: new Date('2024-01-22'),
        startDate: new Date('2024-01-22'),
        completedDate: new Date('2024-02-05'),
        dueDate: new Date('2024-02-10'),
        estimatedHours: 160,
        actualHours: 145,
        location: 'Floor 10, Tower Project',
        siteContact: 'Bob Foreman',
        sitePhone: '+1 (555) 123-1000',
        estimatedCost: 24000.00,
        actualCost: 21750.00,
        currency: 'USD',
        completionNotes: 'All wiring completed, passed inspection',
        completedBy: 'Mike Electrician',
        completedAt: new Date('2024-02-05'),
        approvalStatus: 'approved',
        approvedAt: new Date('2024-02-06'),
        projectId: project1.id,
        vendorId: vendors[0].id,
        companyId: company.id
      },
      {
        workOrderNumber: 'WO-2024-002',
        title: 'Framing - Building A',
        description: 'Framing for Building A of residential complex',
        status: 'in_progress',
        priority: 'high',
        type: 'construction',
        requestedDate: new Date('2024-02-05'),
        scheduledDate: new Date('2024-02-08'),
        startDate: new Date('2024-02-08'),
        dueDate: new Date('2024-03-15'),
        estimatedHours: 320,
        actualHours: 215,
        location: 'Building A, Residential Complex',
        siteContact: 'Tom Carpenter',
        sitePhone: '+1 (555) 123-2000',
        estimatedCost: 48000.00,
        actualCost: 32250.00,
        currency: 'USD',
        approvalStatus: 'approved',
        approvedAt: new Date('2024-02-06'),
        projectId: project2.id,
        vendorId: vendors[2].id,
        companyId: company.id
      },
      {
        workOrderNumber: 'WO-2024-003',
        title: 'Plumbing Installation - 3rd Floor',
        description: 'Install plumbing fixtures for office renovation',
        status: 'pending',
        priority: 'medium',
        type: 'plumbing',
        requestedDate: new Date('2024-03-05'),
        scheduledDate: new Date('2024-03-10'),
        dueDate: new Date('2024-03-25'),
        estimatedHours: 80,
        estimatedCost: 12000.00,
        currency: 'USD',
        projectId: project3.id,
        vendorId: vendors[1].id,
        companyId: company.id
      }
    ]
  })
  console.log('✅ Created 3 work orders')

  // ========================================
  // CREATE INVOICES
  // ========================================
  const invoice1 = await prisma.invoices.create({
    data: {
      invoiceNumber: 'INV-2024-001',
      reference: 'PO-2024-0001',
      status: 'paid',
      type: 'service',
      issueDate: new Date('2024-02-01'),
      dueDate: new Date('2024-03-01'),
      paidDate: new Date('2024-02-20'),
      subtotal: 12500.00,
      taxAmount: 1031.25,
      total: 13531.25,
      balance: 0,
      currency: 'USD',
      paymentTerms: 'net30',
      paymentMethod: 'bank_transfer',
      notes: 'Paid via wire transfer',
      approvalStatus: 'approved',
      approvedAt: new Date('2024-02-05'),
      createdById: financeManager.id,
      vendorId: vendors[0].id,
      purchaseOrderId: po1.id,
      companyId: company.id
    }
  })

  const invoice2 = await prisma.invoices.create({
    data: {
      invoiceNumber: 'INV-2024-002',
      reference: 'PO-2024-0002',
      status: 'sent',
      type: 'product',
      issueDate: new Date('2024-02-25'),
      dueDate: new Date('2024-04-10'),
      subtotal: 18750.00,
      taxAmount: 0,
      discount: 937.50,
      total: 17812.50,
      balance: 17812.50,
      currency: 'USD',
      paymentTerms: 'net45',
      notes: 'Volume discount applied',
      approvalStatus: 'approved',
      approvedAt: new Date('2024-02-26'),
      createdById: financeManager.id,
      vendorId: vendors[2].id,
      purchaseOrderId: po2.id,
      companyId: company.id
    }
  })

  const invoice3 = await prisma.invoices.create({
    data: {
      invoiceNumber: 'INV-2024-003',
      reference: 'PO-2024-0003',
      status: 'pending',
      type: 'product',
      issueDate: new Date('2024-03-01'),
      dueDate: new Date('2024-03-31'),
      subtotal: 8900.00,
      taxAmount: 734.25,
      discount: 445.00,
      total: 9189.25,
      balance: 9189.25,
      currency: 'USD',
      paymentTerms: 'net30',
      approvalStatus: 'pending',
      createdById: financeManager.id,
      vendorId: vendors[1].id,
      purchaseOrderId: po3.id,
      companyId: company.id
    }
  })
  console.log('✅ Created 3 invoices')

  // ========================================
  // CREATE INVOICE LINE ITEMS
  // ========================================
  await prisma.invoice_line_items.createMany({
    data: [
      {
        lineNumber: 1,
        description: 'Electrical supplies - PO-2024-0001',
        quantity: 1,
        unitPrice: 12500.00,
        total: 12500.00,
        invoiceId: invoice1.id
      },
      {
        lineNumber: 1,
        description: 'Lumber - PO-2024-0002',
        quantity: 1,
        unitPrice: 17812.50,
        total: 17812.50,
        invoiceId: invoice2.id
      },
      {
        lineNumber: 1,
        description: 'Plumbing fixtures - PO-2024-0003',
        quantity: 1,
        unitPrice: 9189.25,
        total: 9189.25,
        invoiceId: invoice3.id
      }
    ]
  })
  console.log('✅ Created 3 invoice line items')

  // ========================================
  // CREATE PAYMENTS
  // ========================================
  await prisma.payments.create({
    data: {
      paymentNumber: 'PAY-2024-001',
      amount: 13531.25,
      currency: 'USD',
      method: 'bank_transfer',
      status: 'completed',
      transactionId: 'TRX-12345',
      paymentDate: new Date('2024-02-20'),
      processedDate: new Date('2024-02-20'),
      notes: 'Payment for invoice INV-2024-001',
      bankName: 'Chase Bank',
      accountNumber: '****1234',
      reference: 'PO-2024-0001',
      createdById: financeManager.id,
      invoiceId: invoice1.id,
      companyId: company.id
    }
  })
  console.log('✅ Created 1 payment')

  // ========================================
  // CREATE EXPENSES
  // ========================================
  await prisma.expenses.createMany({
    data: [
      {
        expenseNumber: 'EXP-2024-001',
        category: 'travel',
        description: 'Site visit - Tower Project',
        amount: 350.75,
        currency: 'USD',
        expenseDate: new Date('2024-02-10'),
        receiptUrl: '/receipts/travel-001.pdf',
        isBillable: true,
        status: 'approved',
        approvedAt: new Date('2024-02-15'),
        createdById: projectManager.id,
        projectId: project1.id,
        companyId: company.id,
        notes: 'Uber to site and lunch'
      },
      {
        expenseNumber: 'EXP-2024-002',
        category: 'supplies',
        description: 'Office supplies for project trailer',
        amount: 125.50,
        currency: 'USD',
        expenseDate: new Date('2024-02-15'),
        receiptUrl: '/receipts/supplies-001.pdf',
        isBillable: true,
        status: 'approved',
        approvedAt: new Date('2024-02-18'),
        createdById: projectManager.id,
        projectId: project2.id,
        companyId: company.id,
        notes: 'Stationery and打印 paper'
      },
      {
        expenseNumber: 'EXP-2024-003',
        category: 'equipment',
        description: 'Safety equipment - hard hats, vests',
        amount: 875.25,
        currency: 'USD',
        expenseDate: new Date('2024-02-20'),
        receiptUrl: '/receipts/equipment-001.pdf',
        isBillable: true,
        status: 'pending',
        createdById: projectManager.id,
        projectId: project3.id,
        companyId: company.id,
        notes: '10 hard hats, 20 safety vests'
      }
    ]
  })
  console.log('✅ Created 3 expenses')

  // ========================================
  // CREATE BUDGET ITEMS
  // ========================================
  await prisma.budget_items.createMany({
    data: [
      {
        fiscalYear: 2024,
        category: 'materials',
        description: 'Electrical materials',
        plannedAmount: 150000.00,
        actualAmount: 13531.25,
        committedAmount: 0,
        variance: 150000 - 13531.25,
        variancePercent: 9.0,
        currency: 'USD',
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-03-31'),
        status: 'active',
        projectId: project1.id,
        createdById: financeManager.id,
        companyId: company.id
      },
      {
        fiscalYear: 2024,
        category: 'materials',
        description: 'Lumber materials',
        plannedAmount: 200000.00,
        actualAmount: 17812.50,
        committedAmount: 0,
        variance: 200000 - 17812.50,
        variancePercent: 8.9,
        currency: 'USD',
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-03-31'),
        status: 'active',
        projectId: project2.id,
        createdById: financeManager.id,
        companyId: company.id
      },
      {
        fiscalYear: 2024,
        category: 'materials',
        description: 'Plumbing materials',
        plannedAmount: 50000.00,
        actualAmount: 9189.25,
        committedAmount: 0,
        variance: 50000 - 9189.25,
        variancePercent: 18.4,
        currency: 'USD',
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-03-31'),
        status: 'active',
        projectId: project3.id,
        createdById: financeManager.id,
        companyId: company.id
      }
    ]
  })
  console.log('✅ Created 3 budget items')

  // ========================================
  // CREATE DEMO REQUESTS
  // ========================================
  await prisma.demo_requests.createMany({
    data: [
      {
        requestNumber: 'DEMO-2024-001',
        fullName: 'Robert Johnson',
        email: 'robert.j@constructco.com',
        companyName: 'ConstructCo Builders',
        phone: '+1 (555) 123-7890',
        companySize: '50-100',
        interests: ['vendor_management', 'procurement'],
        preferredDate: new Date('2024-03-15'),
        preferredTime: '10:00 AM',
        status: 'contacted',
        notes: 'Interested in enterprise plan',
        assignedToId: adminUser.id
      },
      {
        requestNumber: 'DEMO-2024-002',
        fullName: 'Emily Williams',
        email: 'emily.w@citydevelopers.com',
        companyName: 'City Developers Inc',
        phone: '+1 (555) 234-5678',
        companySize: '100-250',
        interests: ['project_management', 'finance'],
        preferredDate: new Date('2024-03-18'),
        preferredTime: '2:00 PM',
        status: 'pending',
        notes: 'Looking for comprehensive solution'
      },
      {
        requestNumber: 'DEMO-2024-003',
        fullName: 'Michael Chen',
        email: 'michael.c@premiumbuild.com',
        companyName: 'Premium Builders',
        phone: '+1 (555) 345-6789',
        companySize: '25-50',
        interests: ['vendor_portal', 'contracts'],
        preferredDate: new Date('2024-03-20'),
        preferredTime: '11:30 AM',
        status: 'converted',
        notes: 'Signed up for pro plan',
        assignedToId: adminUser.id
      }
    ]
  })
  console.log('✅ Created 3 demo requests')

  // ========================================
  // CREATE VENDOR RATINGS
  // ========================================
  await prisma.vendor_ratings.createMany({
    data: [
      {
        rating: 5,
        comment: 'Excellent quality and on-time delivery',
        category: 'quality',
        vendorId: vendors[0].id,
        userId: adminUser.id
      },
      {
        rating: 4,
        comment: 'Good products, communication could be better',
        category: 'communication',
        vendorId: vendors[1].id,
        userId: projectManager.id
      },
      {
        rating: 5,
        comment: 'Best lumber supplier in the city',
        category: 'quality',
        vendorId: vendors[2].id,
        userId: adminUser.id
      }
    ]
  })
  console.log('✅ Created 3 vendor ratings')

  // ========================================
  // CREATE ACTIVITY LOGS
  // ========================================
  await prisma.activity_logs.createMany({
    data: [
      {
        action: 'created',
        entityType: 'purchase_order',
        entityId: po1.id,
        entityName: 'PO-2024-0001',
        userId: procurementOfficer.id,
        userEmail: procurementOfficer.email,
        userName: procurementOfficer.name,
        companyId: company.id
      },
      {
        action: 'approved',
        entityType: 'purchase_order',
        entityId: po1.id,
        entityName: 'PO-2024-0001',
        userId: adminUser.id,
        userEmail: adminUser.email,
        userName: adminUser.name,
        companyId: company.id
      },
      {
        action: 'created',
        entityType: 'invoice',
        entityId: invoice1.id,
        entityName: 'INV-2024-001',
        userId: financeManager.id,
        userEmail: financeManager.email,
        userName: financeManager.name,
        companyId: company.id
      },
      {
        action: 'paid',
        entityType: 'invoice',
        entityId: invoice1.id,
        entityName: 'INV-2024-001',
        userId: financeManager.id,
        userEmail: financeManager.email,
        userName: financeManager.name,
        companyId: company.id
      }
    ]
  })
  console.log('✅ Created 4 activity logs')

  // ========================================
  // CREATE NOTIFICATIONS
  // ========================================
  await prisma.notifications.createMany({
    data: [
      {
        type: 'approval',
        title: 'Purchase Order Approved',
        message: 'PO-2024-0001 has been approved',
        status: 'read',
        priority: 'high',
        entityType: 'purchase_order',
        entityId: po1.id,
        actionUrl: '/procurement/purchase-orders/' + po1.id,
        userId: procurementOfficer.id,
        companyId: company.id,
        readAt: new Date()
      },
      {
        type: 'invoice',
        title: 'New Invoice Received',
        message: 'Invoice INV-2024-001 has been received',
        status: 'unread',
        priority: 'medium',
        entityType: 'invoice',
        entityId: invoice1.id,
        actionUrl: '/finance/invoices/' + invoice1.id,
        userId: financeManager.id,
        companyId: company.id
      },
      {
        type: 'work_order',
        title: 'Work Order Due Soon',
        message: 'WO-2024-003 is due in 3 days',
        status: 'unread',
        priority: 'medium',
        entityType: 'work_order',
        entityId: 'WO-2024-003',
        actionUrl: '/projects/work-orders/WO-2024-003',
        userId: projectManager.id,
        companyId: company.id,
        scheduledFor: new Date('2024-03-22')
      }
    ]
  })
  console.log('✅ Created 3 notifications')

  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
