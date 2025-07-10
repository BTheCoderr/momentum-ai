-- NO RLS SETUP - Simplest possible tables without any security policies for testing

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop everything and start fresh
DROP TABLE IF EXISTS user_stats CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table (no RLS)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE,
  primary_goal TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_stats table (no RLS)
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  streak_count INTEGER DEFAULT 0,
  goals_completed INTEGER DEFAULT 0,
  checkins_completed INTEGER DEFAULT 0,
  achievements JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DO NOT ENABLE RLS - Keep tables completely open for testing
-- This removes all policy complications

-- Function to auto-create user stats
CREATE OR REPLACE FUNCTION create_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_stats (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop any existing trigger
DROP TRIGGER IF EXISTS create_user_stats_trigger ON profiles;

-- Create trigger
CREATE TRIGGER create_user_stats_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_user_stats();

-- Grant full access to authenticated users
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON user_stats TO authenticated;
GRANT USAGE ON SEQUENCE user_stats_id_seq TO authenticated; 