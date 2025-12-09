import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAll() {
  console.log('🚀 Starting full database seed...\n');
  console.log('='.repeat(50));

  const startTime = Date.now();

  try {
    // 1. Locations (Countries & Cities) - HARUS PERTAMA
    console.log('\n📍 Step 1: Seeding Locations.. .');
    const { seedLocations } = require('./seed-locations');
    await seedLocations();

    // 2. Archetype Details
    console.log('\n🎭 Step 2: Seeding Archetype Details...');
    const { seedArchetypeDetails } = require('./seed-archetypeDetails');
    await seedArchetypeDetails();

    // 3. Xendit Payment Methods
    console.log('\n💳 Step 3: Seeding Payment Methods...');
    const { seedXenditPaymentMethods } = require('./seed-xenditPaymentMethods');
    await seedXenditPaymentMethods();

    // 4. Subscription Plans
    console.log('\n📦 Step 4: Seeding Subscription Plans...');
    const { seedSubscriptionPlans } = require('./seed-subscriptions');
    await seedSubscriptionPlans();

    // 5. Partners (depends on Cities)
    console.log('\n🏢 Step 5: Seeding Partners...');
    const { seedPartners } = require('./seed-partners');
    await seedPartners();

    // 6. Events (depends on Cities & Partners)
    console.log('\n📅 Step 6: Seeding Events...');
    const { seedEvents } = require('./seed-events');
    await seedEvents();

    // 7. Questions
    console.log('\n❓ Step 7: Seeding Questions...');
    const { seedQuestions } = require('./seed');
    await seedQuestions();

    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n' + '='.repeat(50));
    console.log('🎉 ALL SEEDS COMPLETED SUCCESSFULLY!');
    console.log(`⏱️  Total time: ${duration}s`);
    console.log('='.repeat(50));
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    throw error;
  }
}

async function main() {
  try {
    await prisma.$connect();
    await seedAll();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { seedAll };
