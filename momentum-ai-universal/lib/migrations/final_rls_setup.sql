-- FINAL RLS SETUP - Comprehensive security for all tables
-- This replaces all previous RLS migrations

-- 1. Core User Data Tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- 2. Pod-Related Tables
ALTER TABLE pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE pod_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE pod_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pod_xp_log ENABLE ROW LEVEL SECURITY;

-- 3. Feature Tables
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE rituals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
    -- Core User Data
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own profile" ON profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own stats" ON user_stats';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own checkins" ON checkins';
    
    -- Pod-Related
    EXECUTE 'DROP POLICY IF EXISTS "Users can view pods" ON pods';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view pod members" ON pod_members';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view pod votes" ON pod_votes';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view pod xp" ON pod_xp_log';
    
    -- Feature Tables
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own goals" ON goals';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own progress" ON challenge_progress';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view challenges" ON custom_challenges';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own rituals" ON rituals';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own reminders" ON user_reminders';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own entries" ON vault_entries';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own messages" ON messages';
END $$;

-- Create new policies

-- 1. Core User Data Policies
CREATE POLICY "Users can view own profile"
    ON profiles FOR ALL USING (id::text = auth.uid()::text);

CREATE POLICY "Users can view own stats"
    ON user_stats FOR ALL USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can view own checkins"
    ON checkins FOR ALL USING (user_id::text = auth.uid()::text);

-- 2. Pod-Related Policies
CREATE POLICY "Users can view pods"
    ON pods FOR ALL USING (
        is_public = true OR 
        id IN (SELECT pod_id FROM pod_members WHERE user_id::text = auth.uid()::text)
    );

CREATE POLICY "Users can view pod members"
    ON pod_members FOR ALL USING (
        pod_id IN (SELECT pod_id FROM pod_members WHERE user_id::text = auth.uid()::text)
    );

CREATE POLICY "Users can view pod votes"
    ON pod_votes FOR ALL USING (
        pod_id IN (SELECT pod_id FROM pod_members WHERE user_id::text = auth.uid()::text)
    );

CREATE POLICY "Users can view pod xp"
    ON pod_xp_log FOR ALL USING (
        pod_id IN (SELECT pod_id FROM pod_members WHERE user_id::text = auth.uid()::text)
    );

-- 3. Feature Table Policies
CREATE POLICY "Users can view own goals"
    ON goals FOR ALL USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can view own progress"
    ON challenge_progress FOR ALL USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can view challenges"
    ON custom_challenges FOR ALL USING (
        user_id::text = auth.uid()::text OR
        (for_pod = true AND pod_id IN (
            SELECT pod_id FROM pod_members WHERE user_id::text = auth.uid()::text
        ))
    );

CREATE POLICY "Users can view own rituals"
    ON rituals FOR ALL USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can view own reminders"
    ON user_reminders FOR ALL USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can view own entries"
    ON vault_entries FOR ALL USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can view own messages"
    ON messages FOR ALL USING (user_id::text = auth.uid()::text);

-- Verify RLS is enabled
SELECT tablename, rls_enabled 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'profiles',
    'user_stats',
    'checkins',
    'pods',
    'pod_members',
    'pod_votes',
    'pod_xp_log',
    'goals',
    'challenge_progress',
    'custom_challenges',
    'rituals',
    'user_reminders',
    'vault_entries',
    'messages'
)
ORDER BY tablename; 