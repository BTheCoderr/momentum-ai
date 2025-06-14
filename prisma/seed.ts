import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create test user
  const testUser = await prisma.user.upsert({
    where: { email: 'test@momentum-ai.com' },
    update: {},
    create: {
      email: 'test@momentum-ai.com',
      name: 'Test User',
      emailVerified: new Date(),
    },
  })

  console.log('✅ Created test user:', testUser.email)

  // Create sample goals
  const goal1 = await prisma.goal.upsert({
    where: { id: 'goal-1' },
    update: {},
    create: {
      id: 'goal-1',
      title: 'Launch My SaaS Product',
      description: 'Build and launch my first SaaS product to generate passive income',
      emotionalContext: 'I want financial freedom and the ability to work on my own terms',
      deadline: new Date('2024-06-01'),
      progress: 65,
      status: 'active',
      userId: testUser.id,
      habits: {
        create: [
          { text: 'Code for 2 hours daily', order: 0 },
          { text: 'Research competitors', order: 1 },
          { text: 'Write marketing content', order: 2 },
          { text: 'Network with potential users', order: 3 },
        ]
      }
    },
  })

  const goal2 = await prisma.goal.upsert({
    where: { id: 'goal-2' },
    update: {},
    create: {
      id: 'goal-2',
      title: 'Get in Shape',
      description: 'Lose 20 pounds and build muscle through consistent exercise',
      emotionalContext: 'I want to feel confident and energetic in my body',
      deadline: new Date('2024-05-01'),
      progress: 40,
      status: 'active',
      userId: testUser.id,
      habits: {
        create: [
          { text: 'Workout 4x per week', order: 0 },
          { text: 'Track calories daily', order: 1 },
          { text: 'Drink 8 glasses of water', order: 2 },
          { text: 'Get 8 hours of sleep', order: 3 },
        ]
      }
    },
  })

  console.log('✅ Created sample goals:', goal1.title, goal2.title)

  // Create sample check-ins (using correct model name)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  const checkIn1 = await prisma.dailyCheckIn.create({
    data: {
      date: yesterday,
      goalId: goal1.id,
      completedHabits: ['Code for 2 hours daily', 'Research competitors'],
      mood: 8,
      notes: 'Great progress on the authentication system today!',
      userId: testUser.id,
    },
  })

  const checkIn2 = await prisma.dailyCheckIn.create({
    data: {
      date: yesterday,
      goalId: goal2.id,
      completedHabits: ['Workout 4x per week', 'Drink 8 glasses of water'],
      mood: 7,
      notes: 'Had a solid workout session at the gym.',
      userId: testUser.id,
    },
  })

  console.log('✅ Created sample check-ins')

  // Create sample AI messages (using correct model name)
  const messages = [
    {
      content: 'Welcome to Momentum AI! I\'m here to help you stay accountable to your goals. How are you feeling about your progress today?',
      type: 'greeting',
      sender: 'ai',
      userId: testUser.id,
    },
    {
      content: 'I\'m excited to get started! I have two main goals I want to work on.',
      type: 'response',
      sender: 'user',
      userId: testUser.id,
    },
    {
      content: 'That\'s fantastic! I can see you\'re working on launching a SaaS product and getting in shape. Both are ambitious goals that require consistency. Based on your recent check-ins, you\'re making solid progress on your coding habits. What\'s been your biggest challenge so far?',
      type: 'insight',
      sender: 'ai',
      userId: testUser.id,
    },
  ]

  for (const messageData of messages) {
    await prisma.message.create({ data: messageData })
  }

  console.log('✅ Created sample AI conversation')

  // Create sample AI insights (using correct model name)
  await prisma.aIInsight.create({
    data: {
      type: 'motivation_dip',
      title: 'Motivation Dip Detected',
      description: 'Your fitness goal shows 20% less activity this week. Consider scheduling a workout buddy session.',
      actionable: true,
      userId: testUser.id,
    },
  })

  await prisma.aIInsight.create({
    data: {
      type: 'pattern_recognition',
      title: 'Strong Momentum',
      description: 'Your SaaS project is ahead of schedule! This aligns with your pattern of weekend productivity.',
      actionable: false,
      userId: testUser.id,
    },
  })

  console.log('✅ Created sample AI insights')
  console.log('🎉 Database seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  }) 