-- Enable RLS and create policies for remaining tables

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
  ON "DailyCheckIn" FOR SELECT USING (userId = auth.uid());

CREATE POLICY "Users can create their own daily checkins"
  ON "DailyCheckIn" FOR INSERT WITH CHECK (userId = auth.uid());

CREATE POLICY "Users can update their own daily checkins"
  ON "DailyCheckIn" FOR UPDATE USING (userId = auth.uid());

CREATE POLICY "Users can delete their own daily checkins"
  ON "DailyCheckIn" FOR DELETE USING (userId = auth.uid());

-- Goal and goals
ALTER TABLE "Goal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own goals in Goal"
  ON "Goal" FOR SELECT USING (userId = auth.uid());

CREATE POLICY "Users can create their own goals in Goal"
  ON "Goal" FOR INSERT WITH CHECK (userId = auth.uid());

CREATE POLICY "Users can update their own goals in Goal"
  ON "Goal" FOR UPDATE USING (userId = auth.uid());

CREATE POLICY "Users can delete their own goals in Goal"
  ON "Goal" FOR DELETE USING (userId = auth.uid());

-- Same for goals table
CREATE POLICY "Users can view their own goals in goals"
  ON goals FOR SELECT USING (userId = auth.uid());

CREATE POLICY "Users can create their own goals in goals"
  ON goals FOR INSERT WITH CHECK (userId = auth.uid());

CREATE POLICY "Users can update their own goals in goals"
  ON goals FOR UPDATE USING (userId = auth.uid());

CREATE POLICY "Users can delete their own goals in goals"
  ON goals FOR DELETE USING (userId = auth.uid());

-- Habit
ALTER TABLE "Habit" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own habits"
  ON "Habit" FOR SELECT USING (userId = auth.uid());

CREATE POLICY "Users can create their own habits"
  ON "Habit" FOR INSERT WITH CHECK (userId = auth.uid());

CREATE POLICY "Users can update their own habits"
  ON "Habit" FOR UPDATE USING (userId = auth.uid());

CREATE POLICY "Users can delete their own habits"
  ON "Habit" FOR DELETE USING (userId = auth.uid());

-- Message and messages
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages in Message"
  ON "Message" FOR SELECT USING (userId = auth.uid());

CREATE POLICY "Users can create their own messages in Message"
  ON "Message" FOR INSERT WITH CHECK (userId = auth.uid());

CREATE POLICY "Users can update their own messages in Message"
  ON "Message" FOR UPDATE USING (userId = auth.uid());

CREATE POLICY "Users can delete their own messages in Message"
  ON "Message" FOR DELETE USING (userId = auth.uid());

-- Same for messages table
CREATE POLICY "Users can view their own messages in messages"
  ON messages FOR SELECT USING (userId = auth.uid());

CREATE POLICY "Users can create their own messages in messages"
  ON messages FOR INSERT WITH CHECK (userId = auth.uid());

CREATE POLICY "Users can update their own messages in messages"
  ON messages FOR UPDATE USING (userId = auth.uid());

CREATE POLICY "Users can delete their own messages in messages"
  ON messages FOR DELETE USING (userId = auth.uid());

-- pod_members
ALTER TABLE pod_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pod members can view their pod members"
  ON pod_members FOR SELECT USING (
    pod_id IN (
      SELECT pod_id FROM pod_members WHERE userId = auth.uid()
    )
  );

CREATE POLICY "Users can join pods"
  ON pod_members FOR INSERT WITH CHECK (userId = auth.uid());

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

CREATE POLICY "Users can create their own stats"
  ON user_stats FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own stats"
  ON user_stats FOR UPDATE USING (user_id = auth.uid());

-- VerificationToken (special case - only system access)
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct access to verification tokens"
  ON "VerificationToken" FOR ALL USING (false); 