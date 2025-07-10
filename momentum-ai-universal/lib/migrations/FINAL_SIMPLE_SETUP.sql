-- FINAL SIMPLE SETUP - Just the bare minimum tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop everything cleanly
DROP TABLE IF EXISTS user_stats CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP FUNCTION IF EXISTS create_user_stats() CASCADE;

-- Create profiles table (super simple)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  primary_goal TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_stats table (super simple)
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  streak_count INTEGER DEFAULT 0,
  goals_completed INTEGER DEFAULT 0,
  checkins_completed INTEGER DEFAULT 0,
  achievements JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Make user_id unique
ALTER TABLE user_stats ADD CONSTRAINT user_stats_user_id_unique UNIQUE (user_id);

-- NO RLS - completely open for testing
-- NO GRANTS - let Supabase handle permissions  
-- NO TRIGGERS - keep it simple

-- Just to verify tables were created
SELECT 'Tables created successfully' as status; 