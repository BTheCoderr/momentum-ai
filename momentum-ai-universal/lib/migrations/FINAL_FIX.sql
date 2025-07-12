-- Create checkins table
CREATE TABLE IF NOT EXISTS public.checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    mood INTEGER CHECK (mood >= 1 AND mood <= 5),
    energy INTEGER CHECK (energy >= 1 AND energy <= 5),
    stress INTEGER CHECK (stress >= 1 AND stress <= 5),
    wins TEXT,
    challenges TEXT,
    priorities TEXT,
    reflection TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop all existing policies
DO $$ 
BEGIN
    -- Drop policies for profiles
    DROP POLICY IF EXISTS "Allow all operations on own profile" ON profiles;
    DROP POLICY IF EXISTS "profiles_policy" ON profiles;
    
    -- Drop policies for user_stats
    DROP POLICY IF EXISTS "Allow all operations on own stats" ON user_stats;
    DROP POLICY IF EXISTS "user_stats_policy" ON user_stats;
    
    -- Drop policies for user_settings
    DROP POLICY IF EXISTS "Allow all operations on own settings" ON user_settings;
    
    -- Drop policies for coach_settings
    DROP POLICY IF EXISTS "Allow all operations on own coach settings" ON coach_settings;
    
    -- Drop policies for checkins
    DROP POLICY IF EXISTS "Allow all operations on own checkins" ON checkins;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE coach_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE checkins DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- Create new policies with both USING and WITH CHECK clauses
CREATE POLICY "profiles_all_operations" ON profiles
    FOR ALL
    USING (true)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "user_stats_all_operations" ON user_stats
    FOR ALL
    USING (true)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_settings_all_operations" ON user_settings
    FOR ALL
    USING (true)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "coach_settings_all_operations" ON coach_settings
    FOR ALL
    USING (true)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "checkins_all_operations" ON checkins
    FOR ALL
    USING (true)
    WITH CHECK (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.user_stats TO authenticated;
GRANT ALL ON public.user_settings TO authenticated;
GRANT ALL ON public.coach_settings TO authenticated;
GRANT ALL ON public.checkins TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_date ON checkins(date);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_coach_settings_user_id ON coach_settings(user_id); 