import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Master seed script that runs all seeding operations in the correct order
 */
async function seedAll() {
  console.log('🌱 Starting comprehensive database seeding...\n');

  try {
    // Step 1: Seed buyers first (needed for product prices)
    console.log('📋 Step 1: Seeding buyers...');
    const { seedBuyers } = await import('./seedBuyers');
    await seedBuyers();
    console.log('✅ Buyers seeded\n');

    // Step 2: Seed categories and products
    console.log('📦 Step 2: Seeding categories and products...');
    const { default: seedCategoriesAndProducts } = await import('./seedCategoriesAndProducts');
    // The script runs itself, so we just import it
    await new Promise((resolve) => {
      const originalLog = console.log;
      console.log = (...args: any[]) => {
        originalLog(...args);
        if (args[0]?.includes('Finished seeding')) {
          resolve(undefined);
        }
      };
      seedCategoriesAndProducts().finally(() => resolve(undefined));
    });
    console.log('✅ Categories and products seeded\n');

    console.log('🎉 All seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedAll()
    .then(() => {
      console.log('✅ Seeding complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export default seedAll;

