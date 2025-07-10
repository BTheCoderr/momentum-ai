-- First, let's check the table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'DailyCheckIn';

-- Then enable RLS
ALTER TABLE "DailyCheckIn" ENABLE ROW LEVEL SECURITY;

-- Create policies with consistent column name 'userId'
CREATE POLICY "Users can view their own daily checkins"
  ON "DailyCheckIn" FOR SELECT USING ("userId" = auth.uid());

CREATE POLICY "Users can create their own daily checkins"
  ON "DailyCheckIn" FOR INSERT WITH CHECK ("userId" = auth.uid());

CREATE POLICY "Users can update their own daily checkins"
  ON "DailyCheckIn" FOR UPDATE USING ("userId" = auth.uid());

CREATE POLICY "Users can delete their own daily checkins"
  ON "DailyCheckIn" FOR DELETE USING ("userId" = auth.uid()); 