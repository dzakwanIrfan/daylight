import { PersonalityArchetype, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedArchetypeDetails() {
  console.log('🌱 Seeding archetype details...');

  const archetypes = [
  {
      archetype: PersonalityArchetype.BRIGHT_MORNING,
      symbol: '☀️',
      name: 'Bright Morning',
      traits: ['Optimistic', 'Energetic', 'Outgoing'],
      description: 'You bring fresh energy wherever you go. The kind of person who starts the conversation — and the laughter.',
      imageKey: 'bright-morning',
  },
  {
      archetype: PersonalityArchetype.CALM_DAWN,
      symbol: '🌅',
      name: 'Calm Dawn',
      traits: ['Gentle', 'Thoughtful', 'Warm'],
      description: 'You move at your own rhythm. People feel comfortable around you — grounded, kind, quietly confident.',
      imageKey: 'calm-dawn',
  },
  {
      archetype: PersonalityArchetype.BOLD_NOON,
      symbol: '☀️',
      name: 'Bold Noon',
      traits: ['Driven', 'Focused', 'Inspiring'],
      description: 'The go-getter of every table. You lead naturally, keep things on track, and turn ideas into plans.',
      imageKey: 'bold-noon',
  },
  {
      archetype: PersonalityArchetype.GOLDEN_HOUR,
      symbol: '🌇',
      name: 'Golden Hour',
      traits: ['Charismatic', 'Expressive', 'Radiant'],
      description: 'You light up rooms with your stories and laughter. Effortlessly social, you make everyone feel seen.',
      imageKey: 'golden-hour',
  },
  {
      archetype: PersonalityArchetype.QUIET_DUSK,
      symbol: '🌙',
      name: 'Quiet Dusk',
      traits: ['Deep', 'Analytical', 'Reflective'],
      description: "You're the thinker who listens before you speak — insightful, calm, and full of perspective.",
      imageKey: 'quiet-dusk',
  },
  {
      archetype: PersonalityArchetype.CLOUDY_DAY,
      symbol: '☁️',
      name: 'Cloudy Day',
      traits: ['Creative', 'Empathetic', 'Dreamy'],
      description: 'You see beauty in small moments. Often reserved, but when you open up, your words hit deep.',
      imageKey: 'cloudy-day',
  },
  {
      archetype: PersonalityArchetype.SERENE_DRIZZLE,
      symbol: '🌧️',
      name: 'Serene Drizzle',
      traits: ['Loyal', 'Calm', 'Supportive'],
      description: "You don't chase attention — you create peace. You're the steady soul who listens and understands.",
      imageKey: 'serene-drizzle',
  },
  {
      archetype: PersonalityArchetype.BLAZING_NOON,
      symbol: '🔥',
      name: 'Blazing Noon',
      traits: ['Passionate', 'Decisive', 'Fearless'],
      description: 'You bring heat and direction. When others hesitate, you move — pure action and confidence.',
      imageKey: 'blazing-noon',
  },
  {
      archetype: PersonalityArchetype.STARRY_NIGHT,
      symbol: '⭐',
      name: 'Starry Night',
      traits: ['Visionary', 'Independent', 'Intuitive'],
      description: 'You live in ideas and imagination. You connect through stories, purpose, and shared curiosity.',
      imageKey: 'starry-night',
  },
  {
      archetype: PersonalityArchetype.PERFECT_DAY,
      symbol: '🌈',
      name: 'Perfect Day',
      traits: ['Balanced', 'Adaptable', 'Easygoing'],
      description: "You flow between energies with grace — social when needed, quiet when it counts. You're harmony itself.",
      imageKey: 'perfect-day',
  },
];

for (const detail of archetypes) {
  await prisma.archetypeDetail.upsert({
      where: { archetype: detail.archetype },
      update: detail,
      create: detail,
  });
}
  console.log('✅ Archetype details seeded');
}

seedArchetypeDetails()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });