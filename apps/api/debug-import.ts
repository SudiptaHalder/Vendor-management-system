import { prisma } from '@vendor-management/database'

console.log('🔍 Debugging import:')
console.log('prisma:', prisma)
console.log('typeof prisma:', typeof prisma)
console.log('prisma.user:', prisma?.user)
