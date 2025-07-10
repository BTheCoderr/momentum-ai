-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view public pods" ON pods;
DROP POLICY IF EXISTS "Pod members can view their pods" ON pods;
DROP POLICY IF EXISTS "Users can view pod members" ON pod_members;
DROP POLICY IF EXISTS "Users can view own challenges" ON custom_challenges;
DROP POLICY IF EXISTS "Users can create challenges" ON custom_challenges;
DROP POLICY IF EXISTS "Users can update own challenges" ON custom_challenges;
DROP POLICY IF EXISTS "Users can delete own challenges" ON custom_challenges;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS custom_challenges;
DROP TABLE IF EXISTS pod_members;
DROP TABLE IF EXISTS pods;

-- First create the pods table
CREATE TABLE pods (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    description text,
    is_public boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- Create pod_members table
CREATE TABLE pod_members (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    pod_id uuid REFERENCES pods(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(pod_id, user_id)
);

-- Create custom challenges table
CREATE TABLE custom_challenges (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    for_pod boolean DEFAULT false,
    pod_id uuid REFERENCES pods(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE pod_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_challenges ENABLE ROW LEVEL SECURITY;

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