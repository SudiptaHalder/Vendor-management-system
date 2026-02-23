// seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Clean up existing data (optional - be careful in production!)
  await cleanDatabase()

  // Create main company
  const company = await prisma.companies.create({
    data: {
      name: 'Acme Corporation',
      subdomain: 'acme',
      logo: 'https://example.com/logo.png',
      website: 'https://acme.com',
      phone: '+1-800-555-0123',
      email: 'info@acme.com',
      address: '123 Business Ave',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      postalCode: '94105',
      taxId: '12-3456789',
      registrationNumber: 'REG123456',
      plan: 'enterprise',
      planStatus: 'active',
      settings: {
        timezone: 'America/Los_Angeles',
        dateFormat: 'MM/DD/YYYY',
        currency: 'USD'
      },
      features: {
        advancedProcurement: true,
        projectManagement: true,
        vendorPortal: true
      }
    }
  })

  console.log('Created company:', company.name)

  // Create second company
  const company2 = await prisma.companies.create({
    data: {
      name: 'TechStart Inc',
      subdomain: 'techstart',
      website: 'https://techstart.io',
      phone: '+1-888-555-0123',
      email: 'hello@techstart.io',
      city: 'Austin',
      state: 'TX',
      country: 'USA',
      plan: 'professional',
      planStatus: 'active',
      settings: {
        timezone: 'America/Chicago',
        dateFormat: 'MM/DD/YYYY',
        currency: 'USD'
      }
    }
  })

  console.log('Created company:', company2.name)

  // Create users
  const users = await createUsers(company.id, company2.id)
  
  // Create permissions
  const permissions = await createPermissions(company.id)
  
  // Create roles
  const roles = await createRoles(company.id, permissions)
  
  // Update users with roles
  await assignRolesToUsers(users, roles)
  
  // Create teams
  const teams = await createTeams(company.id, users)
  
  // Add team members
  await addTeamMembers(teams, users, roles)

  // Create categories
  const categories = await createCategories(company.id)

  // Create vendors
  const vendors = await createVendors(company.id, categories)

  // Create vendor ratings
  await createVendorRatings(vendors, users)

  // Create vendor portal access
  await createVendorPortalAccess(vendors)

  // Create projects
  const projects = await createProjects(company.id, users)

  // Create contracts
  const contracts = await createContracts(company.id, vendors, users, projects)

  // Create purchase orders
  const purchaseOrders = await createPurchaseOrders(company.id, vendors, contracts, projects, users)

  // Create RFQs
  const rfqs = await createRFQs(company.id, vendors, projects, users, purchaseOrders)

  // Create quotes
  const quotes = await createQuotes(company.id, rfqs, vendors, users)

  // Create work orders
  const workOrders = await createWorkOrders(company.id, vendors, contracts, projects, users)

  // Create schedules
  const schedules = await createSchedules(company.id, projects, users, workOrders)

  // Create resources
  const resources = await createResources(company.id, users)

  // Create resource assignments
  await createResourceAssignments(resources, projects, workOrders, users)

  // Create invoices
  const invoices = await createInvoices(company.id, vendors, workOrders, contracts, purchaseOrders, projects, users)

  // Create payments
  await createPayments(company.id, invoices, users)

  // Create expenses
  await createExpenses(company.id, vendors, projects, workOrders, users)

  // Create budget items
  await createBudgetItems(company.id, projects, users)

  // Create goods receipts
  await createGoodsReceipts(company.id, purchaseOrders, users)

  // Create documents
  await createDocuments(company.id, vendors, contracts, purchaseOrders, users)

  // Create demo requests
  await createDemoRequests()

  // Create activity logs
  await createActivityLogs(company.id, users)

  // Create notifications
  await createNotifications(company.id, users)

  console.log('Seeding completed successfully!')
}

async function cleanDatabase() {
  // Delete in correct order to avoid foreign key constraints
  const tables = [
    'activity_logs',
    'notifications',
    'documents',
    'payments',
    'invoice_line_items',
    'invoices',
    'expenses',
    'budget_items',
    'resource_assignments',
    'resources',
    'schedule_items',
    'schedules',
    'goods_receipt_line_items',
    'goods_receipts',
    'quote_line_items',
    'quotes',
    'rfq_recipients',
    'rfq_line_items',
    'rfqs',
    'purchase_order_line_items',
    'purchase_orders',
    'work_orders',
    'contract_amendments',
    'contracts',
    'project_vendors',
    'projects',
    'vendor_ratings',
    'vendor_portal_access',
    'vendors',
    'categories',
    'team_members',
    'team_permissions',
    'team_roles',
    'teams',
    'role_permissions',
    'permissions',
    'roles',
    'users',
    'demo_requests',
    'companies'
  ]

  for (const table of tables) {
    await prisma.$executeRawUnsafe(`DELETE FROM "${table}";`)
  }
}

async function createUsers(companyId: string, company2Id: string) {
  const userData = [
    {
      email: 'john.doe@acme.com',
      password: '$2b$10$hashedpassword1',
      name: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      title: 'Procurement Manager',
      department: 'Procurement',
      role: 'admin',
      isActive: true,
      companyId,
      preferences: {
        theme: 'light',
        notifications: true
      }
    },
    {
      email: 'jane.smith@acme.com',
      password: '$2b$10$hashedpassword2',
      name: 'Jane Smith',
      firstName: 'Jane',
      lastName: 'Smith',
      title: 'Project Manager',
      department: 'Operations',
      role: 'manager',
      isActive: true,
      companyId,
      preferences: {
        theme: 'dark',
        notifications: true
      }
    },
    {
      email: 'bob.johnson@acme.com',
      password: '$2b$10$hashedpassword3',
      name: 'Bob Johnson',
      firstName: 'Bob',
      lastName: 'Johnson',
      title: 'Accounts Payable',
      department: 'Finance',
      role: 'member',
      isActive: true,
      companyId
    },
    {
      email: 'alice.williams@acme.com',
      password: '$2b$10$hashedpassword4',
      name: 'Alice Williams',
      firstName: 'Alice',
      lastName: 'Williams',
      title: 'Vendor Relations',
      department: 'Procurement',
      role: 'member',
      isActive: true,
      companyId
    },
    {
      email: 'charlie.brown@techstart.io',
      password: '$2b$10$hashedpassword5',
      name: 'Charlie Brown',
      firstName: 'Charlie',
      lastName: 'Brown',
      title: 'CEO',
      department: 'Executive',
      role: 'admin',
      isActive: true,
      companyId: company2Id
    }
  ]

  const users = []
  for (const data of userData) {
    const user = await prisma.users.create({ data })
    users.push(user)
  }

  console.log(`Created ${users.length} users`)
  return users
}

async function createPermissions(companyId: string) {
  const permissionModules = [
    { module: 'vendors', actions: ['create', 'read', 'update', 'delete', 'approve'] },
    { module: 'contracts', actions: ['create', 'read', 'update', 'delete', 'approve', 'sign'] },
    { module: 'purchase_orders', actions: ['create', 'read', 'update', 'delete', 'approve'] },
    { module: 'invoices', actions: ['create', 'read', 'update', 'delete', 'approve', 'pay'] },
    { module: 'projects', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { module: 'users', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { module: 'reports', actions: ['create', 'read', 'export', 'schedule'] }
  ]

  const permissions = []
  for (const mod of permissionModules) {
    for (const action of mod.actions) {
      const permission = await prisma.permissions.create({
        data: {
          companyId,
          name: `${mod.module}:${action}`,
          module: mod.module,
          action,
          description: `Can ${action} ${mod.module}`,
          isSystem: true
        }
      })
      permissions.push(permission)
    }
  }

  console.log(`Created ${permissions.length} permissions`)
  return permissions
}

async function createRoles(companyId: string, permissions: any[]) {
  const roleData = [
    {
      name: 'Admin',
      description: 'Full system access',
      isSystem: true,
      permissions: permissions
    },
    {
      name: 'Procurement Manager',
      description: 'Manage procurement processes',
      isSystem: true,
      permissions: permissions.filter(p => 
        ['vendors', 'contracts', 'purchase_orders'].includes(p.module) ||
        p.name === 'reports:read'
      )
    },
    {
      name: 'Project Manager',
      description: 'Manage projects and work orders',
      isSystem: true,
      permissions: permissions.filter(p => 
        ['projects', 'work_orders'].includes(p.module) ||
        p.name === 'reports:read'
      )
    },
    {
      name: 'Finance User',
      description: 'Manage invoices and payments',
      isSystem: true,
      permissions: permissions.filter(p => 
        ['invoices', 'payments'].includes(p.module)
      )
    },
    {
      name: 'Viewer',
      description: 'Read-only access',
      isSystem: true,
      permissions: permissions.filter(p => p.action === 'read')
    }
  ]

  const roles = []
  for (const role of roleData) {
    const createdRole = await prisma.roles.create({
      data: {
        companyId,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        permissions: {
          create: role.permissions.map(p => ({
            permissionId: p.id
          }))
        }
      }
    })
    roles.push(createdRole)
  }

  console.log(`Created ${roles.length} roles`)
  return roles
}

async function assignRolesToUsers(users: any[], roles: any[]) {
  // Assign admin role to first user
  await prisma.users.update({
    where: { id: users[0].id },
    data: { roleId: roles.find(r => r.name === 'Admin')?.id }
  })

  // Assign procurement manager to second user
  await prisma.users.update({
    where: { id: users[1].id },
    data: { roleId: roles.find(r => r.name === 'Project Manager')?.id }
  })

  // Assign finance role to third user
  await prisma.users.update({
    where: { id: users[2].id },
    data: { roleId: roles.find(r => r.name === 'Finance User')?.id }
  })

  // Assign viewer role to fourth user
  await prisma.users.update({
    where: { id: users[3].id },
    data: { roleId: roles.find(r => r.name === 'Viewer')?.id }
  })

  console.log('Assigned roles to users')
}

async function createTeams(companyId: string, users: any[]) {
  const teamData = [
    {
      name: 'Procurement Team',
      description: 'Handles all procurement activities',
      createdById: users[0].id
    },
    {
      name: 'Project Management Office',
      description: 'Oversees all projects',
      createdById: users[1].id
    },
    {
      name: 'Finance Department',
      description: 'Manages financial operations',
      createdById: users[2].id
    },
    {
      name: 'Executive Team',
      description: 'Company leadership',
      createdById: users[0].id
    }
  ]

  const teams = []
  for (const team of teamData) {
    const createdTeam = await prisma.teams.create({
      data: {
        companyId,
        ...team
      }
    })
    teams.push(createdTeam)
  }

  console.log(`Created ${teams.length} teams`)
  return teams
}

async function addTeamMembers(teams: any[], users: any[], roles: any[]) {
  // Add users to teams
  const memberships = [
    { team: teams[0], user: users[0], role: roles[0] }, // John in Procurement
    { team: teams[0], user: users[3], role: roles[1] }, // Alice in Procurement
    { team: teams[1], user: users[1], role: roles[2] }, // Jane in PMO
    { team: teams[2], user: users[2], role: roles[3] }, // Bob in Finance
    { team: teams[3], user: users[0], role: roles[0] }, // John in Executive
    { team: teams[3], user: users[1], role: roles[2] }  // Jane in Executive
  ]

  for (const m of memberships) {
    await prisma.team_members.create({
      data: {
        teamId: m.team.id,
        userId: m.user.id,
        roleId: m.role?.id
      }
    })
  }

  console.log(`Created ${memberships.length} team memberships`)
}

async function createCategories(companyId: string) {
  const categoryData = [
    { name: 'Office Supplies', color: 'blue', icon: 'Package', description: 'General office supplies and stationery' },
    { name: 'IT Hardware', color: 'green', icon: 'Laptop', description: 'Computers, servers, and peripherals' },
    { name: 'Software', color: 'purple', icon: 'Code', description: 'Software licenses and subscriptions' },
    { name: 'Consulting', color: 'orange', icon: 'Users', description: 'Professional services and consulting' },
    { name: 'Marketing', color: 'red', icon: 'Megaphone', description: 'Marketing and advertising services' },
    { name: 'Facilities', color: 'yellow', icon: 'Building', description: 'Facility maintenance and management' },
    { name: 'Raw Materials', color: 'indigo', icon: 'Box', description: 'Raw materials for manufacturing' },
    { name: 'Logistics', color: 'pink', icon: 'Truck', description: 'Shipping and logistics services' }
  ]

  const categories = []
  for (const cat of categoryData) {
    const category = await prisma.categories.create({
      data: {
        companyId,
        ...cat
      }
    })
    categories.push(category)
  }

  console.log(`Created ${categories.length} categories`)
  return categories
}

async function createVendors(companyId: string, categories: any[]) {
  const vendorData = [
    {
      name: 'TechSupply Co',
      email: 'sales@techsupply.com',
      phone: '+1-415-555-0101',
      website: 'https://techsupply.com',
      taxId: '98-7654321',
      status: 'active',
      rating: 4,
      reviewCount: 12,
      address: '456 Tech Blvd',
      city: 'San Jose',
      state: 'CA',
      country: 'USA',
      postalCode: '95110',
      contactPerson: 'Sarah Chen',
      contactPersonRole: 'Account Manager',
      contactPersonEmail: 's.chen@techsupply.com',
      contactPersonPhone: '+1-408-555-0102',
      businessType: 'corporation',
      yearEstablished: 2010,
      employeeCount: 50,
      annualRevenue: 10000000,
      paymentTerms: 'net30',
      creditLimit: 50000,
      certified: true,
      preferred: true,
      categoryId: categories.find(c => c.name === 'IT Hardware')?.id,
      tags: ['hardware', 'preferred']
    },
    {
      name: 'Office Essentials',
      email: 'orders@officeessentials.com',
      phone: '+1-510-555-0201',
      website: 'https://officeessentials.com',
      taxId: '87-6543210',
      status: 'active',
      rating: 3,
      reviewCount: 8,
      address: '789 Market St',
      city: 'Oakland',
      state: 'CA',
      country: 'USA',
      postalCode: '94612',
      contactPerson: 'Mike Ross',
      contactPersonRole: 'Sales Director',
      contactPersonEmail: 'm.ross@officeessentials.com',
      businessType: 'llc',
      yearEstablished: 2015,
      employeeCount: 25,
      paymentTerms: 'net15',
      creditLimit: 25000,
      categoryId: categories.find(c => c.name === 'Office Supplies')?.id,
      tags: ['supplies']
    },
    {
      name: 'CloudSoft Inc',
      email: 'sales@cloudsoft.io',
      phone: '+1-650-555-0301',
      website: 'https://cloudsoft.io',
      taxId: '76-5432109',
      status: 'active',
      rating: 5,
      reviewCount: 24,
      address: '321 Innovation Drive',
      city: 'Palo Alto',
      state: 'CA',
      country: 'USA',
      postalCode: '94304',
      contactPerson: 'Alex Rivera',
      contactPersonRole: 'Solutions Engineer',
      contactPersonEmail: 'a.rivera@cloudsoft.io',
      businessType: 'corporation',
      yearEstablished: 2018,
      employeeCount: 120,
      paymentTerms: 'net45',
      creditLimit: 100000,
      certified: true,
      preferred: true,
      categoryId: categories.find(c => c.name === 'Software')?.id,
      tags: ['software', 'cloud']
    },
    {
      name: 'Premier Consulting Group',
      email: 'info@premierconsulting.com',
      phone: '+1-415-555-0401',
      website: 'https://premierconsulting.com',
      taxId: '65-4321098',
      status: 'pending',
      rating: 0,
      reviewCount: 0,
      address: '555 Financial District',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      postalCode: '94111',
      contactPerson: 'Jennifer Lee',
      contactPersonRole: 'Partner',
      contactPersonEmail: 'j.lee@premierconsulting.com',
      businessType: 'partnership',
      yearEstablished: 2020,
      employeeCount: 15,
      paymentTerms: 'net30',
      categoryId: categories.find(c => c.name === 'Consulting')?.id,
      tags: ['consulting']
    },
    {
      name: 'BuildRight Construction',
      email: 'estimates@buildright.com',
      phone: '+1-925-555-0501',
      website: 'https://buildright.com',
      taxId: '54-3210987',
      status: 'active',
      rating: 4,
      reviewCount: 6,
      address: '777 Contractor Way',
      city: 'Walnut Creek',
      state: 'CA',
      country: 'USA',
      postalCode: '94597',
      contactPerson: 'Tom Builder',
      contactPersonRole: 'Project Manager',
      contactPersonEmail: 't.builder@buildright.com',
      businessType: 'corporation',
      yearEstablished: 2005,
      employeeCount: 200,
      paymentTerms: 'net60',
      creditLimit: 200000,
      certified: true,
      categoryId: categories.find(c => c.name === 'Facilities')?.id,
      tags: ['construction', 'facilities']
    }
  ]

  const vendors = []
  for (const vendor of vendorData) {
    const createdVendor = await prisma.vendors.create({
      data: {
        companyId,
        ...vendor
      }
    })
    vendors.push(createdVendor)
  }

  console.log(`Created ${vendors.length} vendors`)
  return vendors
}

async function createVendorRatings(vendors: any[], users: any[]) {
  const ratings = [
    { vendor: vendors[0], rating: 5, comment: 'Excellent service and fast delivery', category: 'quality' },
    { vendor: vendors[0], rating: 4, comment: 'Good products, reasonable prices', category: 'value' },
    { vendor: vendors[1], rating: 3, comment: 'Average quality, slow shipping', category: 'quality' },
    { vendor: vendors[2], rating: 5, comment: 'Best software vendor we\'ve worked with', category: 'support' },
    { vendor: vendors[2], rating: 5, comment: 'Great integration support', category: 'technical' },
    { vendor: vendors[4], rating: 4, comment: 'Completed project on time', category: 'reliability' }
  ]

  for (const r of ratings) {
    await prisma.vendor_ratings.create({
      data: {
        vendorId: r.vendor.id,
        userId: users[Math.floor(Math.random() * users.length)].id,
        rating: r.rating,
        comment: r.comment,
        category: r.category
      }
    })
  }

  console.log(`Created ${ratings.length} vendor ratings`)
}

async function createVendorPortalAccess(vendors: any[]) {
  const portalAccess = [
    {
      vendor: vendors[0],
      email: 'vendor-portal@techsupply.com',
      password: '$2b$10$hashedportal1',
      isActive: true,
      accessLevel: 'standard',
      canViewInvoices: true,
      canSubmitInvoices: true,
      canViewPayments: true,
      canViewPOs: true,
      canViewContracts: true,
      canUploadDocs: true
    },
    {
      vendor: vendors[2],
      email: 'cloudsoft-portal@cloudsoft.io',
      password: '$2b$10$hashedportal2',
      isActive: true,
      accessLevel: 'advanced',
      canViewInvoices: true,
      canSubmitInvoices: true,
      canViewPayments: true,
      canViewPOs: true,
      canSubmitQuotes: true,
      canViewContracts: true,
      canUploadDocs: true
    }
  ]

  for (const portal of portalAccess) {
    await prisma.vendor_portal_access.create({
      data: {
        vendorId: portal.vendor.id,
        email: portal.email,
        password: portal.password,
        isActive: portal.isActive,
        accessLevel: portal.accessLevel,
        canViewInvoices: portal.canViewInvoices,
        canSubmitInvoices: portal.canSubmitInvoices,
        canViewPayments: portal.canViewPayments,
        canViewPOs: portal.canViewPOs,
        canSubmitQuotes: portal.canSubmitQuotes,
        canViewContracts: portal.canViewContracts,
        canUploadDocs: portal.canUploadDocs
      }
    })
  }

  console.log(`Created ${portalAccess.length} vendor portal access records`)
}

async function createProjects(companyId: string, users: any[]) {
  const projectData = [
    {
      projectNumber: 'PRJ-2024-001',
      name: 'Office Renovation Project',
      description: 'Complete renovation of main office floor',
      status: 'in_progress',
      priority: 'high',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-06-30'),
      location: 'San Francisco HQ',
      budget: 250000,
      currency: 'USD',
      progressPercent: 35,
      managerId: users[1].id,
      createdById: users[1].id
    },
    {
      projectNumber: 'PRJ-2024-002',
      name: 'IT Infrastructure Upgrade',
      description: 'Upgrade servers and network equipment',
      status: 'planning',
      priority: 'medium',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-08-31'),
      location: 'Data Center',
      budget: 150000,
      currency: 'USD',
      progressPercent: 10,
      managerId: users[1].id,
      createdById: users[0].id
    },
    {
      projectNumber: 'PRJ-2024-003',
      name: 'ERP Implementation',
      description: 'Implement new ERP system',
      status: 'pending',
      priority: 'high',
      startDate: new Date('2024-04-15'),
      endDate: new Date('2024-12-31'),
      location: 'All Locations',
      budget: 500000,
      currency: 'USD',
      progressPercent: 0,
      managerId: users[1].id,
      createdById: users[0].id
    },
    {
      projectNumber: 'PRJ-2024-004',
      name: 'Annual Marketing Campaign',
      description: 'Q2-Q3 Marketing initiatives',
      status: 'active',
      priority: 'medium',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-09-30'),
      location: 'Remote',
      budget: 75000,
      currency: 'USD',
      progressPercent: 45,
      managerId: users[3].id,
      createdById: users[3].id
    },
    {
      projectNumber: 'PRJ-2024-005',
      name: 'Vendor Portal Launch',
      description: 'Launch vendor self-service portal',
      status: 'completed',
      priority: 'high',
      startDate: new Date('2023-11-01'),
      endDate: new Date('2024-01-31'),
      actualStartDate: new Date('2023-11-01'),
      actualEndDate: new Date('2024-02-15'),
      budget: 80000,
      actualCost: 78500,
      currency: 'USD',
      progressPercent: 100,
      managerId: users[0].id,
      createdById: users[0].id
    }
  ]

  const projects = []
  for (const project of projectData) {
    const createdProject = await prisma.projects.create({
      data: {
        companyId,
        ...project
      }
    })
    projects.push(createdProject)
    
    // Add project vendors
    if (createdProject.name === 'Office Renovation Project') {
      await prisma.project_vendors.create({
        data: {
          projectId: createdProject.id,
          vendorId: vendors[4].id, // BuildRight Construction
          role: 'General Contractor',
          contractValue: 200000,
          startDate: new Date('2024-01-15'),
          status: 'active'
        }
      })
    }
  }

  console.log(`Created ${projects.length} projects`)
  return projects
}

async function createContracts(companyId: string, vendors: any[], users: any[], projects: any[]) {
  const contractData = [
    {
      contractNumber: 'CT-2024-001',
      title: 'IT Hardware Supply Agreement',
      description: 'Annual contract for IT hardware procurement',
      type: 'supply_agreement',
      status: 'active',
      vendorId: vendors[0].id,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      signedDate: new Date('2023-12-15'),
      effectiveDate: new Date('2024-01-01'),
      signedByVendor: true,
      signedByCompany: true,
      value: 500000,
      currency: 'USD',
      paymentTerms: 'net30',
      autoRenew: true,
      approvalStatus: 'approved',
      approvedById: users[0].id,
      approvedAt: new Date('2023-12-10'),
      createdById: users[0].id
    },
    {
      contractNumber: 'CT-2024-002',
      title: 'Office Supplies Framework',
      description: 'Framework agreement for office supplies',
      type: 'framework_agreement',
      status: 'active',
      vendorId: vendors[1].id,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2025-01-31'),
      signedDate: new Date('2024-01-20'),
      value: 100000,
      currency: 'USD',
      paymentTerms: 'net15',
      approvalStatus: 'approved',
      approvedById: users[2].id,
      approvedAt: new Date('2024-01-15'),
      createdById: users[2].id
    },
    {
      contractNumber: 'CT-2024-003',
      title: 'Software License Agreement',
      description: 'Enterprise software licenses',
      type: 'license_agreement',
      status: 'pending',
      vendorId: vendors[2].id,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2025-02-28'),
      value: 250000,
      currency: 'USD',
      paymentTerms: 'net45',
      approvalStatus: 'pending_review',
      createdById: users[0].id
    },
    {
      contractNumber: 'CT-2024-004',
      title: 'Construction Services Contract',
      description: 'Office renovation services',
      type: 'service_contract',
      status: 'active',
      vendorId: vendors[4].id,
      projectId: projects[0].id,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-06-30'),
      signedDate: new Date('2024-01-10'),
      value: 200000,
      currency: 'USD',
      paymentTerms: 'net60',
      approvalStatus: 'approved',
      approvedById: users[1].id,
      approvedAt: new Date('2024-01-05'),
      createdById: users[1].id
    }
  ]

  const contracts = []
  for (const contract of contractData) {
    const createdContract = await prisma.contracts.create({
      data: {
        companyId,
        ...contract
      }
    })
    contracts.push(createdContract)
  }

  console.log(`Created ${contracts.length} contracts`)
  return contracts
}

async function createPurchaseOrders(companyId: string, vendors: any[], contracts: any[], projects: any[], users: any[]) {
  const poData = [
    {
      poNumber: 'PO-2024-001',
      title: 'Server Hardware Order',
      description: 'Purchase of 10 new servers',
      status: 'approved',
      priority: 'high',
      vendorId: vendors[0].id,
      contractId: contracts[0].id,
      projectId: projects[1].id,
      orderDate: new Date('2024-02-15'),
      expectedDate: new Date('2024-03-15'),
      subtotal: 85000,
      taxAmount: 6800,
      taxRate: 8,
      total: 91800,
      currency: 'USD',
      approvalStatus: 'approved',
      approvedById: users[0].id,
      approvedAt: new Date('2024-02-16'),
      createdById: users[0].id,
      lineItems: {
        create: [
          {
            lineNumber: 1,
            description: 'Dell PowerEdge R750 Server',
            sku: 'PE-R750-001',
            quantity: 5,
            unit: 'each',
            unitPrice: 12000,
            total: 60000,
            expectedDate: new Date('2024-03-15')
          },
          {
            lineNumber: 2,
            description: 'Dell PowerEdge R650 Server',
            sku: 'PE-R650-002',
            quantity: 5,
            unit: 'each',
            unitPrice: 5000,
            total: 25000,
            expectedDate: new Date('2024-03-15')
          }
        ]
      }
    },
    {
      poNumber: 'PO-2024-002',
      title: 'Office Supplies Order',
      description: 'Monthly office supplies',
      status: 'pending',
      priority: 'low',
      vendorId: vendors[1].id,
      contractId: contracts[1].id,
      orderDate: new Date('2024-03-01'),
      expectedDate: new Date('2024-03-07'),
      subtotal: 3500,
      taxAmount: 280,
      taxRate: 8,
      total: 3780,
      currency: 'USD',
      approvalStatus: 'pending',
      createdById: users[3].id,
      lineItems: {
        create: [
          {
            lineNumber: 1,
            description: 'Printer Paper - Case of 10',
            sku: 'PP-001',
            quantity: 20,
            unit: 'case',
            unitPrice: 45,
            total: 900
          },
          {
            lineNumber: 2,
            description: 'Pilot G2 Pens - Box of 12',
            sku: 'PG-12',
            quantity: 50,
            unit: 'box',
            unitPrice: 15,
            total: 750
          },
          {
            lineNumber: 3,
            description: 'Post-it Notes - Pack of 24',
            sku: 'PN-24',
            quantity: 100,
            unit: 'pack',
            unitPrice: 8.50,
            total: 850
          }
        ]
      }
    },
    {
      poNumber: 'PO-2024-003',
      title: 'Construction Materials',
      description: 'Materials for office renovation',
      status: 'approved',
      priority: 'high',
      vendorId: vendors[4].id,
      contractId: contracts[3].id,
      projectId: projects[0].id,
      orderDate: new Date('2024-02-01'),
      expectedDate: new Date('2024-02-28'),
      subtotal: 45000,
      taxAmount: 3600,
      taxRate: 8,
      total: 48600,
      currency: 'USD',
      approvalStatus: 'approved',
      approvedById: users[1].id,
      approvedAt: new Date('2024-02-02'),
      createdById: users[1].id,
      lineItems: {
        create: [
          {
            lineNumber: 1,
            description: 'Office Furniture Package',
            sku: 'FURN-001',
            quantity: 1,
            unit: 'lot',
            unitPrice: 35000,
            total: 35000
          },
          {
            lineNumber: 2,
            description: 'Paint and Supplies',
            sku: 'PAINT-001',
            quantity: 1,
            unit: 'lot',
            unitPrice: 5000,
            total: 5000
          }
        ]
      }
    }
  ]

  const purchaseOrders = []
  for (const po of poData) {
    const { lineItems, ...poWithoutItems } = po
    const createdPO = await prisma.purchase_orders.create({
      data: {
        companyId,
        ...poWithoutItems,
        lineItems: lineItems
      }
    })
    purchaseOrders.push(createdPO)
  }

  console.log(`Created ${purchaseOrders.length} purchase orders`)
  return purchaseOrders
}

async function createRFQs(companyId: string, vendors: any[], projects: any[], users: any[], purchaseOrders: any[]) {
  const rfqData = [
    {
      rfqNumber: 'RFQ-2024-001',
      title: 'RFQ for Network Equipment',
      description: 'Request for quotes for network switches and routers',
      status: 'sent',
      issueDate: new Date('2024-02-10'),
      deadline: new Date('2024-02-25'),
      expectedDeliveryDate: new Date('2024-03-15'),
      purchaseOrderId: purchaseOrders[0].id,
      createdById: users[0].id,
      lineItems: {
        create: [
          {
            lineNumber: 1,
            description: 'Cisco Catalyst 9300 Switch',
            quantity: 4,
            unit: 'each',
            specifications: '48-port, PoE+'
          },
          {
            lineNumber: 2,
            description: 'Cisco ISR 4321 Router',
            quantity: 2,
            unit: 'each',
            specifications: 'with security license'
          }
        ]
      },
      recipients: {
        create: [
          { vendorId: vendors[0].id, status: 'responded' },
          { vendorId: vendors[2].id, status: 'pending' }
        ]
      }
    },
    {
      rfqNumber: 'RFQ-2024-002',
      title: 'RFQ for Marketing Services',
      description: 'Digital marketing campaign services',
      status: 'draft',
      issueDate: new Date('2024-03-01'),
      deadline: new Date('2024-03-20'),
      projectId: projects[3].id,
      createdById: users[3].id,
      lineItems: {
        create: [
          {
            lineNumber: 1,
            description: 'Social Media Management',
            quantity: 3,
            unit: 'months'
          },
          {
            lineNumber: 2,
            description: 'Content Creation',
            quantity: 1,
            unit: 'package'
          }
        ]
      },
      recipients: {
        create: [
          { vendorId: vendors[3].id, status: 'pending' }
        ]
      }
    }
  ]

  const rfqs = []
  for (const rfq of rfqData) {
    const { recipients, lineItems, ...rfqWithoutRelations } = rfq
    const createdRFQ = await prisma.rfqs.create({
      data: {
        companyId,
        ...rfqWithoutRelations,
        lineItems: lineItems,
        recipients: recipients
      }
    })
    rfqs.push(createdRFQ)
  }

  console.log(`Created ${rfqs.length} RFQs`)
  return rfqs
}

async function createQuotes(companyId: string, rfqs: any[], vendors: any[], users: any[]) {
  const quoteData = [
    {
      quoteNumber: 'Q-2024-001',
      rfqId: rfqs[0].id,
      vendorId: vendors[0].id,
      status: 'submitted',
      validUntil: new Date('2024-03-25'),
      submittedAt: new Date('2024-02-20'),
      subtotal: 45000,
      taxAmount: 3600,
      taxRate: 8,
      total: 48600,
      currency: 'USD',
      notes: 'Includes installation',
      deliveryTime: 14,
      createdById: users[0].id,
      lineItems: {
        create: [
          {
            lineNumber: 1,
            description: 'Cisco Catalyst 9300 Switch',
            quantity: 4,
            unit: 'each',
            unitPrice: 8500,
            total: 34000
          },
          {
            lineNumber: 2,
            description: 'Cisco ISR 4321 Router',
            quantity: 2,
            unit: 'each',
            unitPrice: 5500,
            total: 11000
          }
        ]
      }
    },
    {
      quoteNumber: 'Q-2024-002',
      rfqId: rfqs[0].id,
      vendorId: vendors[2].id,
      status: 'submitted',
      validUntil: new Date('2024-03-20'),
      submittedAt: new Date('2024-02-22'),
      subtotal: 42500,
      taxAmount: 3400,
      taxRate: 8,
      total: 45900,
      currency: 'USD',
      notes: '5-year warranty included',
      deliveryTime: 10,
      createdById: users[0].id,
      lineItems: {
        create: [
          {
            lineNumber: 1,
            description: 'Juniper EX3400 Switch',
            quantity: 4,
            unit: 'each',
            unitPrice: 7800,
            total: 31200
          },
          {
            lineNumber: 2,
            description: 'Juniper SRX300 Router',
            quantity: 2,
            unit: 'each',
            unitPrice: 5650,
            total: 11300
          }
        ]
      }
    }
  ]

  const quotes = []
  for (const quote of quoteData) {
    const { lineItems, ...quoteWithoutItems } = quote
    const createdQuote = await prisma.quotes.create({
      data: {
        companyId,
        ...quoteWithoutItems,
        lineItems: lineItems
      }
    })
    quotes.push(createdQuote)
  }

  console.log(`Created ${quotes.length} quotes`)
  return quotes
}

async function createWorkOrders(companyId: string, vendors: any[], contracts: any[], projects: any[], users: any[]) {
  const workOrderData = [
    {
      workOrderNumber: 'WO-2024-001',
      title: 'Office Renovation - Phase 1',
      description: 'Demolition and framing',
      status: 'in_progress',
      priority: 'high',
      type: 'construction',
      vendorId: vendors[4].id,
      contractId: contracts[3].id,
      projectId: projects[0].id,
      requestedDate: new Date('2024-01-15'),
      scheduledDate: new Date('2024-01-20'),
      startDate: new Date('2024-01-20'),
      dueDate: new Date('2024-02-15'),
      estimatedHours: 240,
      actualHours: 180,
      location: 'Main Office - Floor 3',
      siteContact: 'Tom Builder',
      sitePhone: '+1-925-555-0501',
      estimatedCost: 35000,
      actualCost: 32500,
      currency: 'USD',
      approvalStatus: 'approved',
      approvedById: users[1].id,
      approvedAt: new Date('2024-01-18'),
      createdById: users[1].id
    },
    {
      workOrderNumber: 'WO-2024-002',
      title: 'Server Installation',
      description: 'Install new servers in data center',
      status: 'pending',
      priority: 'medium',
      type: 'installation',
      vendorId: vendors[0].id,
      contractId: contracts[0].id,
      projectId: projects[1].id,
      requestedDate: new Date('2024-03-01'),
      scheduledDate: new Date('2024-03-20'),
      dueDate: new Date('2024-03-25'),
      estimatedHours: 40,
      location: 'Data Center - Rack A',
      siteContact: 'Sarah Chen',
      estimatedCost: 5000,
      currency: 'USD',
      approvalStatus: 'pending',
      createdById: users[0].id
    },
    {
      workOrderNumber: 'WO-2024-003',
      title: 'Quarterly Maintenance',
      description: 'Routine facility maintenance',
      status: 'completed',
      priority: 'low',
      type: 'maintenance',
      vendorId: vendors[4].id,
      requestedDate: new Date('2024-02-01'),
      scheduledDate: new Date('2024-02-05'),
      startDate: new Date('2024-02-05'),
      completedDate: new Date('2024-02-06'),
      dueDate: new Date('2024-02-10'),
      estimatedHours: 16,
      actualHours: 14,
      location: 'All Facilities',
      estimatedCost: 2000,
      actualCost: 1750,
      currency: 'USD',
      completionNotes: 'All maintenance completed successfully',
      completedBy: 'Maintenance Team',
      completedAt: new Date('2024-02-06'),
      approvalStatus: 'approved',
      approvedById: users[1].id,
      approvedAt: new Date('2024-02-04'),
      createdById: users[1].id
    }
  ]

  const workOrders = []
  for (const wo of workOrderData) {
    const createdWO = await prisma.work_orders.create({
      data: {
        companyId,
        ...wo
      }
    })
    workOrders.push(createdWO)
  }

  console.log(`Created ${workOrders.length} work orders`)
  return workOrders
}

async function createSchedules(companyId: string, projects: any[], users: any[], workOrders: any[]) {
  const scheduleData = [
    {
      scheduleNumber: 'SCH-2024-001',
      name: 'Office Renovation Schedule',
      description: 'Detailed schedule for renovation project',
      type: 'project',
      status: 'active',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-06-30'),
      projectId: projects[0].id,
      createdById: users[1].id,
      items: {
        create: [
          {
            title: 'Demolition Phase',
            description: 'Remove existing structures',
            startTime: new Date('2024-01-20T08:00:00Z'),
            endTime: new Date('2024-02-05T17:00:00Z'),
            isAllDay: false,
            location: 'Floor 3',
            status: 'in_progress',
            assignedToId: users[4]?.id,
            workOrderId: workOrders[0]?.id
          },
          {
            title: 'Framing',
            description: 'Install new walls and partitions',
            startTime: new Date('2024-02-06T08:00:00Z'),
            endTime: new Date('2024-02-28T17:00:00Z'),
            isAllDay: false,
            location: 'Floor 3',
            status: 'scheduled',
            assignedToId: users[4]?.id
          },
          {
            title: 'Electrical Work',
            description: 'Run new wiring and install fixtures',
            startTime: new Date('2024-03-01T08:00:00Z'),
            endTime: new Date('2024-03-20T17:00:00Z'),
            isAllDay: false,
            location: 'Floor 3',
            status: 'scheduled'
          }
        ]
      }
    },
    {
      scheduleNumber: 'SCH-2024-002',
      name: 'IT Project Schedule',
      description: 'Schedule for IT infrastructure upgrade',
      type: 'project',
      status: 'active',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-08-31'),
      projectId: projects[1].id,
      createdById: users[0].id,
      items: {
        create: [
          {
            title: 'Server Installation',
            description: 'Install new servers',
            startTime: new Date('2024-03-20T09:00:00Z'),
            endTime: new Date('2024-03-25T17:00:00Z'),
            isAllDay: false,
            location: 'Data Center',
            status: 'scheduled',
            assignedToId: users[0].id,
            workOrderId: workOrders[1]?.id
          },
          {
            title: 'Network Configuration',
            description: 'Configure network equipment',
            startTime: new Date('2024-03-26T09:00:00Z'),
            endTime: new Date('2024-03-30T17:00:00Z'),
            isAllDay: false,
            location: 'Data Center',
            status: 'scheduled'
          }
        ]
      }
    }
  ]

  const schedules = []
  for (const schedule of scheduleData) {
    const { items, ...scheduleWithoutItems } = schedule
    const createdSchedule = await prisma.schedules.create({
      data: {
        companyId,
        ...scheduleWithoutItems,
        items: items
      }
    })
    schedules.push(createdSchedule)
  }

  console.log(`Created ${schedules.length} schedules`)
  return schedules
}

async function createResources(companyId: string, users: any[]) {
  const resourceData = [
    {
      name: 'Excavator - CAT 320',
      type: 'equipment',
      category: 'Heavy Equipment',
      description: 'Hydraulic excavator for construction',
      status: 'available',
      location: 'Warehouse A',
      model: 'CAT 320',
      serialNumber: 'CAT320-2023-001',
      capacity: '20 tons',
      lastMaintenance: new Date('2024-01-15'),
      nextMaintenance: new Date('2024-04-15'),
      maintenanceInterval: 90,
      hourlyRate: 150,
      dailyRate: 1200,
      purchaseCost: 250000,
      createdById: users[1].id
    },
    {
      name: 'Scissor Lift',
      type: 'equipment',
      category: 'Access Equipment',
      description: 'Electric scissor lift',
      status: 'in_use',
      location: 'Main Office - Floor 3',
      model: 'JLG 1930ES',
      serialNumber: 'JLG-2023-045',
      capacity: '500 lbs',
      lastMaintenance: new Date('2024-02-01'),
      nextMaintenance: new Date('2024-05-01'),
      hourlyRate: 45,
      dailyRate: 350,
      createdById: users[1].id
    },
    {
      name: 'Project Manager - Senior',
      type: 'personnel',
      category: 'Management',
      description: 'Senior project manager',
      status: 'available',
      hourlyRate: 85,
      dailyRate: 650,
      createdById: users[1].id
    },
    {
      name: 'Electrician',
      type: 'personnel',
      category: 'Skilled Labor',
      description: 'Licensed electrician',
      status: 'available',
      hourlyRate: 65,
      dailyRate: 520,
      createdById: users[1].id
    },
    {
      name: 'Forklift - Toyota',
      type: 'equipment',
      category: 'Material Handling',
      description: 'Propane forklift',
      status: 'maintenance',
      location: 'Warehouse B',
      model: 'Toyota 8FGCU25',
      serialNumber: 'TOY-2022-123',
      capacity: '5000 lbs',
      lastMaintenance: new Date('2024-02-28'),
      nextMaintenance: new Date('2024-03-28'),
      hourlyRate: 55,
      dailyRate: 440,
      createdById: users[1].id
    }
  ]

  const resources = []
  for (const resource of resourceData) {
    const createdResource = await prisma.resources.create({
      data: {
        companyId,
        ...resource
      }
    })
    resources.push(createdResource)
  }

  console.log(`Created ${resources.length} resources`)
  return resources
}

async function createResourceAssignments(resources: any[], projects: any[], workOrders: any[], users: any[]) {
  const assignmentData = [
    {
      resourceId: resources[1].id, // Scissor Lift
      projectId: projects[0].id,
      workOrderId: workOrders[0]?.id,
      assignedFrom: new Date('2024-02-15T08:00:00Z'),
      assignedTo: new Date('2024-03-15T17:00:00Z'),
      quantity: 1,
      status: 'active',
      assignedById: users[1].id,
      notes: 'For ceiling work'
    },
    {
      resourceId: resources[3].id, // Electrician
      projectId: projects[0].id,
      assignedFrom: new Date('2024-03-01T08:00:00Z'),
      assignedTo: new Date('2024-03-20T17:00:00Z'),
      quantity: 2,
      status: 'active',
      assignedById: users[1].id,
      notes: 'Electrical rough-in'
    },
    {
      resourceId: resources[4].id, // Forklift
      projectId: projects[0].id,
      assignedFrom: new Date('2024-02-01T08:00:00Z'),
      assignedTo: new Date('2024-02-28T17:00:00Z'),
      quantity: 1,
      status: 'completed',
      assignedById: users[1].id
    }
  ]

  for (const assignment of assignmentData) {
    await prisma.resource_assignments.create({
      data: assignment
    })
  }

  console.log(`Created ${assignmentData.length} resource assignments`)
}

async function createInvoices(companyId: string, vendors: any[], workOrders: any[], contracts: any[], purchaseOrders: any[], projects: any[], users: any[]) {
  const invoiceData = [
    {
      invoiceNumber: 'INV-2024-001',
      vendorId: vendors[4].id,
      workOrderId: workOrders[0]?.id,
      contractId: contracts[3]?.id,
      projectId: projects[0]?.id,
      reference: 'Progress Billing - Phase 1',
      status: 'paid',
      type: 'service',
      issueDate: new Date('2024-02-01'),
      dueDate: new Date('2024-03-02'),
      paidDate: new Date('2024-02-20'),
      subtotal: 32500,
      taxAmount: 2600,
      taxRate: 8,
      total: 35100,
      balance: 0,
      currency: 'USD',
      paymentTerms: 'net30',
      notes: 'Payment for phase 1 completion',
      approvalStatus: 'approved',
      approvedById: users[2].id,
      approvedAt: new Date('2024-02-03'),
      createdById: users[1].id,
      lineItems: {
        create: [
          {
            lineNumber: 1,
            description: 'Demolition and framing',
            quantity: 1,
            unit: 'lump sum',
            unitPrice: 20000,
            total: 20000
          },
          {
            lineNumber: 2,
            description: 'Materials',
            quantity: 1,
            unit: 'lump sum',
            unitPrice: 12500,
            total: 12500
          }
        ]
      }
    },
    {
      invoiceNumber: 'INV-2024-002',
      vendorId: vendors[0].id,
      purchaseOrderId: purchaseOrders[0]?.id,
      contractId: contracts[0]?.id,
      projectId: projects[1]?.id,
      reference: 'Server Hardware',
      status: 'pending',
      type: 'product',
      issueDate: new Date('2024-03-01'),
      dueDate: new Date('2024-03-31'),
      subtotal: 85000,
      taxAmount: 6800,
      taxRate: 8,
      total: 91800,
      balance: 91800,
      currency: 'USD',
      paymentTerms: 'net30',
      notes: 'Invoice for server hardware',
      approvalStatus: 'pending',
      createdById: users[0].id,
      lineItems: {
        create: [
          {
            lineNumber: 1,
            description: 'Dell PowerEdge R750 Servers',
            quantity: 5,
            unit: 'each',
            unitPrice: 12000,
            total: 60000,
            poLineItemId: (await prisma.purchase_order_line_items.findFirst({
              where: { purchaseOrderId: purchaseOrders[0]?.id, lineNumber: 1 }
            }))?.id
          },
          {
            lineNumber: 2,
            description: 'Dell PowerEdge R650 Servers',
            quantity: 5,
            unit: 'each',
            unitPrice: 5000,
            total: 25000,
            poLineItemId: (await prisma.purchase_order_line_items.findFirst({
              where: { purchaseOrderId: purchaseOrders[0]?.id, lineNumber: 2 }
            }))?.id
          }
        ]
      }
    },
    {
      invoiceNumber: 'INV-2024-003',
      vendorId: vendors[1].id,
      purchaseOrderId: purchaseOrders[1]?.id,
      reference: 'Monthly Office Supplies',
      status: 'draft',
      type: 'product',
      issueDate: new Date('2024-03-05'),
      dueDate: new Date('2024-03-20'),
      subtotal: 3500,
      taxAmount: 280,
      taxRate: 8,
      total: 3780,
      balance: 3780,
      currency: 'USD',
      paymentTerms: 'net15',
      approvalStatus: 'draft',
      createdById: users[3].id,
      lineItems: {
        create: [
          {
            lineNumber: 1,
            description: 'Office supplies',
            quantity: 1,
            unit: 'lot',
            unitPrice: 3500,
            total: 3500,
            poLineItemId: (await prisma.purchase_order_line_items.findFirst({
              where: { purchaseOrderId: purchaseOrders[1]?.id }
            }))?.id
          }
        ]
      }
    }
  ]

  const invoices = []
  for (const invoice of invoiceData) {
    const { lineItems, ...invoiceWithoutItems } = invoice
    const createdInvoice = await prisma.invoices.create({
      data: {
        companyId,
        ...invoiceWithoutItems,
        lineItems: lineItems
      }
    })
    invoices.push(createdInvoice)
  }

  console.log(`Created ${invoices.length} invoices`)
  return invoices
}

async function createPayments(companyId: string, invoices: any[], users: any[]) {
  const paymentData = [
    {
      paymentNumber: 'PAY-2024-001',
      invoiceId: invoices[0].id,
      amount: 35100,
      currency: 'USD',
      method: 'wire_transfer',
      status: 'completed',
      paymentDate: new Date('2024-02-20'),
      processedDate: new Date('2024-02-20'),
      settlementDate: new Date('2024-02-22'),
      reference: 'Wire transfer confirmation #12345',
      bankName: 'Chase Bank',
      accountNumber: '****1234',
      createdById: users[2].id
    },
    {
      paymentNumber: 'PAY-2024-002',
      invoiceId: invoices[0].id,
      amount: 17550,
      currency: 'USD',
      method: 'check',
      status: 'processing',
      paymentDate: new Date('2024-02-15'),
      checkNumber: '1001',
      reference: 'Partial payment',
      createdById: users[2].id
    }
  ]

  for (const payment of paymentData) {
    await prisma.payments.create({
      data: {
        companyId,
        ...payment
      }
    })
  }

  console.log(`Created ${paymentData.length} payments`)
}

async function createExpenses(companyId: string, vendors: any[], projects: any[], workOrders: any[], users: any[]) {
  const expenseData = [
    {
      expenseNumber: 'EXP-2024-001',
      vendorId: vendors[4].id,
      projectId: projects[0].id,
      workOrderId: workOrders[0]?.id,
      category: 'Materials',
      description: 'Emergency material purchase',
      amount: 2500,
      currency: 'USD',
      expenseDate: new Date('2024-02-10'),
      receiptUrl: 'https://example.com/receipts/001.pdf',
      receiptNumber: 'REC-001',
      isBillable: true,
      billableClient: 'Office Renovation',
      status: 'approved',
      approvedById: users[1].id,
      approvedAt: new Date('2024-02-12'),
      createdById: users[1].id,
      notes: 'Additional drywall materials'
    },
    {
      expenseNumber: 'EXP-2024-002',
      vendorId: vendors[1].id,
      category: 'Office Supplies',
      description: 'Emergency office supplies',
      amount: 350,
      currency: 'USD',
      expenseDate: new Date('2024-02-15'),
      receiptUrl: 'https://example.com/receipts/002.pdf',
      status: 'pending',
      createdById: users[3].id,
      notes: 'Printer toner'
    },
    {
      expenseNumber: 'EXP-2024-003',
      category: 'Travel',
      description: 'Site visit - Project manager',
      amount: 450,
      currency: 'USD',
      expenseDate: new Date('2024-02-20'),
      status: 'approved',
      approvedById: users[0].id,
      approvedAt: new Date('2024-02-22'),
      createdById: users[1].id,
      notes: 'Uber and meals'
    }
  ]

  for (const expense of expenseData) {
    await prisma.expenses.create({
      data: {
        companyId,
        ...expense
      }
    })
  }

  console.log(`Created ${expenseData.length} expenses`)
}

async function createBudgetItems(companyId: string, projects: any[], users: any[]) {
  const budgetItemData = [
    {
      projectId: projects[0].id,
      fiscalYear: 2024,
      category: 'Construction',
      description: 'Construction materials and labor',
      plannedAmount: 200000,
      actualAmount: 32500,
      committedAmount: 48500,
      currency: 'USD',
      periodStart: new Date('2024-01-01'),
      periodEnd: new Date('2024-03-31'),
      status: 'active',
      approvedById: users[1].id,
      approvedAt: new Date('2024-01-05'),
      createdById: users[1].id
    },
    {
      projectId: projects[1].id,
      fiscalYear: 2024,
      category: 'Hardware',
      description: 'Server and network equipment',
      plannedAmount: 150000,
      actualAmount: 0,
      committedAmount: 91800,
      currency: 'USD',
      periodStart: new Date('2024-01-01'),
      periodEnd: new Date('2024-06-30'),
      status: 'active',
      approvedById: users[0].id,
      approvedAt: new Date('2024-01-10'),
      createdById: users[0].id
    },
    {
      fiscalYear: 2024,
      category: 'Office Supplies',
      description: 'General office supplies budget',
      plannedAmount: 25000,
      actualAmount: 3850,
      committedAmount: 3780,
      currency: 'USD',
      periodStart: new Date('2024-01-01'),
      periodEnd: new Date('2024-12-31'),
      status: 'active',
      approvedById: users[2].id,
      approvedAt: new Date('2024-01-15'),
      createdById: users[2].id
    }
  ]

  for (const budget of budgetItemData) {
    const variance = budget.actualAmount - budget.plannedAmount
    const variancePercent = (variance / budget.plannedAmount) * 100
    
    await prisma.budget_items.create({
      data: {
        companyId,
        ...budget,
        variance,
        variancePercent
      }
    })
  }

  console.log(`Created ${budgetItemData.length} budget items`)
}

async function createGoodsReceipts(companyId: string, purchaseOrders: any[], users: any[]) {
  const receiptData = [
    {
      receiptNumber: 'GR-2024-001',
      purchaseOrderId: purchaseOrders[0].id,
      receivedDate: new Date('2024-03-15'),
      status: 'completed',
      notes: 'All items received in good condition',
      inspectedById: users[0].id,
      inspectedAt: new Date('2024-03-15'),
      inspectionNotes: 'Visual inspection passed',
      receivedById: users[0].id,
      lineItems: {
        create: [
          {
            poLineItemId: (await prisma.purchase_order_line_items.findFirst({
              where: { purchaseOrderId: purchaseOrders[0].id, lineNumber: 1 }
            }))?.id,
            quantity: 5,
            acceptedQuantity: 5,
            rejectedQuantity: 0,
            notes: 'All servers received'
          },
          {
            poLineItemId: (await prisma.purchase_order_line_items.findFirst({
              where: { purchaseOrderId: purchaseOrders[0].id, lineNumber: 2 }
            }))?.id,
            quantity: 5,
            acceptedQuantity: 4,
            rejectedQuantity: 1,
            rejectionReason: 'Damaged during shipping',
            notes: 'One unit damaged, will return'
          }
        ]
      }
    }
  ]

  for (const receipt of receiptData) {
    const { lineItems, ...receiptWithoutItems } = receipt
    await prisma.goods_receipts.create({
      data: {
        companyId,
        ...receiptWithoutItems,
        lineItems: lineItems
      }
    })
  }

  console.log(`Created ${receiptData.length} goods receipts`)
}

async function createDocuments(companyId: string, vendors: any[], contracts: any[], purchaseOrders: any[], users: any[]) {
  const documentData = [
    {
      entityType: 'vendor',
      entityId: vendors[0].id,
      vendorId: vendors[0].id,
      name: 'Vendor Agreement - TechSupply',
      description: 'Signed vendor agreement',
      fileUrl: 'https://example.com/docs/vendor-agreement-techsupply.pdf',
      fileName: 'vendor-agreement-techsupply.pdf',
      fileSize: 2500000,
      fileType: 'application/pdf',
      category: 'contracts',
      version: 1,
      isLatest: true,
      uploadedById: users[0].id,
      uploadedAt: new Date('2024-01-15')
    },
    {
      entityType: 'contract',
      entityId: contracts[0].id,
      vendorId: vendors[0].id,
      name: 'IT Hardware Supply Contract',
      description: 'Signed contract',
      fileUrl: 'https://example.com/docs/contract-it-hardware.pdf',
      fileName: 'contract-it-hardware.pdf',
      fileSize: 3500000,
      fileType: 'application/pdf',
      category: 'contracts',
      version: 1,
      isLatest: true,
      uploadedById: users[0].id,
      uploadedAt: new Date('2024-01-10')
    },
    {
      entityType: 'purchase_order',
      entityId: purchaseOrders[0].id,
      vendorId: vendors[0].id,
      name: 'PO-2024-001 Supporting Documents',
      description: 'Technical specifications',
      fileUrl: 'https://example.com/docs/po-2024-001-specs.pdf',
      fileName: 'po-2024-001-specs.pdf',
      fileSize: 1800000,
      fileType: 'application/pdf',
      category: 'specifications',
      version: 1,
      isLatest: true,
      uploadedById: users[0].id,
      uploadedAt: new Date('2024-02-15')
    },
    {
      entityType: 'vendor',
      entityId: vendors[2].id,
      vendorId: vendors[2].id,
      name: 'W-9 Form',
      description: 'Tax information',
      fileUrl: 'https://example.com/docs/w9-cloudsoft.pdf',
      fileName: 'w9-cloudsoft.pdf',
      fileSize: 500000,
      fileType: 'application/pdf',
      category: 'tax',
      version: 1,
      isLatest: true,
      uploadedById: users[2].id,
      uploadedAt: new Date('2024-02-01')
    }
  ]

  for (const doc of documentData) {
    await prisma.documents.create({
      data: {
        companyId,
        ...doc
      }
    })
  }

  console.log(`Created ${documentData.length} documents`)
}

async function createDemoRequests() {
  const demoRequestData = [
    {
      requestNumber: 'DEMO-2024-001',
      fullName: 'Michael Scott',
      email: 'michael.scott@dundermifflin.com',
      companyName: 'Dunder Mifflin',
      phone: '+1-570-555-0101',
      companySize: '200-500',
      interests: ['procurement', 'vendor-management'],
      preferredDate: new Date('2024-03-20'),
      preferredTime: '10:00 AM EST',
      status: 'pending',
      notes: 'Interested in procurement module',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      requestNumber: 'DEMO-2024-002',
      fullName: 'Dwight Schrute',
      email: 'dwight.schrute@dundermifflin.com',
      companyName: 'Schrute Farms',
      phone: '+1-570-555-0102',
      companySize: '10-50',
      interests: ['contracts', 'project-management'],
      preferredDate: new Date('2024-03-22'),
      preferredTime: '2:00 PM EST',
      status: 'contacted',
      assignedToId: users[0]?.id,
      notes: 'Interested in beet farming project tracking',
      ipAddress: '192.168.1.101'
    },
    {
      requestNumber: 'DEMO-2024-003',
      fullName: 'Jim Halpert',
      email: 'jim.halpert@dundermifflin.com',
      companyName: 'Athlead',
      phone: '+1-570-555-0103',
      companySize: '50-200',
      interests: ['invoicing', 'payments'],
      status: 'converted',
      assignedToId: users[1]?.id,
      notes: 'Signed up for trial',
      ipAddress: '192.168.1.102'
    }
  ]

  for (const demo of demoRequestData) {
    await prisma.demo_requests.create({
      data: demo
    })
  }

  console.log(`Created ${demoRequestData.length} demo requests`)
}

async function createActivityLogs(companyId: string, users: any[]) {
  const activityData = [
    {
      action: 'CREATE',
      entityType: 'vendor',
      entityId: vendors[0].id,
      entityName: vendors[0].name,
      userId: users[0].id,
      userEmail: users[0].email,
      userName: users[0].name,
      changes: { created: vendors[0] },
      ipAddress: '10.0.0.1'
    },
    {
      action: 'UPDATE',
      entityType: 'purchase_order',
      entityId: purchaseOrders[0].id,
      entityName: purchaseOrders[0].title,
      userId: users[0].id,
      userEmail: users[0].email,
      userName: users[0].name,
      changes: { status: { old: 'draft', new: 'approved' } },
      ipAddress: '10.0.0.1'
    },
    {
      action: 'APPROVE',
      entityType: 'invoice',
      entityId: invoices[0].id,
      entityName: invoices[0].invoiceNumber,
      userId: users[2].id,
      userEmail: users[2].email,
      userName: users[2].name,
      changes: { approvalStatus: 'approved' },
      ipAddress: '10.0.0.2'
    },
    {
      action: 'LOGIN',
      entityType: 'user',
      entityId: users[0].id,
      entityName: users[0].name,
      userId: users[0].id,
      userEmail: users[0].email,
      userName: users[0].name,
      ipAddress: '10.0.0.1',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    }
  ]

  for (const activity of activityData) {
    await prisma.activity_logs.create({
      data: {
        companyId,
        ...activity
      }
    })
  }

  console.log(`Created ${activityData.length} activity logs`)
}

async function createNotifications(companyId: string, users: any[]) {
  const notificationData = [
    {
      userId: users[0].id,
      type: 'PO_APPROVAL',
      title: 'Purchase Order Approval Required',
      message: 'PO-2024-002 requires your approval',
      status: 'unread',
      priority: 'high',
      entityType: 'purchase_order',
      entityId: purchaseOrders[1]?.id,
      actionUrl: '/procurement/po/PO-2024-002',
      actions: { approve: true, reject: true }
    },
    {
      userId: users[2].id,
      type: 'INVOICE_DUE',
      title: 'Invoice Payment Due',
      message: 'INV-2024-002 is due in 5 days',
      status: 'unread',
      priority: 'medium',
      entityType: 'invoice',
      entityId: invoices[1]?.id,
      actionUrl: '/finance/invoices/INV-2024-002',
      createdAt: new Date('2024-03-01')
    },
    {
      userId: users[1].id,
      type: 'WORK_ORDER_STATUS',
      title: 'Work Order Update',
      message: 'WO-2024-001 has been updated',
      status: 'read',
      priority: 'low',
      entityType: 'work_order',
      entityId: workOrders[0]?.id,
      readAt: new Date('2024-02-16'),
      createdAt: new Date('2024-02-15')
    },
    {
      userId: users[3].id,
      type: 'DOCUMENT_UPLOAD',
      title: 'Document Uploaded',
      message: 'New document has been uploaded to Vendor Portal',
      status: 'unread',
      priority: 'normal',
      createdAt: new Date('2024-03-05')
    }
  ]

  for (const notification of notificationData) {
    await prisma.notifications.create({
      data: {
        companyId,
        ...notification
      }
    })
  }

  console.log(`Created ${notificationData.length} notifications`)
}

// Execute the seed function
main()
  .catch((e) => {
    console.error('Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })