/**
 * Writes sitemap.xml and robots.txt into dist/ after `vite build`.
 * Set VITE_PUBLIC_SITE_URL in Vercel (or .env) when your URL changes.
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '../dist');

const DEFAULT_SITE_URL = 'https://stripes-backend-seven.vercel.app';

function siteUrl() {
  const raw = process.env.VITE_PUBLIC_SITE_URL?.trim();
  return (raw || DEFAULT_SITE_URL).replace(/\/$/, '');
}

/** Public routes worth indexing (app dashboard routes are local tools, not listed). */
const PUBLIC_PATHS = [{ path: '/sell', changefreq: 'monthly', priority: '1.0' }];

const base = siteUrl();
const lastmod = new Date().toISOString().slice(0, 10);

const urlEntries = PUBLIC_PATHS.map(
  ({ path, changefreq, priority }) => `  <url>
    <loc>${base}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
).join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;

const robots = `# Generated at build time — see frontend/scripts/generate-sitemap.mjs
User-agent: *
Allow: /sell
Allow: /

# Local business dashboard (no login, but not meant for search indexing)
Disallow: /dashboard
Disallow: /customers
Disallow: /buyers
Disallow: /products
Disallow: /purchases
Disallow: /sales
Disallow: /profile
Disallow: /login
Disallow: /register

Sitemap: ${base}/sitemap.xml
`;

writeFileSync(resolve(distDir, 'sitemap.xml'), sitemap, 'utf8');
writeFileSync(resolve(distDir, 'robots.txt'), robots, 'utf8');

console.log(`[sitemap] Wrote ${base}/sitemap.xml (${PUBLIC_PATHS.length} URL(s))`);
