import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapping dari string city lama ke slug city baru
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

async function migratePartnerCities() {
  console.log('🔄 Starting Partner city data migration...\n');

  // Step 1: Build City Lookup Map
  console.log('📚 Building city lookup map...');

  const cities = await prisma.city.findMany({
    select: { id: true, slug: true, name: true },
  });

  const cityLookup = new Map<string, string>(); // slug -> id
  cities.forEach((city) => {
    cityLookup.set(city.slug, city.id);
  });

  console.log(`  Found ${cities.length} cities in database\n`);

  if (cities.length === 0) {
    console.log('⚠️  No cities found! Please run seed-locations.ts first.');
    return;
  }

  // Step 2: Migrate Partner Data
  console.log('🤝 Migrating Partner data...');

  const partnersToMigrate = await prisma.partner.findMany({
    where: { 
      OR: [
        { cityId: undefined },
        { cityId: '' }
      ]
    },
    select: { id: true, name: true, city: true, cityId: true },
  });

  console.log(`  Found ${partnersToMigrate.length} partners to migrate\n`);

  let migrated = 0;
  let failed = 0;
  const unrecognized: string[] = [];

  for (const partner of partnersToMigrate) {
    const legacyCity = partner.city?.toLowerCase().trim();

    if (!legacyCity) {
      console.log(`  ⚠️  Partner "${partner.name}" has no city, using Jakarta as default`);
      const jakartaId = cityLookup.get('jakarta');
      
      if (jakartaId) {
        try {
          await prisma.partner.update({
            where: { id: partner.id },
            data: { cityId: jakartaId },
          });
          migrated++;
          console.log(`  ✅ Set Jakarta as default for: ${partner.name}`);
        } catch (error) {
          failed++;
          console.log(`  ❌ Failed to update partner ${partner.id}: ${error}`);
        }
      }
      continue;
    }

    // Try to find matching city slug
    const citySlug = cityMappings[legacyCity];

    if (!citySlug) {
      failed++;
      if (!unrecognized.includes(partner.city)) {
        unrecognized.push(partner.city);
      }
      console.log(`  ⚠️  Unrecognized city: "${partner.city}" (Partner: ${partner.name})`);
      console.log(`      💡 Add mapping or manually set cityId for this partner`);
      continue;
    }

    const cityId = cityLookup.get(citySlug);

    if (!cityId) {
      failed++;
      console.log(`  ❌ City slug "${citySlug}" not found in database (Partner: ${partner.name})`);
      continue;
    }

    try {
      await prisma.partner.update({
        where: { id: partner.id },
        data: { cityId },
      });
      migrated++;
      console.log(`  ✅ Migrated: ${partner.name} -> ${citySlug}`);
    } catch (error) {
      failed++;
      console.log(`  ❌ Failed to update partner ${partner.id}: ${error}`);
    }
  }

  console.log(`\n📊 Partner Migration Results:`);
  console.log(`  ✅ Migrated: ${migrated}`);
  console.log(`  ❌ Failed/Unrecognized: ${failed}`);

  if (unrecognized.length > 0) {
    console.log('\n⚠️  Unrecognized city names:');
    unrecognized.forEach((city) => {
      console.log(`  - "${city}"`);
    });
  }

  // Verification
  console.log('\n🔍 Verification:');
  const partnersWithCity = await prisma.partner.count({ where: { cityId: { not: undefined } } });
  const partnersTotal = await prisma.partner.count();
  console.log(`  Partners with cityId: ${partnersWithCity}/${partnersTotal}`);

  if (partnersWithCity < partnersTotal) {
    console.log('\n⚠️  Some partners still need cityId assignment!');
    const missingPartners = await prisma.partner.findMany({
      where: { 
        OR: [
          { cityId: undefined },
          { cityId: '' }
        ]
      },
      select: { id: true, name: true, city: true },
    });

    console.log('\n📋 Partners without cityId:');
    missingPartners.forEach(p => {
      console.log(`  - ${p.name} (city: "${p.city || 'N/A'}")`);
    });
  }
}

async function main() {
  try {
    await prisma.$connect();
    console.log('🔌 Connected to database\n');

    await migratePartnerCities();

    console.log('\n================================');
    console.log('🎉 Partner migration completed!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

if (require.main === module) {
  main();
}
