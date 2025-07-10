-- Create the missing checkins table that the app is expecting
-- This fixes the "relation 'public.checkins' does not exist" error

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create checkins table (the app expects this exact table name)
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

-- Enable RLS
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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