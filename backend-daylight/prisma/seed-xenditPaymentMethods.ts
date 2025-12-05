import {
  PrismaClient,
  PaymentMethodType,
  Prisma,
} from '@prisma/client';

const prisma = new PrismaClient();

const xenditPaymentMethods = [
  {
    code: 'DANA',
    name: 'DANA',
    countryCode: 'ID',
    currency: 'IDR',
    minAmount: new Prisma.Decimal('100'),
    maxAmount: new Prisma.Decimal('20000000'),
    type: PaymentMethodType.EWALLET,
    isActive: true,
    adminFeeRate: new Prisma.Decimal('0.03'),
    adminFeeFixed: new Prisma.Decimal('0'),
    logoUrl: 'https://static.xendit.co/logos/new-logos/dana-logo.svg',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    code: 'QRIS',
    name: 'QRIS',
    countryCode: 'ID',
    currency: 'IDR',
    minAmount: new Prisma.Decimal('1'),
    maxAmount: new Prisma.Decimal('10000000'),
    type: PaymentMethodType.QR_CODE,
    isActive: true,
    adminFeeRate: new Prisma.Decimal('0.007'),
    adminFeeFixed: new Prisma.Decimal('0'),
    logoUrl: 'https://static.xendit.co/logos/new-logos/qris-logo.svg',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    code: 'BCA_VIRTUAL_ACCOUNT',
    name: 'BCA VIRTUAL ACCOUNT',
    countryCode: 'ID',
    currency: 'IDR',
    minAmount: new Prisma.Decimal('10000'),
    maxAmount: new Prisma.Decimal('50000000000'),
    type: PaymentMethodType.BANK_TRANSFER,
    isActive: true,
    adminFeeRate: new Prisma.Decimal('0'),
    adminFeeFixed: new Prisma.Decimal('4000'),
    logoUrl: 'https://static.xendit.co/logos/new-logos/bca-logo.svg',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    code: 'ALFAMART',
    name: 'ALFAMART',
    countryCode: 'ID',
    currency: 'IDR',
    minAmount: new Prisma.Decimal('10000'),
    maxAmount: new Prisma.Decimal('5000000'),
    type: PaymentMethodType.OVER_THE_COUNTER,
    isActive: true,
    adminFeeRate: new Prisma.Decimal('0'),
    adminFeeFixed: new Prisma.Decimal('5000'),
    logoUrl: 'https://static.xendit.co/logos/new-logos/alfamart-logo.svg',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export async function seedXenditPaymentMethods() {
  console.log('Seeding Xendit Payment Methods...');
  for (const paymentMethod of xenditPaymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { code: paymentMethod.code },
      update: paymentMethod,
      create: paymentMethod,
    });
  }
  console.log('Seeding completed.');
}

// wrapper main supaya file berjalan saat dipanggil langsung
async function main() {
  try {
    await prisma.$connect();
    await seedXenditPaymentMethods();
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

// Jika file dieksekusi langsung (node / ts-node), jalankan main
if (require.main === module) {
  main();
}
