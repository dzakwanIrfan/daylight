import { PrismaClient, EventCategory, EventStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Helper untuk generate tanggal event (mulai dari besok)
function getEventDate(daysFromNow: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(0, 0, 0, 0);
  return date;
}

function setTime(date: Date, hours: number, minutes: number = 0): Date {
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
}

export async function seedEvents() {
  console.log('📅 Seeding events...');

  const cities = await prisma.city.findMany({
    where: { isActive: true },
    include: { country: true },
  });

  const partners = await prisma.partner.findMany({
    where: { isActive: true, status: 'ACTIVE' },
    include: { cityRelation: true },
  });

  if (!cities.length) {
    console.log('❌ No cities found! ');
    return;
  }

  // Event templates per category (tanpa DAYDREAM)
  const eventTemplates = {
    DAYBREAK: [
      {
        title: 'Morning Yoga Flow',
        desc: 'Start your day with energizing yoga session',
        price: 150000,
        priceMYR: 45,
        startHour: 6,
        duration: 2,
        tags: ['yoga', 'wellness', 'morning'],
      },
      {
        title: 'Sunrise Meditation',
        desc: 'Peaceful meditation as the sun rises',
        price: 100000,
        priceMYR: 30,
        startHour: 5,
        duration: 1.5,
        tags: ['meditation', 'mindfulness'],
      },
      {
        title: 'Healthy Breakfast Club',
        desc: 'Network over nutritious breakfast',
        price: 200000,
        priceMYR: 60,
        startHour: 7,
        duration: 2,
        tags: ['networking', 'food', 'healthy'],
      },
      {
        title: 'Morning Run Club',
        desc: 'Group running session for all levels',
        price: 75000,
        priceMYR: 22,
        startHour: 6,
        duration: 1.5,
        tags: ['running', 'fitness', 'outdoor'],
      },
      {
        title: 'Coffee & Journaling',
        desc: 'Mindful journaling with specialty coffee',
        price: 175000,
        priceMYR: 52,
        startHour: 7,
        duration: 2,
        tags: ['journaling', 'coffee', 'mindfulness'],
      },
      {
        title: 'Power Morning Workout',
        desc: 'High-intensity morning workout session',
        price: 125000,
        priceMYR: 38,
        startHour: 6,
        duration: 1.5,
        tags: ['fitness', 'workout', 'energy'],
      },
      {
        title: 'Breathwork Session',
        desc: 'Energizing breathwork techniques',
        price: 150000,
        priceMYR: 45,
        startHour: 7,
        duration: 1.5,
        tags: ['breathwork', 'wellness'],
      },
      {
        title: 'Morning Swim Club',
        desc: 'Refreshing morning swim session',
        price: 100000,
        priceMYR: 30,
        startHour: 6,
        duration: 1.5,
        tags: ['swimming', 'fitness'],
      },
    ],
    DAYTRIP: [
      {
        title: 'Temple Heritage Walk',
        desc: 'Explore ancient temples with expert guide',
        price: 350000,
        priceMYR: 105,
        startHour: 8,
        duration: 5,
        tags: ['culture', 'heritage', 'history'],
      },
      {
        title: 'Mountain Hiking Adventure',
        desc: 'Guided hiking through scenic trails',
        price: 450000,
        priceMYR: 135,
        startHour: 7,
        duration: 6,
        tags: ['hiking', 'nature', 'adventure'],
      },
      {
        title: 'Culinary Food Tour',
        desc: 'Taste authentic local street food',
        price: 300000,
        priceMYR: 90,
        startHour: 10,
        duration: 4,
        tags: ['food', 'culinary', 'local'],
      },
      {
        title: 'Cycling City Explorer',
        desc: 'Discover the city on two wheels',
        price: 275000,
        priceMYR: 82,
        startHour: 8,
        duration: 4,
        tags: ['cycling', 'city-tour', 'adventure'],
      },
      {
        title: 'Waterfall Chase',
        desc: 'Visit stunning waterfalls and swim',
        price: 400000,
        priceMYR: 120,
        startHour: 7,
        duration: 7,
        tags: ['waterfall', 'nature', 'swimming'],
      },
      {
        title: 'Village Cultural Tour',
        desc: 'Experience authentic village life',
        price: 325000,
        priceMYR: 97,
        startHour: 9,
        duration: 5,
        tags: ['culture', 'village', 'authentic'],
      },
      {
        title: 'Photography Walk',
        desc: 'Capture beautiful spots with pro photographer',
        price: 350000,
        priceMYR: 105,
        startHour: 8,
        duration: 4,
        tags: ['photography', 'art', 'walking'],
      },
      {
        title: 'Beach Hopping Day',
        desc: 'Visit multiple beautiful beaches',
        price: 500000,
        priceMYR: 150,
        startHour: 8,
        duration: 8,
        tags: ['beach', 'ocean', 'relaxation'],
      },
      {
        title: 'Coffee Plantation Tour',
        desc: 'Learn coffee from bean to cup',
        price: 375000,
        priceMYR: 112,
        startHour: 9,
        duration: 5,
        tags: ['coffee', 'plantation', 'learning'],
      },
      {
        title: 'Art Gallery Hop',
        desc: 'Explore local art galleries and studios',
        price: 250000,
        priceMYR: 75,
        startHour: 10,
        duration: 4,
        tags: ['art', 'gallery', 'culture'],
      },
    ],
    DAYCARE: [
      {
        title: 'Mental Wellness Workshop',
        desc: 'Tools for managing stress and anxiety',
        price: 350000,
        priceMYR: 105,
        startHour: 10,
        duration: 3,
        tags: ['mental-health', 'wellness'],
      },
      {
        title: 'Financial Planning 101',
        desc: 'Master personal finance basics',
        price: 400000,
        priceMYR: 120,
        startHour: 14,
        duration: 3,
        tags: ['finance', 'education'],
      },
      {
        title: 'Career Coaching Session',
        desc: 'Accelerate your career growth',
        price: 500000,
        priceMYR: 150,
        startHour: 13,
        duration: 3,
        tags: ['career', 'coaching'],
      },
      {
        title: 'Nutrition & Health Talk',
        desc: 'Learn about balanced nutrition',
        price: 275000,
        priceMYR: 82,
        startHour: 11,
        duration: 2.5,
        tags: ['nutrition', 'health'],
      },
      {
        title: 'Art Therapy Session',
        desc: 'Heal through creative expression',
        price: 325000,
        priceMYR: 97,
        startHour: 14,
        duration: 3,
        tags: ['art-therapy', 'mental-health'],
      },
      {
        title: 'Public Speaking Workshop',
        desc: 'Build confidence in presenting',
        price: 450000,
        priceMYR: 135,
        startHour: 10,
        duration: 4,
        tags: ['public-speaking', 'skills'],
      },
      {
        title: 'Relationship Workshop',
        desc: 'Build healthier relationships',
        price: 375000,
        priceMYR: 112,
        startHour: 14,
        duration: 3,
        tags: ['relationships', 'communication'],
      },
      {
        title: 'Time Management Mastery',
        desc: 'Optimize your productivity',
        price: 300000,
        priceMYR: 90,
        startHour: 10,
        duration: 2.5,
        tags: ['productivity', 'time-management'],
      },
      {
        title: 'Stress Relief Techniques',
        desc: 'Practical stress management tools',
        price: 250000,
        priceMYR: 75,
        startHour: 15,
        duration: 2,
        tags: ['stress-relief', 'wellness'],
      },
      {
        title: 'Digital Wellness Workshop',
        desc: 'Healthy relationship with technology',
        price: 275000,
        priceMYR: 82,
        startHour: 14,
        duration: 2.5,
        tags: ['digital-wellness', 'balance'],
      },
    ],
  };

  await prisma.event.deleteMany();

  let eventCount = 0;

  // Generate events untuk setiap city
  for (const city of cities) {
    const cityPartners = partners.filter((p) => p.cityId === city.id);
    const currency = city.country?.currency || 'IDR';
    const isIDR = currency === 'IDR';

    // Generate events untuk 14 hari ke depan (reduced from 60)
    for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
      const eventDate = getEventDate(dayOffset);
      const dayOfWeek = eventDate.getDay();

      // Weekend = lebih banyak events (reduced from 4/2)
      const eventsPerDay = dayOfWeek === 0 || dayOfWeek === 6 ? 2 : 1;

      // Pilih random events untuk hari ini
      for (let i = 0; i < eventsPerDay; i++) {
        // Random category (tanpa DAYDREAM)
        const categories = Object.keys(eventTemplates) as Array<
          keyof typeof eventTemplates
        >;
        const category =
          categories[Math.floor(Math.random() * categories.length)];

        // Random template dari category
        const templates = eventTemplates[category];
        const template =
          templates[Math.floor(Math.random() * templates.length)];

        // Random partner dari city (atau null)
        const partner =
          cityPartners.length > 0 && Math.random() < 0.7
            ? cityPartners[Math.floor(Math.random() * cityPartners.length)]
            : null;

        const startTime = setTime(eventDate, template.startHour);
        const endTime = setTime(
          eventDate,
          template.startHour + template.duration,
        );

        const slug = `${template.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${city.slug}-${Date.now()}-${eventCount}`;

        const price = isIDR ? template.price : template.priceMYR;

        await prisma.event.create({
          data: {
            title: template.title,
            slug,
            category: category as EventCategory,
            description: `${template.desc}. Join us in ${city.name} for an unforgettable experience!  This event is perfect for anyone looking to ${template.tags.slice(0, 2).join(' and ')}.`,
            shortDescription: template.desc,
            eventDate,
            startTime,
            endTime,
            venue: partner?.name || `${city.name} Event Space`,
            address: partner?.address || `Central ${city.name}`,
            city: city.name,
            cityId: city.id,
            partnerId: partner?.id,
            latitude: partner?.latitude || null,
            longitude: partner?.longitude || null,
            googleMapsUrl: partner?.googleMapsUrl || null,
            price,
            currency,
            status: EventStatus.PUBLISHED,
            isActive: true,
            isFeatured: Math.random() < 0.1,
            tags: template.tags,
            requirements: ['Comfortable clothing', 'Positive attitude'],
            highlights: [
              'Expert facilitator',
              'Refreshments included',
              'Certificate provided',
            ],
            organizerName: 'DayLight Team',
            organizerContact: isIDR ? '+62 812 3456 7890' : '+60 12 345 6789',
          },
        });

        eventCount++;
      }
    }

    console.log(`  ✅ ${city.name}:  events created`);
  }

  // Print summary
  const summary = await prisma.event.groupBy({
    by: ['category'],
    _count: true,
  });

  console.log('\n📊 Events by Category:');
  summary.forEach((s) => console.log(`  ${s.category}: ${s._count}`));

  console.log(`\n✅ Events seeded: ${eventCount} total`);
}

if (require.main === module) {
  prisma
    .$connect()
    .then(() => seedEvents())
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
