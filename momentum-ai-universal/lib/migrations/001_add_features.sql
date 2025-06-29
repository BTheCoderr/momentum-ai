-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Memory settings table
CREATE TABLE IF NOT EXISTS user_memory_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  context_retention INTEGER DEFAULT 30,
  personalized_learning BOOLEAN DEFAULT true,
  behavior_analysis BOOLEAN DEFAULT true,
  pattern_recognition BOOLEAN DEFAULT true,
  emotional_awareness BOOLEAN DEFAULT true,
  goal_alignment BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_plans_user_id ON plans(user_id);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_user_id ON coaching_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_insights_user_id ON saved_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memory_settings_user_id ON user_memory_settings(user_id);

-- Add RLS policies
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memory_settings ENABLE ROW LEVEL SECURITY;

-- Plans policies
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

-- Coaching sessions policies
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

-- Saved insights policies
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

-- Memory settings policies
CREATE POLICY "Users can view their own memory settings"
  ON user_memory_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memory settings"
  ON user_memory_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memory settings"
  ON user_memory_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memory settings"
  ON user_memory_settings FOR DELETE
  USING (auth.uid() = user_id);