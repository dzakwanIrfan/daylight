import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateSubscriptionPricing() {
  console.log('🔄 Starting subscription pricing migration...\n');

  try {
    // Get all existing subscription plans
    const plans = await prisma.subscriptionPlan.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        price: true,
        currency: true,
        prices: true, // Include existing prices to check for duplicates
      },
    });

    console.log(`📊 Found ${plans.length} subscription plans to migrate`);

    let migrated = 0;
    let skipped = 0;

    for (const plan of plans) {
      // Check if price entry already exists for this plan and currency
      const existingPrice = await prisma.subscriptionPlanPrice.findFirst({
        where: {
          subscriptionPlanId: plan.id,
          currency: plan.currency,
          countryCode: null, // Default pricing without country code
        },
      });

      if (existingPrice) {
        console.log(
          `⏭️  Skipping ${plan.name} (${plan.currency}) - already migrated`,
        );
        skipped++;
        continue;
      }

      // Create new price entry from legacy fields
      await prisma.subscriptionPlanPrice.create({
        data: {
          subscriptionPlanId: plan.id,
          currency: plan.currency,
          amount: plan.price,
          countryCode: null, // Default pricing (no specific country)
          isActive: true,
        },
      });

      console.log(`✅ Migrated ${plan.name}: ${plan.price} ${plan.currency}`);
      migrated++;
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   ✅ Migrated: ${migrated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   📊 Total: ${plans.length}`);
    console.log('\n✨ Migration completed successfully! ');

    // Verify migration
    const totalPrices = await prisma.subscriptionPlanPrice.count();
    console.log(`\n🔍 Verification: ${totalPrices} price entries in database`);

    // Show all prices grouped by plan
    console.log('\n📋 Current Pricing Structure:');
    const allPlans = await prisma.subscriptionPlan.findMany({
      include: {
        prices: {
          orderBy: [{ countryCode: 'asc' }, { currency: 'asc' }],
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    for (const plan of allPlans) {
      console.log(`\n   ${plan.name}:`);
      if (plan.prices.length === 0) {
        console.log(`     ⚠️  No prices configured! `);
      } else {
        plan.prices.forEach((price) => {
          const location = price.countryCode
            ? ` (${price.countryCode})`
            : ' (Default)';
          const status = price.isActive ? '✓' : '✗';
          console.log(
            `     ${status} ${price.amount} ${price.currency}${location}`,
          );
        });
      }
    }
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  }
}

migrateSubscriptionPricing()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
