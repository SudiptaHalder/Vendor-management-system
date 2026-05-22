const { prisma } = require('./dist/index.js');

async function listUsers() {
  try {
    const users = await prisma.users.findMany({
      select: { 
        id: true, 
        email: true, 
        name: true, 
        role: true,
        isActive: true 
      }
    });
    
    console.log('\n📋 Users in database:');
    users.forEach(u => {
      console.log(`   - ${u.email} (${u.role}) - Active: ${u.isActive}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
