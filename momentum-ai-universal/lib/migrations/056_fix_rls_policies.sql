-- Drop all existing policies to start fresh
DO $$ 
BEGIN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can view own stats" ON user_stats;
    DROP POLICY IF EXISTS "Users can insert own stats" ON user_stats;
    DROP POLICY IF EXISTS "Users can update own stats" ON user_stats;
    DROP POLICY IF EXISTS "Users can view own goals" ON goals;
    DROP POLICY IF EXISTS "Users can insert own goals" ON goals;
    DROP POLICY IF EXISTS "Users can update own goals" ON goals;
    DROP POLICY IF EXISTS "Users can delete own goals" ON goals;
    DROP POLICY IF EXISTS "Users can view own messages" ON messages;
    DROP POLICY IF EXISTS "Users can insert own messages" ON messages;
    DROP POLICY IF EXISTS "Users can update own messages" ON messages;
    DROP POLICY IF EXISTS "Users can delete own messages" ON messages;
    DROP POLICY IF EXISTS "Users can view own checkins" ON checkins;
    DROP POLICY IF EXISTS "Users can insert own checkins" ON checkins;
    DROP POLICY IF EXISTS "Users can update own checkins" ON checkins;
    DROP POLICY IF EXISTS "Users can delete own checkins" ON checkins;
END $$;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- Create new policies with consistent column names and proper type casting
-- Profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid()::uuid = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid()::uuid = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid()::uuid = id)
    WITH CHECK (auth.uid()::uuid = id);

-- User Stats
CREATE POLICY "Users can view own stats" ON user_stats
    FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can insert own stats" ON user_stats
    FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Users can update own stats" ON user_stats
    FOR UPDATE USING (auth.uid()::uuid = user_id)
    WITH CHECK (auth.uid()::uuid = user_id);

-- Goals
CREATE POLICY "Users can view own goals" ON goals
    FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can insert own goals" ON goals
    FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Users can update own goals" ON goals
    FOR UPDATE USING (auth.uid()::uuid = user_id)
    WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Users can delete own goals" ON goals
    FOR DELETE USING (auth.uid()::uuid = user_id);

-- Messages
CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can insert own messages" ON messages
    FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Users can update own messages" ON messages
    FOR UPDATE USING (auth.uid()::uuid = user_id)
    WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Users can delete own messages" ON messages
    FOR DELETE USING (auth.uid()::uuid = user_id);

-- Checkins
CREATE POLICY "Users can view own checkins" ON checkins
    FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can insert own checkins" ON checkins
    FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Users can update own checkins" ON checkins
    FOR UPDATE USING (auth.uid()::uuid = user_id)
    WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Users can delete own checkins" ON checkins
    FOR DELETE USING (auth.uid()::uuid = user_id);

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON user_stats TO authenticated;
GRANT ALL ON goals TO authenticated;
GRANT ALL ON messages TO authenticated;
GRANT ALL ON checkins TO authenticated;

-- Success notification
DO $$
BEGIN
    RAISE NOTICE '✅ RLS policies fixed with consistent column names and proper type casting';
    RAISE NOTICE '✅ All necessary permissions granted to authenticated users';
END $$; 