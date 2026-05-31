import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateRalphelAddress() {
  try {
    const buyer = await prisma.buyer.findFirst({
      where: {
        OR: [
          { firstName: 'Ralphel', lastName: 'Walton' },
          { phone: '615-669-1243' },
        ],
      },
    });

    if (buyer) {
      const updated = await prisma.buyer.update({
        where: { id: buyer.id },
        data: {
          address: '871 Seven Oaks Blvd',
          city: 'Smyrna',
          state: 'TN',
          zipCode: '37167',
        },
      });

      console.log('✅ Updated Ralphel Walton address:');
      console.log(`   📍 ${updated.address}, ${updated.city}, ${updated.state} ${updated.zipCode}`);
    } else {
      console.log('❌ Buyer not found');
    }
  } catch (error) {
    console.error('❌ Error updating address:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateRalphelAddress();




