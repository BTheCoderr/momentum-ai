#!/usr/bin/env node

/**
 * 🎯 Momentum AI - Demo Data Generator
 * 
 * This script creates realistic demo data to showcase all analytics and productivity features
 * for App Store screenshots. It generates 30 days of realistic user behavior data.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.log('Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Demo user ID - use consistent ID for demo
const DEMO_USER_ID = 'demo-user-2024';

// Helper function to generate dates for the past 30 days
function generatePastDates(days = 30) {
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date);
  }
  return dates;
}

// Generate realistic productivity patterns
function generateProductivityPattern(date, dayIndex) {
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  // Base productivity levels
  let baseMood = 'motivated';
  let baseProgress = 70;
  let baseEnergy = 7;
  
  // Weekend patterns
  if (isWeekend) {
    baseMood = Math.random() > 0.3 ? 'relaxed' : 'motivated';
    baseProgress = Math.random() > 0.4 ? 60 : 40;
    baseEnergy = Math.random() > 0.5 ? 6 : 8;
  }
  
  // Monday motivation
  if (dayOfWeek === 1) {
    baseMood = 'motivated';
    baseProgress = 75;
    baseEnergy = 8;
  }
  
  // Mid-week slump
  if (dayOfWeek === 3 || dayOfWeek === 4) {
    if (Math.random() > 0.6) {
      baseMood = 'neutral';
      baseProgress = 55;
      baseEnergy = 5;
    }
  }
  
  // Friday energy
  if (dayOfWeek === 5) {
    baseMood = Math.random() > 0.2 ? 'happy' : 'motivated';
    baseProgress = 80;
    baseEnergy = 8;
  }
  
  // Add some randomness but trending upward over time
  const trendBonus = Math.floor(dayIndex / 5) * 2; // Slight improvement over time
  const randomVariation = (Math.random() - 0.5) * 20;
  
  return {
    mood: baseMood,
    progress: Math.max(10, Math.min(100, baseProgress + trendBonus + randomVariation)),
    energy: Math.max(1, Math.min(10, baseEnergy + Math.floor(trendBonus / 10))),
    timeOfDay: Math.random() > 0.7 ? 'evening' : 'morning'
  };
}

async function createDemoData() {
  console.log('🎯 Creating Momentum AI Demo Data...\n');
  
  try {
    console.log('1. 🗑️ Cleaning existing demo data...');
    
    // Clean existing demo data
    await supabase.from('user_events').delete().eq('user_id', DEMO_USER_ID);
    await supabase.from('insights').delete().eq('user_id', DEMO_USER_ID);
    await supabase.from('goals').delete().eq('user_id', DEMO_USER_ID);
    await supabase.from('checkins').delete().eq('user_id', DEMO_USER_ID);
    
    console.log('✅ Cleaned existing demo data');
    
    console.log('\n2. 🎯 Creating demo goals...');
    
    // Create realistic goals
    const goals = [
      {
        id: 'goal-1-fitness',
        user_id: DEMO_USER_ID,
        title: 'Daily Exercise',
        description: 'Exercise for at least 30 minutes every day to build strength and endurance',
        status: 'active',
        progress: 78,
        category: 'health',
        target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        habits: ['morning_run', 'yoga', 'strength_training'],
        meta: { xp_per_completion: 50, difficulty: 'medium' }
      },
      {
        id: 'goal-2-learning',
        user_id: DEMO_USER_ID,
        title: 'Learn React Native',
        description: 'Master React Native development for building mobile apps',
        status: 'active',
        progress: 65,
        category: 'learning',
        target_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        habits: ['daily_coding', 'tutorial_watching', 'project_building'],
        meta: { xp_per_completion: 75, difficulty: 'hard' }
      },
      {
        id: 'goal-3-reading',
        user_id: DEMO_USER_ID,
        title: 'Read 30 Minutes Daily',
        description: 'Read books for personal and professional development',
        status: 'active',
        progress: 92,
        category: 'personal',
        target_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        habits: ['morning_reading', 'audiobooks'],
        meta: { xp_per_completion: 30, difficulty: 'easy' }
      },
      {
        id: 'goal-4-meditation',
        user_id: DEMO_USER_ID,
        title: 'Daily Meditation',
        description: 'Practice mindfulness meditation for 10 minutes daily',
        status: 'active',
        progress: 55,
        category: 'wellness',
        target_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        habits: ['morning_meditation', 'breathing_exercises'],
        meta: { xp_per_completion: 25, difficulty: 'medium' }
      },
      {
        id: 'goal-5-completed',
        user_id: DEMO_USER_ID,
        title: 'Complete App Store Submission',
        description: 'Successfully submit Momentum AI to the App Store',
        status: 'completed',
        progress: 100,
        category: 'career',
        target_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        habits: ['app_development', 'testing', 'documentation'],
        meta: { xp_per_completion: 200, difficulty: 'hard' }
      }
    ];
    
    const { error: goalsError } = await supabase.from('goals').insert(goals);
    if (goalsError) {
      console.error('❌ Error creating goals:', goalsError);
    } else {
      console.log(`✅ Created ${goals.length} demo goals`);
    }
    
    console.log('\n3. 📊 Generating 30 days of check-in data...');
    
    // Generate 30 days of realistic check-in data
    const dates = generatePastDates(30);
    const checkIns = [];
    const userEvents = [];
    
    let currentStreak = 0;
    let totalXP = 0;
    
    dates.forEach((date, index) => {
      const pattern = generateProductivityPattern(date, index);
      const shouldSkip = Math.random() > 0.85; // 15% chance to skip a day
      
      if (!shouldSkip) {
        currentStreak++;
        totalXP += Math.floor(pattern.progress / 2) + 10;
        
        // Check-in data
        checkIns.push({
          user_id: DEMO_USER_ID,
          mood: pattern.mood,
          energy: pattern.energy,
          progress: Math.floor(pattern.progress),
          wins: getRandomWin(pattern.mood),
          challenges: getRandomChallenge(pattern.mood),
          tomorrow_plan: getRandomPlan(),
          created_at: date.toISOString(),
          updated_at: date.toISOString()
        });
        
        // User events for analytics
        userEvents.push({
          user_id: DEMO_USER_ID,
          event_type: 'daily_check_in',
          timestamp: date.toISOString(),
          mood: pattern.mood,
          progress: Math.floor(pattern.progress),
          meta: {
            energy_level: pattern.energy,
            time_of_day: pattern.timeOfDay,
            xp_gained: Math.floor(pattern.progress / 2) + 10,
            streak_day: currentStreak
          }
        });
        
        // Add some goal-specific events
        if (Math.random() > 0.3) {
          const randomGoal = goals[Math.floor(Math.random() * goals.length)];
          userEvents.push({
            user_id: DEMO_USER_ID,
            event_type: 'goal_progress',
            timestamp: date.toISOString(),
            goal_id: randomGoal.id,
            progress: Math.floor(Math.random() * 30) + 10,
            meta: {
              goal_title: randomGoal.title,
              category: randomGoal.category,
              session_duration: Math.floor(Math.random() * 60) + 15
            }
          });
        }
      } else {
        currentStreak = 0; // Reset streak on skip
      }
    });
    
    // Insert check-ins
    const { error: checkInsError } = await supabase.from('checkins').insert(checkIns);
    if (checkInsError) {
      console.error('❌ Error creating check-ins:', checkInsError);
    } else {
      console.log(`✅ Created ${checkIns.length} check-ins`);
    }
    
    // Insert user events
    const { error: eventsError } = await supabase.from('user_events').insert(userEvents);
    if (eventsError) {
      console.error('❌ Error creating user events:', eventsError);
    } else {
      console.log(`✅ Created ${userEvents.length} user events`);
    }
    
    console.log('\n4. 🧠 Generating AI insights...');
    
    // Generate realistic AI insights
    const insights = [
      {
        user_id: DEMO_USER_ID,
        summary: "🔥 Amazing progress! You've maintained a 12-day streak and your consistency is paying off. Your energy levels are 40% higher on mornings when you complete your workout first.",
        source: 'ai_pattern_analysis',
        tags: ['streak', 'morning_routine', 'energy_optimization'],
        meta: {
          pattern_type: 'time_optimization',
          confidence: 0.92,
          data_points: 23
        },
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        user_id: DEMO_USER_ID,
        summary: "💡 Pattern detected: Your productivity peaks on Mondays and Fridays. Consider scheduling your most challenging tasks during these high-energy periods.",
        source: 'ai_behavioral_analysis',
        tags: ['productivity_patterns', 'weekly_trends', 'optimization'],
        meta: {
          pattern_type: 'weekly_optimization',
          confidence: 0.87,
          best_days: ['Monday', 'Friday']
        },
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        user_id: DEMO_USER_ID,
        summary: "🎯 Goal completion prediction: You're 94% likely to complete your 'Read 30 Minutes Daily' goal on time. Your current pace is excellent!",
        source: 'ai_goal_prediction',
        tags: ['goal_prediction', 'success_likelihood', 'reading'],
        meta: {
          goal_id: 'goal-3-reading',
          prediction_confidence: 0.94,
          completion_probability: 'high'
        },
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        user_id: DEMO_USER_ID,
        summary: "⚡ Energy optimization: Your energy dips mid-week (Wednesday-Thursday). Try breaking larger tasks into smaller chunks during these days.",
        source: 'ai_energy_analysis',
        tags: ['energy_management', 'mid_week_slump', 'task_planning'],
        meta: {
          pattern_type: 'energy_optimization',
          low_energy_days: ['Wednesday', 'Thursday'],
          suggested_strategy: 'task_chunking'
        },
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        user_id: DEMO_USER_ID,
        summary: "🏆 Milestone achieved! You've completed your App Store submission goal. Your dedication to consistent progress made this possible. Time to celebrate and set your next challenge!",
        source: 'ai_celebration',
        tags: ['milestone', 'goal_completion', 'celebration'],
        meta: {
          goal_id: 'goal-5-completed',
          achievement_type: 'major_goal',
          celebration_level: 'high'
        },
        created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    const { error: insightsError } = await supabase.from('insights').insert(insights);
    if (insightsError) {
      console.error('❌ Error creating insights:', insightsError);
    } else {
      console.log(`✅ Created ${insights.length} AI insights`);
    }
    
    console.log('\n🎉 Demo Data Creation Complete!\n');
    
    console.log('📊 Data Summary:');
    console.log(`✅ ${goals.length} goals (including 1 completed)`);
    console.log(`✅ ${checkIns.length} check-ins over 30 days`);
    console.log(`✅ ${userEvents.length} user events for analytics`);
    console.log(`✅ ${insights.length} AI-generated insights`);
    console.log(`✅ Current streak: ${currentStreak} days`);
    console.log(`✅ Total XP earned: ${totalXP}`);
    
    console.log('\n🎯 Perfect for showcasing:');
    console.log('• 📈 Progress Analytics with real trend data');
    console.log('• 💡 AI Insights with behavioral patterns');
    console.log('• 🔥 Streak tracking and gamification');
    console.log('• 📊 GitHub-style activity heatmap');
    console.log('• 🎯 Goal completion rates and predictions');
    console.log('• ⚡ Energy and productivity patterns');
    
    console.log('\n📱 Now you can take screenshots of:');
    console.log('1. Progress Analytics Screen - shows trends and metrics');
    console.log('2. Insights Screen - swipeable AI insights cards');
    console.log('3. Goals Screen - mix of active and completed goals');
    console.log('4. Home Screen - GitHub activity grid with data');
    console.log('5. Analysis Screen - detailed progress visualizations');
    
    console.log('\n🚀 Ready for App Store submission!');
    
  } catch (error) {
    console.error('❌ Error creating demo data:', error);
  }
}

// Helper functions for realistic content
function getRandomWin(mood) {
  const wins = {
    'happy': [
      'Completed morning workout and felt amazing',
      'Had a breakthrough on my project',
      'Maintained perfect focus for 2 hours straight',
      'Finished reading a challenging chapter',
      'Hit all my daily targets early'
    ],
    'motivated': [
      'Started the day with clear priorities',
      'Made significant progress on learning goals',
      'Stayed consistent with healthy habits',
      'Pushed through initial resistance',
      'Built momentum for tomorrow'
    ],
    'neutral': [
      'Maintained steady progress despite challenges',
      'Completed essential tasks on schedule',
      'Kept up with daily routines',
      'Made incremental improvements',
      'Stayed on track with goals'
    ],
    'relaxed': [
      'Enjoyed a peaceful morning routine',
      'Balanced work with self-care',
      'Took time for reflection',
      'Recharged energy levels',
      'Maintained gentle progress'
    ]
  };
  
  const moodWins = wins[mood] || wins['neutral'];
  return moodWins[Math.floor(Math.random() * moodWins.length)];
}

function getRandomChallenge(mood) {
  const challenges = {
    'happy': [
      'Almost got distracted by excitement',
      'Had to pace myself to avoid burnout',
      'Managed high energy effectively'
    ],
    'motivated': [
      'Overcame initial procrastination',
      'Balanced ambition with realistic expectations',
      'Stayed focused despite external distractions'
    ],
    'neutral': [
      'Pushed through low motivation periods',
      'Dealt with unexpected interruptions',
      'Maintained consistency despite fatigue'
    ],
    'relaxed': [
      'Avoided being too passive',
      'Balanced rest with necessary action',
      'Maintained gentle accountability'
    ]
  };
  
  const moodChallenges = challenges[mood] || challenges['neutral'];
  return moodChallenges[Math.floor(Math.random() * moodChallenges.length)];
}

function getRandomPlan() {
  const plans = [
    'Start with the most important task first',
    'Block time for deep work sessions',
    'Prepare everything the night before',
    'Take regular breaks to maintain energy',
    'Focus on one goal at a time',
    'Begin with a 10-minute warmup routine',
    'Set clear boundaries for focused work',
    'Celebrate small wins throughout the day'
  ];
  
  return plans[Math.floor(Math.random() * plans.length)];
}

// Run the demo data creation
createDemoData();