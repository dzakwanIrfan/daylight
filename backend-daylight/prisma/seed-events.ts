import { PrismaClient, EventCategory, EventStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function untuk generate random date dalam range tertentu
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function untuk generate time
function setTime(date: Date, hours: number, minutes: number = 0): Date {
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
}

// Data untuk setiap kategori
const eventTemplates = {
  DAYBREAK: [
    {
      title: 'Morning Yoga & Meditation',
      shortDescription: 'Start your day with peaceful yoga and meditation session',
      description: 'Join us for a refreshing morning yoga session designed to energize your body and calm your mind. Perfect for all levels, from beginners to advanced practitioners. Our certified instructor will guide you through gentle stretches, breathing exercises, and meditation techniques to set a positive tone for your day.',
      venue: 'Sunrise Yoga Studio',
      city: 'Jakarta',
      address: 'Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan',
      tags: ['yoga', 'meditation', 'wellness', 'morning'],
      requirements: ['Bring your own yoga mat', 'Wear comfortable clothing', 'Arrive 10 minutes early'],
      highlights: ['Certified yoga instructor', 'Complimentary herbal tea', 'Peaceful atmosphere'],
      price: 150000,
      maxParticipants: 20,
    },
    {
      title: 'Healthy Breakfast & Networking',
      shortDescription: 'Connect with like-minded people over nutritious breakfast',
      description: 'Network with professionals and health enthusiasts while enjoying a delicious and nutritious breakfast. Share ideas, make connections, and start your day on the right foot with wholesome food and great conversations.',
      venue: 'Green Kitchen Café',
      city: 'Jakarta',
      address: 'Jl. Panglima Polim No. 23, Kebayoran Baru, Jakarta Selatan',
      tags: ['networking', 'breakfast', 'healthy-eating', 'community'],
      requirements: ['RSVP required', 'Business casual attire'],
      highlights: ['Organic breakfast buffet', 'Coffee and fresh juices', 'Meet new friends'],
      price: 200000,
      maxParticipants: 30,
    },
    {
      title: 'Sunrise Beach Run',
      shortDescription: 'Energizing morning run along the beautiful beach',
      description: 'Experience the beauty of sunrise while getting your cardio in! This guided beach run is perfect for runners of all levels. Enjoy the cool morning breeze, stunning ocean views, and the energy of running with a group.',
      venue: 'Ancol Beach',
      city: 'Jakarta',
      address: 'Pantai Ancol, Jakarta Utara',
      tags: ['running', 'fitness', 'beach', 'outdoor'],
      requirements: ['Wear running shoes', 'Bring water bottle', 'Sunscreen recommended'],
      highlights: ['Scenic beach route', 'Professional running coach', 'Post-run stretching session'],
      price: 0,
      maxParticipants: 50,
    },
    {
      title: 'Mindful Morning Coffee Workshop',
      shortDescription: 'Learn the art of coffee brewing and mindful drinking',
      description: 'Discover the art and science of coffee brewing in this hands-on workshop. Learn about different brewing methods, coffee origins, and how to practice mindfulness while enjoying your morning cup. Perfect for coffee lovers who want to deepen their appreciation.',
      venue: 'Artisan Coffee Lab',
      city: 'Bandung',
      address: 'Jl. Braga No. 78, Bandung',
      tags: ['coffee', 'workshop', 'mindfulness', 'learning'],
      requirements: ['No prior coffee knowledge needed', 'Bring curiosity and enthusiasm'],
      highlights: ['Expert barista instruction', 'Taste 5 different coffee varieties', 'Take home coffee samples'],
      price: 250000,
      maxParticipants: 15,
    },
    {
      title: 'Morning Journaling Circle',
      shortDescription: 'Reflect and set intentions through guided journaling',
      description: 'Start your day with clarity and purpose through guided journaling exercises. This supportive group session helps you reflect on your goals, express gratitude, and set positive intentions for the day ahead.',
      venue: 'Peaceful Mind Studio',
      city: 'Yogyakarta',
      address: 'Jl. Prawirotaman No. 12, Yogyakarta',
      tags: ['journaling', 'self-reflection', 'wellness', 'mindfulness'],
      requirements: ['Bring your own journal and pen', 'Open mind and heart'],
      highlights: ['Guided prompts and exercises', 'Supportive community', 'Tea and light snacks included'],
      price: 100000,
      maxParticipants: 12,
    },
  ],
  DAYTRIP: [
    {
      title: 'Borobudur Temple Heritage Tour',
      shortDescription: 'Explore the magnificent ancient Buddhist temple',
      description: 'Journey through history at one of the world\'s most magnificent Buddhist temples. This full-day guided tour includes transportation, entrance fees, and a knowledgeable guide who will bring the temple\'s rich history to life. Witness stunning stone carvings and enjoy panoramic views of the surrounding landscape.',
      venue: 'Borobudur Temple Complex',
      city: 'Magelang',
      address: 'Borobudur, Magelang, Central Java',
      tags: ['culture', 'heritage', 'temple', 'history'],
      requirements: ['Comfortable walking shoes', 'Hat and sunscreen', 'Modest clothing (no shorts)'],
      highlights: ['UNESCO World Heritage Site', 'Expert local guide', 'Lunch included', 'Small group experience'],
      price: 850000,
      maxParticipants: 25,
    },
    {
      title: 'Bali Rice Terrace Cycling Adventure',
      shortDescription: 'Cycle through stunning rice terraces and traditional villages',
      description: 'Explore the breathtaking landscapes of Bali on two wheels! This guided cycling tour takes you through emerald rice terraces, traditional villages, and hidden temples. Experience authentic Balinese culture, meet friendly locals, and enjoy a delicious traditional lunch.',
      venue: 'Tegalalang Rice Terrace',
      city: 'Ubud',
      address: 'Tegalalang, Ubud, Bali',
      tags: ['cycling', 'nature', 'adventure', 'culture'],
      requirements: ['Basic cycling ability', 'Comfortable clothes', 'Closed-toe shoes'],
      highlights: ['Quality mountain bikes provided', 'Traditional Balinese lunch', 'Visit to local temple', 'Professional guide'],
      price: 650000,
      maxParticipants: 15,
    },
    {
      title: 'Komodo National Park Day Trip',
      shortDescription: 'See the legendary Komodo dragons in their natural habitat',
      description: 'Embark on an unforgettable adventure to see the world-famous Komodo dragons! This day trip includes boat transportation, trekking with experienced rangers, snorkeling in pristine waters, and visiting the stunning Pink Beach. A truly once-in-a-lifetime experience!',
      venue: 'Komodo National Park',
      city: 'Labuan Bajo',
      address: 'Komodo Island, East Nusa Tenggara',
      tags: ['wildlife', 'adventure', 'nature', 'unesco'],
      requirements: ['Moderate fitness level', 'Swimming ability for snorkeling', 'Bring sun protection'],
      highlights: ['See Komodo dragons up close', 'Snorkeling equipment included', 'Visit Pink Beach', 'Boat transportation provided'],
      price: 1500000,
      maxParticipants: 20,
    },
    {
      title: 'Mount Bromo Sunrise Trek',
      shortDescription: 'Witness the magical sunrise over volcanic landscape',
      description: 'Experience one of Indonesia\'s most iconic sunrises at Mount Bromo! This early morning trek takes you to the perfect viewpoint to watch the sun rise over the volcanic landscape. Includes 4x4 jeep ride, trekking guide, and breakfast with a view.',
      venue: 'Mount Bromo Viewpoint',
      city: 'Probolinggo',
      address: 'Mount Bromo, Probolinggo, East Java',
      tags: ['volcano', 'sunrise', 'trekking', 'nature'],
      requirements: ['Warm jacket (very cold at sunrise)', 'Sturdy shoes', 'Flashlight recommended'],
      highlights: ['Stunning sunrise views', '4x4 jeep transportation', 'Experienced trekking guide', 'Hot breakfast included'],
      price: 750000,
      maxParticipants: 30,
    },
    {
      title: 'Thousand Islands Snorkeling Getaway',
      shortDescription: 'Explore pristine islands and underwater wonders',
      description: 'Escape the city for a day of island hopping and snorkeling in the beautiful Thousand Islands. Visit multiple islands, snorkel in crystal-clear waters teeming with colorful fish and coral, and relax on white sand beaches. Perfect for marine life enthusiasts!',
      venue: 'Pramuka Island',
      city: 'Kepulauan Seribu',
      address: 'Pulau Pramuka, Kepulauan Seribu, Jakarta',
      tags: ['snorkeling', 'beach', 'island', 'marine-life'],
      requirements: ['Swimming ability', 'Bring change of clothes', 'Waterproof bag recommended'],
      highlights: ['Visit 3 islands', 'Snorkeling equipment provided', 'Fresh seafood lunch', 'Underwater photography opportunity'],
      price: 550000,
      maxParticipants: 35,
    },
    {
      title: 'Bandung City Food Tour',
      shortDescription: 'Taste the best local delicacies of Bandung',
      description: 'Embark on a culinary journey through Bandung! This guided food tour takes you to the city\'s best-kept secret eateries and popular food spots. Sample traditional Sundanese dishes, street food favorites, and local desserts while learning about Bandung\'s rich culinary heritage.',
      venue: 'Various locations in Bandung',
      city: 'Bandung',
      address: 'Meeting point: Alun-alun Bandung',
      tags: ['food', 'culinary', 'culture', 'local-experience'],
      requirements: ['Come hungry!', 'Comfortable walking shoes', 'Adventurous palate'],
      highlights: ['Visit 6-8 food spots', 'Sample 10+ dishes', 'Expert food guide', 'Learn about local culture'],
      price: 400000,
      maxParticipants: 12,
    },
  ],
  DAYCARE: [
    {
      title: 'Mental Wellness Workshop',
      shortDescription: 'Learn practical tools for managing stress and anxiety',
      description: 'In today\'s fast-paced world, taking care of your mental health is crucial. This workshop provides practical tools and techniques for managing stress, anxiety, and improving overall mental wellness. Led by a licensed psychologist with interactive exercises and group discussions.',
      venue: 'Mindful Space Wellness Center',
      city: 'Jakarta',
      address: 'Jl. Kemang Raya No. 8, Jakarta Selatan',
      tags: ['mental-health', 'wellness', 'stress-management', 'self-care'],
      requirements: ['No prior experience needed', 'Open to sharing in a safe space'],
      highlights: ['Licensed psychologist facilitator', 'Take-home wellness toolkit', 'Small group setting', 'Refreshments provided'],
      price: 350000,
      maxParticipants: 15,
    },
    {
      title: 'Financial Planning 101',
      shortDescription: 'Master the basics of personal finance and investing',
      description: 'Take control of your financial future! This comprehensive workshop covers budgeting, saving strategies, basic investing principles, and retirement planning. Perfect for young professionals and anyone looking to improve their financial literacy. Taught by certified financial planner.',
      venue: 'Smart Money Academy',
      city: 'Jakarta',
      address: 'Jl. Sudirman No. 123, Jakarta Pusat',
      tags: ['finance', 'investment', 'education', 'career'],
      requirements: ['Bring notepad and pen', 'Calculator (or phone)'],
      highlights: ['Certified financial planner', 'Personal finance workbook', 'Q&A session', 'Networking opportunity'],
      price: 500000,
      maxParticipants: 25,
    },
    {
      title: 'Holistic Health Consultation Day',
      shortDescription: 'Get personalized health advice from multiple experts',
      description: 'Comprehensive health day featuring consultations with nutritionists, fitness trainers, and wellness coaches. Get personalized advice on nutrition, exercise, sleep habits, and lifestyle modifications. Includes body composition analysis and customized wellness plan.',
      venue: 'Holistic Health Hub',
      city: 'Surabaya',
      address: 'Jl. HR Muhammad No. 45, Surabaya',
      tags: ['health', 'nutrition', 'fitness', 'wellness'],
      requirements: ['Fasting 8 hours before (for accurate measurements)', 'Comfortable clothing'],
      highlights: ['Body composition analysis', 'Multiple expert consultations', 'Personalized wellness plan', 'Healthy lunch included'],
      price: 800000,
      maxParticipants: 20,
    },
    {
      title: 'Career Development Bootcamp',
      shortDescription: 'Accelerate your career with expert guidance',
      description: 'Fast-track your career growth with this intensive one-day bootcamp. Learn resume optimization, interview techniques, personal branding, and networking strategies from industry experts. Includes mock interviews and personalized feedback.',
      venue: 'Career Excellence Center',
      city: 'Jakarta',
      address: 'Jl. Casablanca No. 88, Jakarta Selatan',
      tags: ['career', 'professional-development', 'networking', 'skills'],
      requirements: ['Bring updated resume', 'LinkedIn profile recommended', 'Professional attire'],
      highlights: ['Industry expert speakers', 'Mock interview sessions', 'Resume review', 'Networking lunch'],
      price: 750000,
      maxParticipants: 30,
    },
    {
      title: 'Art Therapy Workshop',
      shortDescription: 'Express yourself through creative art therapy',
      description: 'Discover the healing power of art in this therapeutic workshop. No artistic experience needed! Explore various art mediums while processing emotions and reducing stress under the guidance of a certified art therapist. A safe space for self-expression and healing.',
      venue: 'Creative Healing Studio',
      city: 'Bandung',
      address: 'Jl. Dago No. 56, Bandung',
      tags: ['art-therapy', 'mental-health', 'creativity', 'wellness'],
      requirements: ['No art experience needed', 'Wear clothes that can get messy', 'Open mind'],
      highlights: ['Certified art therapist', 'All art materials provided', 'Take home your artwork', 'Small group setting'],
      price: 400000,
      maxParticipants: 10,
    },
    {
      title: 'Digital Detox & Mindfulness Retreat',
      shortDescription: 'Disconnect from technology, reconnect with yourself',
      description: 'Take a break from screens and constant connectivity. This one-day retreat combines mindfulness practices, nature walks, journaling, and group discussions. Learn practical strategies for maintaining healthy digital boundaries in your daily life.',
      venue: 'Tranquil Gardens Retreat',
      city: 'Bogor',
      address: 'Jl. Raya Puncak KM 87, Bogor',
      tags: ['digital-detox', 'mindfulness', 'retreat', 'self-care'],
      requirements: ['Leave all devices at check-in', 'Comfortable outdoor clothing', 'Open to disconnecting'],
      highlights: ['Phone-free environment', 'Guided meditation sessions', 'Nature immersion', 'Organic meals included'],
      price: 600000,
      maxParticipants: 20,
    },
  ],
  DAYDREAM: [
    {
      title: 'Stargazing & Astronomy Night',
      shortDescription: 'Explore the cosmos under professional telescopes',
      description: 'Journey through the universe without leaving Earth! This magical evening combines professional stargazing with astronomy education. Use high-powered telescopes to observe planets, stars, and galaxies while learning about constellations and cosmic phenomena from an expert astronomer.',
      venue: 'Mount Tangkuban Perahu Observatory',
      city: 'Bandung',
      address: 'Gunung Tangkuban Perahu, Subang, West Java',
      tags: ['astronomy', 'stargazing', 'science', 'nature'],
      requirements: ['Warm clothing (cold at night)', 'Arrive at sunset', 'Clear weather dependent'],
      highlights: ['Professional telescopes', 'Expert astronomer guide', 'Hot chocolate included', 'Astrophotography tips'],
      price: 450000,
      maxParticipants: 25,
    },
    {
      title: 'Lucid Dreaming Workshop',
      shortDescription: 'Learn to control and explore your dreams',
      description: 'Unlock the fascinating world of lucid dreaming! This workshop teaches you techniques to become aware during dreams and potentially control them. Includes dream journaling exercises, reality-checking methods, and guided visualization practices. Led by certified dream researcher.',
      venue: 'Consciousness Exploration Center',
      city: 'Jakarta',
      address: 'Jl. Tebet Raya No. 34, Jakarta Selatan',
      tags: ['dreams', 'consciousness', 'self-exploration', 'meditation'],
      requirements: ['Keep dream journal for 1 week before', 'Bring notebook', 'Open mindset'],
      highlights: ['Certified dream researcher', 'Dream journal provided', 'Guided meditation session', 'Take-home practice materials'],
      price: 550000,
      maxParticipants: 15,
    },
    {
      title: 'Creative Writing Retreat',
      shortDescription: 'Unleash your storytelling potential in nature',
      description: 'Escape to a serene natural setting and let your creativity flow! This day-long writing retreat includes guided writing exercises, inspiration sessions, and dedicated writing time. Whether you\'re working on a novel, poetry, or personal essays, get expert feedback and support.',
      venue: 'Writer\'s Haven Villa',
      city: 'Ubud',
      address: 'Jl. Raya Ubud No. 78, Ubud, Bali',
      tags: ['writing', 'creativity', 'retreat', 'literature'],
      requirements: ['Bring laptop or notebook', 'Willingness to share work (optional)', 'Any writing level welcome'],
      highlights: ['Published author facilitator', 'Individual feedback sessions', 'Inspiring natural setting', 'Lunch and refreshments'],
      price: 700000,
      maxParticipants: 12,
    },
    {
      title: 'Vision Board Creation Workshop',
      shortDescription: 'Design your future through creative visualization',
      description: 'Turn your dreams into visual reality! This inspiring workshop guides you through creating a powerful vision board that represents your goals and aspirations. Includes goal-setting exercises, manifestation techniques, and all materials needed to create a beautiful board to take home.',
      venue: 'Dream Makers Studio',
      city: 'Jakarta',
      address: 'Jl. Kemang Timur No. 12, Jakarta Selatan',
      tags: ['goal-setting', 'visualization', 'creativity', 'personal-growth'],
      requirements: ['Bring 2-3 magazines (if you have)', 'Photos you love (optional)', 'Clear intention'],
      highlights: ['All craft materials provided', 'Goal-setting worksheet', 'Manifestation guide', 'Inspiring group energy'],
      price: 350000,
      maxParticipants: 18,
    },
    {
      title: 'Sound Healing Journey',
      shortDescription: 'Experience deep relaxation through therapeutic sound',
      description: 'Immerse yourself in the healing vibrations of crystal singing bowls, gongs, and other therapeutic instruments. This transformative sound bath helps reduce stress, promote deep relaxation, and facilitate emotional release. Perfect for anyone seeking deep rest and renewal.',
      venue: 'Harmonic Healing Space',
      city: 'Yogyakarta',
      address: 'Jl. Kaliurang KM 7, Sleman, Yogyakarta',
      tags: ['sound-healing', 'meditation', 'relaxation', 'wellness'],
      requirements: ['Wear comfortable clothes', 'Bring yoga mat and blanket', 'Empty stomach (light meal 2 hours before)'],
      highlights: ['Certified sound healer', 'Crystal singing bowls', 'Guided meditation', 'Herbal tea included'],
      price: 300000,
      maxParticipants: 20,
    },
    {
      title: 'Photography & Mindfulness Walk',
      shortDescription: 'Capture beauty while practicing present moment awareness',
      description: 'Combine the art of photography with mindfulness practice. This walking workshop teaches you to see the world with fresh eyes, capturing beauty in unexpected places while staying fully present. Suitable for all camera types, from smartphones to DSLRs.',
      venue: 'Taman Mini Indonesia Indah',
      city: 'Jakarta',
      address: 'Taman Mini Indonesia Indah, Jakarta Timur',
      tags: ['photography', 'mindfulness', 'art', 'nature'],
      requirements: ['Any camera (phone is fine)', 'Comfortable walking shoes', 'Fully charged device'],
      highlights: ['Professional photographer guide', 'Mindfulness exercises', 'Photo critique session', 'Best photo wins prize'],
      price: 400000,
      maxParticipants: 15,
    },
  ],
};

async function main() {
  console.log('🌱 Starting events seed...');

  // Clear existing events
  await prisma.event.deleteMany();
  console.log('✅ Cleared existing events');

  const today = new Date();
  const threeMonthsFromNow = new Date(today);
  threeMonthsFromNow.setMonth(today.getMonth() + 3);

  let totalCreated = 0;

  // Create events for each category
  for (const [category, templates] of Object.entries(eventTemplates)) {
    console.log(`\n📅 Creating ${category} events...`);

    for (const template of templates) {
      // Create 3-4 instances of each event template with different dates
      const instanceCount = Math.floor(Math.random() * 2) + 3; // 3-4 instances

      for (let i = 0; i < instanceCount; i++) {
        // Random date in the next 3 months
        const eventDate = randomDate(today, threeMonthsFromNow);
        
        // Random start time between 6 AM and 6 PM
        const startHour = Math.floor(Math.random() * 12) + 6;
        const startTime = setTime(new Date(eventDate), startHour);
        
        // End time 2-4 hours after start
        const duration = Math.floor(Math.random() * 3) + 2;
        const endTime = setTime(new Date(eventDate), startHour + duration);

        // Random status with weights (more published events)
        const statusRandom = Math.random();
        let status: EventStatus;
        if (statusRandom < 0.7) status = EventStatus.PUBLISHED;
        else if (statusRandom < 0.85) status = EventStatus.DRAFT;
        else if (statusRandom < 0.95) status = EventStatus.COMPLETED;
        else status = EventStatus.CANCELLED;

        // Random participants (0-80% of max)
        const currentParticipants = Math.floor(
          Math.random() * template.maxParticipants * 0.8
        );

        // Determine if active based on status
        const isActive = status === EventStatus.PUBLISHED || status === EventStatus.DRAFT;

        // Random featured (10% chance)
        const isFeatured = Math.random() < 0.1;

        // Generate slug
        const baseSlug = template.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        const slug = `${baseSlug}-${Date.now()}-${i}`;

        // Random coordinates for the city
        const coordinates = {
          Jakarta: { lat: -6.2088 + (Math.random() - 0.5) * 0.1, lng: 106.8456 + (Math.random() - 0.5) * 0.1 },
          Bandung: { lat: -6.9175 + (Math.random() - 0.5) * 0.1, lng: 107.6191 + (Math.random() - 0.5) * 0.1 },
          Surabaya: { lat: -7.2575 + (Math.random() - 0.5) * 0.1, lng: 112.7521 + (Math.random() - 0.5) * 0.1 },
          Yogyakarta: { lat: -7.7956 + (Math.random() - 0.5) * 0.1, lng: 110.3695 + (Math.random() - 0.5) * 0.1 },
          Bali: { lat: -8.3405 + (Math.random() - 0.5) * 0.1, lng: 115.0920 + (Math.random() - 0.5) * 0.1 },
          Ubud: { lat: -8.5069 + (Math.random() - 0.5) * 0.1, lng: 115.2625 + (Math.random() - 0.5) * 0.1 },
        };

        const cityCoords = coordinates[template.city as keyof typeof coordinates] || 
                          { lat: -6.2088, lng: 106.8456 };

        try {
          await prisma.event.create({
            data: {
              title: template.title,
              slug,
              category: category as EventCategory,
              description: template.description,
              shortDescription: template.shortDescription,
              eventDate,
              startTime,
              endTime,
              venue: template.venue,
              address: template.address,
              city: template.city,
              googleMapsUrl: `https://maps.google.com/?q=${cityCoords.lat},${cityCoords.lng}`,
              latitude: cityCoords.lat,
              longitude: cityCoords.lng,
              bannerImage: null, // Will be uploaded by admin
              price: template.price,
              currency: 'IDR',
              maxParticipants: template.maxParticipants,
              currentParticipants,
              status,
              isActive,
              isFeatured,
              tags: template.tags,
              requirements: template.requirements,
              highlights: template.highlights,
              organizerName: 'DayLight Events Team',
              organizerContact: '+62 812 3456 7890',
            },
          });

          totalCreated++;
        } catch (error) {
          console.error(`Error creating event: ${template.title}`, error);
        }
      }
    }

    console.log(`✅ Created ${category} events`);
  }

  console.log(`\n🎉 Successfully created ${totalCreated} events!`);
  
  // Print summary statistics
  const stats = await prisma.event.groupBy({
    by: ['category', 'status'],
    _count: true,
  });

  console.log('\n📊 Event Statistics:');
  console.log('-------------------');
  
  const categoryStats: Record<string, Record<string, number>> = {};
  stats.forEach(stat => {
    if (!categoryStats[stat.category]) {
      categoryStats[stat.category] = {};
    }
    categoryStats[stat.category][stat.status] = stat._count;
  });

  Object.entries(categoryStats).forEach(([category, statuses]) => {
    console.log(`\n${category}:`);
    Object.entries(statuses).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} events`);
    });
  });

  const totalByStatus = await prisma.event.groupBy({
    by: ['status'],
    _count: true,
  });

  console.log('\n📈 Overall Status:');
  totalByStatus.forEach(stat => {
    console.log(`  ${stat.status}: ${stat._count} events`);
  });

  const featuredCount = await prisma.event.count({
    where: { isFeatured: true },
  });

  console.log(`\n⭐ Featured Events: ${featuredCount}`);
  console.log(`\n✨ Total Events: ${totalCreated}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });