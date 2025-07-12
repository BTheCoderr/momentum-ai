-- Step 1: Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Step 2: Create base tables (no foreign key dependencies)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS public.coach_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT DEFAULT 'Alex',
    personality TEXT DEFAULT 'Empathetic AI coach focused on emotional support',
    style TEXT DEFAULT 'supportive',
    primary_style TEXT DEFAULT 'encouraging',
    communication_preferences JSONB DEFAULT '{"formality": 40, "directness": 50, "enthusiasm": 70, "supportiveness": 80}'::jsonb,
    response_length TEXT DEFAULT 'balanced',
    use_emojis BOOLEAN DEFAULT true,
    use_humor BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    notification_preferences JSONB DEFAULT '{
        "daily_reminder": true,
        "challenge_updates": true,
        "pod_activity": true,
        "reminder_time": "09:00"
    }'::jsonb,
    privacy_settings JSONB DEFAULT '{
        "share_progress": true,
        "public_profile": true,
        "show_in_leaderboard": true
    }'::jsonb,
    theme_preference TEXT DEFAULT 'system',
    language_preference TEXT DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS public.custom_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    difficulty TEXT DEFAULT 'medium',
    duration_days INTEGER DEFAULT 7,
    points INTEGER DEFAULT 100,
    requirements JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Step 3: Create dependent tables
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    target_date DATE,
    status TEXT DEFAULT 'active',
    progress INTEGER DEFAULT 0,
    metrics JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS public.checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    mood INTEGER,
    energy_level INTEGER,
    stress_level INTEGER,
    notes TEXT,
    activities TEXT[],
    metrics JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS public.pods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'public',
    max_members INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Step 4: Create tables with multiple foreign keys
CREATE TABLE IF NOT EXISTS public.challenge_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES public.custom_challenges(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'in_progress',
    current_streak INTEGER DEFAULT 0,
    completed_steps JSONB DEFAULT '[]'::jsonb,
    metrics JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.pod_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pod_id UUID REFERENCES public.pods(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(pod_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.pod_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pod_id UUID REFERENCES public.pods(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES public.custom_challenges(id) ON DELETE CASCADE,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(pod_id, challenge_id)
);

CREATE TABLE IF NOT EXISTS public.pod_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pod_id UUID REFERENCES public.pods(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES public.custom_challenges(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(pod_id, user_id, challenge_id)
);

CREATE TABLE IF NOT EXISTS public.pod_xp_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pod_id UUID REFERENCES public.pods(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    xp_amount INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS public.user_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    total_xp INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    challenges_completed INTEGER DEFAULT 0,
    total_checkins INTEGER DEFAULT 0,
    last_checkin_at TIMESTAMP WITH TIME ZONE,
    metrics JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Step 5: Create timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 6: Create triggers for all tables with updated_at
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I;
            CREATE TRIGGER update_%I_updated_at
                BEFORE UPDATE ON public.%I
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        ', t, t, t, t);
    END LOOP;
END $$;

-- Step 7: Enable Row Level Security
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    END LOOP;
END $$;

-- Step 8: Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_coach_settings_user_id ON public.coach_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON public.checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_created_at ON public.checkins(created_at);
CREATE INDEX IF NOT EXISTS idx_custom_challenges_creator_id ON public.custom_challenges(creator_id);
CREATE INDEX IF NOT EXISTS idx_challenge_progress_user_id ON public.challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_progress_challenge_id ON public.challenge_progress(challenge_id);
CREATE INDEX IF NOT EXISTS idx_pods_creator_id ON public.pods(creator_id);
CREATE INDEX IF NOT EXISTS idx_pod_members_pod_id ON public.pod_members(pod_id);
CREATE INDEX IF NOT EXISTS idx_pod_members_user_id ON public.pod_members(user_id);
CREATE INDEX IF NOT EXISTS idx_pod_challenges_pod_id ON public.pod_challenges(pod_id);
CREATE INDEX IF NOT EXISTS idx_pod_votes_pod_id ON public.pod_votes(pod_id);
CREATE INDEX IF NOT EXISTS idx_pod_votes_user_id ON public.pod_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_pod_xp_log_pod_id ON public.pod_xp_log(pod_id);
CREATE INDEX IF NOT EXISTS idx_pod_xp_log_user_id ON public.pod_xp_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON public.user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- Step 9: Grant access to authenticated users
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('GRANT ALL ON public.%I TO authenticated;', t);
    END LOOP;
END $$;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 10: Create RLS Policies
-- Profiles
CREATE POLICY "Users can view any profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Coach Settings
CREATE POLICY "Users can view own coach settings"
    ON public.coach_settings FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own coach settings"
    ON public.coach_settings FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own coach settings"
    ON public.coach_settings FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Goals
CREATE POLICY "Users can view own goals"
    ON public.goals FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
    ON public.goals FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
    ON public.goals FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
    ON public.goals FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Checkins
CREATE POLICY "Users can view own checkins"
    ON public.checkins FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkins"
    ON public.checkins FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Custom Challenges
CREATE POLICY "Anyone can view public challenges"
    ON public.custom_challenges FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create challenges"
    ON public.custom_challenges FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own challenges"
    ON public.custom_challenges FOR UPDATE
    TO authenticated
    USING (auth.uid() = creator_id)
    WITH CHECK (auth.uid() = creator_id);

-- Challenge Progress
CREATE POLICY "Users can view own challenge progress"
    ON public.challenge_progress FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own challenge progress"
    ON public.challenge_progress FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenge progress"
    ON public.challenge_progress FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Pods
CREATE POLICY "Anyone can view public pods"
    ON public.pods FOR SELECT
    TO authenticated
    USING (type = 'public' OR auth.uid() IN (
        SELECT user_id FROM public.pod_members WHERE pod_id = public.pods.id
    ));

CREATE POLICY "Users can create pods"
    ON public.pods FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Pod creators can update pods"
    ON public.pods FOR UPDATE
    TO authenticated
    USING (auth.uid() = creator_id)
    WITH CHECK (auth.uid() = creator_id);

-- Pod Members
CREATE POLICY "Anyone can view pod members"
    ON public.pod_members FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can join pods"
    ON public.pod_members FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Pod Challenges
CREATE POLICY "Pod members can view pod challenges"
    ON public.pod_challenges FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.pod_members 
        WHERE pod_id = public.pod_challenges.pod_id 
        AND user_id = auth.uid()
    ));

CREATE POLICY "Pod admins can manage pod challenges"
    ON public.pod_challenges FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.pod_members 
        WHERE pod_id = public.pod_challenges.pod_id 
        AND user_id = auth.uid() 
        AND role IN ('admin', 'creator')
    ));

-- Pod Votes
CREATE POLICY "Pod members can view votes"
    ON public.pod_votes FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.pod_members 
        WHERE pod_id = public.pod_votes.pod_id 
        AND user_id = auth.uid()
    ));

CREATE POLICY "Users can vote in their pods"
    ON public.pod_votes FOR INSERT
    TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.pod_members 
        WHERE pod_id = public.pod_votes.pod_id 
        AND user_id = auth.uid()
    ));

-- Pod XP Log
CREATE POLICY "Users can view pod XP logs"
    ON public.pod_xp_log FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.pod_members 
        WHERE pod_id = public.pod_xp_log.pod_id 
        AND user_id = auth.uid()
    ));

-- User Stats
CREATE POLICY "Users can view own stats"
    ON public.user_stats FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "System can update user stats"
    ON public.user_stats FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- User Settings
CREATE POLICY "Users can view own settings"
    ON public.user_settings FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
    ON public.user_settings FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
    ON public.user_settings FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Step 11: Create publication for realtime subscriptions
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR ALL TABLES; 