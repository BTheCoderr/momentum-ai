-- First, let's check if the table exists and its structure
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = 'DailyCheckIn'
);

-- First, let's check the column type
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'DailyCheckIn' AND column_name = 'userId';

-- Enable RLS
ALTER TABLE "DailyCheckIn" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own daily checkins" ON "DailyCheckIn";
DROP POLICY IF EXISTS "Users can create their own daily checkins" ON "DailyCheckIn";
DROP POLICY IF EXISTS "Users can update their own daily checkins" ON "DailyCheckIn";
DROP POLICY IF EXISTS "Users can delete their own daily checkins" ON "DailyCheckIn";

-- Create new policies with text type handling (since userId is text)
CREATE POLICY "Users can view their own daily checkins"
  ON "DailyCheckIn" 
  FOR SELECT 
  USING ("userId" = auth.uid()::text);

CREATE POLICY "Users can create their own daily checkins"
  ON "DailyCheckIn" 
  FOR INSERT 
  WITH CHECK ("userId" = auth.uid()::text);

CREATE POLICY "Users can update their own daily checkins"
  ON "DailyCheckIn" 
  FOR UPDATE 
  USING ("userId" = auth.uid()::text);

CREATE POLICY "Users can delete their own daily checkins"
  ON "DailyCheckIn" 
  FOR DELETE 
  USING ("userId" = auth.uid()::text); 