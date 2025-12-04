import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapping dari string city lama ke slug city baru
// Key harus lowercase untuk case-insensitive matching
const cityMappings: Record<string, string> = {
  // Indonesia
  jakarta: 'jakarta',
  'jakarta selatan': 'jakarta',
  'jakarta pusat': 'jakarta',
  'jakarta barat': 'jakarta',
  'jakarta timur': 'jakarta',
  'jakarta utara': 'jakarta',
  bali: 'bali',
  bandung: 'bandung',
  surabaya: 'surabaya',
  yogyakarta: 'yogyakarta',
  jogja: 'yogyakarta',
  jogjakarta: 'yogyakarta',
  ubud: 'ubud',
  bogor: 'bogor',
  magelang: 'magelang',
  'labuan bajo': 'labuan-bajo',
  probolinggo: 'probolinggo',
  'kepulauan seribu': 'kepulauan-seribu',
  'pulau seribu': 'kepulauan-seribu',
  tangerang: 'jakarta', // Map Tangerang to Jakarta for now
  banten: 'jakarta', // Map Banten to Jakarta for now

  // Singapore
  singapore: 'singapore',
  singapura: 'singapore',

  // Japan
  tokyo: 'tokyo',
  osaka: 'osaka',
  kyoto: 'kyoto',

  // Malaysia
  'kuala lumpur': 'kuala-lumpur',
  kl: 'kuala-lumpur',

  // Thailand
  bangkok: 'bangkok',
};

interface MigrationStats {
  total: number;
  migrated: number;
  skipped: number;
  failed: number;
  unrecognized: string[];
}

export async function migrateCityData() {
  console. log('🔄 Starting city data migration...\n');
  console.log('This script will update cityId for Users and Events based on legacy city string.\n');

  // Step 1: Build City Lookup Map
  console.log('📚 Building city lookup map...');

  const cities = await prisma. city.findMany({
    select: { id: true, slug: true, name: true },
  });

  const cityLookup = new Map<string, string>(); // slug -> id
  cities.forEach((city) => {
    cityLookup.set(city. slug, city.id);
  });

  console.log(`  Found ${cities.length} cities in database\n`);

  if (cities.length === 0) {
    console.log('⚠️  No cities found!  Please run seed-locations.ts first.');
    return;
  }

  // Step 2: Migrate Event Data
  console.log('📅 Migrating Event data...');

  const eventStats: MigrationStats = {
    total: 0,
    migrated: 0,
    skipped: 0,
    failed: 0,
    unrecognized: [],
  };

  // Find events with null cityId
  const eventsToMigrate = await prisma.event. findMany({
    where: { cityId: null },
    select: { id: true, title: true, city: true },
  });

  eventStats.total = eventsToMigrate.length;
  console.log(`  Found ${eventsToMigrate.length} events to migrate\n`);

  for (const event of eventsToMigrate) {
    const legacyCity = event.city?.toLowerCase().trim();

    if (!legacyCity) {
      eventStats.skipped++;
      continue;
    }

    // Try to find matching city slug
    const citySlug = cityMappings[legacyCity];

    if (!citySlug) {
      eventStats.failed++;
      if (! eventStats.unrecognized.includes(event.city)) {
        eventStats.unrecognized.push(event.city);
      }
      console.log(`  ⚠️  Unrecognized city: "${event.city}" (Event: ${event.title. substring(0, 30)}...)`);
      continue;
    }

    const cityId = cityLookup.get(citySlug);

    if (!cityId) {
      eventStats.failed++;
      console.log(`  ❌ City slug "${citySlug}" not found in database (Event: ${event. title.substring(0, 30)}... )`);
      continue;
    }

    try {
      await prisma.event.update({
        where: { id: event. id },
        data: { cityId },
      });
      eventStats.migrated++;
    } catch (error) {
      eventStats.failed++;
      console.log(`  ❌ Failed to update event ${event.id}: ${error}`);
    }
  }

  console.log(`\n📊 Event Migration Results:`);
  console.log(`  ✅ Migrated: ${eventStats.migrated}`);
  console. log(`  ⏭️  Skipped (empty city): ${eventStats. skipped}`);
  console.log(`  ❌ Failed/Unrecognized: ${eventStats. failed}`);

  // Step 3: Migrate User Data
  console.log('\n👤 Migrating User data...');

  const userStats: MigrationStats = {
    total: 0,
    migrated: 0,
    skipped: 0,
    failed: 0,
    unrecognized: [],
  };

  // Check if User model has a legacy city field
  // Based on the schema, User only has currentCityId (no legacy city string)
  // So we'll set default city for users without currentCityId

  const usersWithoutCity = await prisma. user.findMany({
    where: { currentCityId: null },
    select: { id: true, email: true },
  });

  userStats.total = usersWithoutCity.length;
  console.log(`  Found ${usersWithoutCity.length} users without city assigned`);
  console.log(`  ℹ️  Users don't have legacy city field, skipping automatic migration. `);
  console.log(`  💡 Tip: Users can set their city through profile settings.\n`);

  // Step 4: Migrate Partner Data (if needed)
  console.log('🤝 Checking Partner data...');

  // Partners have city string field too
  const partnersToCheck = await prisma. partner.count();
  console.log(`  Found ${partnersToCheck} partners (migration not implemented yet)`);
  console.log(`  💡 Tip: Add cityId field to Partner model if needed.\n`);

  // Step 5: Summary Report
  console. log('================================');
  console.log('🎉 Migration completed!\n');

  console.log('📊 Summary:');
  console.log(`  Events: ${eventStats.migrated}/${eventStats.total} migrated`);
  console.log(`  Users: ${userStats.migrated}/${userStats.total} migrated`);

  if (eventStats.unrecognized.length > 0) {
    console.log('\n⚠️  Unrecognized city names (need manual mapping):');
    eventStats.unrecognized.forEach((city) => {
      console.log(`  - "${city}"`);
    });
    console.log('\n💡 Add these cities to cityMappings in migrate-city-data. ts');
  }

  // Verification
  console.log('\n🔍 Verification:');
  const eventsWithCity = await prisma.event. count({ where: { cityId: { not: null } } });
  const eventsTotal = await prisma. event.count();
  console.log(`  Events with cityId: ${eventsWithCity}/${eventsTotal}`);

  const usersWithCity = await prisma.user.count({ where: { currentCityId: { not: null } } });
  const usersTotal = await prisma.user.count();
  console.log(`  Users with currentCityId: ${usersWithCity}/${usersTotal}`);
}

// Dry run - shows what would be migrated without making changes
export async function dryRunMigration() {
  console.log('🔍 DRY RUN - No changes will be made\n');

  const cities = await prisma. city.findMany({
    select: { id: true, slug: true, name: true },
  });

  const cityLookup = new Map<string, string>();
  cities.forEach((city) => {
    cityLookup.set(city.slug, city. id);
  });

  // Check events
  const events = await prisma. event.findMany({
    where: { cityId: null },
    select: { id: true, title: true, city: true },
  });

  console.log(`📅 Events to migrate: ${events. length}`);

  const eventsByCity = new Map<string, number>();
  const unrecognized = new Set<string>();

  for (const event of events) {
    const legacyCity = event.city?.toLowerCase().trim();
    if (! legacyCity) continue;

    const citySlug = cityMappings[legacyCity];
    if (citySlug && cityLookup. has(citySlug)) {
      const count = eventsByCity. get(event.city) || 0;
      eventsByCity.set(event.city, count + 1);
    } else {
      unrecognized.add(event. city);
    }
  }

  console.log('\n✅ Will be migrated:');
  eventsByCity.forEach((count, city) => {
    console. log(`  ${city}: ${count} events`);
  });

  if (unrecognized.size > 0) {
    console.log('\n⚠️  Unrecognized (will be skipped):');
    unrecognized. forEach((city) => {
      console. log(`  - "${city}"`);
    });
  }
}

// Rollback - set cityId back to null
export async function rollbackMigration() {
  console.log('⏪ Rolling back city migration...\n');

  const eventResult = await prisma. event.updateMany({
    where: { cityId: { not: null } },
    data: { cityId: null },
  });

  console.log(`  Reset ${eventResult.count} events`);

  const userResult = await prisma.user.updateMany({
    where: { currentCityId: { not: null } },
    data: { currentCityId: null },
  });

  console.log(`  Reset ${userResult.count} users`);

  console.log('\n✅ Rollback completed!');
}

// Main execution
async function main() {
  const args = process.argv. slice(2);
  const command = args[0] || 'migrate';

  try {
    await prisma.$connect();
    console.log('🔌 Connected to database\n');

    switch (command) {
      case 'migrate':
        await migrateCityData();
        break;
      case 'dry-run':
        await dryRunMigration();
        break;
      case 'rollback':
        await rollbackMigration();
        break;
      default:
        console. log('Usage: ts-node migrate-city-data.ts [command]');
        console.log('Commands:');
        console.log('  migrate  - Run the migration (default)');
        console.log('  dry-run  - Show what would be migrated');
        console.log('  rollback - Undo the migration');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}