import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ProductData {
  name: string;
  ndcCode?: string;
  expirationRange1Label?: string;
  expirationRange1Price?: number;
  expirationRange2Label?: string;
  expirationRange2Price?: number;
  dingReductionPrice?: number;
  specialNotes?: string;
}

interface CategoryData {
  name: string;
  description?: string;
  expirationRange1Label?: string;
  expirationRange2Label?: string;
  subCategories: {
    name: string;
    products: ProductData[];
  }[];
}

const categoriesData: CategoryData[] = [
  {
    name: 'DIABETIC TEST STRIPS (NDC = National Drug Code)',
    description: 'NDC = National Drug Code',
    expirationRange1Label: 'Mint 12/26+',
    expirationRange2Label: 'Mint 9/26-11/26+',
    subCategories: [
      {
        name: 'One Touch Ultra',
        products: [
          {
            name: 'One Touch Ultra 100ct Retail',
            ndcCode: '53885-0245-10',
            expirationRange1Price: 62.00,
            expirationRange2Price: 58.00,
            dingReductionPrice: 3.00,
            specialNotes: 'NOT BUYING',
          },
          {
            name: 'One Touch Ultra 50ct Retail',
            ndcCode: '53885-0244-50',
            expirationRange1Price: 41.00,
            expirationRange2Price: 39.00,
            dingReductionPrice: 3.00,
            specialNotes: 'NOT BUYING',
          },
          {
            name: 'One Touch Ultra 50ct Mail Order',
            ndcCode: '53885-0963-50',
            expirationRange1Price: 28.00,
            expirationRange2Price: 24.00,
            dingReductionPrice: 2.00,
          },
          {
            name: 'One Touch Ultra 25ct Retail',
            ndcCode: '53885-0994-25',
            expirationRange1Price: 11.00,
            dingReductionPrice: 1.00,
          },
        ],
      },
      {
        name: 'One Touch Verio',
        products: [
          {
            name: 'One Touch Verio 100ct Retail',
            ndcCode: '53885-0272-10',
            expirationRange1Price: 47.00,
            expirationRange2Price: 43.00,
            dingReductionPrice: 3.00,
            specialNotes: 'NOT BUYING',
          },
          {
            name: 'One Touch Verio 50ct Retail',
            ndcCode: '53885-0271-50',
            expirationRange1Price: 28.00,
            expirationRange2Price: 24.00,
            dingReductionPrice: 2.00,
            specialNotes: 'NOT BUYING',
          },
          {
            name: 'One Touch Verio 50ct DME/Mail Order',
            ndcCode: '53885-0838-01',
            expirationRange1Price: 14.00,
            expirationRange2Price: 9.00,
            dingReductionPrice: 1.00,
            specialNotes: 'NOT BUYING',
          },
          {
            name: 'One Touch Verio 25ct Retail',
            ndcCode: '53885-0270-25',
            expirationRange1Price: 7.00,
            dingReductionPrice: 1.00,
          },
        ],
      },
      {
        name: 'FreeStyle',
        products: [
          {
            name: 'FreeStyle Lite 100ct Retail',
            ndcCode: '99073-0708-27',
            expirationRange1Price: 68.00,
            expirationRange2Price: 64.00,
            dingReductionPrice: 3.00,
            specialNotes: 'NOT BUYING',
          },
          {
            name: 'FreeStyle Lite 50ct Retail',
            ndcCode: '99073-0708-22',
            expirationRange1Price: 40.00,
            expirationRange2Price: 36.00,
            dingReductionPrice: 3.00,
            specialNotes: 'NOT BUYING',
          },
          {
            name: 'FreeStyle Lite 50ct NFR',
            ndcCode: '99073-0708-19',
            expirationRange1Price: 17.00,
            dingReductionPrice: 2.00,
          },
          {
            name: 'FreeStyle Lite 50ct Institutional Use Only',
            ndcCode: '99073-0710-26',
            expirationRange1Price: 25.00,
            expirationRange2Price: 21.00,
            dingReductionPrice: 2.00,
          },
          {
            name: 'FreeStyle 100ct Retail',
            ndcCode: '99073-0708-27',
            expirationRange1Price: 23.00,
            dingReductionPrice: 2.00,
          },
          {
            name: 'FreeStyle 50ct Retail',
            ndcCode: '99073-0120-50',
            expirationRange1Price: 18.00,
            dingReductionPrice: 2.00,
          },
        ],
      },
      {
        name: 'Accu-Chek',
        products: [
          {
            name: 'Accu-Chek Aviva Plus 100ct Retail',
            ndcCode: '65702-0408-10',
            expirationRange1Price: 62.00,
            expirationRange2Price: 58.00,
            dingReductionPrice: 2.00,
          },
          {
            name: 'Accu-Chek Aviva Plus 50ct Retail',
            ndcCode: '65702-0407-10',
            expirationRange1Price: 34.00,
            expirationRange2Price: 30.00,
            dingReductionPrice: 2.00,
          },
          {
            name: 'Accu-Chek Aviva Plus 50ct NFR',
            ndcCode: '65702-0438-10',
            expirationRange1Price: 14.00,
            expirationRange2Price: 12.00,
            dingReductionPrice: 2.00,
          },
          {
            name: 'Accu-Chek Guide 100ct Retail',
            ndcCode: '65702-0712-10',
            expirationRange1Price: 30.00,
            dingReductionPrice: 2.00,
          },
          {
            name: 'Accu-Chek Guide 50ct Retail',
            ndcCode: '65702-0711-10',
            expirationRange1Price: 15.00,
            dingReductionPrice: 1.00,
          },
        ],
      },
      {
        name: 'Contour Next',
        products: [
          {
            name: 'Contour Next 100ct Retail',
            ndcCode: '0193-7312-21',
            expirationRange1Price: 27.00,
            expirationRange2Price: 25.00,
            dingReductionPrice: 2.00,
          },
          {
            name: 'Contour Next 50ct Retail',
            ndcCode: '0193-7311-50',
            expirationRange1Price: 19.00,
            expirationRange2Price: 17.00,
            dingReductionPrice: 2.00,
            specialNotes: 'NOT BUYING',
          },
        ],
      },
    ],
  },
  {
    name: 'MEDICAL DEVICES (CGM) Dexcoms',
    description: 'How To Tell Which G7 Sensor You Have',
    expirationRange1Label: 'Mint 11/26+',
    expirationRange2Label: 'Mint 8/26-10/26+',
    subCategories: [
      {
        name: 'Dexcom G7',
        products: [
          {
            name: 'Dexcom G7 Retail Sensor',
            ndcCode: 'STP-AT-012',
            expirationRange1Price: 90.00,
            expirationRange2Price: 85.00,
            dingReductionPrice: 5.00,
          },
          {
            name: 'Dexcom G7 Retail Sensor OR',
            ndcCode: 'STP-AT-011',
            expirationRange1Price: 89.00,
            expirationRange2Price: 80.00,
            dingReductionPrice: 5.00,
          },
          {
            name: 'Dexcom Sensor G7 DME',
            ndcCode: 'STP-AT-013',
            expirationRange1Price: 73.00,
            expirationRange2Price: 68.00,
            dingReductionPrice: 5.00,
          },
          {
            name: 'Dexcom G7 Receiver 1pk',
            ndcCode: '08627-0078-01',
            expirationRange1Price: 140.00,
            dingReductionPrice: 10.00,
          },
        ],
      },
      {
        name: 'Dexcom G6',
        products: [
          {
            name: 'Dexcom G6 Sensor 3 Pack Retail',
            ndcCode: 'REF STS-OE-003',
            expirationRange1Price: 265.00,
            expirationRange2Price: 255.00,
            dingReductionPrice: 10.00,
            specialNotes: 'ON NO BUY LIST',
          },
          {
            name: 'Dexcom G6 Sensor 3 Pack Mail order',
            ndcCode: 'REF STS-OR-003',
            expirationRange1Price: 255.00,
            expirationRange2Price: 245.00,
            dingReductionPrice: 10.00,
          },
          {
            name: 'Dexcom G6 Sensor 3 Pack DME',
            ndcCode: 'STS-OM-003',
            expirationRange1Price: 185.00,
            expirationRange2Price: 175.00,
            dingReductionPrice: 10.00,
          },
          {
            name: 'Dexcom G6 Transmitter Kit',
            ndcCode: '08627-0016-01 (REF STT-OE-001)',
            expirationRange1Price: 150.00,
            expirationRange2Price: 140.00,
            dingReductionPrice: 10.00,
          },
          {
            name: 'Dexcom G6 Transmitter 1 pack',
            ndcCode: '08627-0016-01 (REF STT-OR-001)',
            expirationRange1Price: 110.00,
            expirationRange2Price: 105.00,
            dingReductionPrice: 5.00,
          },
          {
            name: 'Dexcom G6 Receiver 1pk',
            ndcCode: '08627-0091-11',
            expirationRange1Price: 140.00,
            dingReductionPrice: 10.00,
          },
        ],
      },
    ],
  },
  {
    name: 'MEDICAL DEVICES (CGM) Freestyle Libres',
    expirationRange1Label: '6/26+',
    expirationRange2Label: 'Mint 3/26-5/26+',
    subCategories: [
      {
        name: 'Freestyle Libre',
        products: [
          {
            name: 'Freestlye Libre 14 Day Sensor',
            ndcCode: '57599-0001-01',
            expirationRange1Price: 50.00,
            expirationRange2Price: 45.00,
            dingReductionPrice: 2.00,
          },
          {
            name: 'Freestyle Libre2 14 Day Sensor',
            ndcCode: '57599-0800-00',
            expirationRange1Price: 55.00,
            expirationRange2Price: 45.00,
            dingReductionPrice: 2.00,
          },
          {
            name: 'Freestyle Libre 3 14 Day Sensor',
            ndcCode: '57599-0818-00',
            expirationRange1Price: 55.00,
            expirationRange2Price: 45.00,
            dingReductionPrice: 2.00,
            specialNotes: 'NOT BUYING',
          },
        ],
      },
    ],
  },
  {
    name: 'MEDICAL DEVICES (CGM) Insulet',
    expirationRange1Label: '8/26+',
    expirationRange2Label: 'Mint 6/26-7/26+',
    subCategories: [
      {
        name: 'Omnipod',
        products: [
          {
            name: 'Omnipod 5 (Purple Box)',
            ndcCode: '08508-3000-21',
            expirationRange1Price: 210.00,
            expirationRange2Price: 200.00,
            dingReductionPrice: 5.00,
          },
          {
            name: 'Omnipod 5 (White / Yellow Box) Starter Kit',
            ndcCode: 'REF-SKT-H001-G-X9',
            expirationRange1Price: 380.00,
            expirationRange2Price: 340.00,
            dingReductionPrice: 10.00,
          },
          {
            name: 'Omnipod 5pk',
            ndcCode: '08508-1120-05',
            expirationRange1Price: 80.00,
            expirationRange2Price: 70.00,
            dingReductionPrice: 5.00,
          },
          {
            name: 'Omnipod 5pk DASH',
            ndcCode: '08508-2000-05',
            expirationRange1Price: 100.00,
            expirationRange2Price: 90.00,
            dingReductionPrice: 5.00,
          },
        ],
      },
    ],
  },
  {
    name: 'LANCETS',
    expirationRange1Label: 'Mint 8/26+',
    expirationRange2Label: 'Mint 5/26-7/26+',
    subCategories: [
      {
        name: 'Lancets',
        products: [
          {
            name: 'Delica 30G Retail',
            ndcCode: '53885-0011-10',
            expirationRange1Price: 4.00,
            specialNotes: 'MUST BE MINT',
          },
          {
            name: 'Delica 33G Retail',
            ndcCode: '53885-0008-10',
            expirationRange1Price: 4.00,
            specialNotes: 'MUST BE MINT',
          },
          {
            name: 'FreeStyle 28G Retail',
            ndcCode: '99073-0130-01',
            expirationRange1Price: 4.00,
            specialNotes: 'MUST BE MINT',
          },
          {
            name: 'Microlet Retail',
            ndcCode: '0193-6586-21',
            expirationRange1Price: 4.00,
            specialNotes: 'MUST BE MINT',
          },
          {
            name: 'Fastclix Retail',
            ndcCode: '65702-0288-10',
            expirationRange1Price: 4.00,
            specialNotes: 'MUST BE MINT',
          },
          {
            name: 'Softclix Retail',
            ndcCode: '50924-0971-10',
            expirationRange1Price: 4.00,
            specialNotes: 'MUST BE MINT',
          },
        ],
      },
    ],
  },
  {
    name: 'INSULIN',
    description: 'Note: Insulin orders will not be accepted through PayPal due to their terms of use. INSULIN MUST BE OVERNIGHTED + PACKED WITH ICE PACKS IN AN INSULATED CONTAINER. Failure to ship this way will result in product being returned.',
    expirationRange1Label: 'MINT 8/26+',
    expirationRange2Label: 'MINT',
    subCategories: [
      {
        name: 'Novolin',
        products: [
          {
            name: 'Novolin 7030 Relion',
            ndcCode: '0169-1837-02',
            expirationRange1Price: 28.00,
            dingReductionPrice: 3.00,
          },
          {
            name: 'Novolin N Relion',
            ndcCode: '0169-1834-02',
            expirationRange1Price: 28.00,
            dingReductionPrice: 3.00,
          },
          {
            name: 'Novolin R Relion',
            ndcCode: '0169-1833-02',
            expirationRange1Price: 28.00,
            dingReductionPrice: 3.00,
          },
          {
            name: 'Novolin 7030 Novo Nordisk',
            ndcCode: '0169-1837-11',
            expirationRange1Price: 28.00,
            dingReductionPrice: 3.00,
          },
          {
            name: 'Novolin N Novo Nordisk',
            ndcCode: '0169-1834-11',
            expirationRange1Price: 28.00,
            dingReductionPrice: 3.00,
          },
          {
            name: 'Novolin R Novo Nordisk',
            ndcCode: '0169-1833-11',
            expirationRange1Price: 28.00,
            dingReductionPrice: 3.00,
          },
        ],
      },
      {
        name: 'Humulin',
        products: [
          {
            name: 'Humulin 7030 Vial',
            ndcCode: '0002-8715-01',
            expirationRange1Price: 30.00,
            dingReductionPrice: 3.00,
          },
          {
            name: 'Humulin N Vial',
            ndcCode: '0002-8315-01',
            expirationRange1Price: 30.00,
            dingReductionPrice: 3.00,
          },
          {
            name: 'Humulin R Vial',
            ndcCode: '0002-8215-01',
            expirationRange1Price: 30.00,
            dingReductionPrice: 3.00,
          },
        ],
      },
    ],
  },
];

async function seedNortheastMedicalProducts() {
  console.log('🌱 Seeding Northeast Medical Exchange products...\n');

  // Find or create Northeast Medical Exchange buyer
  let buyer = await prisma.buyer.findFirst({
    where: {
      OR: [
        { firstName: { contains: 'Northeast' } },
        { lastName: { contains: 'Medical' } },
      ],
    },
  });

  if (!buyer) {
    buyer = await prisma.buyer.create({
      data: {
        firstName: 'Northeast',
        lastName: 'Medical Exchange',
        phone: 'N/A',
        isPreferred: true,
      },
    });
    console.log('✅ Created buyer: Northeast Medical Exchange');
  } else {
    // Ensure active/preferred in case it was modified
    buyer = await prisma.buyer.update({
      where: { id: buyer.id },
      data: {
        isActive: true,
        isPreferred: true,
      },
    });
    console.log(`✅ Found buyer: ${buyer.firstName} ${buyer.lastName}`);
  }

  let categoryOrder = 1;
  let subCategoryOrder = 1;

  for (const categoryData of categoriesData) {
    // Create or find category
    let category = await prisma.category.findFirst({
      where: { name: categoryData.name },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: categoryData.name,
          description: categoryData.description,
          order: categoryOrder++,
        },
      });
      console.log(`\n📁 Created category: ${category.name}`);
    } else {
      // Update category description if provided
      if (categoryData.description) {
        category = await prisma.category.update({
          where: { id: category.id },
          data: { description: categoryData.description, isActive: true },
        });
        console.log(`\n📁 Updated category: ${category.name}`);
      } else {
        // Ensure active even if previously deactivated
        if (!category.isActive) {
          category = await prisma.category.update({
            where: { id: category.id },
            data: { isActive: true },
          });
        }
        console.log(`\n📁 Found category: ${category.name}`);
      }
    }

    subCategoryOrder = 1;

    for (const subCategoryData of categoryData.subCategories) {
      // Create or find subcategory
      let subCategory = await prisma.subCategory.findFirst({
        where: {
          name: subCategoryData.name,
          categoryId: category.id,
        },
      });

      if (!subCategory) {
        subCategory = await prisma.subCategory.create({
          data: {
            name: subCategoryData.name,
            categoryId: category.id,
            order: subCategoryOrder++,
          },
        });
        console.log(`  📂 Created subcategory: ${subCategory.name}`);
      } else {
        // Ensure active even if previously deactivated
        if (!subCategory.isActive) {
          subCategory = await prisma.subCategory.update({
            where: { id: subCategory.id },
            data: { isActive: true },
          });
        }
        console.log(`  📂 Found subcategory: ${subCategory.name}`);
      }

      // Create products
      for (const productData of subCategoryData.products) {
        let product = await prisma.product.findFirst({
          where: {
            name: productData.name,
            subCategoryId: subCategory.id,
          },
        });

        if (!product) {
          product = await prisma.product.create({
            data: {
              name: productData.name,
              ndcCode: productData.ndcCode,
              specialNotes: productData.specialNotes,
              subCategoryId: subCategory.id,
              brand: productData.name.split(' ')[0], // Extract brand from name
              isActive: true,
            },
          });
          console.log(`    ✅ Created product: ${product.name}`);
        } else {
          // Update existing product
          product = await prisma.product.update({
            where: { id: product.id },
            data: {
              ndcCode: productData.ndcCode,
              specialNotes: productData.specialNotes,
              brand: productData.name.split(' ')[0],
              subCategoryId: subCategory.id,
              isActive: true,
            },
          });
          console.log(`    ✅ Updated product: ${product.name}`);
        }

        // Create or update buyer price with expiration ranges
        await prisma.buyerProductPrice.upsert({
          where: {
            buyerId_productId: {
              buyerId: buyer.id,
              productId: product.id,
            },
          },
          update: {
            expirationRange1Label: categoryData.expirationRange1Label,
            expirationRange1Price: productData.expirationRange1Price,
            expirationRange2Label: categoryData.expirationRange2Label,
            expirationRange2Price: productData.expirationRange2Price,
            dingReductionPrice: productData.dingReductionPrice,
          },
          create: {
            buyerId: buyer.id,
            productId: product.id,
            expirationRange1Label: categoryData.expirationRange1Label,
            expirationRange1Price: productData.expirationRange1Price,
            expirationRange2Label: categoryData.expirationRange2Label,
            expirationRange2Price: productData.expirationRange2Price,
            dingReductionPrice: productData.dingReductionPrice,
          },
        });
      }
    }
  }

  console.log('\n✅ Finished seeding Northeast Medical Exchange products!');
}

// Export for use in other scripts/routes (CommonJS + ESM)
module.exports = seedNortheastMedicalProducts;
module.exports.default = seedNortheastMedicalProducts;
export default seedNortheastMedicalProducts;

// Run if called directly
if (require.main === module) {
  seedNortheastMedicalProducts()
    .catch((error) => {
      console.error('❌ Error seeding products:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

