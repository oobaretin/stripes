# Migrating from SQLite to PostgreSQL

This guide helps you migrate your Striply app from SQLite (development) to PostgreSQL (production on Railway).

## Step 1: Update Prisma Schema

Change the `provider` in `backend/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

## Step 2: Update Product Model (if needed)

PostgreSQL handles auto-incrementing IDs differently. The current schema uses `@id @default(cuid())` which works with both, but if you want auto-incrementing integers:

```prisma
model Product {
  id            String   @id @default(cuid())  // Keep this, or change to:
  // id          Int      @id @default(autoincrement())  // Alternative
  // ... rest of fields
}
```

**Note**: Your current schema already uses `cuid()` which works with PostgreSQL, so you might not need to change anything!

## Step 3: Create Migration

After updating the schema:

```bash
cd backend
npm run db:generate
npx prisma migrate dev --name init_postgres
```

## Step 4: Update Environment Variables

For Railway, use the PostgreSQL connection string format:
```
DATABASE_URL=postgresql://user:password@host:port/database?schema=public
```

Railway provides this automatically in their PostgreSQL service variables.

## Step 5: Push Schema to Production

Once deployed to Railway:

```bash
# Via Railway CLI
railway run npx prisma db push

# Or via Railway dashboard
# Add a one-off command: npx prisma db push
```

## Differences Between SQLite and PostgreSQL

### ✅ What Works the Same
- Most Prisma queries
- Relationships
- Transactions
- Migrations

### ⚠️ What's Different
- **Auto-increment IDs**: SQLite uses `INTEGER PRIMARY KEY`, PostgreSQL uses `SERIAL` or `BIGSERIAL`
- **String IDs**: Your schema uses `cuid()` which works identically
- **Case sensitivity**: PostgreSQL is case-sensitive for identifiers (use quotes if needed)
- **Date/Time**: Both support DateTime, but PostgreSQL has more precision

### 🔄 Migration Strategy

**Option 1: Fresh Start (Recommended for new deployments)**
- Deploy to Railway with PostgreSQL
- Run seed scripts to populate data
- No data migration needed

**Option 2: Migrate Existing Data**
If you have important data in SQLite:

1. Export data from SQLite:
   ```bash
   sqlite3 backend/dev.db .dump > backup.sql
   ```

2. Convert SQLite dump to PostgreSQL format (manual or use a tool)

3. Import to PostgreSQL:
   ```bash
   psql $DATABASE_URL < converted_backup.sql
   ```

**For Striply**: Since you're just starting, Option 1 (fresh start) is recommended. Just run your seed scripts on Railway.

## Testing Locally with PostgreSQL

You can test PostgreSQL locally before deploying:

1. **Install PostgreSQL locally** or use Docker:
   ```bash
   docker run --name postgres-test -e POSTGRES_PASSWORD=test -p 5432:5432 -d postgres
   ```

2. **Update .env**:
   ```
   DATABASE_URL="postgresql://postgres:test@localhost:5432/striply?schema=public"
   ```

3. **Push schema**:
   ```bash
   npm run db:push
   ```

4. **Test your app**:
   ```bash
   npm run dev
   ```

## Production Checklist

- [ ] Schema updated to `postgresql`
- [ ] `DATABASE_URL` set in Railway
- [ ] Prisma client regenerated (`npm run db:generate`)
- [ ] Schema pushed to Railway database (`railway run npx prisma db push`)
- [ ] Seed scripts run (if needed)
- [ ] Test API endpoints
- [ ] Verify CORS settings for frontend domain

