-- First, create the checkins table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    mood INTEGER CHECK (mood >= 1 AND mood <= 5),
    energy INTEGER CHECK (energy >= 1 AND mood <= 5),
    stress INTEGER CHECK (stress >= 1 AND mood <= 5),
    wins TEXT,
    challenges TEXT,
    priorities TEXT,
    reflection TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow individual profile access" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual stats access" ON public.user_stats;
DROP POLICY IF EXISTS "Allow individual settings access" ON public.user_settings;
DROP POLICY IF EXISTS "Allow individual coach settings access" ON public.coach_settings;
DROP POLICY IF EXISTS "Allow individual checkins access" ON public.checkins;

-- Create secure policies for profiles
CREATE POLICY "Allow individual profile access" ON public.profiles
FOR ALL USING (
    auth.uid() = id
) WITH CHECK (
    auth.uid() = id
);

-- Create secure policies for user_stats
CREATE POLICY "Allow individual stats access" ON public.user_stats
FOR ALL USING (
    auth.uid() = user_id
) WITH CHECK (
    auth.uid() = user_id
);

-- Create secure policies for user_settings
CREATE POLICY "Allow individual settings access" ON public.user_settings
FOR ALL USING (
    auth.uid() = user_id
) WITH CHECK (
    auth.uid() = user_id
);

-- Create secure policies for coach_settings
CREATE POLICY "Allow individual coach settings access" ON public.coach_settings
FOR ALL USING (
    auth.uid() = user_id
) WITH CHECK (
    auth.uid() = user_id
);

-- Create secure policies for checkins
CREATE POLICY "Allow individual checkins access" ON public.checkins
FOR ALL USING (
    auth.uid() = user_id
) WITH CHECK (
    auth.uid() = user_id
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON public.checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_date ON public.checkins(date);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON public.user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_coach_settings_user_id ON public.coach_settings(user_id);

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create trigger function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers to all tables
DO $$ 
BEGIN
    -- Drop existing triggers if they exist
    DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
    DROP TRIGGER IF EXISTS update_user_stats_updated_at ON public.user_stats;
    DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
    DROP TRIGGER IF EXISTS update_coach_settings_updated_at ON public.coach_settings;
    DROP TRIGGER IF EXISTS update_checkins_updated_at ON public.checkins;

    -- Create new triggers
    CREATE TRIGGER update_profiles_updated_at
        BEFORE UPDATE ON public.profiles
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_user_stats_updated_at
        BEFORE UPDATE ON public.user_stats
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_user_settings_updated_at
        BEFORE UPDATE ON public.user_settings
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_coach_settings_updated_at
        BEFORE UPDATE ON public.coach_settings
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_checkins_updated_at
        BEFORE UPDATE ON public.checkins
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
END $$; 