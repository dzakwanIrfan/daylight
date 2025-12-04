import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Migration script to populate cityId for existing partners
 * based on their legacy city string field
 */
async function migratePartnerCities() {
  console.log('🚀 Starting partner city migration...\n');

  try {
    // 1. Get all cities from database
    const cities = await prisma.city.findMany();
    console.log(`✅ Found ${cities.length} cities in database\n`);

    // Create a map for quick lookup (case-insensitive)
    const cityMap = new Map(
      cities.map(city => [city.name.toLowerCase(), city. id])
    );

    // 2. Get all partners without cityId
    const partners = await prisma.partner.findMany({
      where: {
        OR: [
          { cityId: undefined },
          { cityId: '' }
        ]
      }
    });

    console.log(`📊 Found ${partners.length} partners to migrate\n`);

    if (partners.length === 0) {
      console.log('✅ No partners to migrate.  All done!');
      return;
    }

    // 3.  Migrate each partner
    let successCount = 0;
    let failCount = 0;
    const failedPartners: any[] = [];

    for (const partner of partners) {
      const cityName = partner.city. toLowerCase(). trim();
      const cityId = cityMap.get(cityName);

      if (cityId) {
        try {
          await prisma.partner.update({
            where: { id: partner. id },
            data: { cityId }
          });
          console.log(`✅ Migrated: ${partner.name} -> ${partner.city} (${cityId})`);
          successCount++;
        } catch (error) {
          console.error(`❌ Failed to migrate ${partner.name}:`, error);
          failCount++;
          failedPartners.push({ name: partner.name, city: partner.city, error: error.message });
        }
      } else {
        console.warn(`⚠️  No matching city found for: ${partner.name} (${partner.city})`);
        failCount++;
        failedPartners.push({ name: partner.name, city: partner.city, error: 'No matching city' });
      }
    }

    // 4. Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Successfully migrated: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    
    if (failedPartners. length > 0) {
      console.log('\n❌ Failed Partners:');
      failedPartners.forEach(p => {
        console.log(`   - ${p.name} (${p.city}): ${p.error}`);
      });
    }

  } catch (error) {
    console. error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migratePartnerCities()
  .then(() => {
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console. error('\n❌ Migration failed:', error);
    process.exit(1);
  });