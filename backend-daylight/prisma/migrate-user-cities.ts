import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Migration script to set default city (Jakarta) for all existing users
 * Safe to run on production - only updates users with null currentCityId
 */
async function migrateUserCities() {
  console.log('🚀 Starting user city migration...\n');

  try {
    // 1. Get Jakarta city ID
    const jakarta = await prisma.city.findUnique({
      where: { slug: 'jakarta' },
    });

    if (!jakarta) {
      console.error('❌ Jakarta city not found in database!');
      console.log('💡 Please run: ts-node prisma/seed-locations.ts first');
      process.exit(1);
    }

    console.log(`✅ Found Jakarta city: ${jakarta.name} (${jakarta.id})\n`);

    // 2. Count users without city
    const usersWithoutCity = await prisma.user.count({
      where: {
        currentCityId: null,
      },
    });

    console.log(`📊 Found ${usersWithoutCity} users without city assigned\n`);

    if (usersWithoutCity === 0) {
      console.log('✅ All users already have a city assigned. Nothing to migrate!');
      return;
    }

    // 3. Show sample of users to be migrated
    const sampleUsers = await prisma.user.findMany({
      where: { currentCityId: null },
      select: { id: true, email: true, firstName: true, lastName: true },
      take: 5,
    });

    console.log('👥 Sample users to be migrated:');
    sampleUsers.forEach((user, index) => {
      const name = user.firstName || user.lastName 
        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
        : 'No name';
      console.log(`   ${index + 1}. ${user.email} (${name})`);
    });

    if (usersWithoutCity > 5) {
      console.log(`   ... and ${usersWithoutCity - 5} more users\n`);
    } else {
      console.log('');
    }

    // 4. Perform migration
    console.log('🔄 Migrating users to Jakarta...');

    const result = await prisma.user.updateMany({
      where: {
        currentCityId: null,
      },
      data: {
        currentCityId: jakarta.id,
      },
    });

    console.log(`✅ Successfully migrated ${result.count} users to Jakarta\n`);

    // 5. Verification
    console.log('🔍 Verification:');
    const totalUsers = await prisma.user.count();
    const usersWithCity = await prisma.user.count({
      where: { currentCityId: { not: null } },
    });
    const usersInJakarta = await prisma.user.count({
      where: { currentCityId: jakarta.id },
    });

    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Users with city: ${usersWithCity}/${totalUsers}`);
    console.log(`   Users in Jakarta: ${usersInJakarta}`);

    // 6. Summary by city
    console.log('\n📊 Users by City:');
    const usersByCity = await prisma.city.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
      where: {
        users: {
          some: {},
        },
      },
      orderBy: {
        users: {
          _count: 'desc',
        },
      },
    });

    usersByCity.forEach((city) => {
      console.log(`   ${city.name}: ${city._count.users} users`);
    });

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Dry run - shows what would be migrated without making changes
 */
async function dryRunMigration() {
  console.log('🔍 DRY RUN - No changes will be made\n');

  try {
    // Get Jakarta city
    const jakarta = await prisma.city.findUnique({
      where: { slug: 'jakarta' },
    });

    if (!jakarta) {
      console.error('❌ Jakarta city not found in database!');
      process.exit(1);
    }

    console.log(`✅ Target city: ${jakarta.name} (${jakarta.id})\n`);

    // Count users
    const usersWithoutCity = await prisma.user.count({
      where: { currentCityId: null },
    });

    const totalUsers = await prisma.user.count();

    console.log(`📊 Statistics:`);
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Users without city: ${usersWithoutCity}`);
    console.log(`   Users with city: ${totalUsers - usersWithoutCity}\n`);

    if (usersWithoutCity === 0) {
      console.log('✅ All users already have a city assigned. Nothing to migrate!');
      return;
    }

    // Show all users to be migrated
    const users = await prisma.user.findMany({
      where: { currentCityId: null },
      select: { 
        id: true, 
        email: true, 
        firstName: true, 
        lastName: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    console.log('👥 Users that will be migrated to Jakarta:');
    users.forEach((user, index) => {
      const name = user.firstName || user.lastName 
        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
        : 'No name';
      const date = user.createdAt.toLocaleDateString('id-ID');
      console.log(`   ${index + 1}. ${user.email}`);
      console.log(`      Name: ${name} | Role: ${user.role} | Joined: ${date}`);
    });

    console.log(`\n💡 Run without --dry-run flag to execute the migration`);

  } catch (error) {
    console.error('❌ Dry run failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Rollback - set currentCityId back to null for all users
 * USE WITH CAUTION - This will remove city data from all users
 */
async function rollbackMigration() {
  console.log('⚠️  ROLLBACK MODE\n');
  console.log('⚠️  This will remove city assignments from ALL users!\n');

  try {
    const usersWithCity = await prisma.user.count({
      where: { currentCityId: { not: null } },
    });

    console.log(`📊 Found ${usersWithCity} users with city assigned\n`);

    if (usersWithCity === 0) {
      console.log('✅ No users have city assigned. Nothing to rollback!');
      return;
    }

    console.log('🔄 Rolling back...');

    const result = await prisma.user.updateMany({
      where: { currentCityId: { not: null } },
      data: { currentCityId: null },
    });

    console.log(`✅ Removed city from ${result.count} users\n`);

    // Verification
    const remaining = await prisma.user.count({
      where: { currentCityId: { not: null } },
    });

    console.log('🔍 Verification:');
    console.log(`   Users with city remaining: ${remaining}`);
    console.log('\n✅ Rollback completed!');

  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'migrate';

  try {
    await prisma.$connect();
    console.log('🔌 Connected to database\n');

    switch (command) {
      case 'migrate':
        await migrateUserCities();
        break;
      case 'dry-run':
      case '--dry-run':
        await dryRunMigration();
        break;
      case 'rollback':
      case '--rollback':
        await rollbackMigration();
        break;
      default:
        console.log('Usage: ts-node prisma/migrate-user-cities.ts [command]');
        console.log('\nCommands:');
        console.log('  migrate   - Run the migration (default)');
        console.log('  dry-run   - Show what would be migrated without making changes');
        console.log('  rollback  - Undo the migration (USE WITH CAUTION)');
        console.log('\nExamples:');
        console.log('  ts-node prisma/migrate-user-cities.ts');
        console.log('  ts-node prisma/migrate-user-cities.ts dry-run');
        console.log('  ts-node prisma/migrate-user-cities.ts migrate');
    }
  } catch (error) {
    console.error('❌ Operation failed:', error);
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
