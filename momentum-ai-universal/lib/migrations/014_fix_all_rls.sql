-- Fix RLS for all tables with proper UUID handling

-- challenge_progress
ALTER TABLE challenge_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own challenge progress" ON challenge_progress;
DROP POLICY IF EXISTS "Users can create their own challenge progress" ON challenge_progress;
DROP POLICY IF EXISTS "Users can update their own challenge progress" ON challenge_progress;
DROP POLICY IF EXISTS "Users can delete their own challenge progress" ON challenge_progress;

CREATE POLICY "Users can view their own challenge progress"
  ON challenge_progress FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can create their own challenge progress"
  ON challenge_progress FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update their own challenge progress"
  ON challenge_progress FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete their own challenge progress"
  ON challenge_progress FOR DELETE USING (user_id::text = auth.uid()::text);

-- pod_votes
ALTER TABLE pod_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view pod votes" ON pod_votes;
DROP POLICY IF EXISTS "Users can create pod votes" ON pod_votes;
DROP POLICY IF EXISTS "Users can update pod votes" ON pod_votes;
DROP POLICY IF EXISTS "Users can delete pod votes" ON pod_votes;

CREATE POLICY "Users can view pod votes"
  ON pod_votes FOR SELECT USING (
    pod_id IN (
      SELECT pod_id FROM pod_members WHERE user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can create pod votes"
  ON pod_votes FOR INSERT WITH CHECK (
    pod_id IN (
      SELECT pod_id FROM pod_members WHERE user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update pod votes"
  ON pod_votes FOR UPDATE USING (
    pod_id IN (
      SELECT pod_id FROM pod_members WHERE user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete pod votes"
  ON pod_votes FOR DELETE USING (
    pod_id IN (
      SELECT pod_id FROM pod_members WHERE user_id::text = auth.uid()::text
    )
  );

-- pod_xp_log
ALTER TABLE pod_xp_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own pod XP" ON pod_xp_log;
DROP POLICY IF EXISTS "Users can create their own pod XP" ON pod_xp_log;
DROP POLICY IF EXISTS "Users can update their own pod XP" ON pod_xp_log;
DROP POLICY IF EXISTS "Users can delete their own pod XP" ON pod_xp_log;

CREATE POLICY "Users can view their own pod XP"
  ON pod_xp_log FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can create their own pod XP"
  ON pod_xp_log FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update their own pod XP"
  ON pod_xp_log FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete their own pod XP"
  ON pod_xp_log FOR DELETE USING (user_id::text = auth.uid()::text);

-- user_reminders
ALTER TABLE user_reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own reminders" ON user_reminders;
DROP POLICY IF EXISTS "Users can create their own reminders" ON user_reminders;
DROP POLICY IF EXISTS "Users can update their own reminders" ON user_reminders;
DROP POLICY IF EXISTS "Users can delete their own reminders" ON user_reminders;

CREATE POLICY "Users can view their own reminders"
  ON user_reminders FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can create their own reminders"
  ON user_reminders FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update their own reminders"
  ON user_reminders FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete their own reminders"
  ON user_reminders FOR DELETE USING (user_id::text = auth.uid()::text);

-- rituals
ALTER TABLE rituals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own rituals" ON rituals;
DROP POLICY IF EXISTS "Users can create their own rituals" ON rituals;
DROP POLICY IF EXISTS "Users can update their own rituals" ON rituals;
DROP POLICY IF EXISTS "Users can delete their own rituals" ON rituals;

CREATE POLICY "Users can view their own rituals"
  ON rituals FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can create their own rituals"
  ON rituals FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update their own rituals"
  ON rituals FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete their own rituals"
  ON rituals FOR DELETE USING (user_id::text = auth.uid()::text);

-- vault_entries
ALTER TABLE vault_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own vault entries" ON vault_entries;
DROP POLICY IF EXISTS "Users can create their own vault entries" ON vault_entries;
DROP POLICY IF EXISTS "Users can update their own vault entries" ON vault_entries;
DROP POLICY IF EXISTS "Users can delete their own vault entries" ON vault_entries;

CREATE POLICY "Users can view their own vault entries"
  ON vault_entries FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can create their own vault entries"
  ON vault_entries FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update their own vault entries"
  ON vault_entries FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete their own vault entries"
  ON vault_entries FOR DELETE USING (user_id::text = auth.uid()::text);

-- DailyCheckIn
ALTER TABLE "DailyCheckIn" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own daily checkins" ON "DailyCheckIn";
DROP POLICY IF EXISTS "Users can create their own daily checkins" ON "DailyCheckIn";
DROP POLICY IF EXISTS "Users can update their own daily checkins" ON "DailyCheckIn";
DROP POLICY IF EXISTS "Users can delete their own daily checkins" ON "DailyCheckIn";

CREATE POLICY "Users can view their own daily checkins"
  ON "DailyCheckIn" FOR SELECT USING ("userId" = auth.uid()::text);

CREATE POLICY "Users can create their own daily checkins"
  ON "DailyCheckIn" FOR INSERT WITH CHECK ("userId" = auth.uid()::text);

CREATE POLICY "Users can update their own daily checkins"
  ON "DailyCheckIn" FOR UPDATE USING ("userId" = auth.uid()::text);

CREATE POLICY "Users can delete their own daily checkins"
  ON "DailyCheckIn" FOR DELETE USING ("userId" = auth.uid()::text); 