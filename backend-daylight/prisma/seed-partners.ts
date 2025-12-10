import { PrismaClient, PartnerType, PartnerStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedPartners() {
  console.log('🏢 Seeding partners...');

  const cities = await prisma.city.findMany({
    where: { isActive: true },
    include: { country: true },
  });

  if (!cities.length) {
    console.log('❌ No cities found! ');
    return;
  }

  const partnersData = [
    // Jakarta
    {
      name: 'Sunrise Yoga Studio',
      type: PartnerType.BRAND,
      citySlug: 'jakarta',
      address: 'Jl. Senopati No.  45, Kebayoran Baru',
      lat: -6.2315,
      lng: 106.801,
      tags: ['yoga', 'wellness'],
      amenities: ['wifi', 'parking', 'shower'],
    },
    // Bandung
    {
      name: 'Artisan Coffee Lab',
      type: PartnerType.BRAND,
      citySlug: 'bandung',
      address: 'Jl. Braga No. 78',
      lat: -6.9175,
      lng: 107.6091,
      tags: ['coffee', 'workshop'],
      amenities: ['wifi', 'workshop-space'],
    },
    // Surabaya
    {
      name: 'East Java Fitness Studio',
      type: PartnerType.BRAND,
      citySlug: 'surabaya',
      address: 'Jl. HR Muhammad No. 45',
      lat: -7.29,
      lng: 112.73,
      tags: ['fitness', 'gym'],
      amenities: ['parking', 'shower', 'locker'],
    },
    // Yogyakarta
    {
      name: 'Peaceful Mind Jogja',
      type: PartnerType.BRAND,
      citySlug: 'yogyakarta',
      address: 'Jl.  Prawirotaman No. 12',
      lat: -7.815,
      lng: 110.365,
      tags: ['meditation', 'wellness'],
      amenities: ['garden', 'cafe'],
    },
    // Bali
    {
      name: 'Ubud Healing Space',
      type: PartnerType.BRAND,
      citySlug: 'bali',
      address: 'Jl. Raya Ubud No. 88',
      lat: -8.5069,
      lng: 115.2625,
      tags: ['healing', 'meditation'],
      amenities: ['outdoor-space', 'organic-cafe'],
    },
    // Semarang
    {
      name: 'Semarang Wellness Studio',
      type: PartnerType.BRAND,
      citySlug: 'semarang',
      address: 'Jl. Pandanaran No. 50',
      lat: -6.985,
      lng: 110.42,
      tags: ['wellness', 'fitness'],
      amenities: ['wifi', 'parking'],
    },
    // Malang
    {
      name: 'Malang Creative Space',
      type: PartnerType.BRAND,
      citySlug: 'malang',
      address: 'Jl. Ijen No. 22',
      lat: -7.977,
      lng: 112.632,
      tags: ['creative', 'workshop'],
      amenities: ['wifi', 'cafe', 'workspace'],
    },
    // Medan
    {
      name: 'Medan Wellness Hub',
      type: PartnerType.BRAND,
      citySlug: 'medan',
      address: 'Jl. Imam Bonjol No. 45',
      lat: 3.585,
      lng: 98.675,
      tags: ['wellness', 'spa'],
      amenities: ['parking', 'spa', 'cafe'],
    },
    // Kuala Lumpur
    {
      name: 'KL Mindfulness Center',
      type: PartnerType.BRAND,
      citySlug: 'kuala-lumpur',
      address: 'Jalan Bukit Bintang No. 88',
      lat: 3.148,
      lng: 101.713,
      tags: ['mindfulness', 'meditation'],
      amenities: ['wifi', 'ac', 'meditation-room'],
    },
    // Penang
    {
      name: 'Georgetown Wellness Studio',
      type: PartnerType.BRAND,
      citySlug: 'penang',
      address: 'Lebuh Chulia No. 123',
      lat: 5.416,
      lng: 100.338,
      tags: ['wellness', 'heritage'],
      amenities: ['wifi', 'cafe'],
    },
    // Johor Bahru
    {
      name: 'JB Wellness Center',
      type: PartnerType.BRAND,
      citySlug: 'johor-bahru',
      address: 'Jalan Wong Ah Fook No. 88',
      lat: 1.462,
      lng: 103.761,
      tags: ['wellness', 'fitness'],
      amenities: ['parking', 'shower'],
    },
    // Malacca
    {
      name: 'Melaka Heritage Wellness',
      type: PartnerType.BRAND,
      citySlug: 'malacca',
      address: 'Jalan Hang Jebat No. 56',
      lat: 2.196,
      lng: 102.248,
      tags: ['wellness', 'heritage'],
      amenities: ['wifi', 'cafe'],
    },
  ];

  await prisma.partner.deleteMany();

  for (const p of partnersData) {
    const city = cities.find((c) => c.slug === p.citySlug);
    if (!city) continue;

    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    await prisma.partner.create({
      data: {
        name: p.name,
        slug,
        type: p.type,
        description: `${p.name} is a premier ${p.tags.join(' & ')} destination in ${city.name}. `,
        shortDescription: `${p.tags.join(' & ')} in ${city.name}`,
        cityId: city.id,
        city: city.name,
        address: p.address,
        latitude: p.lat,
        longitude: p.lng,
        googleMapsUrl: `https://maps.google.com/?q=${p.lat},${p.lng}`,
        status: PartnerStatus.ACTIVE,
        isActive: true,
        isPreferred: Math.random() < 0.3,
        isFeatured: Math.random() < 0.2,
        tags: p.tags,
        amenities: p.amenities,
      },
    });
    console.log(`  ✅ ${p.name} (${city.name})`);
  }

  console.log(`✅ Partners seeded: ${await prisma.partner.count()}`);
}

if (require.main === module) {
  prisma
    .$connect()
    .then(() => seedPartners())
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
