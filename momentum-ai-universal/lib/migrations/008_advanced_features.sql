-- Advanced Features Migration
-- Challenge Progress Tracking
CREATE TABLE IF NOT EXISTS challenge_progress (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_id uuid REFERENCES custom_challenges(id) ON DELETE CASCADE,
    completed_days integer[] DEFAULT '{}',
    last_updated timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, challenge_id)
);

-- Pod Voting & Shared Goals
CREATE TABLE IF NOT EXISTS pod_votes (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    pod_id uuid REFERENCES pods(id) ON DELETE CASCADE,
    title text NOT NULL,
    options text[] NOT NULL,
    votes jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone
);

-- Pod XP & Rankings
CREATE TABLE IF NOT EXISTS pod_xp_log (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    pod_id uuid REFERENCES pods(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    source text CHECK (source IN ('checkin', 'challenge', 'support', 'invite', 'vote')),
    points integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- User Reminders for Push/SMS
CREATE TABLE IF NOT EXISTS user_reminders (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    channel text CHECK (channel IN ('push', 'sms', 'email')) DEFAULT 'push',
    time_of_day time NOT NULL,
    message text NOT NULL,
    enabled boolean DEFAULT true,
    timezone text DEFAULT 'UTC',
    repeat_days integer[] DEFAULT '{0,1,2,3,4,5,6}', -- 0=Sunday, 6=Saturday
    created_at timestamp with time zone DEFAULT now()
);

-- Rituals for Custom Routines
CREATE TABLE IF NOT EXISTS rituals (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    steps text[] NOT NULL,
    time_of_day text CHECK (time_of_day IN ('morning', 'afternoon', 'evening', 'any')) DEFAULT 'any',
    repeat_days integer[] DEFAULT '{0,1,2,3,4,5,6}',
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- Momentum Vault for Archived Wins
CREATE TABLE IF NOT EXISTS vault_entries (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    entry_type text CHECK (entry_type IN ('checkin', 'challenge', 'goal', 'ritual')) NOT NULL,
    ref_id uuid NOT NULL,
    highlight text NOT NULL,
    tags text[] DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now()
);

-- Add onboarding fields to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_step integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS onboarding_complete boolean DEFAULT false;

-- Add invite code to pods
ALTER TABLE pods
ADD COLUMN IF NOT EXISTS invite_code text UNIQUE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_challenge_progress_user_id ON challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_progress_challenge_id ON challenge_progress(challenge_id);
CREATE INDEX IF NOT EXISTS idx_pod_votes_pod_id ON pod_votes(pod_id);
CREATE INDEX IF NOT EXISTS idx_pod_xp_log_pod_id ON pod_xp_log(pod_id);
CREATE INDEX IF NOT EXISTS idx_pod_xp_log_user_id ON pod_xp_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reminders_user_id ON user_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_rituals_user_id ON rituals(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_entries_user_id ON vault_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_pods_invite_code ON pods(invite_code) WHERE invite_code IS NOT NULL;

-- Enable RLS and add secure policies for all user-owned tables

-- challenge_progress
ALTER TABLE challenge_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own challenge progress"
  ON challenge_progress FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own challenge progress"
  ON challenge_progress FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own challenge progress"
  ON challenge_progress FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own challenge progress"
  ON challenge_progress FOR DELETE USING (user_id = auth.uid());

-- pod_votes
ALTER TABLE pod_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pod votes"
  ON pod_votes FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own pod votes"
  ON pod_votes FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own pod votes"
  ON pod_votes FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own pod votes"
  ON pod_votes FOR DELETE USING (user_id = auth.uid());

-- pod_xp_log
ALTER TABLE pod_xp_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pod XP"
  ON pod_xp_log FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own pod XP"
  ON pod_xp_log FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own pod XP"
  ON pod_xp_log FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own pod XP"
  ON pod_xp_log FOR DELETE USING (user_id = auth.uid());

-- user_reminders
ALTER TABLE user_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reminders"
  ON user_reminders FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own reminders"
  ON user_reminders FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reminders"
  ON user_reminders FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own reminders"
  ON user_reminders FOR DELETE USING (user_id = auth.uid());

-- rituals
ALTER TABLE rituals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rituals"
  ON rituals FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own rituals"
  ON rituals FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own rituals"
  ON rituals FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own rituals"
  ON rituals FOR DELETE USING (user_id = auth.uid());

-- vault_entries
ALTER TABLE vault_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vault entries"
  ON vault_entries FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own vault entries"
  ON vault_entries FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own vault entries"
  ON vault_entries FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own vault entries"
  ON vault_entries FOR DELETE USING (user_id = auth.uid());

-- Function to generate unique invite codes
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS text AS $$
DECLARE
    chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result text := '';
    i integer;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get pod XP totals
CREATE OR REPLACE FUNCTION get_pod_xp_totals()
RETURNS TABLE(pod_id uuid, total_xp bigint, pod_name text) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as pod_id,
        COALESCE(SUM(pxl.points), 0) as total_xp,
        p.name as pod_name
    FROM pods p
    LEFT JOIN pod_xp_log pxl ON p.id = pxl.pod_id
    WHERE p.is_public = true
    GROUP BY p.id, p.name
    ORDER BY total_xp DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE challenge_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE pod_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE pod_xp_log;
ALTER PUBLICATION supabase_realtime ADD TABLE vault_entries;

-- Enable RLS and create policies for all tables

-- custom_challenges
ALTER TABLE custom_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own custom challenges"
  ON custom_challenges FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own custom challenges"
  ON custom_challenges FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own custom challenges"
  ON custom_challenges FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own custom challenges"
  ON custom_challenges FOR DELETE USING (user_id = auth.uid());

-- DailyCheckIn
ALTER TABLE "DailyCheckIn" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own daily checkins"
  ON "DailyCheckIn" FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own daily checkins"
  ON "DailyCheckIn" FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own daily checkins"
  ON "DailyCheckIn" FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own daily checkins"
  ON "DailyCheckIn" FOR DELETE USING (user_id = auth.uid());

-- Goal and goals
ALTER TABLE "Goal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own goals"
  ON "Goal" FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own goals"
  ON "Goal" FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own goals"
  ON "Goal" FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own goals"
  ON "Goal" FOR DELETE USING (user_id = auth.uid());

-- Same for goals table
CREATE POLICY "Users can view their own goals"
  ON goals FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own goals"
  ON goals FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own goals"
  ON goals FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own goals"
  ON goals FOR DELETE USING (user_id = auth.uid());

-- Habit
ALTER TABLE "Habit" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own habits"
  ON "Habit" FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own habits"
  ON "Habit" FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own habits"
  ON "Habit" FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own habits"
  ON "Habit" FOR DELETE USING (user_id = auth.uid());

-- Message and messages
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages"
  ON "Message" FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own messages"
  ON "Message" FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own messages"
  ON "Message" FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
  ON "Message" FOR DELETE USING (user_id = auth.uid());

-- Same for messages table
CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own messages"
  ON messages FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
  ON messages FOR DELETE USING (user_id = auth.uid());

-- pod_members
ALTER TABLE pod_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pod members can view their pod members"
  ON pod_members FOR SELECT USING (
    pod_id IN (
      SELECT pod_id FROM pod_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join pods"
  ON pod_members FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Pod owners can manage members"
  ON pod_members FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM pods 
      WHERE pods.id = pod_members.pod_id 
      AND pods.owner_id = auth.uid()
    )
  );

-- pods
ALTER TABLE pods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pods"
  ON pods FOR SELECT USING (true);

CREATE POLICY "Users can create pods"
  ON pods FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Pod owners can update pods"
  ON pods FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Pod owners can delete pods"
  ON pods FOR DELETE USING (owner_id = auth.uid());

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (id = auth.uid());

-- user_stats
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own stats"
  ON user_stats FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own stats"
  ON user_stats FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own stats"
  ON user_stats FOR UPDATE USING (user_id = auth.uid());

-- VerificationToken (special case - only system access)
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct access to verification tokens"
  ON "VerificationToken" FOR ALL USING (false); 