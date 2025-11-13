import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting enhanced seed...');

  // Clear existing data
  await prisma.questionOption.deleteMany();
  await prisma.question.deleteMany();

  // Section 1: Core Personality & Social Energy (Q1-Q5)
  
  // Q1: Energy - Meeting new people
  await prisma.question.create({
    data: {
      questionNumber: 1,
      section: 'Core Personality & Social Energy',
      prompt: 'When meeting new people, you usually...',
      type: 'single',
      order: 1,
      isActive: true,
      options: {
        create: [
          {
            optionKey: 'A',
            text: 'Feel excited to talk and engage.',
            traitImpacts: { E: 10 },
          },
          {
            optionKey: 'B',
            text: 'Observe quietly before joining in.',
            traitImpacts: { E: -10 },
          },
        ],
      },
    },
  });

  // Q2: Energy - Recharge style
  await prisma.question.create({
    data: {
      questionNumber: 2,
      section: 'Core Personality & Social Energy',
      prompt: 'After a long week, what helps you recharge?',
      type: 'single',
      order: 2,
      isActive: true,
      options: {
        create: [
          {
            optionKey: 'A',
            text: 'Going out or being around others.',
            traitImpacts: { E: 10 },
          },
          {
            optionKey: 'B',
            text: 'Alone time, reflection, or creative work.',
            traitImpacts: { E: -10 },
          },
        ],
      },
    },
  });

  // Q3: Openness - Conversation type (FIXED: deep=Openness, light=less open)
  await prisma.question.create({
    data: {
      questionNumber: 3,
      section: 'Core Personality & Social Energy',
      prompt: 'What type of conversation do you enjoy most?',
      type: 'single',
      order: 3,
      isActive: true,
      options: {
        create: [
          {
            optionKey: 'A',
            text: 'Light and funny.',
            traitImpacts: { O: -10 },
          },
          {
            optionKey: 'B',
            text: 'Deep and meaningful.',
            traitImpacts: { O: 10 },
          },
        ],
      },
    },
  });

  // Q4: Structure - Plan changes
  await prisma.question.create({
    data: {
      questionNumber: 4,
      section: 'Core Personality & Social Energy',
      prompt: 'When plans change last-minute, how do you feel?',
      type: 'single',
      order: 4,
      isActive: true,
      options: {
        create: [
          {
            optionKey: 'A',
            text: 'Love it — I enjoy surprises.',
            traitImpacts: { S: 10 },
          },
          {
            optionKey: 'B',
            text: 'Prefer structure and clarity.',
            traitImpacts: { S: -10 },
          },
        ],
      },
    },
  });

  // Q5: Affect - Problem response
  await prisma.question.create({
    data: {
      questionNumber: 5,
      section: 'Core Personality & Social Energy',
      prompt: 'When friends share a problem, you tend to...',
      type: 'single',
      order: 5,
      isActive: true,
      options: {
        create: [
          {
            optionKey: 'A',
            text: 'Empathize and comfort them.',
            traitImpacts: { A: 10 },
          },
          {
            optionKey: 'B',
            text: 'Help them think logically and find solutions.',
            traitImpacts: { A: -10 },
          },
        ],
      },
    },
  });

  // Section 2: Relationship & Life Context (Q6-Q8)
  // These are context questions, moved to separate flow

  // Section 3: Lifestyle & Social Comfort (Q9-Q12)
  
  // Q6: Lifestyle tier (was Q9)
  await prisma.question.create({
    data: {
      questionNumber: 6,
      section: 'Lifestyle & Social Comfort',
      prompt: 'What type of café/restaurant do you usually go to?',
      type: 'single',
      order: 6,
      isActive: true,
      options: {
        create: [
          {
            optionKey: 'A',
            text: 'Cozy local spots (IDR 50K-150K per meal)',
            traitImpacts: { L: 1 },
          },
          {
            optionKey: 'B',
            text: 'Trendy mid-range cafés (IDR 150K-300K)',
            traitImpacts: { L: 2 },
          },
          {
            optionKey: 'C',
            text: 'Fine dining or premium spots (IDR 300K+)',
            traitImpacts: { L: 3 },
          },
        ],
      },
    },
  });

  // Q7: Weekend activity (was Q10)
  await prisma.question.create({
    data: {
      questionNumber: 7,
      section: 'Lifestyle & Social Comfort',
      prompt: "What's your ideal weekend activity?",
      type: 'single',
      order: 7,
      isActive: true,
      options: {
        create: [
          {
            optionKey: 'A',
            text: 'Reading or journaling',
            traitImpacts: { E: -5, O: 5 },
          },
          {
            optionKey: 'B',
            text: 'Outdoor adventures',
            traitImpacts: { E: 5, O: 5 },
          },
          {
            optionKey: 'C',
            text: 'Café hopping or art events',
            traitImpacts: { E: 3, O: 5 },
          },
          {
            optionKey: 'D',
            text: 'Workout or yoga session',
            traitImpacts: { E: 0, O: -2 },
          },
        ],
      },
    },
  });

  // Q8: Music vibe (was Q11)
  await prisma.question.create({
    data: {
      questionNumber: 8,
      section: 'Lifestyle & Social Comfort',
      prompt: 'Which music vibe feels most like you?',
      type: 'single',
      order: 8,
      isActive: true,
      options: {
        create: [
          {
            optionKey: 'A',
            text: 'Jazz / Lo-Fi',
            traitImpacts: { O: 6 },
          },
          {
            optionKey: 'B',
            text: 'Pop / R&B',
            traitImpacts: { O: 2 },
          },
          {
            optionKey: 'C',
            text: 'Indie / Alternative',
            traitImpacts: { O: 6 },
          },
          {
            optionKey: 'D',
            text: 'EDM / Dance',
            traitImpacts: { O: -2 },
          },
        ],
      },
    },
  });

  // Q9: Movie genre (was Q12)
  await prisma.question.create({
    data: {
      questionNumber: 9,
      section: 'Lifestyle & Social Comfort',
      prompt: 'What movie genre do you love most?',
      type: 'single',
      order: 9,
      isActive: true,
      options: {
        create: [
          {
            optionKey: 'A',
            text: 'Romance / Drama',
            traitImpacts: { A: 6 },
          },
          {
            optionKey: 'B',
            text: 'Comedy',
            traitImpacts: { A: 2 },
          },
          {
            optionKey: 'C',
            text: 'Thriller / Mystery',
            traitImpacts: { A: -2 },
          },
          {
            optionKey: 'D',
            text: 'Documentary / Biopic',
            traitImpacts: { A: -6 },
          },
        ],
      },
    },
  });

  // Section 4: Openness & Social Behavior (Q13-Q15)
  
  // Q10: Meet strangers (was Q13)
  await prisma.question.create({
    data: {
      questionNumber: 10,
      section: 'Openness & Social Behavior',
      prompt: 'How do you feel about meeting complete strangers?',
      type: 'single',
      order: 10,
      isActive: true,
      options: {
        create: [
          {
            optionKey: 'A',
            text: 'Excited — I love new people.',
            traitImpacts: { C: 10 },
          },
          {
            optionKey: 'B',
            text: "Nervous, but I'll try.",
            traitImpacts: { C: 5 },
          },
          {
            optionKey: 'C',
            text: 'I prefer smaller, safer groups.',
            traitImpacts: { C: 2 },
          },
        ],
      },
    },
  });

  // Q11: Communication style (was Q14)
  await prisma.question.create({
    data: {
      questionNumber: 11,
      section: 'Openness & Social Behavior',
      prompt: 'What best describes your communication style?',
      type: 'single',
      order: 11,
      isActive: true,
      options: {
        create: [
          {
            optionKey: 'A',
            text: 'Talkative and expressive',
            traitImpacts: { E: 8 },
          },
          {
            optionKey: 'B',
            text: 'Balanced — I talk and listen equally',
            traitImpacts: { E: 4 },
          },
          {
            optionKey: 'C',
            text: 'Reserved but thoughtful',
            traitImpacts: { E: -8 },
          },
        ],
      },
    },
  });

  // Q12: Ideal connection (was Q15)
  await prisma.question.create({
    data: {
      questionNumber: 12,
      section: 'Openness & Social Behavior',
      prompt: 'How would you describe your ideal connection?',
      type: 'single',
      order: 12,
      isActive: true,
      options: {
        create: [
          {
            optionKey: 'A',
            text: 'Playful and fun',
            traitImpacts: { A: 3, O: -2 },
          },
          {
            optionKey: 'B',
            text: 'Deep and meaningful',
            traitImpacts: { A: 8, O: 6 },
          },
          {
            optionKey: 'C',
            text: 'Inspiring and intellectual',
            traitImpacts: { A: 4, O: 8 },
          },
          {
            optionKey: 'D',
            text: 'Calm and comfortable',
            traitImpacts: { A: 6, O: 2 },
          },
        ],
      },
    },
  });

  console.log('✅ Enhanced seed completed successfully!');
  console.log(`Created 12 core questions + 3 context questions (separate flow)`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });