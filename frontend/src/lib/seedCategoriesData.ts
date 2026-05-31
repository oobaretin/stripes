/**
 * Builds the local-storage category tree from `northeastCatalogRaw.ts`
 * Northeast Medical Exchange SKU list for the in-browser product catalog.
 */
import { NORTHEAST_CATALOG } from './northeastCatalogRaw';
import { SEED_BUYERS } from './seedBuyersData';

function slug(parts: string[]) {
  return parts
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildBuyerPricesForProduct(
  prodId: string,
  cat: { expirationRange1Label?: string; expirationRange2Label?: string },
  prod: {
    expirationRange1Price?: number;
    expirationRange2Price?: number;
    dingReductionPrice?: number;
    specialNotes?: string;
  }
) {
  const label1 = cat.expirationRange1Label || 'Range 1';
  const label2 = cat.expirationRange2Label || 'Range 2';
  const neR1 = prod.expirationRange1Price ?? 0;
  const neR2 = prod.expirationRange2Price;
  const neDing = prod.dingReductionPrice;

  return SEED_BUYERS.map((buyer, bi) => {
    const isNE = buyer.id === 'buyer-northeast-medical-exchange';
    const mult = isNE ? 1 : 0.9 + (bi % 10) * 0.01;
    const r1Raw = isNE ? neR1 : neR1 * mult;
    const r1 = Math.max(0.01, Math.round(r1Raw * 100) / 100);
    let r2: number | null = null;
    if (neR2 !== undefined) {
      const r2Raw = isNE ? neR2 : neR2 * mult;
      r2 = Math.max(0.01, Math.round(r2Raw * 100) / 100);
    }
    let ding: number | null = null;
    if (neDing !== undefined) {
      const dRaw = isNE ? neDing : neDing * mult;
      ding = Math.round(dRaw * 100) / 100;
    }

    return {
      id: `bp-${prodId}-${buyer.id}`,
      buyer: {
        firstName: buyer.firstName,
        lastName: buyer.lastName,
        isPreferred: buyer.isPreferred,
      },
      expirationRange1Price: r1,
      expirationRange1Label: label1,
      expirationRange2Price: r2,
      expirationRange2Label: label2,
      dingReductionPrice: ding,
      damagedPrice: null as number | null,
    };
  });
}

export function buildSeedCategories(): any[] {
  let catOrder = 0;
  return NORTHEAST_CATALOG.map((cat) => {
    const catId = `cat-${slug([cat.name])}`;
    catOrder += 1;
    return {
      id: catId,
      name: cat.name,
      description: cat.description ?? '',
      order: catOrder,
      subCategories: cat.subCategories.map((sub, si) => {
        const subId = `sub-${slug([cat.name, sub.name])}`;
        return {
          id: subId,
          name: sub.name,
          description: '',
          categoryId: catId,
          order: si + 1,
          products: sub.products.map((prod) => {
            const ndcPart = (prod.ndcCode || 'x').replace(/[^a-z0-9]+/gi, '');
            const prodId = `prod-${slug([cat.name, sub.name, prod.name])}-${ndcPart.slice(0, 16)}`;
            const brand = prod.name.split(/\s+/)[0];
            return {
              id: prodId,
              name: prod.name,
              brand,
              ndcCode: prod.ndcCode ?? '',
              imageUrl: null as string | null,
              isActive: true,
              specialNotes: prod.specialNotes,
              buyerPrices: buildBuyerPricesForProduct(prodId, cat, prod),
            };
          }),
        };
      }),
    };
  });
}

export const SEED_CATEGORIES = buildSeedCategories();
