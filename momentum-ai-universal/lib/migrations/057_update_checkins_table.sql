-- Update checkins table with new fields
ALTER TABLE checkins
  ADD COLUMN IF NOT EXISTS went_well TEXT,
  ADD COLUMN IF NOT EXISTS could_improve TEXT,
  ADD COLUMN IF NOT EXISTS gratitude TEXT,
  ADD COLUMN IF NOT EXISTS tomorrow_goals TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_date ON checkins(date);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view own checkins" ON checkins;
DROP POLICY IF EXISTS "Users can insert own checkins" ON checkins;
DROP POLICY IF EXISTS "Users can update own checkins" ON checkins;
DROP POLICY IF EXISTS "Users can delete own checkins" ON checkins;

CREATE POLICY "Users can view own checkins" ON checkins
  FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can insert own checkins" ON checkins
  FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Users can update own checkins" ON checkins
  FOR UPDATE USING (auth.uid()::uuid = user_id)
  WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Users can delete own checkins" ON checkins
  FOR DELETE USING (auth.uid()::uuid = user_id);

-- Grant necessary permissions
GRANT ALL ON checkins TO authenticated; 