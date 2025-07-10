-- Step 1: Enable RLS on all tables
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pod_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pod_xp_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS rituals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS vault_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "DailyCheckIn" ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can view own checkins" ON checkins;
DROP POLICY IF EXISTS "Users can view own goals" ON goals;
DROP POLICY IF EXISTS "Users can view own challenge progress" ON challenge_progress;
DROP POLICY IF EXISTS "Users can view pod votes" ON pod_votes;
DROP POLICY IF EXISTS "Users can view own pod xp" ON pod_xp_log;
DROP POLICY IF EXISTS "Users can view own reminders" ON user_reminders;
DROP POLICY IF EXISTS "Users can view own rituals" ON rituals;
DROP POLICY IF EXISTS "Users can view own vault entries" ON vault_entries;
DROP POLICY IF EXISTS "Users can view own daily checkins" ON "DailyCheckIn";

-- Step 3: Add basic RLS policies for each table
-- Profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR ALL USING (auth.uid()::text = id::text);

-- User Stats
CREATE POLICY "Users can view own stats" ON user_stats
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Checkins
CREATE POLICY "Users can view own checkins" ON checkins
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Goals
CREATE POLICY "Users can view own goals" ON goals
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Challenge Progress
CREATE POLICY "Users can view own challenge progress" ON challenge_progress
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Pod Votes (special case - users can see votes for pods they're members of)
CREATE POLICY "Users can view pod votes" ON pod_votes
    FOR ALL USING (
        pod_id IN (
            SELECT pod_id 
            FROM pod_members 
            WHERE user_id::text = auth.uid()::text
        )
    );

-- Pod XP Log
CREATE POLICY "Users can view own pod xp" ON pod_xp_log
    FOR ALL USING (auth.uid()::text = user_id::text);

-- User Reminders
CREATE POLICY "Users can view own reminders" ON user_reminders
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Rituals
CREATE POLICY "Users can view own rituals" ON rituals
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Vault Entries
CREATE POLICY "Users can view own vault entries" ON vault_entries
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Daily Check-In
CREATE POLICY "Users can view own daily checkins" ON "DailyCheckIn"
    FOR ALL USING ("userId" = auth.uid()::text);

-- Verification query to confirm changes
SELECT tablename as table_name,
       rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'profiles',
    'user_stats',
    'checkins',
    'goals',
    'challenge_progress',
    'pod_votes',
    'pod_xp_log',
    'user_reminders',
    'rituals',
    'vault_entries',
    'DailyCheckIn'
)
ORDER BY tablename; 