-- Enable RLS and add secure policies for all user-owned tables

-- DailyCheckIn
ALTER TABLE "DailyCheckIn" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own daily checkins" ON "DailyCheckIn";
DROP POLICY IF EXISTS "Users can create their own daily checkins" ON "DailyCheckIn";
DROP POLICY IF EXISTS "Users can update their own daily checkins" ON "DailyCheckIn";
DROP POLICY IF EXISTS "Users can delete their own daily checkins" ON "DailyCheckIn";

CREATE POLICY "Users can view their own daily checkins"
  ON "DailyCheckIn" FOR SELECT USING ("userId"::uuid = auth.uid()::uuid);

CREATE POLICY "Users can create their own daily checkins"
  ON "DailyCheckIn" FOR INSERT WITH CHECK ("userId"::uuid = auth.uid()::uuid);

CREATE POLICY "Users can update their own daily checkins"
  ON "DailyCheckIn" FOR UPDATE USING ("userId"::uuid = auth.uid()::uuid);

CREATE POLICY "Users can delete their own daily checkins"
  ON "DailyCheckIn" FOR DELETE USING ("userId"::uuid = auth.uid()::uuid);

-- challenge_progress
ALTER TABLE challenge_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own challenge progress" ON challenge_progress;
DROP POLICY IF EXISTS "Users can create their own challenge progress" ON challenge_progress;
DROP POLICY IF EXISTS "Users can update their own challenge progress" ON challenge_progress;
DROP POLICY IF EXISTS "Users can delete their own challenge progress" ON challenge_progress;

CREATE POLICY "Users can view their own challenge progress"
  ON challenge_progress FOR SELECT USING (user_id::uuid = auth.uid()::uuid);

CREATE POLICY "Users can create their own challenge progress"
  ON challenge_progress FOR INSERT WITH CHECK (user_id::uuid = auth.uid()::uuid);

CREATE POLICY "Users can update their own challenge progress"
  ON challenge_progress FOR UPDATE USING (user_id::uuid = auth.uid()::uuid);

CREATE POLICY "Users can delete their own challenge progress"
  ON challenge_progress FOR DELETE USING (user_id::uuid = auth.uid()::uuid);

-- pod_votes
ALTER TABLE pod_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view pod votes" ON pod_votes;
DROP POLICY IF EXISTS "Users can create pod votes" ON pod_votes;
DROP POLICY IF EXISTS "Users can update pod votes" ON pod_votes;
DROP POLICY IF EXISTS "Users can delete pod votes" ON pod_votes;

CREATE POLICY "Users can view pod votes"
  ON pod_votes FOR SELECT USING (
    pod_id::uuid IN (
      SELECT pod_id::uuid FROM pod_members WHERE user_id::uuid = auth.uid()::uuid
    )
  );

CREATE POLICY "Users can create pod votes"
  ON pod_votes FOR INSERT WITH CHECK (
    pod_id::uuid IN (
      SELECT pod_id::uuid FROM pod_members WHERE user_id::uuid = auth.uid()::uuid
    )
  );

CREATE POLICY "Users can update pod votes"
  ON pod_votes FOR UPDATE USING (
    pod_id::uuid IN (
      SELECT pod_id::uuid FROM pod_members WHERE user_id::uuid = auth.uid()::uuid
    )
  );

CREATE POLICY "Users can delete pod votes"
  ON pod_votes FOR DELETE USING (
    pod_id::uuid IN (
      SELECT pod_id::uuid FROM pod_members WHERE user_id::uuid = auth.uid()::uuid
    )
  );

-- pod_members
ALTER TABLE pod_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their pod memberships" ON pod_members;
DROP POLICY IF EXISTS "Users can join pods" ON pod_members;
DROP POLICY IF EXISTS "Users can leave pods" ON pod_members;

CREATE POLICY "Users can view their pod memberships"
  ON pod_members FOR SELECT USING (user_id::uuid = auth.uid()::uuid);

CREATE POLICY "Users can join pods"
  ON pod_members FOR INSERT WITH CHECK (user_id::uuid = auth.uid()::uuid);

CREATE POLICY "Users can leave pods"
  ON pod_members FOR DELETE USING (user_id::uuid = auth.uid()::uuid);

-- pods
ALTER TABLE pods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view pods" ON pods;
DROP POLICY IF EXISTS "Users can create pods" ON pods;
DROP POLICY IF EXISTS "Users can manage their pods" ON pods;

CREATE POLICY "Users can view pods"
  ON pods FOR SELECT USING (
    is_public = true OR 
    id::uuid IN (
      SELECT pod_id::uuid FROM pod_members WHERE user_id::uuid = auth.uid()::uuid
    )
  );

CREATE POLICY "Users can create pods"
  ON pods FOR INSERT WITH CHECK (created_by::uuid = auth.uid()::uuid);

CREATE POLICY "Users can manage their pods"
  ON pods FOR UPDATE USING (created_by::uuid = auth.uid()::uuid);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'RLS policies updated successfully for all tables';
    RAISE NOTICE 'Tables secured: DailyCheckIn, challenge_progress, pod_votes, pod_members, pods';
END $$; 