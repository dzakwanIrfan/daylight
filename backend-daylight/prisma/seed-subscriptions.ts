import { PrismaClient, SubscriptionPlanType } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedSubscriptionPlans() {
  console.log('🌱 Seeding subscription plans...');

  const plans = [
    {
      type: SubscriptionPlanType.MONTHLY_1,
      name: '1 Month Unlimited',
      description: 'Join unlimited events for 1 month',
      price: 150000,
      currency: 'IDR',
      durationInMonths: 1,
      features: [
        'Unlimited event access',
        'Exclusive community access',
        'Monthly newsletter',
      ],
      isActive: true,
      sortOrder: 1,
      prices: [
        { currency: 'IDR', amount: 150000, countryCode: 'IDR' },
        { currency: 'SGD', amount: 18, countryCode: 'SG' },
        { currency: 'MYR', amount: 60, countryCode: 'MY' },
      ],
    },
    {
      type: SubscriptionPlanType.MONTHLY_3,
      name: '3 Months Unlimited',
      description: 'Join unlimited events for 3 months - Best value!',
      price: 399000,
      currency: 'IDR',
      durationInMonths: 3,
      features: [
        'Unlimited event access',
        'Exclusive community access',
        'Monthly newsletter',
      ],
      isActive: true,
      sortOrder: 2,
      prices: [
        { currency: 'IDR', amount: 399000, countryCode: 'IDR' },
        { currency: 'SGD', amount: 45, countryCode: 'SG' },
        { currency: 'MYR', amount: 150, countryCode: 'MY' },
      ],
    },
    {
      type: SubscriptionPlanType.MONTHLY_6,
      name: '6 Months Unlimited',
      description: 'Join unlimited events for 6 months - Premium package!',
      price: 899000,
      currency: 'IDR',
      durationInMonths: 6,
      features: [
        'Unlimited event access',
        'Exclusive community access',
        'Monthly newsletter',
      ],
      isActive: false,
      sortOrder: 3,
      prices: [
        { currency: 'IDR', amount: 899000, countryCode: 'IDR' },
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
      await prisma.subscriptionPlan.update({
        where: { id: existing.id },
        data: {
          ...planFields,
          prices: {
            deleteMany: {},
            create: prices.map((p) => ({
              currency: p.currency,
              amount: p.amount,
              countryCode: p.countryCode,
              isActive: true,
            })),
          },
        },
      });
      console.log(`  ✏️  Updated:  ${planData.name}`);
    } else {
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
      });
      console.log(`  ✅ Created: ${planData.name}`);
    }
  }

  console.log('✅ Subscription plans seeded');
}

if (require.main === module) {
  prisma
    .$connect()
    .then(() => seedSubscriptionPlans())
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
