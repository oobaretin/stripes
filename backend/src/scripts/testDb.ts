import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDb() {
  try {
    console.log('Testing database connection...');
    
    // Try to create a test category
    const category = await prisma.category.create({
      data: {
        name: 'Test Category',
        description: 'Test',
      },
    });
    
    console.log('✅ Created category:', category);
    
    // Try to read it back
    const categories = await prisma.category.findMany();
    console.log('✅ Found categories:', categories.length);
    
    // Clean up
    await prisma.category.delete({ where: { id: category.id } });
    console.log('✅ Test successful!');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDb();




