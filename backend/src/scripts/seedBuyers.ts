import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface BuyerData {
  name: string;
  email?: string;
  paymentEmail?: string;
  phone?: string;
  address?: string;
  priceSheetUrl?: string;
  bestFormOfContact?: string;
  facebookLink?: string;
  removeLabels?: boolean;
  reachOutPriorToInvoicing?: boolean;
  paymentMethods?: string;
  isPreferred?: boolean;
  notes?: string;
}

const buyersData: BuyerData[] = [
  {
    name: 'Northeast Medical Exchange',
    paymentEmail: 'Purchasing@northeastmedicalexchange.com',
    phone: '603-303-8424 ext 1204',
    address: '2 Commerce Drive, Unit 105, Bedford, NH, 03110',
    priceSheetUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQJpkhoS4fyLt5tT560ddH_ukGnLEe0oz4SfCghLkWzqSf9hOOHBbfs0hZGzQvrhWCc1R0moWMCuxud/pubhtml',
    bestFormOfContact: 'Email (Phone Number to Introduce)',
    facebookLink: 'Contact Email Only - LSouza@NortheastMedical.com',
    removeLabels: false,
    reachOutPriorToInvoicing: false,
    paymentMethods: 'PayPal, Wire, ACH',
    isPreferred: true,
  },
  {
    name: 'Charles Harris',
    paymentEmail: 'Diabeticteststripguys@gmail.com',
    phone: '510-405-4569',
    address: '23 Maine Avenue, #94, Richmond, CA, 94804',
    // Not a URL; keep as instructions
    priceSheetUrl: 'Text "pricesheet" to 510-405-4569',
    bestFormOfContact: 'Text',
    facebookLink: 'Text Phone Number for Price Sheet or Support',
    removeLabels: true,
    reachOutPriorToInvoicing: false,
    paymentMethods: 'PayPal, Venmo, CashApp and Zelle',
    isPreferred: true,
    notes: 'The Diabetic Test Strip Guys',
  },
  {
    name: 'Chris Sampson',
    email: 'Chris@firstclassmedsupply.com',
    paymentEmail: 'BCDeacon31@gmail.com',
    phone: '267-982-4471',
    address: '2560 Frankford Avenue STORE, Philadelphia, PA, 19125',
    priceSheetUrl: 'https://docs.google.com/spreadsheets/d/1Y6J9TVs5n8CtmLr5CckOpjkJgQTCkRLS/edit#gid=732569512',
    bestFormOfContact: 'Email',
    facebookLink: 'https://www.facebook.com/chris.sampson.10',
    removeLabels: true,
    reachOutPriorToInvoicing: true,
    paymentMethods: 'Bank ACH, Wire, Cash App, PayPal and PayPal Friends & Family',
    isPreferred: false,
    notes: 'First Class Med Supply',
  },
  {
    name: 'PATH MEDICAL SUPPLY',
    paymentEmail: 'payments@pathmedicalsupply.com',
    phone: '405-965-8799',
    address: '299 W Camino Gardens Blvd, Suite 303, Boca Raton, FL, 33432',
    priceSheetUrl: 'https://docs.google.com/spreadsheets/d/1BLRws5kaYvV78_YK10JqjP8SxPXXwdLQm3sqkEGYar4/edit?usp=sharing',
    bestFormOfContact: 'Text',
    facebookLink: 'https://www.facebook.com/people/Sheldon-Clarke/pfbid0icQkwcESAN1gDtbnG9vKx2z4wNA8YYMB7AnxPDvwLCMoQdod4bXK6JDsihJaaR81l/',
    removeLabels: false,
    reachOutPriorToInvoicing: true,
    paymentMethods: 'PrePayment only with PayPal - On Arrival - ACH, Wire, Zelle, Check',
    isPreferred: true,
    notes: 'Formally known as Test Strip Bank',
  },
  {
    name: 'Ralphel Walton',
    paymentEmail: 'sales@prestigemedicalsupply.net',
    phone: '615-669-1243',
    address: '871 Seven Oaks Blvd, Suite 240, Smyrna, TN, 37167',
    priceSheetUrl: 'https://docs.google.com/spreadsheets/d/1uhuQ1ovm1-NIizrU2HP8AM8UcVW5qOFQbewWL8DwyEk/edit#gid=1760226217',
    bestFormOfContact: 'Email or Text',
    facebookLink: 'https://www.facebook.com/Ralphelwal',
    removeLabels: true,
    reachOutPriorToInvoicing: true,
    paymentMethods: 'Wire, Venmo, ACH, PayPal PrePayment, Cash App, Apple Pay and Zelle',
    isPreferred: false,
    notes: 'Buys short date boxes; buys expired boxes; buys damaged boxes',
  },
  {
    name: 'Max Med Distributors',
    paymentEmail: 'admin@maxmeddistributors.com',
    phone: '760-448-0224',
    address: '3210 Production Avenue, Suite D, Oceanside, CA, 92056',
    priceSheetUrl:
      'https://docs.google.com/spreadsheets/d/1g0eMRGH9fkRPJaXrApZwS9MbhEDX0TR9JWLnXllyGC4/edit?gid=73038629#gid=73038629',
    bestFormOfContact: 'Text or Email',
    facebookLink: 'https://www.facebook.com/erik.gabriel.1428?mibextid=LQQJ4d',
    removeLabels: true,
    reachOutPriorToInvoicing: true,
    paymentMethods: 'PayPal prepaid or Zelle, ACH, Wire, Venmo, Cash App or Check after delivery',
    isPreferred: false,
    notes: 'If you cannot remove labels, let us know; may send invoice.',
  },
];

function parseName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  if (parts.length === 2) {
    return { firstName: parts[0], lastName: parts[1] };
  }
  // For names with more than 2 parts, take first as first name, rest as last name
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

function parseAddress(address: string): {
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
} {
  if (!address) {
    return {};
  }

  // Try to parse address format: "Street, City, State, ZIP"
  const parts = address.split(',').map((p) => p.trim());
  
  if (parts.length >= 3) {
    const zipState = parts[parts.length - 1].split(/\s+/);
    const state = zipState[0];
    const zipCode = zipState[1] || '';
    const city = parts[parts.length - 2];
    const streetAddress = parts.slice(0, parts.length - 2).join(', ');

    return {
      address: streetAddress,
      city,
      state,
      zipCode,
    };
  }

  return { address };
}

async function seedBuyers() {
  console.log('🌱 Seeding buyers...');

  for (const buyerData of buyersData) {
    const { firstName, lastName } = parseName(buyerData.name);
    const addressParts = buyerData.address ? parseAddress(buyerData.address) : {};

    try {
      // Check if buyer already exists by phone or email
      const existingBuyer = await prisma.buyer.findFirst({
        where: {
          OR: [
            ...(buyerData.phone ? [{ phone: buyerData.phone }] : []),
            ...(buyerData.paymentEmail ? [{ paymentEmail: buyerData.paymentEmail }] : []),
          ],
        },
      });

      const buyer = existingBuyer
        ? await prisma.buyer.update({
            where: { id: existingBuyer.id },
            data: {
              firstName,
              lastName,
              email: buyerData.email || buyerData.paymentEmail || undefined,
              paymentEmail: buyerData.paymentEmail,
              phone: buyerData.phone || '',
              ...addressParts,
              priceSheetUrl: buyerData.priceSheetUrl,
              bestFormOfContact: buyerData.bestFormOfContact,
              facebookLink: buyerData.facebookLink,
              removeLabels: buyerData.removeLabels ?? false,
              reachOutPriorToInvoicing: buyerData.reachOutPriorToInvoicing ?? false,
              paymentMethods: buyerData.paymentMethods,
              isPreferred: buyerData.isPreferred ?? false,
              notes: buyerData.notes,
            },
          })
        : await prisma.buyer.create({
            data: {
              firstName,
              lastName,
              email: buyerData.email || buyerData.paymentEmail || undefined,
              paymentEmail: buyerData.paymentEmail,
              phone: buyerData.phone || '',
              ...addressParts,
              priceSheetUrl: buyerData.priceSheetUrl,
              bestFormOfContact: buyerData.bestFormOfContact,
              facebookLink: buyerData.facebookLink,
              removeLabels: buyerData.removeLabels ?? false,
              reachOutPriorToInvoicing: buyerData.reachOutPriorToInvoicing ?? false,
              paymentMethods: buyerData.paymentMethods,
              isPreferred: buyerData.isPreferred ?? false,
              notes: buyerData.notes,
            },
          });

      console.log(`✅ Seeded buyer: ${buyer.firstName} ${buyer.lastName}`);
    } catch (error) {
      console.error(`❌ Error seeding buyer ${buyerData.name}:`, error);
    }
  }

  console.log('✅ Finished seeding buyers!');
}

// Export for use in other scripts (CommonJS)
module.exports = { seedBuyers };

// Also export as ES module for TypeScript
export { seedBuyers };

// Run if called directly
if (require.main === module) {
  seedBuyers()
    .catch((error) => {
      console.error('Error seeding buyers:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

