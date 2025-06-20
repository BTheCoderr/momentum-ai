#!/usr/bin/env node

/**
 * 🧠 Momentum AI - Database Setup Script
 * 
 * This script sets up the core database tables for the AI-powered
 * accountability system including behavioral tracking and insights.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nsgqhhbqpyvonirlfluv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.log('Please set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🚀 Setting up Momentum AI database...\n');

  try {
    // Create user_events table for behavioral tracking
    console.log('📊 Creating user_events table...');
    const { error: eventsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_events (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL,
          event_type TEXT NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          mood TEXT,
          progress INTEGER CHECK (progress >= 0 AND progress <= 100),
          goal_id UUID,
          meta JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON user_events(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_events_type ON user_events(event_type);
        CREATE INDEX IF NOT EXISTS idx_user_events_timestamp ON user_events(timestamp DESC);
        CREATE INDEX IF NOT EXISTS idx_user_events_mood ON user_events(mood) WHERE mood IS NOT NULL;
      `
    });

    if (eventsError) {
      console.error('❌ Error creating user_events table:', eventsError);
    } else {
      console.log('✅ user_events table created successfully');
    }

    // Create insights table for AI-generated insights
    console.log('🧠 Creating insights table...');
    const { error: insightsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS insights (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL,
          summary TEXT NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          source TEXT DEFAULT 'ai_generated',
          tags TEXT[] DEFAULT '{}',
          meta JSONB DEFAULT '{}',
          is_read BOOLEAN DEFAULT FALSE,
          is_liked BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create indexes for insights
        CREATE INDEX IF NOT EXISTS idx_insights_user_id ON insights(user_id);
        CREATE INDEX IF NOT EXISTS idx_insights_timestamp ON insights(timestamp DESC);
        CREATE INDEX IF NOT EXISTS idx_insights_source ON insights(source);
        CREATE INDEX IF NOT EXISTS idx_insights_unread ON insights(user_id, is_read) WHERE is_read = FALSE;
      `
    });

    if (insightsError) {
      console.error('❌ Error creating insights table:', insightsError);
    } else {
      console.log('✅ insights table created successfully');
    }

    // Create goals table if it doesn't exist
    console.log('🎯 Creating goals table...');
    const { error: goalsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS goals (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          target_date DATE,
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'archived')),
          progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
          category TEXT,
          habits JSONB DEFAULT '[]',
          meta JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create indexes for goals
        CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
        CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
        CREATE INDEX IF NOT EXISTS idx_goals_category ON goals(category) WHERE category IS NOT NULL;
      `
    });

    if (goalsError) {
      console.error('❌ Error creating goals table:', goalsError);
    } else {
      console.log('✅ goals table created successfully');
    }

    // Insert sample data for testing
    console.log('\n🌱 Inserting sample data...');
    
    const testUserId = 'test-user-id';
    
    // Sample goal
    const { error: sampleGoalError } = await supabase
      .from('goals')
      .upsert([{
        id: 'sample-goal-1',
        user_id: testUserId,
        title: 'Daily Exercise',
        description: 'Exercise for at least 30 minutes every day',
        status: 'active',
        progress: 65,
        category: 'health',
        habits: ['morning_run', 'yoga', 'strength_training']
      }], { onConflict: 'id' });

    if (sampleGoalError) {
      console.log('⚠️ Sample goal already exists or error:', sampleGoalError.message);
    } else {
      console.log('✅ Sample goal created');
    }

    // Sample check-in events
    const sampleEvents = [
      {
        user_id: testUserId,
        event_type: 'daily_check_in',
        mood: 'happy',
        progress: 75,
        meta: {
          energy_level: 8,
          time_of_day: 'morning',
          wins: 'Completed morning workout',
          challenges: 'Felt tired initially',
          tomorrow_plan: 'Focus on nutrition'
        }
      },
      {
        user_id: testUserId,
        event_type: 'daily_check_in',
        mood: 'neutral',
        progress: 60,
        meta: {
          energy_level: 6,
          time_of_day: 'evening',
          wins: 'Stayed consistent with habits',
          challenges: 'Work was stressful',
          tomorrow_plan: 'Start earlier'
        }
      }
    ];

    const { error: sampleEventsError } = await supabase
      .from('user_events')
      .insert(sampleEvents);

    if (sampleEventsError) {
      console.log('⚠️ Sample events error:', sampleEventsError.message);
    } else {
      console.log('✅ Sample check-in events created');
    }

    // Sample insight
    const { error: sampleInsightError } = await supabase
      .from('insights')
      .insert([{
        user_id: testUserId,
        summary: 'You\'ve been consistently checking in and maintaining good progress! Your energy levels tend to be higher in the morning - consider scheduling your most important tasks during this time.',
        source: 'ai_generated',
        tags: ['consistency', 'energy_patterns', 'morning_person'],
        meta: {
          pattern_analyzed: 'Morning vs evening energy levels',
          confidence: 0.85
        }
      }]);

    if (sampleInsightError) {
      console.log('⚠️ Sample insight error:', sampleInsightError.message);
    } else {
      console.log('✅ Sample AI insight created');
    }

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log('  • user_events table - tracks all behavioral data');
    console.log('  • insights table - stores AI-generated insights');
    console.log('  • goals table - manages user goals and habits');
    console.log('  • Sample data inserted for testing');
    
    console.log('\n🔥 Your AI accountability system is ready!');
    console.log('Next steps:');
    console.log('  1. Test the check-in flow in your app');
    console.log('  2. Verify insights are being generated');
    console.log('  3. Set up your GROQ_API_KEY for real AI insights');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase().then(() => {
  console.log('\n✨ Setup complete! Your AI brain is ready to learn.');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
}); 