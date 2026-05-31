#!/bin/bash

# Script to switch Prisma schema from PostgreSQL to SQLite
# Usage: ./scripts/switch-to-sqlite.sh

echo "🔄 Switching Prisma schema to SQLite..."

# Replace provider
sed -i '' 's/provider = "postgresql"/provider = "sqlite"/g' prisma/schema.prisma

echo "✅ Schema updated to SQLite"
echo ""
echo "Next steps:"
echo "1. Run: npm run db:generate"
echo "2. Set DATABASE_URL to: file:./dev.db"
echo "3. Run: npm run db:push"

