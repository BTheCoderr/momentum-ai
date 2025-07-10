-- Enable RLS on all tables
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE pod_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pod_xp_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE rituals ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE pod_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_progress ENABLE ROW LEVEL SECURITY;

-- Checkins policies
CREATE POLICY "Users can view their own checkins"
ON checkins FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own checkins"
ON checkins FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own checkins"
ON checkins FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own checkins"
ON checkins FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Pod votes policies
CREATE POLICY "Users can view votes in their pods"
ON pod_votes FOR SELECT
TO authenticated
USING (
  pod_id IN (
    SELECT pod_id FROM pod_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can vote in their pods"
ON pod_votes FOR INSERT
TO authenticated
WITH CHECK (
  pod_id IN (
    SELECT pod_id FROM pod_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own votes"
ON pod_votes FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own votes"
ON pod_votes FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Pod XP log policies
CREATE POLICY "Users can view XP logs in their pods"
ON pod_xp_log FOR SELECT
TO authenticated
USING (
  pod_id IN (
    SELECT pod_id FROM pod_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create XP logs in their pods"
ON pod_xp_log FOR INSERT
TO authenticated
WITH CHECK (
  pod_id IN (
    SELECT pod_id FROM pod_members WHERE user_id = auth.uid()
  )
);

-- User reminders policies
CREATE POLICY "Users can view their own reminders"
ON user_reminders FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own reminders"
ON user_reminders FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reminders"
ON user_reminders FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own reminders"
ON user_reminders FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Rituals policies
CREATE POLICY "Users can view their own rituals"
ON rituals FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own rituals"
ON rituals FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own rituals"
ON rituals FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own rituals"
ON rituals FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Vault entries policies
CREATE POLICY "Users can view their own vault entries"
ON vault_entries FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own vault entries"
ON vault_entries FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own vault entries"
ON vault_entries FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own vault entries"
ON vault_entries FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Custom challenges policies
CREATE POLICY "Users can view challenges in their pods"
ON custom_challenges FOR SELECT
TO authenticated
USING (
  pod_id IN (
    SELECT pod_id FROM pod_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create challenges in their pods"
ON custom_challenges FOR INSERT
TO authenticated
WITH CHECK (
  pod_id IN (
    SELECT pod_id FROM pod_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own challenges"
ON custom_challenges FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete their own challenges"
ON custom_challenges FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- Pods policies
CREATE POLICY "Users can view their pods"
ON pods FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT pod_id FROM pod_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create pods"
ON pods FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Pod creators can update their pods"
ON pods FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Pod creators can delete their pods"
ON pods FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- Pod members policies
CREATE POLICY "Users can view members in their pods"
ON pod_members FOR SELECT
TO authenticated
USING (
  pod_id IN (
    SELECT pod_id FROM pod_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can join pods"
ON pod_members FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave pods"
ON pod_members FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Goals policies
CREATE POLICY "Users can view their own goals"
ON goals FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own goals"
ON goals FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own goals"
ON goals FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own goals"
ON goals FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- User stats policies
CREATE POLICY "Users can view their own stats"
ON user_stats FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own stats"
ON user_stats FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own stats"
ON user_stats FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- User settings policies
CREATE POLICY "Users can view their own settings"
ON user_settings FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own settings"
ON user_settings FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own settings"
ON user_settings FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can create their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Challenge progress policies
CREATE POLICY "Users can view their own challenge progress"
ON challenge_progress FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own challenge progress"
ON challenge_progress FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own challenge progress"
ON challenge_progress FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own challenge progress"
ON challenge_progress FOR DELETE USING (user_id = auth.uid()); 