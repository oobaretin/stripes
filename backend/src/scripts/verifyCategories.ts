import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyCategories() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        subCategories: {
          where: { isActive: true },
          include: {
            products: {
              where: { isActive: true },
              include: {
                buyerPrices: {
                  include: {
                    buyer: {
                      select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    console.log(`✅ Found ${categories.length} categories`);
    categories.forEach((cat) => {
      console.log(`   - ${cat.name} (${cat.subCategories.length} sub-categories)`);
      cat.subCategories.forEach((sub) => {
        console.log(`     - ${sub.name} (${sub.products.length} products)`);
      });
    });
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyCategories();




