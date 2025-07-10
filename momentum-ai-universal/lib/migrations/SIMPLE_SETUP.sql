-- SIMPLE STANDALONE SETUP - Just the essential tables for the app

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing policies if they exist (cleanup)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can insert their own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can update their own stats" ON user_stats;

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

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies (these should work!)
CREATE POLICY "profiles_policy" ON profiles 
  FOR ALL 
  USING (auth.uid() = id);

CREATE POLICY "user_stats_policy" ON user_stats 
  FOR ALL 
  USING (auth.uid() = user_id);

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