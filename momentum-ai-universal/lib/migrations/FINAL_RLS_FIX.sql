-- Drop all existing policies
DO $$ 
BEGIN
    -- Drop policies for profiles
    DROP POLICY IF EXISTS "profiles_all_operations" ON profiles;
    DROP POLICY IF EXISTS "profiles_policy" ON profiles;
    
    -- Drop policies for user_stats
    DROP POLICY IF EXISTS "user_stats_all_operations" ON user_stats;
    DROP POLICY IF EXISTS "user_stats_policy" ON user_stats;
    
    -- Drop policies for user_settings
    DROP POLICY IF EXISTS "user_settings_all_operations" ON user_settings;
    
    -- Drop policies for coach_settings
    DROP POLICY IF EXISTS "coach_settings_all_operations" ON coach_settings;
    
    -- Drop policies for checkins
    DROP POLICY IF EXISTS "checkins_all_operations" ON checkins;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Temporarily disable RLS for testing
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE coach_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE checkins DISABLE ROW LEVEL SECURITY;

-- Create super permissive policies for testing
CREATE POLICY "allow_all_profiles" ON profiles FOR ALL USING (true);
CREATE POLICY "allow_all_user_stats" ON user_stats FOR ALL USING (true);
CREATE POLICY "allow_all_user_settings" ON user_settings FOR ALL USING (true);
CREATE POLICY "allow_all_coach_settings" ON coach_settings FOR ALL USING (true);
CREATE POLICY "allow_all_checkins" ON checkins FOR ALL USING (true);

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- Grant full permissions to authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated; 