import { readFileSync, writeFileSync } from 'fs'

const schemaPath = 'prisma/schema.prisma'
let schema = readFileSync(schemaPath, 'utf-8')

// Add relations to vendors model
const vendorRelations = `
  // Uploaded Data Relations
  uploadedData      uploaded_vendor_data[]
  invitations       vendor_invitations[]`

// Add to purchase_orders model
const poRelations = `
  // Uploaded Data Relation
  uploadedData      uploaded_vendor_data[]`

// Add to users model
const userRelations = `
  // Uploaded Data Relation
  uploadedVendorData uploaded_vendor_data[]`

// Find where to insert in vendors model
const vendorModelRegex = /model vendors \{[\s\S]*?\}/
const vendorMatch = schema.match(vendorModelRegex)
if (vendorMatch) {
  const vendorModel = vendorMatch[0]
  // Insert before the closing brace
  const updatedVendorModel = vendorModel.replace(/\}\s*$/, `${vendorRelations}\n}`)
  schema = schema.replace(vendorModel, updatedVendorModel)
  console.log('✅ Added relations to vendors model')
}

// Find where to insert in purchase_orders model
const poModelRegex = /model purchase_orders \{[\s\S]*?\}/
const poMatch = schema.match(poModelRegex)
if (poMatch) {
  const poModel = poMatch[0]
  // Insert before the closing brace
  const updatedPOModel = poModel.replace(/\}\s*$/, `${poRelations}\n}`)
  schema = schema.replace(poModel, updatedPOModel)
  console.log('✅ Added relations to purchase_orders model')
}

// Find where to insert in users model
const userModelRegex = /model users \{[\s\S]*?\}/
const userMatch = schema.match(userModelRegex)
if (userMatch) {
  const userModel = userMatch[0]
  // Insert before the closing brace
  const updatedUserModel = userModel.replace(/\}\s*$/, `${userRelations}\n}`)
  schema = schema.replace(userModel, updatedUserModel)
  console.log('✅ Added relations to users model')
}

writeFileSync(schemaPath, schema)
console.log('✅ Schema updated successfully')
