-- Momentum AI Database Schema
-- Run this in your Supabase SQL editor to create the required tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: user_events
-- Stores all user interactions and check-ins for behavioral analysis
CREATE TABLE IF NOT EXISTS user_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Using TEXT for now, can be UUID if you have a users table
    event_type TEXT NOT NULL, -- 'daily_check_in', 'goal_created', 'habit_completed', etc.
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    mood TEXT, -- 'energized', 'happy', 'calm', 'neutral', 'tired', 'frustrated', 'down'
    progress INTEGER CHECK (progress >= 0 AND progress <= 100), -- Overall progress percentage
    goal_id TEXT, -- Reference to specific goal if applicable
    meta JSONB DEFAULT '{}', -- Additional metadata like energy_level, challenges, wins, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: insights 
-- Stores AI-generated insights and coaching messages
CREATE TABLE IF NOT EXISTS insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    summary TEXT NOT NULL, -- The AI-generated insight text
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source TEXT DEFAULT 'groq_ai', -- 'groq_ai', 'openai', 'claude', 'fallback'
    tags TEXT[] DEFAULT ARRAY['ai_generated'], -- ['pattern_recognition', 'energy_optimization', etc.]
    meta JSONB DEFAULT '{}', -- Analysis metadata, confidence scores, etc.
    is_read BOOLEAN DEFAULT FALSE, -- Track if user has seen this insight
    is_liked BOOLEAN DEFAULT FALSE, -- User can like insights
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: goals (enhanced version)
-- Stores user goals and habits for progress tracking
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'Personal',
    target_date DATE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    milestones JSONB DEFAULT '[]',
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    reminder_frequency TEXT DEFAULT 'daily' CHECK (reminder_frequency IN ('daily', 'weekly', 'none')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: streaks
-- Track user consistency and streaks
CREATE TABLE IF NOT EXISTS streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    streak_type TEXT DEFAULT 'daily', -- 'daily', 'weekly', 'custom'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: chat_messages
-- Stores AI conversations for context and learning
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    message TEXT NOT NULL,
    is_ai BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new tables for plans, coaching sessions, and saved insights

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT CHECK (duration IN ('day', 'week', 'month')),
  milestones JSONB,
  reminders_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  status TEXT CHECK (status IN ('active', 'completed', 'archived')) DEFAULT 'active'
);

-- Coaching sessions table
CREATE TABLE IF NOT EXISTS coaching_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('motivation', 'strategy', 'reflection', 'challenge')),
  completed BOOLEAN DEFAULT false,
  xp_reward INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Saved insights table
CREATE TABLE IF NOT EXISTS saved_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON user_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_events_timestamp ON user_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_events_type ON user_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_events_mood ON user_events(mood) WHERE mood IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_insights_user_id ON insights(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_timestamp ON insights(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_insights_source ON insights(source);
CREATE INDEX IF NOT EXISTS idx_insights_unread ON insights(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_insights_tags ON insights USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_category ON goals(category) WHERE category IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_streaks_user_id ON streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_streaks_goal_id ON streaks(goal_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp DESC);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_plans_user_id ON plans(user_id);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_user_id ON coaching_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_insights_user_id ON saved_insights(user_id);

-- Row Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_insights ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own data
CREATE POLICY "Users can access own events" ON user_events
    FOR ALL USING (user_id = auth.uid()::text OR user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can access own insights" ON insights
    FOR ALL USING (user_id = auth.uid()::text OR user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can access own goals" ON goals
    FOR ALL USING (user_id = auth.uid()::text OR user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can access own streaks" ON streaks
    FOR ALL USING (user_id = auth.uid()::text OR user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can access own chat messages" ON chat_messages
    FOR ALL USING (user_id = auth.uid()::text OR user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can view their own plans"
  ON plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plans"
  ON plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans"
  ON plans FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans"
  ON plans FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own coaching sessions"
  ON coaching_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coaching sessions"
  ON coaching_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coaching sessions"
  ON coaching_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own coaching sessions"
  ON coaching_sessions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own saved insights"
  ON saved_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved insights"
  ON saved_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved insights"
  ON saved_insights FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved insights"
  ON saved_insights FOR DELETE
  USING (auth.uid() = user_id);

-- Functions for common queries
-- Function to get recent check-ins for a user
CREATE OR REPLACE FUNCTION get_recent_checkins(p_user_id TEXT, p_limit INTEGER DEFAULT 7)
RETURNS TABLE(
    event_date DATE,
    mood TEXT,
    progress INTEGER,
    energy_level INTEGER,
    wins TEXT,
    challenges TEXT,
    tomorrow_plan TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(e.timestamp) as event_date,
        e.mood,
        e.progress,
        COALESCE((e.meta->>'energy_level')::INTEGER, 5) as energy_level,
        e.meta->>'wins' as wins,
        e.meta->>'challenges' as challenges,
        e.meta->>'tomorrow_plan' as tomorrow_plan
    FROM user_events e
    WHERE e.user_id = p_user_id 
    AND e.event_type = 'daily_check_in'
    ORDER BY e.timestamp DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's unread insights
CREATE OR REPLACE FUNCTION get_unread_insights(p_user_id TEXT)
RETURNS TABLE(
    id UUID,
    summary TEXT,
    timestamp TIMESTAMP WITH TIME ZONE,
    source TEXT,
    tags TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.summary,
        i.timestamp,
        i.source,
        i.tags
    FROM insights i
    WHERE i.user_id = p_user_id 
    AND i.is_read = FALSE
    ORDER BY i.timestamp DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate user streak
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id TEXT, p_goal_id UUID DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
    current_streak INTEGER := 0;
    last_checkin_date DATE;
    today_date DATE := CURRENT_DATE;
BEGIN
    -- Get the most recent check-in date
    SELECT DATE(timestamp) INTO last_checkin_date
    FROM user_events
    WHERE user_id = p_user_id 
    AND event_type = 'daily_check_in'
    AND (p_goal_id IS NULL OR goal_id::UUID = p_goal_id)
    ORDER BY timestamp DESC
    LIMIT 1;
    
    -- If no check-ins found, return 0
    IF last_checkin_date IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Calculate streak by counting consecutive days
    WITH RECURSIVE streak_calc AS (
        SELECT 
            DATE(timestamp) as checkin_date,
            ROW_NUMBER() OVER (ORDER BY DATE(timestamp) DESC) as rn
        FROM user_events
        WHERE user_id = p_user_id 
        AND event_type = 'daily_check_in'
        AND (p_goal_id IS NULL OR goal_id::UUID = p_goal_id)
        AND DATE(timestamp) <= today_date
        GROUP BY DATE(timestamp)
        ORDER BY DATE(timestamp) DESC
    ),
    consecutive_days AS (
        SELECT 
            checkin_date,
            rn,
            checkin_date + INTERVAL '1 day' * (rn - 1) as expected_date
        FROM streak_calc
    )
    SELECT COUNT(*) INTO current_streak
    FROM consecutive_days
    WHERE checkin_date = expected_date;
    
    RETURN current_streak;
END;
$$ LANGUAGE plpgsql;

-- Function to get user streak statistics (MISSING FUNCTION)
CREATE OR REPLACE FUNCTION get_user_streak_stats(p_user_id TEXT)
RETURNS TABLE(
    goal_id UUID,
    goal_title TEXT,
    current_streak INTEGER,
    longest_streak INTEGER,
    last_activity_date DATE,
    streak_type TEXT,
    progress INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.goal_id,
        COALESCE(g.title, 'Overall Progress') as goal_title,
        s.current_streak,
        s.longest_streak,
        s.last_activity_date,
        s.streak_type,
        COALESCE(g.progress, 0) as progress
    FROM streaks s
    LEFT JOIN goals g ON s.goal_id = g.id
    WHERE s.user_id = p_user_id
    ORDER BY s.current_streak DESC, s.longest_streak DESC;
END;
$$ LANGUAGE plpgsql;

-- Sample data for testing (optional)
INSERT INTO user_events (user_id, event_type, mood, progress, meta) VALUES 
('test-user-id', 'daily_check_in', 'happy', 75, '{"energy_level": 8, "wins": "Completed morning workout", "challenges": "None today", "tomorrow_plan": "Focus on deep work", "time_of_day": "morning", "device": "web"}'),
('test-user-id', 'daily_check_in', 'calm', 60, '{"energy_level": 6, "wins": "Good progress on project", "challenges": "Felt distracted during work", "tomorrow_plan": "Start earlier", "time_of_day": "evening", "device": "web"}'),
('test-user-id', 'daily_check_in', 'energized', 85, '{"energy_level": 9, "wins": "Had a productive day", "challenges": "None", "tomorrow_plan": "Keep the momentum", "time_of_day": "evening", "device": "web"}')
ON CONFLICT DO NOTHING;

INSERT INTO goals (id, user_id, title, description, status, progress, category, habits) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'test-user-id', 'Daily Exercise', 'Exercise for at least 30 minutes every day', 'active', 65, 'health', '[{"id": "habit-1", "text": "Morning run", "completed": false}, {"id": "habit-2", "text": "Strength training", "completed": false}]'),
('550e8400-e29b-41d4-a716-446655440002', 'test-user-id', 'Read More Books', 'Read for 20 minutes daily to expand knowledge', 'active', 80, 'learning', '[{"id": "habit-3", "text": "Read before bed", "completed": false}, {"id": "habit-4", "text": "Take notes", "completed": false}]'),
('550e8400-e29b-41d4-a716-446655440003', 'test-user-id', 'Meditation Practice', 'Daily 10-minute meditation for mindfulness', 'active', 45, 'wellness', '[{"id": "habit-5", "text": "Morning meditation", "completed": false}]')
ON CONFLICT DO NOTHING;

INSERT INTO insights (user_id, summary, source, tags, meta) VALUES 
('test-user-id', 'You''re showing great consistency with your check-ins! I notice you tend to have higher energy in the mornings - consider scheduling your most important tasks during this time to maximize your productivity.', 'groq_ai', ARRAY['pattern_recognition', 'energy_patterns', 'consistency'], '{"confidence": 0.85, "pattern_analyzed": "energy_levels", "check_in_count": 7}'),
('test-user-id', 'Your progress has been steady this week, averaging 73%. When you mention feeling distracted, try the 2-minute rule: if something will take less than 2 minutes, do it immediately rather than letting it pile up mentally.', 'groq_ai', ARRAY['coaching_tip', 'productivity', 'distraction_management'], '{"confidence": 0.78, "pattern_analyzed": "distraction_patterns", "check_in_count": 5}'),
('test-user-id', 'I see you''ve been maintaining good momentum with your exercise goal! Your wins consistently mention physical activity. Consider celebrating these victories more - they''re building a powerful positive feedback loop.', 'groq_ai', ARRAY['positive_reinforcement', 'habit_formation', 'exercise'], '{"confidence": 0.92, "pattern_analyzed": "exercise_consistency", "check_in_count": 8}')
ON CONFLICT DO NOTHING;

INSERT INTO streaks (user_id, goal_id, current_streak, longest_streak, last_activity_date) VALUES 
('test-user-id', '550e8400-e29b-41d4-a716-446655440001', 7, 12, CURRENT_DATE),
('test-user-id', '550e8400-e29b-41d4-a716-446655440002', 5, 15, CURRENT_DATE - INTERVAL '1 day'),
('test-user-id', '550e8400-e29b-41d4-a716-446655440003', 3, 8, CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_streaks_updated_at BEFORE UPDATE ON streaks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🎉 Momentum AI database schema created successfully!';
    RAISE NOTICE '📊 Tables created: user_events, insights, goals, streaks';
    RAISE NOTICE '🔍 Indexes and functions added for optimal performance';
    RAISE NOTICE '🛡️ Row Level Security policies enabled';
    RAISE NOTICE '📝 Sample data inserted for testing';
    RAISE NOTICE '';
    RAISE NOTICE '✨ Your AI accountability system is ready to track behavioral patterns!';
END $$; 