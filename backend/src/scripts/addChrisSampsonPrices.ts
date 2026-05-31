import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Chris Sampson Price List
 * 
 * Mapping:
 * - 9mo+ / 7mo+ -> expirationRange1Price
 * - 7-8mo / 6mo -> expirationRange2Price
 * - DINGS -> dingReductionPrice
 */

interface ChrisSampsonPrice {
  productName: string; // As it appears in our database
  ndcCode?: string; // Optional NDC for matching
  range1Price?: number; // 9mo+ or 7mo+
  range2Price?: number; // 7-8mo or 6mo
  range3Price?: number; // 6mo or 5mo
  damagedPrice?: number; // Damaged 6mo+
  dingReduction?: number; // DINGS amount
}

const chrisSampsonPrices: ChrisSampsonPrice[] = [
  // OneTouch
  {
    productName: 'One Touch Ultra 25ct Retail',
    ndcCode: '53885-0994-25',
    range1Price: 7.00, // 9mo+
    dingReduction: 2.00,
  },
  {
    productName: 'One Touch Ultra 50ct Mail Order',
    ndcCode: '53885-0963-50',
    range1Price: 18.00, // 9mo+
    damagedPrice: 10.00,
    dingReduction: 3.00,
  },
  // FreeStyle
  {
    productName: 'FreeStyle Lite 50ct Retail',
    ndcCode: '99073-0708-22',
    range1Price: 33.00, // 9mo+
    damagedPrice: 15.00,
    dingReduction: 3.00,
  },
  {
    productName: 'FreeStyle Lite 100ct Retail',
    ndcCode: '99073-0708-27',
    range1Price: 45.00, // 9mo+
    damagedPrice: 28.00,
    dingReduction: 3.00,
  },
  {
    productName: 'FreeStyle Lite 50ct Institutional Use Only',
    ndcCode: '99073-0710-26',
    range1Price: 24.00, // 9mo+
    range2Price: 21.00, // 7-8mo
    range3Price: 18.00, // 6mo
    damagedPrice: 13.00,
    dingReduction: 3.00,
  },
  {
    productName: 'FreeStyle 50ct Retail',
    ndcCode: '99073-0120-50',
    range1Price: 18.00, // 9mo+
    range2Price: 15.00, // 7-8mo
    dingReduction: 3.00,
  },
  {
    productName: 'FreeStyle 100ct Retail',
    ndcCode: '99073-0708-27',
    range1Price: 30.00, // 9mo+
    range2Price: 25.00, // 7-8mo
    dingReduction: 3.00,
  },
  // Contour Next
  {
    productName: 'Contour Next 50ct Retail',
    ndcCode: '0193-7311-50',
    range1Price: 16.00, // 9mo+
    range2Price: 13.00, // 7-8mo
    range3Price: 11.00, // 6mo
    damagedPrice: 10.00,
    dingReduction: 3.00,
  },
  {
    productName: 'Contour Next 100ct Retail',
    ndcCode: '0193-7312-21',
    range1Price: 34.00, // 9mo+
    range2Price: 31.00, // 7-8mo
    range3Price: 29.00, // 6mo
    damagedPrice: 18.00,
    dingReduction: 3.00,
  },
  // Accu-Chek
  {
    productName: 'Accu-Chek Aviva Plus 50ct Retail',
    ndcCode: '65702-0407-10',
    range1Price: 37.00, // 9mo+
    range2Price: 37.00, // 7-8mo
    range3Price: 36.00, // 6mo
    damagedPrice: 26.00,
    dingReduction: 3.00,
  },
  {
    productName: 'Accu-Chek Aviva Plus 100ct Retail',
    ndcCode: '65702-0408-10',
    range1Price: 70.00, // 9mo+
    range2Price: 69.00, // 7-8mo
    range3Price: 67.00, // 6mo
    damagedPrice: 30.00,
    dingReduction: 3.00,
  },
  {
    productName: 'Accu-Chek Aviva Plus 50ct NFR',
    ndcCode: '65702-0438-10',
    range1Price: 25.00, // 9mo+ (Not For Pharmacy Benefit)
    range2Price: 23.00, // 7-8mo
    range3Price: 21.00, // 6mo
    damagedPrice: 15.00,
    dingReduction: 3.00,
  },
  {
    productName: 'Accu-Chek Guide 50ct Retail',
    ndcCode: '65702-0711-10',
    range1Price: 16.00, // 9mo+
    range2Price: 13.00, // 7-8mo
    range3Price: 7.00, // 6mo
    damagedPrice: 5.00,
    dingReduction: 3.00,
  },
  {
    productName: 'Accu-Chek Guide 100ct Retail',
    ndcCode: '65702-0712-10',
    range1Price: 29.00, // 9mo+
    range2Price: 26.00, // 7-8mo
    range3Price: 16.00, // 6mo
    damagedPrice: 15.00,
    dingReduction: 3.00,
  },
  // Lancets
  {
    productName: 'Delica 30G Retail',
    ndcCode: '53885-0011-10',
    range1Price: 5.00, // 9mo+
    range2Price: 5.00, // 7-8mo
    range3Price: 4.00, // 6mo
    dingReduction: 2.00,
  },
  {
    productName: 'Delica 33G Retail',
    ndcCode: '53885-0008-10',
    range1Price: 5.00, // 9mo+
    range2Price: 5.00, // 7-8mo
    range3Price: 4.00, // 6mo
    dingReduction: 2.00,
  },
  {
    productName: 'FreeStyle 28G Retail',
    ndcCode: '99073-0130-01',
    range1Price: 4.00, // 9mo+ (Freestyle Lite, Ultrasoft)
    range2Price: 4.00, // 7-8mo
    range3Price: 4.00, // 6mo
    dingReduction: 2.00,
  },
  {
    productName: 'Microlet Retail',
    ndcCode: '0193-6586-21',
    range1Price: 4.00, // 9mo+ (Microlets, Fastclix, Softclix)
    range2Price: 4.00, // 7-8mo
    dingReduction: 1.00,
  },
  {
    productName: 'Fastclix Retail',
    ndcCode: '65702-0288-10',
    range1Price: 4.00, // 9mo+
    range2Price: 4.00, // 7-8mo
    dingReduction: 1.00,
  },
  {
    productName: 'Softclix Retail',
    ndcCode: '50924-0971-10',
    range1Price: 4.00, // 9mo+
    range2Price: 4.00, // 7-8mo
    dingReduction: 1.00,
  },
  // Dexcom G6
  {
    productName: 'Dexcom G6 Sensor 3 Pack Retail',
    ndcCode: 'REF STS-OE-003',
    range1Price: 240.00, // 7mo+
    range2Price: 230.00, // 6mo
  },
  {
    productName: 'Dexcom G6 Sensor 3 Pack Mail order',
    ndcCode: 'REF STS-OR-003',
    range1Price: 240.00, // 7mo+
    range2Price: 230.00, // 6mo
  },
  {
    productName: 'Dexcom G6 Sensor 3 Pack DME',
    ndcCode: 'STS-OM-003',
    range1Price: 190.00, // 7mo+
    range2Price: 190.00, // 6mo
  },
  {
    productName: 'Dexcom G6 Transmitter Kit',
    ndcCode: '08627-0016-01 (REF STT-OE-001)',
    range1Price: 150.00, // 7mo+
  },
  {
    productName: 'Dexcom G6 Transmitter 1 pack',
    ndcCode: '08627-0016-01 (REF STT-OR-001)',
    range1Price: 112.00, // 7mo+ (OR)
    range2Price: 112.00, // 6mo
  },
  {
    productName: 'Dexcom G6 Receiver 1pk',
    ndcCode: '08627-0091-11',
    range1Price: 125.00, // 7mo+ (FR) - doesn't expire
  },
  // Dexcom G7
  {
    productName: 'Dexcom G7 Retail Sensor',
    ndcCode: 'STP-AT-012',
    range1Price: 96.00, // 7mo+
    range2Price: 96.00, // 6mo
    range3Price: 96.00, // 5mo
  },
  {
    productName: 'Dexcom G7 Retail Sensor OR',
    ndcCode: 'STP-AT-011',
    range1Price: 91.00, // 7mo+
    range2Price: 91.00, // 6mo
  },
  {
    productName: 'Dexcom Sensor G7 DME',
    ndcCode: 'STP-AT-013',
    range1Price: 78.00, // 7mo+
    range2Price: 78.00, // 6mo
  },
  {
    productName: 'Dexcom G7 Receiver 1pk',
    ndcCode: '08627-0078-01',
    range1Price: 150.00, // 7mo+ (011)
    range2Price: 150.00, // 6mo
    range3Price: 150.00, // 5mo
  },
  // Freestyle Libre
  {
    productName: 'Freestyle Libre2 14 Day Sensor',
    ndcCode: '57599-0800-00',
    range1Price: 57.00, // 9mo+ (3mo+)
    range2Price: 57.00, // 7-8mo
    range3Price: 57.00, // 6mo
    // Note: Special pricing 3mo+: $56, 2mo: $35
  },
  {
    productName: 'Freestlye Libre 14 Day Sensor',
    ndcCode: '57599-0001-01',
    range1Price: 58.00, // 9mo+ (3mo+)
    range2Price: 58.00, // 7-8mo
    range3Price: 58.00, // 6mo
    // Note: Special pricing 3mo+: $56, 2mo: $35
  },
  {
    productName: 'Freestyle Libre 3 14 Day Sensor',
    ndcCode: '57599-0818-00',
    range1Price: 61.00, // 9mo+ (3mo+)
    range2Price: 61.00, // 7-8mo
    range3Price: 61.00, // 6mo
    // Note: Special pricing 3mo+: $61, 2mo: $45
  },
  // Omnipod
  {
    productName: 'Omnipod 5pk',
    ndcCode: '08508-1120-05',
    range1Price: 70.00, // 7mo+
    range2Price: 70.00, // 6mo
  },
  {
    productName: 'Omnipod 5 (Purple Box)',
    ndcCode: '08508-3000-21',
    range1Price: 230.00, // 7mo+ (New Purple & White)
    range2Price: 230.00, // 6mo
    range3Price: 230.00, // 5mo
  },
  {
    productName: 'Omnipod 5 (White / Yellow Box) Starter Kit',
    ndcCode: 'REF-SKT-H001-G-X9',
    range1Price: 430.00, // 7mo+ (Pod 5 Full Starter Kit)
    range2Price: 430.00, // 6mo
    range3Price: 430.00, // 5mo
  },
  {
    productName: 'Omnipod 5pk DASH',
    ndcCode: '08508-2000-05',
    range1Price: 160.00, // 7mo+ (Dash Pod 5 Pack)
    range2Price: 160.00, // 6mo
    range3Price: 155.00, // 5mo
  },
];

async function addChrisSampsonPrices() {
  console.log('💰 Adding Chris Sampson prices...\n');

  // Find Chris Sampson buyer
  const buyer = await prisma.buyer.findFirst({
    where: {
      OR: [
        { firstName: { contains: 'Chris' } },
        { lastName: { contains: 'Sampson' } },
      ],
    },
  });

  if (!buyer) {
    console.log('❌ Chris Sampson buyer not found. Please run seed:buyers first.');
    return;
  }

  console.log(`✅ Found buyer: ${buyer.firstName} ${buyer.lastName}\n`);

  let successCount = 0;
  let notFoundCount = 0;

  for (const priceData of chrisSampsonPrices) {
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
      let range1Label = '9mo+';
      let range2Label = '7-8mo';

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
      
      // Use dingReduction from data, or calculate if not provided
      const dingReduction = priceData.dingReduction || 
        (range1Price && range2Price && range2Price < range1Price
          ? range1Price - range2Price
          : null);

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
module.exports = { addChrisSampsonPrices };
export { addChrisSampsonPrices };

// Run if called directly
if (require.main === module) {
  addChrisSampsonPrices()
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}







