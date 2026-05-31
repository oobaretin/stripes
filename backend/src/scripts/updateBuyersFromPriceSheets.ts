import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Updated buyer information based on price sheets and original data
const updatedBuyersData = [
  {
    name: 'Northeast Medical Exchange',
    firstName: 'Northeast',
    lastName: 'Medical Exchange',
    email: 'LSouza@NortheastMedical.com',
    paymentEmail: 'Purchasing@northeastmedicalexchange.com',
    phone: '603-303-8424',
    address: '2 Commerce Drive, Unit 105',
    city: 'Bedford',
    state: 'NH',
    zipCode: '03110',
    country: 'USA',
    priceSheetUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQJpkhoS4fyLt5tT560ddH_ukGnLEe0oz4SfCghLkWzqSf9hOOHBbfs0hZGzQvrhWCc1R0moWMCuxud/pubhtml',
    bestFormOfContact: 'Email (Phone Number to Introduce)',
    facebookLink: 'Contract Email Only - LSouza@NortheastMedical.com',
    removeLabels: false,
    reachOutPriorToInvoicing: false,
    paymentMethods: 'PayPal, Wire, ACH',
    isPreferred: false,
  },
  {
    name: 'Charles Harris',
    firstName: 'Charles',
    lastName: 'Harris',
    email: 'Diabeticteststripguys@gmail.com',
    paymentEmail: 'Diabeticteststripguys@gmail.com',
    phone: '510-405-4569',
    address: '23 Maine Avenue, #94',
    city: 'Richmond',
    state: 'CA',
    zipCode: '94804',
    country: 'USA',
    priceSheetUrl: 'Text "pricesheet" to 510-405-4569',
    bestFormOfContact: 'Text',
    facebookLink: 'Text Phone Number for Price Sheet or Support',
    removeLabels: true,
    reachOutPriorToInvoicing: false,
    paymentMethods: 'PayPal, Venmo, CashApp and Zelle',
    isPreferred: true,
  },
  {
    name: 'Chris Sampson',
    firstName: 'Chris',
    lastName: 'Sampson',
    email: 'Chris@firstclassmedsupply.com',
    paymentEmail: 'BCDeacon31@gmail.com',
    phone: '267-982-4471',
    address: '2560 Frankford Avenue',
    city: 'Philadelphia',
    state: 'PA',
    zipCode: '19125',
    country: 'USA',
    priceSheetUrl: 'https://docs.google.com/spreadsheets/d/1Y6J9TVs5n8CtmLr5CckOpjkJgQTCkRLS/edit#gid=732569512',
    bestFormOfContact: 'Email',
    facebookLink: 'https://www.facebook.com/chris.sampson.10',
    removeLabels: true,
    reachOutPriorToInvoicing: true,
    paymentMethods: 'Bank ACH, Wire, Cash App, PayPal and PayPal Friends & Family',
    isPreferred: false,
  },
  {
    name: 'PATH MEDICAL SUPPLY',
    firstName: 'PATH',
    lastName: 'MEDICAL SUPPLY',
    email: 'payments@pathmedicalsupply.com',
    paymentEmail: 'payments@pathmedicalsupply.com',
    phone: '405-965-8799',
    address: '299 W Camino Gardens Blvd, Suite 303',
    city: 'Boca Raton',
    state: 'FL',
    zipCode: '33432',
    country: 'USA',
    priceSheetUrl: 'https://docs.google.com/spreadsheets/d/1BLRws5kaYvV78_YK10JqjP8SxPXXwdLQm3sqkEGYar4/edit?usp=sharing',
    bestFormOfContact: 'Text',
    facebookLink: 'https://www.facebook.com/people/Sheldon-Clarke/pfbid0icQkwcESAN1gDtbnG9vKx2z4wNA8YYMB7AnxPDvwLCMoQdod4bXK6JDsihJaaR81l/',
    removeLabels: false,
    reachOutPriorToInvoicing: true,
    paymentMethods: 'PrePayment only with PayPal - On Arrival - ACH, Wire, Zelle, Check',
    isPreferred: true,
  },
  {
    name: 'Ralphel Walton',
    firstName: 'Ralphel',
    lastName: 'Walton',
    email: 'sales@prestigemedicalsupply.net',
    paymentEmail: 'sales@prestigemedicalsupply.net',
    phone: '615-669-1243',
    address: '871 Seven Oaks Blvd, Suite 240',
    city: 'Smyrna',
    state: 'TN',
    zipCode: '37167',
    country: 'USA',
    priceSheetUrl: 'https://docs.google.com/spreadsheets/d/1uhuQ1ovm1-NIizrU2HP8AM8UcVW5qOFQbewWL8DwyEk/edit#gid=1760226217',
    bestFormOfContact: 'Email or Text',
    facebookLink: 'https://www.facebook.com/Ralphelwal',
    removeLabels: true,
    reachOutPriorToInvoicing: true,
    paymentMethods: 'Wire, Venmo, ACH, PayPal PrePayment, Cash App',
    isPreferred: false,
  },
];

async function updateBuyers() {
  console.log('🔄 Updating buyers with complete information...');

  for (const buyerData of updatedBuyersData) {
    try {
      // Find buyer by name or phone
      const existingBuyer = await prisma.buyer.findFirst({
        where: {
          OR: [
            { phone: buyerData.phone },
            { paymentEmail: buyerData.paymentEmail },
            { firstName: buyerData.firstName, lastName: buyerData.lastName },
          ],
        },
      });

      if (existingBuyer) {
        const updated = await prisma.buyer.update({
          where: { id: existingBuyer.id },
          data: {
            firstName: buyerData.firstName,
            lastName: buyerData.lastName,
            email: buyerData.email || undefined,
            paymentEmail: buyerData.paymentEmail,
            phone: buyerData.phone,
            address: buyerData.address,
            city: buyerData.city || undefined,
            state: buyerData.state || undefined,
            zipCode: buyerData.zipCode || undefined,
            country: buyerData.country,
            priceSheetUrl: buyerData.priceSheetUrl,
            bestFormOfContact: buyerData.bestFormOfContact,
            facebookLink: buyerData.facebookLink,
            removeLabels: buyerData.removeLabels,
            reachOutPriorToInvoicing: buyerData.reachOutPriorToInvoicing,
            paymentMethods: buyerData.paymentMethods,
            isPreferred: buyerData.isPreferred,
          },
        });

        console.log(`✅ Updated buyer: ${updated.firstName} ${updated.lastName}`);
        console.log(`   📧 Email: ${updated.email || 'N/A'}`);
        console.log(`   💰 Payment Email: ${updated.paymentEmail || 'N/A'}`);
        console.log(`   📞 Phone: ${updated.phone}`);
        console.log(`   📍 Address: ${updated.address}, ${updated.city}, ${updated.state} ${updated.zipCode}`);
      } else {
        // Create if doesn't exist
        const created = await prisma.buyer.create({
          data: {
            firstName: buyerData.firstName,
            lastName: buyerData.lastName,
            email: buyerData.email || undefined,
            paymentEmail: buyerData.paymentEmail,
            phone: buyerData.phone,
            address: buyerData.address,
            city: buyerData.city || undefined,
            state: buyerData.state || undefined,
            zipCode: buyerData.zipCode || undefined,
            country: buyerData.country,
            priceSheetUrl: buyerData.priceSheetUrl,
            bestFormOfContact: buyerData.bestFormOfContact,
            facebookLink: buyerData.facebookLink,
            removeLabels: buyerData.removeLabels,
            reachOutPriorToInvoicing: buyerData.reachOutPriorToInvoicing,
            paymentMethods: buyerData.paymentMethods,
            isPreferred: buyerData.isPreferred,
          },
        });

        console.log(`✅ Created buyer: ${created.firstName} ${created.lastName}`);
      }
    } catch (error) {
      console.error(`❌ Error updating buyer ${buyerData.name}:`, error);
    }
  }

  console.log('✅ Finished updating buyers!');
}

updateBuyers()
  .catch((error) => {
    console.error('Error updating buyers:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

