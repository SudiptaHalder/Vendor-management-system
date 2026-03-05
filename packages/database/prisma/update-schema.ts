import { readFileSync, writeFileSync } from 'fs'

const schemaPath = 'prisma/schema.prisma'
let schema = readFileSync(schemaPath, 'utf-8')

// Add relations to vendors model
const vendorRelations = `
  // Vendor Portal Relations
  notifications      vendor_notifications[]
  messages           vendor_messages[]
  activityLogs       vendor_activity_logs[]`

// Add to users model
const userRelations = `
  // Vendor Messages
  vendorMessages     vendor_messages[] @relation("AdminMessages")`

// Find where to insert in vendors model
const vendorModelRegex = /model vendors \{[\s\S]*?\}/
const vendorMatch = schema.match(vendorModelRegex)
if (vendorMatch) {
  const vendorModel = vendorMatch[0]
  // Insert before the closing brace
  const updatedVendorModel = vendorModel.replace(/\}\s*$/, `${vendorRelations}\n}`)
  schema = schema.replace(vendorModel, updatedVendorModel)
}

// Find where to insert in users model
const userModelRegex = /model users \{[\s\S]*?\}/
const userMatch = schema.match(userModelRegex)
if (userMatch) {
  const userModel = userMatch[0]
  // Insert before the closing brace
  const updatedUserModel = userModel.replace(/\}\s*$/, `${userRelations}\n}`)
  schema = schema.replace(userModel, updatedUserModel)
}

writeFileSync(schemaPath, schema)
console.log('✅ Schema updated successfully')
