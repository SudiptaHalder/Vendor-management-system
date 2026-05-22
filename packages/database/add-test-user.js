const { prisma } = require('./dist/index.js');
const bcrypt = require('bcrypt');

async function addTestUser() {
  try {
    // Check if any users exist
    const userCount = await prisma.users.count();
    console.log(`📊 Existing users: ${userCount}`);
    
    if (userCount === 0) {
      // Create a test admin user
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      
      const user = await prisma.users.create({
        data: {
          email: 'admin@vendorflow.com',
          password: hashedPassword,
          name: 'Admin User',
          role: 'admin',
          isActive: true
        }
      });
      
      console.log('✅ Test admin user created:');
      console.log(`   Email: admin@vendorflow.com`);
      console.log(`   Password: Admin123!`);
    } else {
      // List existing users (without passwords)
      const users = await prisma.users.findMany({
        select: { id: true, email: true, name: true, role: true }
      });
      console.log('\n📋 Existing users:');
      users.forEach(u => {
        console.log(`   - ${u.email} (${u.role})`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addTestUser();
