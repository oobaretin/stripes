import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateCharlesHarrisPriceSheet() {
  console.log('🔄 Updating Charles Harris price sheet URL...\n');

  const buyer = await prisma.buyer.findFirst({
    where: {
      OR: [
        { firstName: { contains: 'Charles' } },
        { lastName: { contains: 'Harris' } },
      ],
    },
  });

  if (!buyer) {
    console.log('❌ Charles Harris buyer not found.');
    return;
  }

  const updatedBuyer = await prisma.buyer.update({
    where: { id: buyer.id },
    data: {
      priceSheetUrl: 'https://docs.google.com/spreadsheets/d/1Qs80kY-H8I4taOq1XXONEWTvK5x5u7iKYk1LzWiGfNE/edit?gid=0#gid=0',
    },
  });

  console.log(`✅ Updated ${updatedBuyer.firstName} ${updatedBuyer.lastName} price sheet URL`);
  console.log(`   URL: ${updatedBuyer.priceSheetUrl}`);
}

updateCharlesHarrisPriceSheet()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });




