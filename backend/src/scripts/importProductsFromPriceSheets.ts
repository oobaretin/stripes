import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Color codes for visual differentiation
const COLOR_CODES = [
  'bg-blue-100 border-blue-300 text-blue-800',
  'bg-green-100 border-green-300 text-green-800',
  'bg-yellow-100 border-yellow-300 text-yellow-800',
  'bg-purple-100 border-purple-300 text-purple-800',
  'bg-pink-100 border-pink-300 text-pink-800',
  'bg-indigo-100 border-indigo-300 text-indigo-800',
  'bg-red-100 border-red-300 text-red-800',
  'bg-orange-100 border-orange-300 text-orange-800',
];

// Sample products from common diabetic test strips
// In production, you would extract these from the actual price sheets
const commonProducts = [
  // Accu-Chek products
  { name: 'Accu-Chek Aviva Plus', brand: 'Accu-Chek', colorCode: COLOR_CODES[0] },
  { name: 'Accu-Chek Guide', brand: 'Accu-Chek', colorCode: COLOR_CODES[0] },
  { name: 'Accu-Chek Performa', brand: 'Accu-Chek', colorCode: COLOR_CODES[0] },
  
  // OneTouch products
  { name: 'OneTouch Ultra', brand: 'OneTouch', colorCode: COLOR_CODES[1] },
  { name: 'OneTouch Verio', brand: 'OneTouch', colorCode: COLOR_CODES[1] },
  { name: 'OneTouch Select', brand: 'OneTouch', colorCode: COLOR_CODES[1] },
  
  // FreeStyle products
  { name: 'FreeStyle Lite', brand: 'FreeStyle', colorCode: COLOR_CODES[2] },
  { name: 'FreeStyle Freedom Lite', brand: 'FreeStyle', colorCode: COLOR_CODES[2] },
  
  // Contour products
  { name: 'Contour Next', brand: 'Contour', colorCode: COLOR_CODES[3] },
  { name: 'Contour', brand: 'Contour', colorCode: COLOR_CODES[3] },
  
  // True Metrix products
  { name: 'True Metrix', brand: 'True Metrix', colorCode: COLOR_CODES[4] },
  
  // ReliOn products
  { name: 'ReliOn Prime', brand: 'ReliOn', colorCode: COLOR_CODES[5] },
  { name: 'ReliOn Confirm', brand: 'ReliOn', colorCode: COLOR_CODES[5] },
  
  // Other brands
  { name: 'Bayer Contour', brand: 'Bayer', colorCode: COLOR_CODES[6] },
  { name: 'Prodigy', brand: 'Prodigy', colorCode: COLOR_CODES[7] },
];

// Sample buyer prices (you would extract these from actual price sheets)
// Format: { buyerName: { productName: price } }
const buyerPrices: Record<string, Record<string, number>> = {
  'Northeast Medical Exchange': {
    'Accu-Chek Aviva Plus': 0.15,
    'OneTouch Ultra': 0.18,
    'FreeStyle Lite': 0.16,
    'Contour Next': 0.14,
  },
  'Charles Harris': {
    'Accu-Chek Aviva Plus': 0.16,
    'OneTouch Ultra': 0.19,
    'FreeStyle Lite': 0.17,
    'True Metrix': 0.12,
  },
  'Chris Sampson': {
    'Accu-Chek Guide': 0.15,
    'OneTouch Verio': 0.20,
    'Contour Next': 0.15,
    'ReliOn Prime': 0.10,
  },
  'PATH MEDICAL SUPPLY': {
    'Accu-Chek Performa': 0.14,
    'OneTouch Select': 0.17,
    'FreeStyle Freedom Lite': 0.16,
    'Bayer Contour': 0.13,
  },
  'Ralphel Walton': {
    'Accu-Chek Aviva Plus': 0.17,
    'OneTouch Ultra': 0.18,
    'Contour Next': 0.15,
    'Prodigy': 0.11,
  },
};

async function importProducts() {
  console.log('🔄 Importing products from price sheets...');

  // First, get all buyers
  const buyers = await prisma.buyer.findMany();
  const buyerMap = new Map(buyers.map(b => [b.firstName + ' ' + b.lastName, b]));

  // Import products
  for (const productData of commonProducts) {
    try {
      // Check if product exists
      let product = await prisma.product.findFirst({
        where: { name: productData.name },
      });

      if (!product) {
        product = await prisma.product.create({
          data: {
            name: productData.name,
            brand: productData.brand,
            colorCode: productData.colorCode,
          },
        });
      } else {
        product = await prisma.product.update({
          where: { id: product.id },
          data: {
            brand: productData.brand,
            colorCode: productData.colorCode,
          },
        });
      }

      console.log(`✅ Product: ${product.name} (${product.brand})`);

      // Add prices for each buyer
      for (const [buyerName, prices] of Object.entries(buyerPrices)) {
        const buyer = buyerMap.get(buyerName);
        if (buyer && prices[product.name]) {
          await prisma.buyerProductPrice.upsert({
            where: {
              buyerId_productId: {
                buyerId: buyer.id,
                productId: product.id,
              },
            },
            update: {
              price: prices[product.name],
            },
            create: {
              buyerId: buyer.id,
              productId: product.id,
              price: prices[product.name],
            },
          });
          console.log(`   💰 ${buyerName}: $${prices[product.name].toFixed(2)}`);
        }
      }
    } catch (error) {
      console.error(`❌ Error importing product ${productData.name}:`, error);
    }
  }

  console.log('✅ Finished importing products!');
}

importProducts()
  .catch((error) => {
    console.error('Error importing products:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

