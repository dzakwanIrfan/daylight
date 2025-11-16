import { PrismaClient, SubscriptionPlanType } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSubscriptionPlans() {
  console.log('🌱 Seeding subscription plans...');

  const plans = [
    {
      type: SubscriptionPlanType.MONTHLY_1,
      name: '1 Month Unlimited',
      description: 'Join unlimited events for 1 month',
      price: 199000,
      currency: 'IDR',
      durationInMonths: 1,
      features: [
        'Unlimited event access',
        'Priority booking',
        'Exclusive community access',
        'Monthly newsletter',
      ],
      isActive: true,
      sortOrder: 1,
    },
    {
      type: SubscriptionPlanType.MONTHLY_3,
      name: '3 Months Unlimited',
      description: 'Join unlimited events for 3 months',
      price: 499000,
      currency: 'IDR',
      durationInMonths: 3,
      features: [
        'Unlimited event access',
        'Priority booking',
        'Exclusive community access',
        'Monthly newsletter',
        '15% discount on merchandise',
      ],
      isActive: true,
      sortOrder: 2,
    },
    {
      type: SubscriptionPlanType.MONTHLY_6,
      name: '6 Months Unlimited',
      description: 'Join unlimited events for 6 months',
      price: 899000,
      currency: 'IDR',
      durationInMonths: 6,
      features: [
        'Unlimited event access',
        'Priority booking',
        'Exclusive community access',
        'Monthly newsletter',
        '25% discount on merchandise',
        'VIP event access',
      ],
      isActive: true,
      sortOrder: 3,
    },
  ];

  for (const plan of plans) {
    const existing = await prisma.subscriptionPlan.findFirst({
      where: { type: plan.type },
    });

    if (existing) {
      // Update existing
      await prisma.subscriptionPlan.update({
        where: { id: existing.id },
        data: plan,
      });
      console.log(`✅ Updated plan: ${plan.name}`);
    } else {
      // Create new
      await prisma.subscriptionPlan.create({
        data: plan,
      });
      console.log(`✅ Created plan: ${plan.name}`);
    }
  }

  console.log('✅ Subscription plans seeded');
}

seedSubscriptionPlans()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });