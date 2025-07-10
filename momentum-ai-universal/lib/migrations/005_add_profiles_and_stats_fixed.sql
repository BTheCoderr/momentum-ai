-- Add missing essential tables for user profiles and stats (FIXED VERSION)

-- Profiles table (essential for user management)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE,
  primary_goal TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- User stats table (for gamification and progress tracking)
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  streak_count INTEGER DEFAULT 0,
  goals_completed INTEGER DEFAULT 0,
  checkins_completed INTEGER DEFAULT 0,
  achievements JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Goals table (main feature for goal tracking)
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  progress DECIMAL(5,2) DEFAULT 0.00 CHECK (progress >= 0 AND progress <= 100),
  target_date DATE,
  milestones JSONB DEFAULT '[]'::jsonb,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  reminder_frequency TEXT CHECK (reminder_frequency IN ('daily', 'weekly', 'none')) DEFAULT 'none',
  status TEXT CHECK (status IN ('active', 'completed', 'paused', 'archived')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Messages table (for AI chat functionality)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'ai', 'system')),
  type TEXT DEFAULT 'text',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles (FIXED with proper UUID casting)
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid()::UUID = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid()::UUID = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid()::UUID = id)
  WITH CHECK (auth.uid()::UUID = id);

-- RLS Policies for user_stats (FIXED with proper UUID casting)
CREATE POLICY "Users can view their own stats"
  ON user_stats FOR SELECT
  USING (auth.uid()::UUID = user_id);

CREATE POLICY "Users can insert their own stats"
  ON user_stats FOR INSERT
  WITH CHECK (auth.uid()::UUID = user_id);

CREATE POLICY "Users can update their own stats"
  ON user_stats FOR UPDATE
  USING (auth.uid()::UUID = user_id)
  WITH CHECK (auth.uid()::UUID = user_id);

-- RLS Policies for goals (FIXED with proper UUID casting)
CREATE POLICY "Users can view their own goals"
  ON goals FOR SELECT
  USING (auth.uid()::UUID = user_id);

CREATE POLICY "Users can insert their own goals"
  ON goals FOR INSERT
  WITH CHECK (auth.uid()::UUID = user_id);

CREATE POLICY "Users can update their own goals"
  ON goals FOR UPDATE
  USING (auth.uid()::UUID = user_id)
  WITH CHECK (auth.uid()::UUID = user_id);

CREATE POLICY "Users can delete their own goals"
  ON goals FOR DELETE
  USING (auth.uid()::UUID = user_id);

-- RLS Policies for messages (FIXED with proper UUID casting)
CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  USING (auth.uid()::UUID = user_id);

CREATE POLICY "Users can insert their own messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid()::UUID = user_id);

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (auth.uid()::UUID = user_id)
  WITH CHECK (auth.uid()::UUID = user_id);

CREATE POLICY "Users can delete their own messages"
  ON messages FOR DELETE
  USING (auth.uid()::UUID = user_id);

-- Create a function to automatically create user stats when a profile is created
CREATE OR REPLACE FUNCTION create_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_stats (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user stats
CREATE TRIGGER create_user_stats_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_user_stats(); 