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
    {
      name: 'Mindful Space Jakarta',
      type: PartnerType.BRAND,
      citySlug: 'jakarta',
      address: 'Jl. Kemang Raya No. 8',
      lat: -6.2608,
      lng: 106.8136,
      tags: ['mental-health', 'therapy'],
      amenities: ['wifi', 'ac', 'private-rooms'],
    },
    {
      name: 'Green Kitchen Café',
      type: PartnerType.BRAND,
      citySlug: 'jakarta',
      address: 'Jl. Panglima Polim No. 23',
      lat: -6.245,
      lng: 106.7985,
      tags: ['food', 'healthy'],
      amenities: ['wifi', 'outdoor-seating'],
    },
    {
      name: 'Jakarta Running Club',
      type: PartnerType.COMMUNITY,
      citySlug: 'jakarta',
      address: 'GBK Senayan, Jakarta Pusat',
      lat: -6.2186,
      lng: 106.8019,
      tags: ['running', 'fitness'],
      amenities: ['parking', 'locker'],
    },
    {
      name: 'Financial Wisdom Center',
      type: PartnerType.BRAND,
      citySlug: 'jakarta',
      address: 'Jl. Sudirman No. 123',
      lat: -6.227,
      lng: 106.818,
      tags: ['finance', 'education'],
      amenities: ['wifi', 'projector', 'ac'],
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
    {
      name: 'Dago Wellness Center',
      type: PartnerType.BRAND,
      citySlug: 'bandung',
      address: 'Jl. Dago No. 56',
      lat: -6.885,
      lng: 107.6137,
      tags: ['wellness', 'spa'],
      amenities: ['parking', 'spa', 'cafe'],
    },
    {
      name: 'Bandung Creative Hub',
      type: PartnerType.COMMUNITY,
      citySlug: 'bandung',
      address: 'Jl. Ciumbuleuit No. 42',
      lat: -6.8712,
      lng: 107.6068,
      tags: ['creative', 'art'],
      amenities: ['wifi', 'workshop-space', 'gallery'],
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
    {
      name: 'Surabaya Wellness Hub',
      type: PartnerType.BRAND,
      citySlug: 'surabaya',
      address: 'Jl. Pemuda No. 88',
      lat: -7.265,
      lng: 112.75,
      tags: ['wellness', 'mental-health'],
      amenities: ['wifi', 'ac', 'private-rooms'],
    },
    {
      name: 'Tunjungan Health Center',
      type: PartnerType.BRAND,
      citySlug: 'surabaya',
      address: 'Jl. Tunjungan No. 12',
      lat: -7.257,
      lng: 112.738,
      tags: ['health', 'nutrition'],
      amenities: ['parking', 'cafe'],
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
    {
      name: 'Jogja Art Therapy Studio',
      type: PartnerType.BRAND,
      citySlug: 'yogyakarta',
      address: 'Jl. Malioboro No. 100',
      lat: -7.793,
      lng: 110.3655,
      tags: ['art', 'therapy'],
      amenities: ['wifi', 'art-supplies'],
    },
    {
      name: 'Prambanan Adventure Club',
      type: PartnerType.COMMUNITY,
      citySlug: 'yogyakarta',
      address: 'Jl. Raya Prambanan KM 16',
      lat: -7.752,
      lng: 110.4915,
      tags: ['adventure', 'culture'],
      amenities: ['parking', 'guide'],
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
    {
      name: 'Seminyak Yoga Retreat',
      type: PartnerType.BRAND,
      citySlug: 'bali',
      address: 'Jl. Kayu Aya No. 55',
      lat: -8.6895,
      lng: 115.158,
      tags: ['yoga', 'retreat'],
      amenities: ['pool', 'spa', 'restaurant'],
    },
    {
      name: 'Canggu Surf & Wellness',
      type: PartnerType.COMMUNITY,
      citySlug: 'bali',
      address: 'Jl. Pantai Batu Bolong No. 32',
      lat: -8.656,
      lng: 115.132,
      tags: ['surf', 'wellness'],
      amenities: ['beach-access', 'cafe', 'board-rental'],
    },
    {
      name: 'Sanur Health Center',
      type: PartnerType.BRAND,
      citySlug: 'bali',
      address: 'Jl. Danau Tamblingan No. 78',
      lat: -8.688,
      lng: 115.262,
      tags: ['health', 'nutrition'],
      amenities: ['parking', 'cafe'],
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
    {
      name: 'Lawang Sewu Adventure',
      type: PartnerType.COMMUNITY,
      citySlug: 'semarang',
      address: 'Jl. Pemuda No. 160',
      lat: -6.984,
      lng: 110.4105,
      tags: ['adventure', 'history'],
      amenities: ['guide', 'parking'],
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
    {
      name: 'Batu Adventure Center',
      type: PartnerType.COMMUNITY,
      citySlug: 'malang',
      address: 'Jl. Raya Batu No. 88',
      lat: -7.883,
      lng: 112.528,
      tags: ['adventure', 'nature'],
      amenities: ['parking', 'equipment'],
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
    {
      name: 'Lake Toba Adventure',
      type: PartnerType.COMMUNITY,
      citySlug: 'medan',
      address: 'Jl. SM Raja No. 200',
      lat: 3.565,
      lng: 98.69,
      tags: ['adventure', 'nature'],
      amenities: ['transport', 'guide'],
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
    {
      name: 'KLCC Fitness Studio',
      type: PartnerType.BRAND,
      citySlug: 'kuala-lumpur',
      address: 'Jalan Ampang No. 50',
      lat: 3.158,
      lng: 101.712,
      tags: ['fitness', 'gym'],
      amenities: ['parking', 'shower', 'locker'],
    },
    {
      name: 'Bangsar Wellness Space',
      type: PartnerType.BRAND,
      citySlug: 'kuala-lumpur',
      address: 'Jalan Telawi 3, Bangsar',
      lat: 3.1295,
      lng: 101.671,
      tags: ['wellness', 'yoga'],
      amenities: ['cafe', 'parking'],
    },
    {
      name: 'PJ Community Hub',
      type: PartnerType.COMMUNITY,
      citySlug: 'kuala-lumpur',
      address: 'Jalan SS2/55, Petaling Jaya',
      lat: 3.118,
      lng: 101.625,
      tags: ['community', 'networking'],
      amenities: ['wifi', 'meeting-room'],
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
    {
      name: 'Penang Hill Adventure',
      type: PartnerType.COMMUNITY,
      citySlug: 'penang',
      address: 'Jalan Bukit Bendera',
      lat: 5.423,
      lng: 100.268,
      tags: ['adventure', 'nature'],
      amenities: ['parking', 'guide'],
    },
    {
      name: 'Batu Ferringhi Yoga',
      type: PartnerType.BRAND,
      citySlug: 'penang',
      address: 'Jalan Batu Ferringhi No. 45',
      lat: 5.472,
      lng: 100.242,
      tags: ['yoga', 'beach'],
      amenities: ['beach-access', 'parking'],
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
    {
      name: 'Iskandar Fitness Hub',
      type: PartnerType.BRAND,
      citySlug: 'johor-bahru',
      address: 'Jalan Medini Utara 1',
      lat: 1.425,
      lng: 103.638,
      tags: ['fitness', 'gym'],
      amenities: ['parking', 'pool', 'spa'],
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
    {
      name: 'Jonker Walk Studio',
      type: PartnerType.COMMUNITY,
      citySlug: 'malacca',
      address: 'Jalan Hang Kasturi No. 32',
      lat: 2.195,
      lng: 102.247,
      tags: ['art', 'culture'],
      amenities: ['gallery', 'workshop-space'],
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
