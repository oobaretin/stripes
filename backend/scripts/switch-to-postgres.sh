#!/bin/bash

# Script to switch Prisma schema from SQLite to PostgreSQL
# Usage: ./scripts/switch-to-postgres.sh

echo "🔄 Switching Prisma schema to PostgreSQL..."

# Backup original schema
cp prisma/schema.prisma prisma/schema.prisma.sqlite.backup

# Replace provider
sed -i '' 's/provider = "sqlite"/provider = "postgresql"/g' prisma/schema.prisma

echo "✅ Schema updated to PostgreSQL"
echo "📝 Original schema backed up to: prisma/schema.prisma.sqlite.backup"
echo ""
echo "Next steps:"
echo "1. Run: npm run db:generate"
echo "2. Set DATABASE_URL environment variable"
echo "3. Run: npm run db:push"
echo ""
echo "To switch back to SQLite, run: ./scripts/switch-to-sqlite.sh"

