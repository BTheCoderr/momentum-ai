#!/usr/bin/env node

/**
 * 🎯 Momentum AI - Simple Demo Data Generator
 * 
 * This script creates demo data that works with the existing database schema
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

async function createSimpleDemoData() {
  console.log('🎯 Creating Simple Demo Data...\n');
  
  try {
    console.log('1. 🗑️ Cleaning existing demo data...');
    
    // Clean existing demo data
    await supabase.from('user_events').delete().eq('user_id', DEMO_USER_ID);
    await supabase.from('insights').delete().eq('user_id', DEMO_USER_ID);
    await supabase.from('goals').delete().eq('user_id', DEMO_USER_ID);
    
    console.log('✅ Cleaned existing demo data');
    
    console.log('\n2. 🎯 Creating simple goals...');
    
    // Create simple goals without problematic fields
    const goals = [
      {
        user_id: DEMO_USER_ID,
        title: 'Daily Exercise',
        description: 'Exercise for at least 30 minutes every day',
        status: 'active',
        progress: 78
      },
      {
        user_id: DEMO_USER_ID,
        title: 'Learn React Native',
        description: 'Master React Native development',
        status: 'active',
        progress: 65
      },
      {
        user_id: DEMO_USER_ID,
        title: 'Read 30 Minutes Daily',
        description: 'Read books for personal development',
        status: 'active',
        progress: 92
      },
      {
        user_id: DEMO_USER_ID,
        title: 'Complete App Store Submission',
        description: 'Successfully submit Momentum AI to App Store',
        status: 'completed',
        progress: 100
      }
    ];
    
    const { error: goalsError } = await supabase.from('goals').insert(goals);
    if (goalsError) {
      console.error('❌ Error creating goals:', goalsError);
    } else {
      console.log(`✅ Created ${goals.length} demo goals`);
    }
    
    console.log('\n3. 📊 Creating user events (check-ins)...');
    
    // Generate 15 days of user events
    const userEvents = [];
    const dates = [];
    
    // Generate past 15 days
    for (let i = 14; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date);
    }
    
    dates.forEach((date, index) => {
      // Skip some days randomly (85% chance to have data)
      if (Math.random() > 0.15) {
        const mood = ['happy', 'motivated', 'neutral', 'relaxed'][Math.floor(Math.random() * 4)];
        const progress = Math.floor(Math.random() * 30) + 60; // 60-90 range
        const energy = Math.floor(Math.random() * 3) + 7; // 7-10 range
        
        userEvents.push({
          user_id: DEMO_USER_ID,
          event_type: 'daily_check_in',
          timestamp: date.toISOString(),
          mood: mood,
          progress: progress,
          meta: {
            energy_level: energy,
            time_of_day: Math.random() > 0.7 ? 'evening' : 'morning',
            wins: getRandomWin(mood),
            challenges: getRandomChallenge(mood),
            xp_gained: Math.floor(progress / 2) + 10,
            streak_day: Math.floor(index / 2) + 1
          }
        });
      }
    });
    
    const { error: eventsError } = await supabase.from('user_events').insert(userEvents);
    if (eventsError) {
      console.error('❌ Error creating user events:', eventsError);
    } else {
      console.log(`✅ Created ${userEvents.length} user events`);
    }
    
    console.log('\n4. 🧠 Creating AI insights...');
    
    // Generate AI insights
    const insights = [
      {
        user_id: DEMO_USER_ID,
        summary: "🔥 Amazing progress! You've maintained excellent consistency and your energy levels are 40% higher on mornings when you complete your workout first.",
        source: 'ai_pattern_analysis',
        tags: ['streak', 'morning_routine', 'energy_optimization'],
        meta: {
          pattern_type: 'time_optimization',
          confidence: 0.92,
          data_points: 15
        }
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
        }
      },
      {
        user_id: DEMO_USER_ID,
        summary: "🎯 Goal completion prediction: You're 94% likely to complete your 'Read 30 Minutes Daily' goal on time. Your current pace is excellent!",
        source: 'ai_goal_prediction',
        tags: ['goal_prediction', 'success_likelihood', 'reading'],
        meta: {
          prediction_confidence: 0.94,
          completion_probability: 'high'
        }
      },
      {
        user_id: DEMO_USER_ID,
        summary: "🏆 Milestone achieved! You've completed your App Store submission goal. Your dedication to consistent progress made this possible!",
        source: 'ai_celebration',
        tags: ['milestone', 'goal_completion', 'celebration'],
        meta: {
          achievement_type: 'major_goal',
          celebration_level: 'high'
        }
      }
    ];
    
    const { error: insightsError } = await supabase.from('insights').insert(insights);
    if (insightsError) {
      console.error('❌ Error creating insights:', insightsError);
    } else {
      console.log(`✅ Created ${insights.length} AI insights`);
    }
    
    console.log('\n🎉 Simple Demo Data Creation Complete!\n');
    
    console.log('📊 Data Summary:');
    console.log(`✅ ${goals.length} goals (including 1 completed)`);
    console.log(`✅ ${userEvents.length} check-ins over 15 days`);
    console.log(`✅ ${insights.length} AI-generated insights`);
    
    console.log('\n🎯 Perfect for showcasing:');
    console.log('• 📈 Progress Analytics with trend data');
    console.log('• 💡 AI Insights with behavioral patterns');
    console.log('• 🔥 Streak tracking and gamification');
    console.log('• 📊 GitHub-style activity heatmap');
    console.log('• 🎯 Goal completion rates');
    
    console.log('\n📱 Now take screenshots of:');
    console.log('1. Home Screen - GitHub activity grid with data');
    console.log('2. Goals Screen - mix of active and completed goals');
    console.log('3. Insights Screen - swipeable AI insight cards');
    console.log('4. Progress Analytics Screen - charts and metrics');
    
    console.log('\n🚀 Ready for App Store submission!');
    
    // Instructions for using the demo data
    console.log('\n💡 Next Steps:');
    console.log('1. Sign in to your app with email: demo@momentum-ai.com');
    console.log('2. Make sure to use the same user ID in the app');
    console.log('3. Navigate through the screens to see the data');
    console.log('4. Take screenshots in good lighting');
    console.log('5. Use iPhone 15 Pro for best quality');
    
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
      'Maintained perfect focus for 2 hours straight'
    ],
    'motivated': [
      'Started the day with clear priorities',
      'Made significant progress on learning goals',
      'Stayed consistent with healthy habits'
    ],
    'neutral': [
      'Completed essential tasks on schedule',
      'Kept up with daily routines',
      'Made incremental improvements'
    ],
    'relaxed': [
      'Enjoyed a peaceful morning routine',
      'Balanced work with self-care',
      'Took time for reflection'
    ]
  };
  
  const moodWins = wins[mood] || wins['neutral'];
  return moodWins[Math.floor(Math.random() * moodWins.length)];
}

function getRandomChallenge(mood) {
  const challenges = {
    'happy': ['Had to pace myself to avoid burnout'],
    'motivated': ['Overcame initial procrastination'],
    'neutral': ['Pushed through low motivation periods'],
    'relaxed': ['Avoided being too passive']
  };
  
  const moodChallenges = challenges[mood] || challenges['neutral'];
  return moodChallenges[Math.floor(Math.random() * moodChallenges.length)];
}

// Run the demo data creation
createSimpleDemoData(); 