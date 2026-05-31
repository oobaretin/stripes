import { SEED_CATEGORIES } from './seedCategoriesData';
import { SEED_BUYERS } from './seedBuyersData';

export const SK = {
  customers: 'striply_customers',
  buyers: 'striply_buyers',
  purchases: 'striply_purchases',
  sales: 'striply_sales',
  categories: 'striply_categories',
  profile: 'striply_profile',
} as const;

const DEMO_PRODUCTS = [
  { id: 'p-demo-1', name: 'Demo glucose test strips', ndcCode: '00000-0000-00', isActive: true },
];

export function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJson(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function clone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

export function flattenProductsFromCategories(categories: any[]): any[] {
  const out: any[] = [];
  for (const c of categories || []) {
    for (const sc of c.subCategories || []) {
      for (const p of sc.products || []) {
        out.push({
          id: p.id,
          name: p.name,
          ndcCode: p.ndcCode ?? '',
          brand: p.brand,
          isActive: p.isActive !== false,
        });
      }
    }
  }
  return out;
}

/** First visit: persist full category tree with buyer prices. */
export function loadCategoriesOrSeed(): any[] {
  const raw = localStorage.getItem(SK.categories);
  if (raw === null) {
    saveJson(SK.categories, SEED_CATEGORIES);
    return clone(SEED_CATEGORIES);
  }
  try {
    return JSON.parse(raw) as any[];
  } catch {
    saveJson(SK.categories, SEED_CATEGORIES);
    return clone(SEED_CATEGORIES);
  }
}

export function getProductCatalog(): any[] {
  const flat = flattenProductsFromCategories(loadCategoriesOrSeed());
  if (flat.length > 0) return flat;
  return loadJson('striply_product_catalog', DEMO_PRODUCTS);
}

/** First visit: persist seed buyers. If key exists (even `[]`), use stored value. */
export function loadBuyersOrSeed(): any[] {
  const raw = localStorage.getItem(SK.buyers);
  if (raw === null) {
    saveJson(SK.buyers, SEED_BUYERS);
    return SEED_BUYERS.map((b) => ({ ...b }));
  }
  try {
    return JSON.parse(raw) as any[];
  } catch {
    saveJson(SK.buyers, SEED_BUYERS);
    return SEED_BUYERS.map((b) => ({ ...b }));
  }
}
