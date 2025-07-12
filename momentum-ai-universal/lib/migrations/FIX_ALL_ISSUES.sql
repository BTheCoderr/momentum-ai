-- Drop all existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Enable read for users own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for users own profile" ON profiles;
DROP POLICY IF EXISTS "Enable update for users own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_policy" ON profiles;

DROP POLICY IF EXISTS "Enable read for users own stats" ON user_stats;
DROP POLICY IF EXISTS "Enable insert for users own stats" ON user_stats;
DROP POLICY IF EXISTS "Enable update for users own stats" ON user_stats;
DROP POLICY IF EXISTS "user_stats_policy" ON user_stats;

DROP POLICY IF EXISTS "Enable read for users own settings" ON user_settings;
DROP POLICY IF EXISTS "Enable insert for users own settings" ON user_settings;
DROP POLICY IF EXISTS "Enable update for users own settings" ON user_settings;

DROP POLICY IF EXISTS "Enable read for users own coach settings" ON coach_settings;
DROP POLICY IF EXISTS "Enable insert for users own coach settings" ON coach_settings;
DROP POLICY IF EXISTS "Enable update for users own coach settings" ON coach_settings;

-- Create user_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    coach_personality JSONB DEFAULT '{}',
    memory_settings JSONB DEFAULT '{}',
    privacy_settings JSONB DEFAULT '{}',
    notification_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- Create simplified RLS policies that allow all operations for authenticated users on their own data
CREATE POLICY "Allow all operations on own profile" ON profiles 
    FOR ALL 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow all operations on own stats" ON user_stats 
    FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow all operations on own settings" ON user_settings 
    FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow all operations on own coach settings" ON coach_settings 
    FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow all operations on own checkins" ON checkins 
    FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions to authenticated users
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.user_stats TO authenticated;
GRANT ALL ON public.user_settings TO authenticated;
GRANT ALL ON public.coach_settings TO authenticated;
GRANT ALL ON public.checkins TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated; 