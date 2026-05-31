import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script to add prices for other buyers
 * 
 * Usage example:
 * 
 * To add prices for a buyer, modify the buyerPrices object below with:
 * - buyerName: The full name of the buyer (e.g., "Charles Harris")
 * - productName: Exact product name as it appears in the database
 * - expirationRange1Price: Price for range 1 (e.g., "Mint 12/26+")
 * - expirationRange2Price: Price for range 2 (e.g., "Mint 9/26-11/26+")
 * - dingReductionPrice: Ding reduction price
 * - expirationRange1Label: Label for range 1 (optional, will use category default if not provided)
 * - expirationRange2Label: Label for range 2 (optional, will use category default if not provided)
 */

interface BuyerPriceData {
  buyerName: string;
  productName: string;
  expirationRange1Price?: number;
  expirationRange2Price?: number;
  dingReductionPrice?: number;
  expirationRange1Label?: string;
  expirationRange2Label?: string;
}

// Add your buyer prices here
const buyerPrices: BuyerPriceData[] = [
  // Example: Charles Harris prices
  // {
  //   buyerName: 'Charles Harris',
  //   productName: 'One Touch Ultra 100ct Retail',
  //   expirationRange1Price: 60.00,
  //   expirationRange2Price: 56.00,
  //   dingReductionPrice: 3.00,
  // },
  // {
  //   buyerName: 'Charles Harris',
  //   productName: 'Accu-Chek Aviva Plus 100ct Retail',
  //   expirationRange1Price: 60.00,
  //   expirationRange2Price: 56.00,
  //   dingReductionPrice: 2.00,
  // },
];

async function addBuyerPrices() {
  console.log('💰 Adding buyer prices...\n');

  if (buyerPrices.length === 0) {
    console.log('⚠️  No prices to add. Please add prices to the buyerPrices array in the script.');
    return;
  }

  for (const priceData of buyerPrices) {
    try {
      // Find buyer
      const [firstName, ...lastNameParts] = priceData.buyerName.split(' ');
      const lastName = lastNameParts.join(' ');

      const buyer = await prisma.buyer.findFirst({
        where: {
          firstName: { contains: firstName },
          lastName: { contains: lastName },
        },
      });

      if (!buyer) {
        console.log(`❌ Buyer not found: ${priceData.buyerName}`);
        continue;
      }

      // Find product
      const product = await prisma.product.findFirst({
        where: { name: priceData.productName },
        include: {
          subCategory: {
            include: {
              category: true,
            },
          },
        },
      });

      if (!product) {
        console.log(`❌ Product not found: ${priceData.productName}`);
        continue;
      }

      // Get category expiration range labels if not provided
      const category = product.subCategory?.category;
      const range1Label = priceData.expirationRange1Label || 
        (category ? await getCategoryRange1Label(category.id) : undefined);
      const range2Label = priceData.expirationRange2Label || 
        (category ? await getCategoryRange2Label(category.id) : undefined);

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
          expirationRange1Price: priceData.expirationRange1Price,
          expirationRange2Label: range2Label,
          expirationRange2Price: priceData.expirationRange2Price,
          dingReductionPrice: priceData.dingReductionPrice,
        },
        create: {
          buyerId: buyer.id,
          productId: product.id,
          expirationRange1Label: range1Label,
          expirationRange1Price: priceData.expirationRange1Price,
          expirationRange2Label: range2Label,
          expirationRange2Price: priceData.expirationRange2Price,
          dingReductionPrice: priceData.dingReductionPrice,
        },
      });

      console.log(`✅ Added price for ${buyer.firstName} ${buyer.lastName} - ${product.name}`);
    } catch (error) {
      console.error(`❌ Error adding price for ${priceData.buyerName} - ${priceData.productName}:`, error);
    }
  }

  console.log('\n✅ Finished adding buyer prices!');
}

async function getCategoryRange1Label(categoryId: string): Promise<string | undefined> {
  // Get range label from first product's buyer price in this category
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      subCategories: {
        include: {
          products: {
            include: {
              buyerPrices: {
                where: {
                  buyer: {
                    firstName: 'Northeast',
                    lastName: 'Medical Exchange',
                  },
                },
                take: 1,
              },
            },
            take: 1,
          },
        },
        take: 1,
      },
    },
  });

  return category?.subCategories?.[0]?.products?.[0]?.buyerPrices?.[0]?.expirationRange1Label;
}

async function getCategoryRange2Label(categoryId: string): Promise<string | undefined> {
  // Get range label from first product's buyer price in this category
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      subCategories: {
        include: {
          products: {
            include: {
              buyerPrices: {
                where: {
                  buyer: {
                    firstName: 'Northeast',
                    lastName: 'Medical Exchange',
                  },
                },
                take: 1,
              },
            },
            take: 1,
          },
        },
        take: 1,
      },
    },
  });

  return category?.subCategories?.[0]?.products?.[0]?.buyerPrices?.[0]?.expirationRange2Label;
}

addBuyerPrices()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });




