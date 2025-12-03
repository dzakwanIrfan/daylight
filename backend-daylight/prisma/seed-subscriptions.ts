import { PrismaClient, SubscriptionPlanType } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSubscriptionPlans() {
  console.log('🌱 Seeding subscription plans with multi-currency pricing...');

  const plans = [
    {
      type: SubscriptionPlanType.MONTHLY_1,
      name: '1 Month Unlimited',
      description: 'Join unlimited events for 1 month',
      price: 150000, // Legacy IDR price
      currency: 'IDR', // Legacy currency
      durationInMonths: 1,
      features: [
        'Unlimited event access',
        'Exclusive community access',
        'Monthly newsletter',
      ],
      isActive: true,
      sortOrder: 1,
      // Multi-currency pricing
      prices: [
        { currency: 'IDR', amount: 150000, countryCode: null }, // Default Indonesia
        { currency: 'USD', amount: 13, countryCode: null }, // Default USD
        { currency: 'SGD', amount: 18, countryCode: 'SG' }, // Singapore
        { currency: 'MYR', amount: 60, countryCode: 'MY' }, // Malaysia
      ],
    },
    {
      type: SubscriptionPlanType.MONTHLY_3,
      name: '3 Months Unlimited',
      description: 'Join unlimited events for 3 months - Best value! ',
      price: 399000, // Legacy IDR price
      currency: 'IDR',
      durationInMonths: 3,
      features: [
        'Unlimited event access',
        'Exclusive community access',
        'Monthly newsletter',
      ],
      isActive: true,
      sortOrder: 2,
      // Multi-currency pricing
      prices: [
        { currency: 'IDR', amount: 399000, countryCode: null },
        { currency: 'USD', amount: 32, countryCode: null },
        { currency: 'SGD', amount: 45, countryCode: 'SG' },
        { currency: 'MYR', amount: 150, countryCode: 'MY' },
      ],
    },
    {
      type: SubscriptionPlanType.MONTHLY_6,
      name: '6 Months Unlimited',
      description: 'Join unlimited events for 6 months - Premium package!',
      price: 899000, // Legacy IDR price
      currency: 'IDR',
      durationInMonths: 6,
      features: [
        'Unlimited event access',
        'Exclusive community access',
        'Monthly newsletter',
      ],
      isActive: false,
      sortOrder: 3,
      // Multi-currency pricing
      prices: [
        { currency: 'IDR', amount: 899000, countryCode: null },
        { currency: 'USD', amount: 58, countryCode: null },
        { currency: 'SGD', amount: 80, countryCode: 'SG' },
        { currency: 'MYR', amount: 270, countryCode: 'MY' },
      ],
    },
  ];

  for (const planData of plans) {
    const { prices, ...planFields } = planData;

    const existing = await prisma.subscriptionPlan.findFirst({
      where: { type: planData.type },
      include: { prices: true },
    });

    if (existing) {
      // Update existing plan
      await prisma.subscriptionPlan.update({
        where: { id: existing.id },
        data: {
          ...planFields,
          // Delete existing prices and create new ones
          prices: {
            deleteMany: {}, // Clear all existing prices
            create: prices.map((p) => ({
              currency: p.currency,
              amount: p.amount,
              countryCode: p.countryCode,
              isActive: true,
            })),
          },
        },
        include: { prices: true },
      });
      console.log(
        `✅ Updated plan: ${planData.name} with ${prices.length} price(s)`,
      );
    } else {
      // Create new plan
      await prisma.subscriptionPlan.create({
        data: {
          ...planFields,
          prices: {
            create: prices.map((p) => ({
              currency: p.currency,
              amount: p.amount,
              countryCode: p.countryCode,
              isActive: true,
            })),
          },
        },
        include: { prices: true },
      });
      console.log(
        `✅ Created plan: ${planData.name} with ${prices.length} price(s)`,
      );
    }
  }

  // Summary
  const totalPlans = await prisma.subscriptionPlan.count();
  const totalPrices = await prisma.subscriptionPlanPrice.count();

  console.log('\n📊 Seeding Summary:');
  console.log(`   📦 Total Plans: ${totalPlans}`);
  console.log(`   💰 Total Prices: ${totalPrices}`);
  console.log('✨ Subscription plans seeded successfully!\n');
}

seedSubscriptionPlans()
  .catch((e) => {
    console.error('❌ Error seeding subscription plans:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
