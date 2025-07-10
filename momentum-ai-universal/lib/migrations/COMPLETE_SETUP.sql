-- COMPLETE SETUP - All essential tables and RLS policies

-- Drop existing constraints and indexes first
ALTER TABLE IF EXISTS checkins DROP CONSTRAINT IF EXISTS unique_user_date_checkin;
DROP INDEX IF EXISTS idx_checkins_user_id;
DROP INDEX IF EXISTS idx_checkins_date;
DROP INDEX IF EXISTS idx_checkins_user_date;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing policies if they exist (cleanup)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can insert their own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can update their own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can view their own checkins" ON checkins;
DROP POLICY IF EXISTS "Users can insert their own checkins" ON checkins;
DROP POLICY IF EXISTS "Users can update their own checkins" ON checkins;
DROP POLICY IF EXISTS "Users can delete their own checkins" ON checkins;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS checkins CASCADE;
DROP TABLE IF EXISTS user_stats CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create the essential tables
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE,
  primary_goal TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

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

CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood INTEGER NOT NULL CHECK (mood >= 1 AND mood <= 5),
  energy INTEGER NOT NULL CHECK (energy >= 1 AND energy <= 5),
  stress INTEGER NOT NULL CHECK (stress >= 1 AND stress <= 5),
  wins TEXT NOT NULL,
  challenges TEXT,
  priorities TEXT NOT NULL,
  reflection TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_date ON checkins(date);
CREATE INDEX IF NOT EXISTS idx_checkins_user_date ON checkins(user_id, date);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "profiles_policy" ON profiles 
  FOR ALL 
  USING (auth.uid() = id);

-- Create RLS policies for user_stats
CREATE POLICY "user_stats_policy" ON user_stats 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create RLS policies for checkins
CREATE POLICY "Users can view their own checkins"
  ON checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own checkins"
  ON checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checkins"
  ON checkins FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own checkins"
  ON checkins FOR DELETE
  USING (auth.uid() = user_id);

-- Add unique constraint to prevent duplicate checkins per day per user
ALTER TABLE checkins ADD CONSTRAINT unique_user_date_checkin UNIQUE (user_id, date);

-- Auto-create user stats trigger
CREATE OR REPLACE FUNCTION create_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_stats (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS create_user_stats_trigger ON profiles;

-- Create trigger
CREATE TRIGGER create_user_stats_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_user_stats(); 