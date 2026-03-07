import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Adding new dummy vendor...\n')

  // Get the super admin user (for relations)
  const superAdmin = await prisma.users.findFirst({
    where: { role: 'super_admin' }
  })

  if (!superAdmin) {
    console.log('❌ Super admin not found')
    return
  }

  // Get or create a company
  let company = await prisma.companies.findFirst()
  if (!company) {
    company = await prisma.companies.create({
      data: {
        name: 'VendorFlow Demo Company',
        subdomain: 'democompany',
        plan: 'enterprise'
      }
    })
    console.log('✅ Created default company')
  }

  // Get a random category or create one
  let category = await prisma.categories.findFirst()
  if (!category) {
    category = await prisma.categories.create({
      data: {
        name: 'General Supplies',
        description: 'General supplies and materials',
        color: 'blue',
        icon: 'Package',
        companyId: company.id
      }
    })
  }

  // New vendor details
  const newVendor = {
    name: 'Premium Logistics Solutions',
    email: 'contact@premiumlogistics.com',
    phone: '+1 (555) 777-8888',
    website: 'https://www.premiumlogistics.com',
    taxId: '90-1234567',
    registrationNumber: 'VEND-LOGISTICS-001',
    status: 'active',
    rating: 5,
    reviewCount: 0,
    address: '777 Delivery Blvd',
    city: 'Newark',
    state: 'NJ',
    country: 'USA',
    postalCode: '07102',
    contactPerson: 'Robert Martinez',
    contactPersonRole: 'Operations Director',
    contactPersonEmail: 'r.martinez@premiumlogistics.com',
    contactPersonPhone: '+1 (555) 777-8889',
    businessType: 'corporation',
    yearEstablished: 2018,
    employeeCount: 85,
    annualRevenue: 12000000,
    paymentTerms: 'net30',
    currency: 'USD',
    creditLimit: 200000,
    notes: 'Premium logistics and shipping partner',
    tags: ['logistics', 'shipping', 'preferred'],
    certified: true,
    preferred: true
  }

  // Create the vendor
  const vendor = await prisma.vendors.create({
    data: {
      ...newVendor,
      companyId: company.id,
      categoryId: category.id
    }
  })

  console.log(`✅ Created vendor: ${vendor.name}`)
  console.log(`   ID: ${vendor.id}`)

  // Create portal access for the vendor
  const portalEmail = `vendor.${vendor.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@portal.com`
  const password = 'vendor123'
  const hashedPassword = await bcrypt.hash(password, 10)

  const portalAccess = await prisma.vendor_portal_access.create({
    data: {
      vendorId: vendor.id,
      email: portalEmail,
      password: hashedPassword,
      isActive: true,
      accessLevel: 'standard',
      canViewInvoices: true,
      canSubmitInvoices: true,
      canViewPayments: true,
      canViewPOs: true,
      canSubmitQuotes: true,
      canViewContracts: true,
      canUploadDocs: true
    }
  })

  // Update vendor to enable portal
  await prisma.vendors.update({
    where: { id: vendor.id },
    data: { portalEnabled: true }
  })

  console.log(`✅ Created portal access for ${vendor.name}`)
  console.log(`   Email: ${portalEmail}`)
  console.log(`   Password: ${password}`)

  // Update category vendor count
  await prisma.categories.update({
    where: { id: category.id },
    data: {
      vendorCount: {
        increment: 1
      }
    }
  })

  console.log('\n📊 New Vendor Summary:')
  console.log('=======================')
  console.log(`Name: ${vendor.name}`)
  console.log(`Email: ${portalEmail}`)
  console.log(`Password: ${password}`)
  console.log(`Category: ${category.name}`)
  console.log(`Status: ${vendor.status}`)
  console.log('=======================\n')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
