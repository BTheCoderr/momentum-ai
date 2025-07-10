-- Complete RLS Setup with proper dependency handling

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- First, drop all existing policies to avoid conflicts
DO $$ 
BEGIN
    -- Drop policies for challenge_progress
    DROP POLICY IF EXISTS "Users can view their own challenge progress" ON challenge_progress;
    DROP POLICY IF EXISTS "Users can create their own challenge progress" ON challenge_progress;
    DROP POLICY IF EXISTS "Users can update their own challenge progress" ON challenge_progress;
    DROP POLICY IF EXISTS "Users can delete their own challenge progress" ON challenge_progress;
    
    -- Drop policies for custom_challenges
    DROP POLICY IF EXISTS "Users can view own challenges" ON custom_challenges;
    DROP POLICY IF EXISTS "Users can create challenges" ON custom_challenges;
    DROP POLICY IF EXISTS "Users can update own challenges" ON custom_challenges;
    DROP POLICY IF EXISTS "Users can delete own challenges" ON custom_challenges;
    
    -- Drop policies for pods
    DROP POLICY IF EXISTS "Users can view public pods" ON pods;
    DROP POLICY IF EXISTS "Pod members can view their pods" ON pods;
    
    -- Drop policies for pod_members
    DROP POLICY IF EXISTS "Users can view pod members" ON pod_members;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Drop existing tables in correct order (handle dependencies)
DROP TABLE IF EXISTS challenge_progress CASCADE;
DROP TABLE IF EXISTS custom_challenges CASCADE;
DROP TABLE IF EXISTS pod_members CASCADE;
DROP TABLE IF EXISTS pods CASCADE;

-- Create tables in correct order
-- 1. First create pods (no dependencies)
CREATE TABLE pods (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    description text,
    is_public boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Create pod_members (depends on pods)
CREATE TABLE pod_members (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    pod_id uuid REFERENCES pods(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(pod_id, user_id)
);

-- 3. Create custom_challenges (depends on pods)
CREATE TABLE custom_challenges (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    for_pod boolean DEFAULT false,
    pod_id uuid REFERENCES pods(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now()
);

-- 4. Create challenge_progress (depends on custom_challenges)
CREATE TABLE challenge_progress (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_id uuid REFERENCES custom_challenges(id) ON DELETE CASCADE,
    completed_days integer[] DEFAULT '{}',
    last_updated timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, challenge_id)
);

-- Enable RLS on all tables
ALTER TABLE pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE pod_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for pods
CREATE POLICY "Users can view public pods"
    ON pods FOR SELECT
    USING (is_public = true);

CREATE POLICY "Pod members can view their pods"
    ON pods FOR SELECT
    USING (id IN (
        SELECT pod_id FROM pod_members WHERE user_id = auth.uid()
    ));

-- Create RLS policies for pod_members
CREATE POLICY "Users can view pod members"
    ON pod_members FOR SELECT
    USING (pod_id IN (
        SELECT pod_id FROM pod_members WHERE user_id = auth.uid()
    ));

-- Create RLS policies for custom_challenges
CREATE POLICY "Users can view own challenges"
    ON custom_challenges FOR SELECT
    USING (user_id = auth.uid() OR (for_pod = true AND pod_id IN (
        SELECT pod_id FROM pod_members WHERE user_id = auth.uid()
    )));

CREATE POLICY "Users can create challenges"
    ON custom_challenges FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own challenges"
    ON custom_challenges FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own challenges"
    ON custom_challenges FOR DELETE
    USING (user_id = auth.uid());

-- Create RLS policies for challenge_progress
CREATE POLICY "Users can view own progress"
    ON challenge_progress FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create own progress"
    ON challenge_progress FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own progress"
    ON challenge_progress FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own progress"
    ON challenge_progress FOR DELETE
    USING (user_id = auth.uid());

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pod_members_user_id ON pod_members(user_id);
CREATE INDEX IF NOT EXISTS idx_pod_members_pod_id ON pod_members(pod_id);
CREATE INDEX IF NOT EXISTS idx_custom_challenges_user_id ON custom_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_challenges_pod_id ON custom_challenges(pod_id);
CREATE INDEX IF NOT EXISTS idx_challenge_progress_user_id ON challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_progress_challenge_id ON challenge_progress(challenge_id); 