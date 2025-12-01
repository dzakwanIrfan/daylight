import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Data master untuk Countries
const countriesData = [
  {
    code: 'ID',
    name: 'Indonesia',
    currency: 'IDR',
    phoneCode: '+62',
  },
  {
    code: 'SG',
    name: 'Singapore',
    currency: 'SGD',
    phoneCode: '+65',
  },
  {
    code: 'JP',
    name: 'Japan',
    currency: 'JPY',
    phoneCode: '+81',
  },
  {
    code: 'MY',
    name: 'Malaysia',
    currency: 'MYR',
    phoneCode: '+60',
  },
  {
    code: 'TH',
    name: 'Thailand',
    currency: 'THB',
    phoneCode: '+66',
  },
];

// Data master untuk Cities (dengan referensi ke country code)
const citiesData = [
  // Indonesia
  {
    slug: 'jakarta',
    name: 'Jakarta',
    timezone: 'Asia/Jakarta',
    countryCode: 'ID',
    isActive: true,
  },
  {
    slug: 'bali',
    name: 'Bali',
    timezone: 'Asia/Makassar', // WITA (UTC+8)
    countryCode: 'ID',
    isActive: true,
  },
  {
    slug: 'bandung',
    name: 'Bandung',
    timezone: 'Asia/Jakarta',
    countryCode: 'ID',
    isActive: true,
  },
  {
    slug: 'surabaya',
    name: 'Surabaya',
    timezone: 'Asia/Jakarta',
    countryCode: 'ID',
    isActive: true,
  },
  {
    slug: 'yogyakarta',
    name: 'Yogyakarta',
    timezone: 'Asia/Jakarta',
    countryCode: 'ID',
    isActive: true,
  },
  {
    slug: 'ubud',
    name: 'Ubud',
    timezone: 'Asia/Makassar',
    countryCode: 'ID',
    isActive: true,
  },
  {
    slug: 'bogor',
    name: 'Bogor',
    timezone: 'Asia/Jakarta',
    countryCode: 'ID',
    isActive: true,
  },
  {
    slug: 'magelang',
    name: 'Magelang',
    timezone: 'Asia/Jakarta',
    countryCode: 'ID',
    isActive: true,
  },
  {
    slug: 'labuan-bajo',
    name: 'Labuan Bajo',
    timezone: 'Asia/Makassar',
    countryCode: 'ID',
    isActive: true,
  },
  {
    slug: 'probolinggo',
    name: 'Probolinggo',
    timezone: 'Asia/Jakarta',
    countryCode: 'ID',
    isActive: true,
  },
  {
    slug: 'kepulauan-seribu',
    name: 'Kepulauan Seribu',
    timezone: 'Asia/Jakarta',
    countryCode: 'ID',
    isActive: true,
  },
  // Singapore
  {
    slug: 'singapore',
    name: 'Singapore',
    timezone: 'Asia/Singapore',
    countryCode: 'SG',
    isActive: true,
  },
  // Japan
  {
    slug: 'tokyo',
    name: 'Tokyo',
    timezone: 'Asia/Tokyo',
    countryCode: 'JP',
    isActive: true,
  },
  {
    slug: 'osaka',
    name: 'Osaka',
    timezone: 'Asia/Tokyo',
    countryCode: 'JP',
    isActive: true,
  },
  {
    slug: 'kyoto',
    name: 'Kyoto',
    timezone: 'Asia/Tokyo',
    countryCode: 'JP',
    isActive: true,
  },
  // Malaysia
  {
    slug: 'kuala-lumpur',
    name: 'Kuala Lumpur',
    timezone: 'Asia/Kuala_Lumpur',
    countryCode: 'MY',
    isActive: true,
  },
  // Thailand
  {
    slug: 'bangkok',
    name: 'Bangkok',
    timezone: 'Asia/Bangkok',
    countryCode: 'TH',
    isActive: true,
  },
];

export async function seedLocations() {
  console.log('🌍 Seeding locations (Countries & Cities)...\n');

  // Track statistics
  let countriesCreated = 0;
  let countriesUpdated = 0;
  let citiesCreated = 0;
  let citiesUpdated = 0;

  // ========================================
  // Step 1: Seed Countries
  // ========================================
  console.log('📍 Seeding countries...');

  const countryMap = new Map<string, string>(); // code -> id

  for (const country of countriesData) {
    const existing = await prisma.country. findUnique({
      where: { code: country.code },
    });

    if (existing) {
      // Update existing country
      await prisma.country. update({
        where: { code: country.code },
        data: {
          name: country.name,
          currency: country.currency,
          phoneCode: country.phoneCode,
        },
      });
      countryMap.set(country.code, existing.id);
      countriesUpdated++;
      console.log(`  ✏️  Updated: ${country.name} (${country. code})`);
    } else {
      // Create new country
      const created = await prisma. country.create({
        data: country,
      });
      countryMap. set(country.code, created.id);
      countriesCreated++;
      console.log(`  ✅ Created: ${country. name} (${country.code})`);
    }
  }

  console.log(`\n📊 Countries: ${countriesCreated} created, ${countriesUpdated} updated\n`);

  // ========================================
  // Step 2: Seed Cities
  // ========================================
  console.log('🏙️  Seeding cities.. .');

  for (const city of citiesData) {
    const countryId = countryMap.get(city.countryCode);

    if (!countryId) {
      console.log(`  ⚠️  Skipped: ${city.name} - Country ${city.countryCode} not found`);
      continue;
    }

    const existing = await prisma.city.findUnique({
      where: { slug: city.slug },
    });

    if (existing) {
      // Update existing city
      await prisma. city.update({
        where: { slug: city.slug },
        data: {
          name: city.name,
          timezone: city.timezone,
          countryId: countryId,
          isActive: city. isActive,
        },
      });
      citiesUpdated++;
      console. log(`  ✏️  Updated: ${city.name} (${city.slug})`);
    } else {
      // Create new city
      await prisma.city. create({
        data: {
          slug: city.slug,
          name: city.name,
          timezone: city.timezone,
          countryId: countryId,
          isActive: city.isActive,
        },
      });
      citiesCreated++;
      console.log(`  ✅ Created: ${city. name} (${city.slug})`);
    }
  }

  console. log(`\n📊 Cities: ${citiesCreated} created, ${citiesUpdated} updated`);

  // ========================================
  // Step 3: Summary
  // ========================================
  console. log('\n🎉 Location seeding completed!');
  console.log('================================');

  const totalCountries = await prisma.country. count();
  const totalCities = await prisma.city. count();
  const activeCities = await prisma.city.count({ where: { isActive: true } });

  console.log(`📍 Total Countries: ${totalCountries}`);
  console.log(`🏙️  Total Cities: ${totalCities} (${activeCities} active)`);

  // Print summary by country
  console.log('\n📋 Cities by Country:');
  const countriesWithCities = await prisma.country.findMany({
    include: {
      cities: {
        select: { name: true, isActive: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  for (const country of countriesWithCities) {
    const activeCount = country.cities.filter((c) => c.isActive).length;
    console.log(`  ${country.name}: ${country.cities.length} cities (${activeCount} active)`);
    country.cities.forEach((city) => {
      const status = city.isActive ? '🟢' : '🔴';
      console. log(`    ${status} ${city.name}`);
    });
  }
}

// Fungsi untuk clear semua location data (untuk development)
export async function clearLocations() {
  console.log('🗑️  Clearing all location data...');

  // Clear cities first (karena ada foreign key ke country)
  const deletedCities = await prisma.city. deleteMany();
  console.log(`  Deleted ${deletedCities. count} cities`);

  const deletedCountries = await prisma.country.deleteMany();
  console.log(`  Deleted ${deletedCountries.count} countries`);

  console.log('✅ Location data cleared!');
}

// Main execution
async function main() {
  try {
    await prisma.$connect();
    console.log('🔌 Connected to database\n');

    // Uncomment line below to clear data before seeding
    // await clearLocations();

    await seedLocations();
  } catch (error) {
    console. error('❌ Seed failed:', error);
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