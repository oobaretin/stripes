import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sample structure based on typical diabetic test strip price lists
const categoriesData = [
  {
    name: 'Test Strips',
    description: 'Diabetic test strips for blood glucose monitoring',
    order: 1,
    subCategories: [
      {
        name: 'Accu-Chek',
        description: 'Roche Accu-Chek products',
        order: 1,
        products: [
          { name: 'Accu-Chek Aviva Plus', brand: 'Accu-Chek', imageUrl: null },
          { name: 'Accu-Chek Guide', brand: 'Accu-Chek', imageUrl: null },
          { name: 'Accu-Chek Performa', brand: 'Accu-Chek', imageUrl: null },
        ],
      },
      {
        name: 'OneTouch',
        description: 'LifeScan OneTouch products',
        order: 2,
        products: [
          { name: 'OneTouch Ultra', brand: 'OneTouch', imageUrl: null },
          { name: 'OneTouch Verio', brand: 'OneTouch', imageUrl: null },
          { name: 'OneTouch Select', brand: 'OneTouch', imageUrl: null },
        ],
      },
      {
        name: 'FreeStyle',
        description: 'Abbott FreeStyle products',
        order: 3,
        products: [
          { name: 'FreeStyle Lite', brand: 'FreeStyle', imageUrl: null },
          { name: 'FreeStyle Freedom Lite', brand: 'FreeStyle', imageUrl: null },
        ],
      },
      {
        name: 'Contour',
        description: 'Bayer Contour products',
        order: 4,
        products: [
          { name: 'Contour Next', brand: 'Contour', imageUrl: null },
          { name: 'Contour', brand: 'Contour', imageUrl: null },
        ],
      },
      {
        name: 'Other Brands',
        description: 'Other test strip brands',
        order: 5,
        products: [
          { name: 'True Metrix', brand: 'True Metrix', imageUrl: null },
          { name: 'ReliOn Prime', brand: 'ReliOn', imageUrl: null },
          { name: 'ReliOn Confirm', brand: 'ReliOn', imageUrl: null },
          { name: 'Bayer Contour', brand: 'Bayer', imageUrl: null },
          { name: 'Prodigy', brand: 'Prodigy', imageUrl: null },
        ],
      },
    ],
  },
  {
    name: 'Blood Glucose Meters',
    description: 'Blood glucose monitoring devices',
    order: 2,
    subCategories: [
      {
        name: 'Accu-Chek Meters',
        description: 'Roche Accu-Chek meters',
        order: 1,
        products: [
          { name: 'Accu-Chek Aviva Connect', brand: 'Accu-Chek', imageUrl: null },
          { name: 'Accu-Chek Guide Me', brand: 'Accu-Chek', imageUrl: null },
        ],
      },
      {
        name: 'OneTouch Meters',
        description: 'LifeScan OneTouch meters',
        order: 2,
        products: [
          { name: 'OneTouch Verio Flex', brand: 'OneTouch', imageUrl: null },
          { name: 'OneTouch Select Plus', brand: 'OneTouch', imageUrl: null },
        ],
      },
    ],
  },
  {
    name: 'Lancets',
    description: 'Lancing devices and lancets',
    order: 3,
    subCategories: [
      {
        name: 'Universal Lancets',
        description: 'Universal fit lancets',
        order: 1,
        products: [
          { name: 'BD Ultra-Fine Lancets', brand: 'BD', imageUrl: null },
          { name: 'Accu-Chek FastClix Lancets', brand: 'Accu-Chek', imageUrl: null },
        ],
      },
    ],
  },
];

// Buyer prices for Northeast Medical Exchange (primary buyer)
const northeastPrices: Record<string, number> = {
  'Accu-Chek Aviva Plus': 0.15,
  'Accu-Chek Guide': 0.15,
  'Accu-Chek Performa': 0.14,
  'OneTouch Ultra': 0.18,
  'OneTouch Verio': 0.19,
  'OneTouch Select': 0.17,
  'FreeStyle Lite': 0.16,
  'FreeStyle Freedom Lite': 0.16,
  'Contour Next': 0.14,
  'Contour': 0.13,
  'True Metrix': 0.12,
  'ReliOn Prime': 0.10,
  'Bayer Contour': 0.13,
  'Prodigy': 0.11,
};

async function seedCategoriesAndProducts() {
  console.log('🔄 Seeding categories, sub-categories, and products...');

  // Get Northeast Medical Exchange buyer
  const northeastBuyer = await prisma.buyer.findFirst({
    where: {
      OR: [
        { firstName: 'Northeast', lastName: 'Medical Exchange' },
        { paymentEmail: 'Purchasing@northeastmedicalexchange.com' },
      ],
    },
  });

  if (!northeastBuyer) {
    console.log('⚠️  Northeast Medical Exchange buyer not found. Please run update:buyers first.');
    return;
  }

  for (const categoryData of categoriesData) {
    try {
      // Create or get category
      let category = await prisma.category.findFirst({
        where: { name: categoryData.name },
      });

      if (!category) {
        category = await prisma.category.create({
          data: {
            name: categoryData.name,
            description: categoryData.description,
            order: categoryData.order,
          },
        });
        console.log(`✅ Created category: ${category.name}`);
      }

      // Create sub-categories and products
      for (const subCategoryData of categoryData.subCategories) {
        let subCategory = await prisma.subCategory.findFirst({
          where: {
            name: subCategoryData.name,
            categoryId: category.id,
          },
        });

        if (!subCategory) {
          subCategory = await prisma.subCategory.create({
            data: {
              categoryId: category.id,
              name: subCategoryData.name,
              description: subCategoryData.description,
              order: subCategoryData.order,
            },
          });
          console.log(`   ✅ Created sub-category: ${subCategory.name}`);
        }

        // Create products
        for (const productData of subCategoryData.products) {
          let product = await prisma.product.findFirst({
            where: { name: productData.name },
          });

          if (!product) {
            product = await prisma.product.create({
              data: {
                subCategoryId: subCategory.id,
                name: productData.name,
                brand: productData.brand,
                imageUrl: productData.imageUrl,
              },
            });
            console.log(`      ✅ Created product: ${product.name}`);
          } else {
            // Update existing product to link to subcategory if not already linked
            if (!product.subCategoryId) {
              product = await prisma.product.update({
                where: { id: product.id },
                data: { subCategoryId: subCategory.id },
              });
              console.log(`      🔗 Linked product to subcategory: ${product.name}`);
            }
          }

          // Add price for Northeast Medical Exchange if available and not already set
          const price = northeastPrices[product.name];
          if (price) {
            const existingPrice = await prisma.buyerProductPrice.findFirst({
              where: {
                buyerId: northeastBuyer.id,
                productId: product.id,
              },
            });

            if (!existingPrice) {
              await prisma.buyerProductPrice.create({
                data: {
                  buyerId: northeastBuyer.id,
                  productId: product.id,
                  price,
                },
              });
              console.log(`         💰 Added price: $${price.toFixed(2)}`);
            }
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error seeding category ${categoryData.name}:`, error);
    }
  }

  console.log('✅ Finished seeding categories and products!');
}

// Export as default for use in other scripts (CommonJS)
module.exports = seedCategoriesAndProducts;
module.exports.default = seedCategoriesAndProducts;

// Also export as ES module for TypeScript
export default seedCategoriesAndProducts;

// Run if called directly
if (require.main === module) {
  seedCategoriesAndProducts()
    .catch((error) => {
      console.error('Error seeding categories:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

