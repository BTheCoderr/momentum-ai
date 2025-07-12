-- Create a new table with the correct structure
CREATE TABLE IF NOT EXISTS "DailyCheckIn_new" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    mood INTEGER,
    energy INTEGER,
    stress INTEGER,
    wins TEXT,
    challenges TEXT,
    priorities TEXT,
    reflection TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Copy data from old table to new table, converting user_id to TEXT
INSERT INTO "DailyCheckIn_new" (
    id,
    user_id,
    date,
    mood,
    energy,
    stress,
    wins,
    challenges,
    priorities,
    reflection,
    created_at,
    updated_at
)
SELECT 
    id,
    CAST(COALESCE("userId", user_id) AS TEXT),
    date,
    mood,
    energy,
    stress,
    wins,
    challenges,
    priorities,
    reflection,
    created_at,
    updated_at
FROM "DailyCheckIn";

-- Drop the old table
DROP TABLE IF EXISTS "DailyCheckIn";

-- Rename the new table to the original name
ALTER TABLE "DailyCheckIn_new" RENAME TO "DailyCheckIn";

-- Enable RLS
ALTER TABLE "DailyCheckIn" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own daily checkins"
    ON "DailyCheckIn" FOR SELECT
    USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can create their own daily checkins"
    ON "DailyCheckIn" FOR INSERT
    WITH CHECK (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can update their own daily checkins"
    ON "DailyCheckIn" FOR UPDATE
    USING (auth.uid()::TEXT = user_id)
    WITH CHECK (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can delete their own daily checkins"
    ON "DailyCheckIn" FOR DELETE
    USING (auth.uid()::TEXT = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_checkin_user_id ON "DailyCheckIn"(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_checkin_date ON "DailyCheckIn"(date);
CREATE INDEX IF NOT EXISTS idx_daily_checkin_user_date ON "DailyCheckIn"(user_id, date);

-- Add unique constraint to prevent duplicate checkins per day per user
ALTER TABLE "DailyCheckIn" 
    ADD CONSTRAINT unique_user_date_checkin 
    UNIQUE (user_id, date); 