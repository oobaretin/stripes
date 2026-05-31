import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * PATH MEDICAL SUPPLY Price List
 * 
 * Mapping:
 * - 9+ Months / 7+ Months / 3+ Months -> expirationRange1Price
 * - 7-8 Months / 6 Months / 2 Months -> expirationRange2Price
 * - 6 Months / 5 Months / 1 Month -> (could be range2 or separate)
 */

interface PathMedicalPrice {
  productName: string; // As it appears in our database
  ndcCode?: string; // Optional NDC for matching
  // Range 1 prices (9+ months, 7+ months, or 3+ months depending on category)
  range1Price?: number;
  // Range 2 prices (7-8 months, 6 months, or 2 months)
  range2Price?: number;
  // Range 3 prices (6 months, 5 months, or 1 month) - will use as range2 if range2 not available
  range3Price?: number;
}

const pathMedicalPrices: PathMedicalPrice[] = [
  // DEXCOM G6
  {
    productName: 'Dexcom G6 Sensor 3 Pack Retail',
    ndcCode: 'REF STS-OE-003',
    range1Price: 220.00, // 7+ Months
    range2Price: 220.00, // 6 Months
    range3Price: 210.00, // 5 Months
  },
  {
    productName: 'Dexcom G6 Sensor 3 Pack Mail order',
    ndcCode: 'REF STS-OR-003',
    range1Price: 200.00, // 7+ Months
    range2Price: 200.00, // 6 Months
    range3Price: 190.00, // 5 Months
  },
  {
    productName: 'Dexcom G6 Sensor 3 Pack DME',
    ndcCode: 'STS-OM-003',
    range1Price: 190.00, // 7+ Months
    range2Price: 190.00, // 6 Months
    range3Price: 180.00, // 5 Months
  },
  {
    productName: 'Dexcom G6 Transmitter Kit',
    ndcCode: '08627-0016-01 (REF STT-OE-001)',
    range1Price: 125.00, // 7+ Months (BIG BOX)
    range2Price: 120.00, // 6 Months
    range3Price: 90.00, // 5 Months
  },
  {
    productName: 'Dexcom G6 Transmitter 1 pack',
    ndcCode: '08627-0016-01 (REF STT-OR-001)',
    range1Price: 110.00, // 7+ Months
    range2Price: 110.00, // 6 Months
    range3Price: null, // ASK
  },
  {
    productName: 'Dexcom G6 Receiver 1pk',
    ndcCode: '08627-0091-11',
    range1Price: 145.00, // 7+ Months (OE) - doesn't expire
    // Note: Multiple receiver types, using OE as primary
  },
  // DEXCOM G7
  {
    productName: 'Dexcom G7 Retail Sensor',
    ndcCode: 'STP-AT-012',
    range1Price: 90.00, // 7+ Months
    range2Price: 90.00, // 6 Months
    range3Price: 90.00, // 5 Months
  },
  {
    productName: 'Dexcom G7 Retail Sensor OR',
    ndcCode: 'STP-AT-011',
    range1Price: 88.00, // 7+ Months
    range2Price: 88.00, // 6 Months
    range3Price: 85.00, // 5 Months
  },
  {
    productName: 'Dexcom Sensor G7 DME',
    ndcCode: 'STP-AT-013',
    range1Price: 73.00, // 7+ Months
    range2Price: 73.00, // 6 Months
    range3Price: 70.00, // 5 Months
  },
  {
    productName: 'Dexcom G7 Receiver 1pk',
    ndcCode: '08627-0078-01',
    range1Price: 145.00, // 7+ Months (STK-AT-011) - doesn't expire
  },
  // FREESTYLE LIBRE
  {
    productName: 'Freestyle Libre 3 14 Day Sensor',
    ndcCode: '57599-0818-00',
    range1Price: 60.00, // 3+ Months
    range2Price: 35.00, // 2 Months
    range3Price: null, // ask
  },
  {
    productName: 'Freestyle Libre2 14 Day Sensor',
    ndcCode: '57599-0800-00',
    range1Price: 55.00, // 3+ Months
    range2Price: 30.00, // 2 Months
    range3Price: null, // ask
  },
  {
    productName: 'Freestlye Libre 14 Day Sensor',
    ndcCode: '57599-0001-01',
    range1Price: 55.00, // 3+ Months
    range2Price: 30.00, // 2 Months
    range3Price: null, // ask
  },
  // OMNIPOD
  {
    productName: 'Omnipod 5 (White / Yellow Box) Starter Kit',
    ndcCode: 'REF-SKT-H001-G-X9',
    range1Price: 425.00, // 7+ Months
    range2Price: 425.00, // 6 Months
    range3Price: 425.00, // 5 Months
  },
  {
    productName: 'Omnipod 5pk',
    ndcCode: '08508-1120-05',
    range1Price: 220.00, // 7+ Months
    range2Price: 220.00, // 6 Months
    range3Price: 220.00, // 5 Months
  },
  {
    productName: 'Omnipod 5pk DASH',
    ndcCode: '08508-2000-05',
    range1Price: 155.00, // 7+ Months
    range2Price: 155.00, // 6 Months
    range3Price: 140.00, // 5 Months
  },
  // TEST STRIPS - OneTouch
  {
    productName: 'One Touch Ultra 50ct Mail Order',
    ndcCode: '53885-0963-50',
    range1Price: 22.00, // 9+ Months
    range2Price: 20.00, // 7-8 Months
    range3Price: 19.00, // 6 Months
  },
  {
    productName: 'One Touch Ultra 25ct Retail',
    ndcCode: '53885-0994-25',
    range1Price: 8.00, // 9+ Months
    range2Price: 7.00, // 7-8 Months
    range3Price: 4.00, // 6 Months
  },
  {
    productName: 'One Touch Verio 50ct DME/Mail Order',
    ndcCode: '53885-0838-01',
    range1Price: 7.00, // 9+ Months
    range2Price: 7.00, // 7-8 Months
    range3Price: 7.00, // 6 Months
  },
  {
    productName: 'One Touch Verio 25ct Retail',
    ndcCode: '53885-0270-25',
    range1Price: 4.00, // 9+ Months
    range2Price: 4.00, // 7-8 Months
    range3Price: 4.00, // 6 Months
  },
  // TEST STRIPS - FreeStyle
  {
    productName: 'FreeStyle Lite 100ct Retail',
    ndcCode: '99073-0708-27',
    range1Price: 45.00, // 9+ Months
    range2Price: 45.00, // 7-8 Months
    range3Price: 42.00, // 6 Months
  },
  {
    productName: 'FreeStyle Lite 50ct Retail',
    ndcCode: '99073-0708-22',
    range1Price: 35.00, // 9+ Months
    range2Price: 35.00, // 7-8 Months
    range3Price: 30.00, // 6 Months
  },
  {
    productName: 'FreeStyle 100ct Retail',
    ndcCode: '99073-0708-27',
    range1Price: 34.00, // 9+ Months
    range2Price: 32.00, // 7-8 Months
    range3Price: 30.00, // 6 Months
  },
  {
    productName: 'FreeStyle 50ct Retail',
    ndcCode: '99073-0120-50',
    range1Price: 20.00, // 9+ Months
    range2Price: 19.00, // 7-8 Months
    range3Price: 10.00, // 6 Months
  },
  // TEST STRIPS - Contour
  {
    productName: 'Contour Next 100ct Retail',
    ndcCode: '0193-7312-21',
    range1Price: 33.00, // 9+ Months
    range2Price: 30.00, // 7-8 Months
    range3Price: 28.00, // 6 Months
  },
  {
    productName: 'Contour Next 50ct Retail',
    ndcCode: '0193-7311-50',
    range1Price: 15.00, // 9+ Months
    range2Price: 13.00, // 7-8 Months
    range3Price: 10.00, // 6 Months
  },
  // TEST STRIPS - Accu-Chek
  {
    productName: 'Accu-Chek Aviva Plus 100ct Retail',
    ndcCode: '65702-0408-10',
    range1Price: 63.00, // 9+ Months
    range2Price: 61.00, // 7-8 Months
    range3Price: 60.00, // 6 Months
  },
  {
    productName: 'Accu-Chek Aviva Plus 50ct Retail',
    ndcCode: '65702-0407-10',
    range1Price: 34.00, // 9+ Months
    range2Price: 31.00, // 7-8 Months
    range3Price: 30.00, // 6 Months
  },
  {
    productName: 'Accu-Chek Aviva Plus 50ct NFR',
    ndcCode: '65702-0438-10',
    range1Price: 22.00, // 9+ Months
    range2Price: 20.00, // 7-8 Months
    range3Price: 18.00, // 6 Months
  },
  {
    productName: 'Accu-Chek Guide 100ct Retail',
    ndcCode: '65702-0712-10',
    range1Price: 29.00, // 9+ Months
    range2Price: 28.00, // 7-8 Months
    range3Price: 16.00, // 6 Months
  },
  {
    productName: 'Accu-Chek Guide 50ct Retail',
    ndcCode: '65702-0711-10',
    range1Price: 15.00, // 9+ Months
    range2Price: 11.00, // 7-8 Months
    range3Price: 8.00, // 6 Months
  },
  // LANCETS
  {
    productName: 'FreeStyle 28G Retail',
    ndcCode: '99073-0130-01',
    range1Price: 4.00, // 9+ Months
    range2Price: 4.00, // 7-8 Months
    range3Price: 4.00, // 6 Months
  },
  {
    productName: 'Delica 30G Retail',
    ndcCode: '53885-0011-10',
    range1Price: 4.00, // 9+ Months
    range2Price: 4.00, // 7-8 Months
    range3Price: 4.00, // 6 Months
  },
  {
    productName: 'Delica 33G Retail',
    ndcCode: '53885-0008-10',
    range1Price: 4.00, // 9+ Months
    range2Price: 4.00, // 7-8 Months
    range3Price: 4.00, // 6 Months
  },
  {
    productName: 'Microlet Retail',
    ndcCode: '0193-6586-21',
    range1Price: 4.00, // 9+ Months
    range2Price: 4.00, // 7-8 Months
    range3Price: 4.00, // 6 Months
  },
  {
    productName: 'Fastclix Retail',
    ndcCode: '65702-0288-10',
    range1Price: 4.00, // 9+ Months
    range2Price: 4.00, // 7-8 Months
    range3Price: 4.00, // 6 Months
  },
  {
    productName: 'Softclix Retail',
    ndcCode: '50924-0971-10',
    range1Price: 4.00, // 9+ Months
    range2Price: 4.00, // 7-8 Months
    range3Price: 4.00, // 6 Months
  },
];

async function addPathMedicalPrices() {
  console.log('💰 Adding PATH MEDICAL SUPPLY prices...\n');

  // Find PATH MEDICAL SUPPLY buyer
  const buyer = await prisma.buyer.findFirst({
    where: {
      OR: [
        { firstName: 'PATH', lastName: 'MEDICAL SUPPLY' },
        { firstName: { contains: 'PATH' } },
        { lastName: { contains: 'MEDICAL SUPPLY' } },
      ],
    },
  });

  if (!buyer) {
    console.log('❌ PATH MEDICAL SUPPLY buyer not found. Please run seed:buyers first.');
    return;
  }

  console.log(`✅ Found buyer: ${buyer.firstName} ${buyer.lastName}\n`);

  let successCount = 0;
  let notFoundCount = 0;

  for (const priceData of pathMedicalPrices) {
    try {
      // Find product by name or NDC
      let product = await prisma.product.findFirst({
        where: priceData.ndcCode
          ? {
              OR: [
                { name: { contains: priceData.productName } },
                { ndcCode: priceData.ndcCode },
              ],
            }
          : { name: { contains: priceData.productName } },
        include: {
          subCategory: {
            include: {
              category: true,
            },
          },
        },
      });

      if (!product) {
        console.log(`⚠️  Product not found: ${priceData.productName}`);
        notFoundCount++;
        continue;
      }

      // Get category expiration range labels
      const category = product.subCategory?.category;
      let range1Label = '9+ Months';
      let range2Label = '7-8 Months';

      // Try to get labels from Northeast Medical prices
      if (category) {
        const northeastPrice = await prisma.buyerProductPrice.findFirst({
          where: {
            productId: product.id,
            buyer: {
              firstName: 'Northeast',
              lastName: 'Medical Exchange',
            },
          },
        });
        if (northeastPrice?.expirationRange1Label) {
          range1Label = northeastPrice.expirationRange1Label;
        }
        if (northeastPrice?.expirationRange2Label) {
          range2Label = northeastPrice.expirationRange2Label;
        }
      }

      // Use range1Price as primary, range2Price as secondary (or range3Price if range2 not available)
      const range1Price = priceData.range1Price;
      const range2Price = priceData.range2Price || priceData.range3Price;
      
      // Calculate ding reduction if we have both range1 and a lower range2
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
          damagedPrice: (priceData as any).damagedPrice || undefined,
        },
        create: {
          buyerId: buyer.id,
          productId: product.id,
          expirationRange1Label: range1Label,
          expirationRange1Price: range1Price || undefined,
          expirationRange2Label: range2Label,
          expirationRange2Price: range2Price || undefined,
          dingReductionPrice: dingReduction || undefined,
          damagedPrice: (priceData as any).damagedPrice || undefined,
        },
      });

      console.log(`✅ Added price for: ${product.name}`);
      if (range1Price) console.log(`   Range 1 (${range1Label}): $${range1Price.toFixed(2)}`);
      if (range2Price) console.log(`   Range 2 (${range2Label}): $${range2Price.toFixed(2)}`);
      if (dingReduction) console.log(`   Ding Reduction: $${dingReduction.toFixed(2)}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error adding price for ${priceData.productName}:`, error);
    }
  }

  console.log(`\n✅ Finished! Added ${successCount} prices, ${notFoundCount} products not found.`);
}

// Export for use in other scripts/routes (CommonJS + ESM)
module.exports = { addPathMedicalPrices };
export { addPathMedicalPrices };

// Run if called directly
if (require.main === module) {
  addPathMedicalPrices()
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

