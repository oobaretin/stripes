/** Optional: set `VITE_PUBLIC_SITE_URL=https://yoursite.com` for canonical + Open Graph URLs in production. */
function siteOrigin(): string {
  const raw = import.meta.env.VITE_PUBLIC_SITE_URL;
  if (typeof raw === 'string' && raw.trim()) return raw.replace(/\/$/, '');
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin;
  return '';
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  const selector = attr === 'name' ? `meta[name="${key}"]` : `meta[property="${key}"]`;
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

const ROUTE_META: Record<
  string,
  { title: string; description: string }
> = {
  '/dashboard': {
    title: 'Dashboard — Striply',
    description:
      'Business snapshot for diabetic test strip resale: counts, revenue, recent purchases and sales. Data stays in your browser.',
  },
  '/customers': {
    title: 'Sellers & suppliers — Striply',
    description: 'Track suppliers you buy test strips from. Manage contact details and notes locally in Striply.',
  },
  '/buyers': {
    title: 'Buyers — Striply',
    description:
      'Manage resale buyers, price sheets, preferred flags, and payment methods for your test strip business.',
  },
  '/products': {
    title: 'Products & pricing — Striply',
    description:
      'SKU catalog with NDCs, per-buyer expiration tiers, ding pricing, and profit-margin buy suggestions for diabetic supplies.',
  },
  '/purchases': {
    title: 'Purchases — Striply',
    description: 'Record purchases from sellers with line items, products, and totals. Stored locally in Striply.',
  },
  '/sales': {
    title: 'Sales — Striply',
    description: 'Log sales to buyers with line items. Keeps history aligned with your catalog and purchases.',
  },
  '/profile': {
    title: 'Business profile — Striply',
    description: 'Edit your Striply business profile and contact information saved in this browser.',
  },
};

const DEFAULT_APP_META = {
  title: 'Striply — Diabetic test strip business tools',
  description:
    'Striply helps manage sellers, buyers, product pricing, purchases, and sales for a diabetic test strip resale business—all in your browser.',
};

export function applyRouteSeo(pathname: string) {
  const entry = ROUTE_META[pathname] ?? DEFAULT_APP_META;
  document.title = entry.title;
  upsertMeta('name', 'description', entry.description);
  upsertMeta('property', 'og:title', entry.title);
  upsertMeta('property', 'og:description', entry.description);
  upsertMeta('property', 'og:type', 'website');
  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', entry.title);
  upsertMeta('name', 'twitter:description', entry.description);

  const base = siteOrigin();
  if (base) {
    const url = `${base}${pathname || '/'}`;
    upsertMeta('property', 'og:url', url);
    upsertLink('canonical', url);
    upsertMeta('property', 'og:image', `${base}/logo.png`);
    upsertMeta('name', 'twitter:image', `${base}/logo.png`);
  }
}

export function applySellPageSeo() {
  const title = 'Sell diabetic test strips — Get a quote | Striply';
  const description =
    'Sell extra diabetic supplies safely: request a quote for test strips and related products. Clear steps, prepaid shipping, and fast payment after verification.';
  document.title = title;
  upsertMeta('name', 'description', description);
  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', description);
  upsertMeta('property', 'og:type', 'website');
  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', title);
  upsertMeta('name', 'twitter:description', description);
  const base = siteOrigin();
  if (base) {
    const url = `${base}/sell`;
    upsertMeta('property', 'og:url', url);
    upsertLink('canonical', url);
    upsertMeta('property', 'og:image', `${base}/logo.png`);
  }
}
