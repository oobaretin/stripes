# Striply

Local-first tools for managing a diabetic test strip resale business. All data (sellers, buyers, catalog, purchases, sales) is stored in **your browser** via `localStorage` — no server, login, or database required.

Public **seller landing page** at `/sell`. Business dashboard at `/dashboard`.

## Features

- **Dashboard** — counts, revenue, profit, recent activity
- **Sellers / suppliers** — people you buy from
- **Buyers** — resale partners with price sheets (seed list included)
- **Products** — Northeast-style SKU catalog (NDCs, expiration tiers, ding pricing, margin suggestions)
- **Purchases & sales** — line items tied to the catalog
- **Profile** — business contact info
- **SEO** — meta tags and JSON-LD on `/sell` and app routes

## Tech stack

- React 18 + TypeScript + Vite
- React Router, Tailwind CSS, Lucide icons
- `localStorage` via `frontend/src/lib/localData.ts`

## Prerequisites

- Node.js 18+

## Local development

```bash
git clone https://github.com/oobaretin/stripes.git
cd stripes
npm install
npm run dev
```

Open http://localhost:3000

Or from the frontend folder only:

```bash
cd frontend && npm install && npm run dev
```

## First visit

1. Open `/dashboard` — seed buyers and product catalog load automatically on first use
2. Use **Load default catalog** / **Add default buyers** on Products and Buyers if you reset storage
3. Add sellers, then log purchases and sales

Data stays in this browser until you clear site data or use another device.

## Project structure

```
stripes/
├── frontend/
│   ├── src/
│   │   ├── pages/          # Dashboard, Products, Purchases, …
│   │   ├── lib/            # localData, seeds, SEO
│   │   ├── config/         # App shell routes
│   │   └── components/
│   ├── public/
│   └── vercel.json         # Use when Vercel Root Directory = frontend
├── vercel.json             # Use when Vercel Root Directory = repo root
└── package.json
```

## Deploy on Vercel

**Recommended:** one frontend project, repo root as Root Directory.

| Setting | Value |
|---------|--------|
| Root Directory | `.` (repository root) |
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `frontend/dist` |
| Install Command | `npm install` |

The repo root `vercel.json` matches these settings.

**Alternative:** Root Directory = `frontend` — uses `frontend/vercel.json` instead.

### Optional environment variable

| Name | Example |
|------|---------|
| `VITE_PUBLIC_SITE_URL` | `https://your-app.vercel.app` |

Improves canonical and Open Graph URLs in production.

## Build

```bash
npm run build
```

Output: `frontend/dist/`

## License

Private — see repository owner.
