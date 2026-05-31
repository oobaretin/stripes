import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Charles Harris (The Diabetic Test Strip Guys) Price List
 * Source: https://docs.google.com/spreadsheets/d/1Qs80kY-H8I4taOq1XXONEWTvK5x5u7iKYk1LzWiGfNE/edit?gid=0#gid=0
 * 
 * Mapping:
 * - MINT PRICE 10 Months -> expirationRange1Price
 * - 6-9 Month -> expirationRange2Price
 * - acceptable damage -> (stored in notes or as separate field)
 */

interface CharlesHarrisPrice {
  productName: string;
  category: string;
  subCategory: string;
  range1Price?: number; // MINT PRICE 10 Months
  range2Price?: number; // 6-9 Month
  damagedPrice?: number; // acceptable damage
  specialNotes?: string;
}

const charlesHarrisPrices: CharlesHarrisPrice[] = [
  // Weight Loss Products
  {
    productName: 'Ozempic Red Box .25 MG',
    category: 'WEIGHT LOSS / OTHER',
    subCategory: 'Ozempic',
    range1Price: 125.00,
    specialNotes: 'Mint Product only/No rips tears or stains',
  },
  {
    productName: 'Ozempic Blue Box 1 MG',
    category: 'WEIGHT LOSS / OTHER',
    subCategory: 'Ozempic',
    range1Price: 125.00,
  },
  {
    productName: 'Ozempic Gold Box 2 MG',
    category: 'WEIGHT LOSS / OTHER',
    subCategory: 'Ozempic',
    range1Price: 150.00,
  },
  {
    productName: 'Monjoro 2.5',
    category: 'WEIGHT LOSS / OTHER',
    subCategory: 'Monjoro',
    range1Price: 250.00,
    range2Price: 150.00,
    damagedPrice: 125.00, // 125-200 range
    specialNotes: 'NEED TO BE MINT MINT',
  },
  {
    productName: 'Monjoro 5.0',
    category: 'WEIGHT LOSS / OTHER',
    subCategory: 'Monjoro',
    range1Price: 250.00,
    range2Price: 175.00,
    damagedPrice: 125.00, // 125-200 range
  },
  {
    productName: 'Monjoro 7.5/10',
    category: 'WEIGHT LOSS / OTHER',
    subCategory: 'Monjoro',
    range1Price: 250.00,
    range2Price: 175.00,
    damagedPrice: 125.00, // 125-200 range
  },
  {
    productName: 'Monjoro 12.5/ 15',
    category: 'WEIGHT LOSS / OTHER',
    subCategory: 'Monjoro',
    range1Price: 250.00,
    range2Price: 175.00,
    damagedPrice: 125.00, // 125-200 range
  },
  {
    productName: 'Zepbound 2.5/5.0/7.5/10',
    category: 'WEIGHT LOSS / OTHER',
    subCategory: 'Zepbound',
    range1Price: 250.00,
    range2Price: 100.00,
    damagedPrice: 100.00,
  },
  {
    productName: 'Zepbound 12.5/15',
    category: 'WEIGHT LOSS / OTHER',
    subCategory: 'Zepbound',
    range1Price: 300.00,
    range2Price: 100.00,
    damagedPrice: 100.00,
  },
  {
    productName: 'wegovy all strengths',
    category: 'WEIGHT LOSS / OTHER',
    subCategory: 'Wegovy',
    range1Price: 300.00,
    range2Price: 150.00,
  },
  {
    productName: 'Wegovy Sample Size',
    category: 'WEIGHT LOSS / OTHER',
    subCategory: 'Wegovy',
    damagedPrice: 40.00,
  },
  // Other Medications
  {
    productName: 'Skyrizi Injection (all strengths)',
    category: 'WEIGHT LOSS / OTHER',
    subCategory: 'Other Medications',
    range1Price: 300.00,
  },
  {
    productName: 'Dupixent',
    category: 'WEIGHT LOSS / OTHER',
    subCategory: 'Other Medications',
    range1Price: 100.00,
  },
  {
    productName: 'Repatha',
    category: 'WEIGHT LOSS / OTHER',
    subCategory: 'Other Medications',
    range1Price: 150.00,
  },
  {
    productName: 'Enbrel Injection/ syringe',
    category: 'WEIGHT LOSS / OTHER',
    subCategory: 'Other Medications',
    range1Price: 500.00,
    range2Price: 200.00,
  },
  {
    productName: 'Mavret',
    category: 'WEIGHT LOSS / OTHER',
    subCategory: 'Other Medications',
    range1Price: 300.00,
    range2Price: 200.00,
    damagedPrice: 200.00,
  },
  {
    productName: 'emgality',
    category: 'WEIGHT LOSS / OTHER',
    subCategory: 'Other Medications',
    range1Price: 200.00,
    range2Price: 100.00,
  },
  {
    productName: 'Rinvoq 15 mg/30 mg',
    category: 'WEIGHT LOSS / OTHER',
    subCategory: 'Other Medications',
    range1Price: 100.00,
    range2Price: 300.00,
  },
  {
    productName: 'Otzela',
    category: 'WEIGHT LOSS / OTHER',
    subCategory: 'Other Medications',
    range1Price: 100.00,
  },
];

async function addCharlesHarrisPrices() {
  console.log('💰 Adding Charles Harris prices...\n');

  // Find Charles Harris buyer
  const buyer = await prisma.buyer.findFirst({
    where: {
      OR: [
        { firstName: { contains: 'Charles' } },
        { lastName: { contains: 'Harris' } },
      ],
    },
  });

  if (!buyer) {
    console.log('❌ Charles Harris buyer not found. Please run seed:buyers first.');
    return;
  }

  console.log(`✅ Found buyer: ${buyer.firstName} ${buyer.lastName}\n`);

  let successCount = 0;
  let notFoundCount = 0;
  let createdCount = 0;

  // Group prices by category and subcategory
  const categoryMap = new Map<string, Map<string, CharlesHarrisPrice[]>>();

  for (const priceData of charlesHarrisPrices) {
    if (!categoryMap.has(priceData.category)) {
      categoryMap.set(priceData.category, new Map());
    }
    const subCategoryMap = categoryMap.get(priceData.category)!;
    if (!subCategoryMap.has(priceData.subCategory)) {
      subCategoryMap.set(priceData.subCategory, []);
    }
    subCategoryMap.get(priceData.subCategory)!.push(priceData);
  }

  // Process each category
  for (const [categoryName, subCategoryMap] of categoryMap) {
    // Find or create category
    let category = await prisma.category.findFirst({
      where: { name: categoryName },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: categoryName,
          description: 'Weight loss medications and other injectable medications',
          order: 10, // After existing categories
        },
      });
      console.log(`\n📁 Created category: ${category.name}`);
    } else {
      console.log(`\n📁 Found category: ${category.name}`);
    }

    // Process each subcategory
    for (const [subCategoryName, products] of subCategoryMap) {
      // Find or create subcategory
      let subCategory = await prisma.subCategory.findFirst({
        where: {
          name: subCategoryName,
          categoryId: category.id,
        },
      });

      if (!subCategory) {
        subCategory = await prisma.subCategory.create({
          data: {
            name: subCategoryName,
            categoryId: category.id,
            order: 1,
          },
        });
        console.log(`  📂 Created subcategory: ${subCategory.name}`);
      } else {
        console.log(`  📂 Found subcategory: ${subCategory.name}`);
      }

      // Process each product
      for (const priceData of products) {
        try {
          // Find or create product
          let product = await prisma.product.findFirst({
            where: {
              name: priceData.productName,
              subCategoryId: subCategory.id,
            },
          });

          if (!product) {
            product = await prisma.product.create({
              data: {
                name: priceData.productName,
                subCategoryId: subCategory.id,
                brand: priceData.subCategory,
                specialNotes: priceData.specialNotes,
              },
            });
            console.log(`    ✅ Created product: ${product.name}`);
            createdCount++;
          }

          // Set expiration range labels
          const range1Label = 'MINT 10 Months';
          const range2Label = '6-9 Months';
          const range1Price = priceData.range1Price;
          const range2Price = priceData.range2Price;

          // Calculate ding reduction if we have both prices
          const dingReduction = range1Price && range2Price && range2Price < range1Price
            ? range1Price - range2Price
            : null;

          // Create or update buyer price
          await prisma.buyerProductPrice.upsert({
            where: {
              buyerId_productId: {
                buyerId: buyer.id,
                productId: product.id,
              },
            },
            update: {
              expirationRange1Label: range1Label,
              expirationRange1Price: range1Price || undefined,
              expirationRange2Label: range2Label,
              expirationRange2Price: range2Price || undefined,
              dingReductionPrice: dingReduction || undefined,
              damagedPrice: priceData.damagedPrice || undefined,
            },
            create: {
              buyerId: buyer.id,
              productId: product.id,
              expirationRange1Label: range1Label,
              expirationRange1Price: range1Price || undefined,
              expirationRange2Label: range2Label,
              expirationRange2Price: range2Price || undefined,
              dingReductionPrice: dingReduction || undefined,
              damagedPrice: priceData.damagedPrice || undefined,
            },
          });

          console.log(`    💰 Added price for: ${product.name}`);
          if (range1Price) console.log(`       Range 1 (${range1Label}): $${range1Price.toFixed(2)}`);
          if (range2Price) console.log(`       Range 2 (${range2Label}): $${range2Price.toFixed(2)}`);
          if (priceData.damagedPrice) console.log(`       Damaged: $${priceData.damagedPrice.toFixed(2)}`);
          if (dingReduction) console.log(`       Ding Reduction: $${dingReduction.toFixed(2)}`);
          successCount++;
        } catch (error) {
          console.error(`    ❌ Error adding price for ${priceData.productName}:`, error);
        }
      }
    }
  }

  console.log(`\n✅ Finished! Added ${successCount} prices, created ${createdCount} products, ${notFoundCount} products not found.`);
}

// Export for use in other scripts/routes (CommonJS + ESM)
module.exports = { addCharlesHarrisPrices };
export { addCharlesHarrisPrices };

// Run if called directly
if (require.main === module) {
  addCharlesHarrisPrices()
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

