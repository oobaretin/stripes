import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Ralph Walton Price List
 * Updated: 12/5/2025
 * 
 * Mapping:
 * - 9 Mos+ MINT -> expirationRange1Price
 * - 9 Mos+ DINGED -> expirationRange2Price (or we can use 7-8 Mos MINT)
 * - dingReductionPrice = MINT - DINGED (for 9 Mos+)
 */

interface RalphWaltonPrice {
  productName: string; // As it appears in our database
  ndcCode?: string; // Optional NDC for matching
  // 9 Mos+ prices
  mint9Mos?: number;
  dinged9Mos?: number;
  damaged9Mos?: number;
  // 7-8 Mos prices
  mint7to8Mos?: number;
  dinged7to8Mos?: number;
  damaged7to8Mos?: number;
  // 6 Mos prices
  mint6Mos?: number;
  dinged6Mos?: number;
  damaged6Mos?: number;
}

const ralphWaltonPrices: RalphWaltonPrice[] = [
  // FreeStyle
  {
    productName: 'FreeStyle Lite 100ct Retail',
    mint9Mos: 48.00,
    dinged9Mos: 45.00,
    damaged9Mos: 28.00,
    mint7to8Mos: null, // ASK
    dinged7to8Mos: null, // ASK
    damaged7to8Mos: 25.00,
    mint6Mos: null, // ASK
    dinged6Mos: null, // ASK
    damaged6Mos: 25.00,
  },
  {
    productName: 'FreeStyle Lite 50ct Retail',
    mint9Mos: 30.00,
    dinged9Mos: 27.00,
    damaged9Mos: 15.00,
    mint7to8Mos: null, // ASK
    dinged7to8Mos: null, // ASK
    damaged7to8Mos: 11.00,
    mint6Mos: null, // ASK
    dinged6Mos: null, // ASK
    damaged6Mos: 10.00,
  },
  {
    productName: 'FreeStyle Lite 50ct Institutional Use Only',
    mint9Mos: 25.00,
    dinged9Mos: 22.00,
    damaged9Mos: 13.00,
    mint7to8Mos: 22.00,
    dinged7to8Mos: 19.00,
    damaged7to8Mos: 13.00,
    mint6Mos: 19.00,
    dinged6Mos: 10.00,
    damaged6Mos: 13.00,
  },
  {
    productName: 'FreeStyle 100ct Retail',
    mint9Mos: 35.00,
    dinged9Mos: null, // N/A
    damaged9Mos: null, // N/a
    mint7to8Mos: 30.00,
    dinged7to8Mos: null, // N/A
    damaged7to8Mos: null, // N/a
    mint6Mos: null, // N/A
    dinged6Mos: null, // N/A
    damaged6Mos: null, // N/a
  },
  {
    productName: 'FreeStyle 50ct Retail',
    mint9Mos: 20.00,
    dinged9Mos: 17.00,
    damaged9Mos: null, // N/a
    mint7to8Mos: 17.00,
    dinged7to8Mos: 14.00,
    damaged7to8Mos: null, // N/a
    mint6Mos: null, // N/A
    dinged6Mos: null, // N/A
    damaged6Mos: null, // N/a
  },
  // Accu-Chek
  {
    productName: 'Accu-Chek Aviva Plus 100ct Retail',
    mint9Mos: 69.00,
    dinged9Mos: 66.00,
    damaged9Mos: 30.00,
    mint7to8Mos: 68.00,
    dinged7to8Mos: 65.00,
    damaged7to8Mos: null, // Ask
    mint6Mos: 66.00,
    dinged6Mos: 63.00,
    damaged6Mos: null, // Ask
  },
  {
    productName: 'Accu-Chek Aviva Plus 50ct Retail',
    mint9Mos: 36.00,
    dinged9Mos: 33.00,
    damaged9Mos: 25.00,
    mint7to8Mos: 35.00,
    dinged7to8Mos: 32.00,
    damaged7to8Mos: null, // Ask
    mint6Mos: 35.00,
    dinged6Mos: 32.00,
    damaged6Mos: null, // Ask
  },
  {
    productName: 'Accu-Chek Guide 100ct Retail',
    mint9Mos: 31.00,
    dinged9Mos: 28.00,
    damaged9Mos: 15.00,
    mint7to8Mos: 28.00,
    dinged7to8Mos: 25.00,
    damaged7to8Mos: 12.00,
    mint6Mos: 16.00,
    dinged6Mos: 13.00,
    damaged6Mos: 9.00,
  },
  {
    productName: 'Accu-Chek Guide 50ct Retail',
    mint9Mos: 16.00,
    dinged9Mos: 13.00,
    damaged9Mos: 5.00,
    mint7to8Mos: 13.00,
    dinged7to8Mos: 10.00,
    damaged7to8Mos: null, // Ask
    mint6Mos: 7.00,
    dinged6Mos: 4.00,
    damaged6Mos: null, // Ask
  },
  // Contour Next
  {
    productName: 'Contour Next 100ct Retail',
    ndcCode: '0193-7312-21',
    mint9Mos: 34.00,
    dinged9Mos: 31.00,
    damaged9Mos: 18.00,
    mint7to8Mos: 32.00,
    dinged7to8Mos: 29.00,
    damaged7to8Mos: 18.00,
    mint6Mos: 29.00,
    dinged6Mos: 26.00,
    damaged6Mos: 18.00,
  },
  {
    productName: 'Contour Next 50ct Retail',
    ndcCode: '0193-7311-50',
    mint9Mos: 16.00,
    dinged9Mos: 13.00,
    damaged9Mos: 10.00,
    mint7to8Mos: 13.00,
    dinged7to8Mos: 10.00,
    damaged7to8Mos: 7.00,
    mint6Mos: 11.00,
    dinged6Mos: 8.00,
    damaged6Mos: 5.00,
  },
  // Lancets
  {
    productName: 'Delica 30G Retail',
    mint9Mos: 5.00, // 12 Mos+ for lancets
    dinged9Mos: 4.00,
    damaged9Mos: 3.00,
  },
  {
    productName: 'Delica 33G Retail',
    mint9Mos: 5.00, // 12 Mos+ for lancets
    dinged9Mos: 4.00,
    damaged9Mos: 3.00,
  },
  {
    productName: 'FreeStyle 28G Retail',
    mint9Mos: 3.00, // 12 Mos+ for lancets (FREESTYLE,SOFTCLIX,MICROLET)
    dinged9Mos: 2.00,
    damaged9Mos: 2.00,
  },
  {
    productName: 'Microlet Retail',
    mint9Mos: 3.00, // 12 Mos+ for lancets
    dinged9Mos: 2.00,
    damaged9Mos: 2.00,
  },
  {
    productName: 'Fastclix Retail',
    mint9Mos: 5.00, // 12 Mos+ for lancets
    dinged9Mos: 4.00,
    damaged9Mos: 4.00,
  },
  {
    productName: 'Softclix Retail',
    mint9Mos: 3.00, // 12 Mos+ for lancets
    dinged9Mos: 2.00,
    damaged9Mos: 2.00,
  },
  // Dexcom G7
  {
    productName: 'Dexcom G7 Retail Sensor OR',
    ndcCode: 'STP-AT-011',
    mint9Mos: 85.00, // 7 months+
    dinged9Mos: 80.00,
    mint7to8Mos: 85.00, // 6 Months
    dinged7to8Mos: 80.00,
    mint6Mos: 80.00, // 5 months
    dinged6Mos: 75.00,
  },
  {
    productName: 'Dexcom G7 Retail Sensor',
    ndcCode: 'STP-AT-012',
    mint9Mos: 93.00, // 7 months+
    dinged9Mos: 88.00,
    mint7to8Mos: 91.00, // 6 Months
    dinged7to8Mos: 86.00,
    mint6Mos: 85.00, // 5 months
    dinged6Mos: 80.00,
  },
  {
    productName: 'Dexcom Sensor G7 DME',
    ndcCode: 'STP-AT-013',
    mint9Mos: 76.00, // 7 months+
    dinged9Mos: 71.00,
    mint7to8Mos: 73.00, // 6 Months
    dinged7to8Mos: 68.00,
    mint6Mos: 69.00, // 5 months
    dinged6Mos: 64.00,
  },
  {
    productName: 'Dexcom G7 Receiver 1pk',
    ndcCode: '08627-0078-01',
    mint9Mos: 145.00, // No Exp (Retail Non-Medicare)
    dinged9Mos: 135.00,
  },
  // Dexcom G6
  {
    productName: 'Dexcom G6 Sensor 3 Pack Retail',
    ndcCode: 'REF STS-OE-003',
    mint9Mos: 235.00, // 7 Months+
    dinged9Mos: 225.00,
    mint7to8Mos: 230.00, // 6 Months
    dinged7to8Mos: 220.00,
    damaged7to8Mos: null, // ASK
  },
  {
    productName: 'Dexcom G6 Sensor 3 Pack Mail order',
    ndcCode: 'REF STS-OR-003',
    mint9Mos: 235.00, // 7 Months+
    dinged9Mos: 225.00,
    mint7to8Mos: 230.00, // 6 Months
    dinged7to8Mos: 220.00,
    damaged7to8Mos: null, // ASK
  },
  {
    productName: 'Dexcom G6 Sensor 3 Pack DME',
    ndcCode: 'STS-OM-003',
    mint9Mos: 190.00, // 7 Months+
    dinged9Mos: 180.00,
    mint7to8Mos: 190.00, // 6 Months
    dinged7to8Mos: 180.00,
  },
  {
    productName: 'Dexcom G6 Transmitter Kit',
    ndcCode: '08627-0016-01 (REF STT-OE-001)',
    mint9Mos: 160.00, // 7 Months+ (Stt-OE-002 Full Kit)
    dinged9Mos: 150.00,
  },
  {
    productName: 'Dexcom G6 Transmitter 1 pack',
    ndcCode: '08627-0016-01 (REF STT-OR-001)',
    mint9Mos: 110.00, // 7 months+
    dinged9Mos: 105.00,
  },
  {
    productName: 'Dexcom G6 Receiver 1pk',
    ndcCode: '08627-0091-11',
    mint9Mos: 90.00, // Don't Expire (Orange Label/No Booklet)
  },
  // Freestyle Libre
  {
    productName: 'Freestyle Libre 3 14 Day Sensor',
    ndcCode: '57599-0818-00',
    mint9Mos: 60.00, // 3 Months +
    dinged9Mos: 55.00,
  },
  {
    productName: 'Freestyle Libre2 14 Day Sensor',
    ndcCode: '57599-0800-00',
    mint9Mos: 56.00, // 3 Months +
    dinged9Mos: 51.00,
    damaged9Mos: 25.00,
    mint7to8Mos: 30.00, // 2 Months
    dinged7to8Mos: 25.00,
  },
  {
    productName: 'Freestlye Libre 14 Day Sensor',
    ndcCode: '57599-0001-01',
    mint9Mos: 56.00, // 3 Months +
    dinged9Mos: 51.00,
    damaged9Mos: 25.00,
    mint7to8Mos: 30.00, // 2 Months
    dinged7to8Mos: 25.00,
  },
  // Omnipod
  {
    productName: 'Omnipod 5 (Purple Box)',
    ndcCode: '08508-3000-21',
    mint9Mos: 200.00, // 7 months+ (Omnipod 5 - 5 Pack G6/G7 DME)
    dinged9Mos: 195.00,
    mint7to8Mos: 200.00, // 6 Months
    dinged7to8Mos: 195.00,
  },
  {
    productName: 'Omnipod 5pk',
    ndcCode: '08508-1120-05',
    mint9Mos: null, // 7 months+ Ask
    dinged9Mos: null, // ASK
  },
  {
    productName: 'Omnipod 5pk DASH',
    ndcCode: '08508-2000-05',
    mint9Mos: 145.00, // 7 months+
    dinged9Mos: 135.00,
    damaged9Mos: 120.00,
  },
];

async function addRalphWaltonPrices() {
  console.log('💰 Adding Ralph Walton prices...\n');

  // Find Ralph Walton buyer
  const buyer = await prisma.buyer.findFirst({
    where: {
      OR: [
        { firstName: { contains: 'Ralphel' } },
        { firstName: { contains: 'Ralph' } },
        { lastName: { contains: 'Walton' } },
      ],
    },
  });

  if (!buyer) {
    console.log('❌ Ralph Walton buyer not found. Please run seed:buyers first.');
    return;
  }

  console.log(`✅ Found buyer: ${buyer.firstName} ${buyer.lastName}\n`);

  let successCount = 0;
  let notFoundCount = 0;

  for (const priceData of ralphWaltonPrices) {
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
      let range1Label = '9 Mos+';
      let range2Label = '7-8 Mos';

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

      // Use 9 Mos+ MINT as range1, 9 Mos+ DINGED as range2 (or 7-8 Mos MINT if available)
      const range1Price = priceData.mint9Mos;
      const range2Price = priceData.mint7to8Mos || priceData.dinged9Mos;
      const dingReduction = priceData.mint9Mos && priceData.dinged9Mos
        ? priceData.mint9Mos - priceData.dinged9Mos
        : null;
      const damagedPrice = priceData.damaged9Mos ?? priceData.damaged7to8Mos ?? priceData.damaged6Mos ?? null;

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
          damagedPrice: damagedPrice || undefined,
        },
        create: {
          buyerId: buyer.id,
          productId: product.id,
          expirationRange1Label: range1Label,
          expirationRange1Price: range1Price || undefined,
          expirationRange2Label: range2Label,
          expirationRange2Price: range2Price || undefined,
          dingReductionPrice: dingReduction || undefined,
          damagedPrice: damagedPrice || undefined,
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
module.exports = { addRalphWaltonPrices };
export { addRalphWaltonPrices };

// Run if called directly
if (require.main === module) {
  addRalphWaltonPrices()
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

