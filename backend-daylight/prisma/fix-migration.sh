#!/bin/bash

# Script untuk memperbaiki migration error Partner cityId
# Run: bash prisma/fix-migration.sh

set -e  # Exit on error

echo "======================================"
echo "🔧 Partner CityId Migration Fix"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Mark failed migration as rolled back
echo -e "${YELLOW}Step 1/6:${NC} Marking failed migration as rolled back..."
psql -d daylight -c "UPDATE _prisma_migrations SET rolled_back_at = NOW(), finished_at = NOW() WHERE migration_name = '20251201133342_add_city_partner' AND rolled_back_at IS NULL;" || {
    echo -e "${RED}✗ Failed to mark migration as rolled back${NC}"
    exit 1
}
echo -e "${GREEN}✓ Migration marked as rolled back${NC}"
echo ""

# Step 2: Deploy the fixed migration
echo -e "${YELLOW}Step 2/6:${NC} Deploying fixed migration..."
pnpm prisma migrate deploy || {
    echo -e "${RED}✗ Failed to deploy migration${NC}"
    exit 1
}
echo -e "${GREEN}✓ Migration deployed successfully${NC}"
echo ""

# Step 3: Generate Prisma Client
echo -e "${YELLOW}Step 3/6:${NC} Generating Prisma Client..."
pnpm prisma generate || {
    echo -e "${RED}✗ Failed to generate Prisma Client${NC}"
    exit 1
}
echo -e "${GREEN}✓ Prisma Client generated${NC}"
echo ""

# Step 4: Migrate event cities (with updated mappings)
echo -e "${YELLOW}Step 4/6:${NC} Migrating event cities..."
pnpm ts-node prisma/migrate-city-data.ts || {
    echo -e "${RED}✗ Failed to migrate event cities${NC}"
    exit 1
}
echo -e "${GREEN}✓ Event cities migrated${NC}"
echo ""

# Step 5: Migrate partner cities
echo -e "${YELLOW}Step 5/6:${NC} Migrating partner cities..."
pnpm ts-node prisma/migrate-partner-cities-fix.ts || {
    echo -e "${RED}✗ Failed to migrate partner cities${NC}"
    exit 1
}
echo -e "${GREEN}✓ Partner cities migrated${NC}"
echo ""

# Step 6: Verification
echo -e "${YELLOW}Step 6/6:${NC} Running verification checks..."
echo ""

echo "📊 Events with cityId:"
psql -d daylight -t -c "SELECT COUNT(*) || '/' || (SELECT COUNT(*) FROM \"Event\") || ' events have cityId' FROM \"Event\" WHERE \"cityId\" IS NOT NULL;"

echo ""
echo "🤝 Partners with cityId:"
psql -d daylight -t -c "SELECT COUNT(*) || '/' || (SELECT COUNT(*) FROM \"Partner\") || ' partners have cityId' FROM \"Partner\" WHERE \"cityId\" IS NOT NULL;"

echo ""
echo "👤 Users with currentCityId:"
psql -d daylight -t -c "SELECT COUNT(*) || '/' || (SELECT COUNT(*) FROM \"User\") || ' users have currentCityId' FROM \"User\" WHERE \"currentCityId\" IS NOT NULL;"

echo ""
echo "======================================"
echo -e "${GREEN}✅ Migration fix completed!${NC}"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Check if all partners have cityId (should be 100%)"
echo "2. If yes, optionally run migration to make cityId NOT NULL"
echo "3. Restart backend service"
echo ""

# Check if any partners are missing cityId
MISSING=$(psql -d daylight -t -c "SELECT COUNT(*) FROM \"Partner\" WHERE \"cityId\" IS NULL;")
MISSING=$(echo $MISSING | xargs) # trim whitespace

if [ "$MISSING" != "0" ]; then
    echo -e "${YELLOW}⚠️  Warning: $MISSING partner(s) still missing cityId!${NC}"
    echo "Run this to see which partners:"
    echo "  psql -d daylight -c \"SELECT id, name, city FROM \\\"Partner\\\" WHERE \\\"cityId\\\" IS NULL;\""
    echo ""
else
    echo -e "${GREEN}✓ All partners have cityId!${NC}"
    echo ""
    echo "Optional: Deploy migration to make cityId NOT NULL"
    echo "  pnpm prisma migrate deploy"
    echo ""
fi
