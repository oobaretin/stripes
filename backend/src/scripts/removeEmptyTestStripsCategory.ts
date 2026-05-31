import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function removeEmptyTestStripsCategory() {
  console.log('🗑️  Removing empty "Test Strips" category...\n');

  try {
    // Find the "Test Strips" category
    const category = await prisma.category.findFirst({
      where: { name: 'Test Strips' },
      include: {
        subCategories: {
          include: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      console.log('❌ "Test Strips" category not found.');
      return;
    }

    // Check what it contains
    const totalProducts = category.subCategories.reduce((sum, sc) => sum + sc.products.length, 0);
    console.log(`📊 Category contains:`);
    console.log(`   - ${category.subCategories.length} sub-categories`);
    console.log(`   - ${totalProducts} products`);

    // Delete all subcategories and their products first (cascade delete)
    for (const subCategory of category.subCategories) {
      // Delete all products in this subcategory
      for (const product of subCategory.products) {
        await prisma.product.delete({
          where: { id: product.id },
        });
      }
      // Delete the subcategory
      await prisma.subCategory.delete({
        where: { id: subCategory.id },
      });
    }

    // Delete the category
    await prisma.category.delete({
      where: { id: category.id },
    });

    console.log('✅ Successfully deleted "Test Strips" category!');
  } catch (error) {
    console.error('❌ Error removing category:', error);
    throw error;
  }
}

removeEmptyTestStripsCategory()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

