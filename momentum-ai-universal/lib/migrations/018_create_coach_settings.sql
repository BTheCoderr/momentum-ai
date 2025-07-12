-- Drop existing objects if they exist
DROP TRIGGER IF EXISTS update_coach_settings_updated_at ON "coach_settings";
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP TABLE IF EXISTS "coach_settings";

-- Create coach_settings table with proper structure and constraints
CREATE TABLE IF NOT EXISTS "coach_settings" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    daily_goal INTEGER,
    personality TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS
ALTER TABLE "coach_settings" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own coach settings"
    ON "coach_settings" FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own coach settings"
    ON "coach_settings" FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coach settings"
    ON "coach_settings" FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own coach settings"
    ON "coach_settings" FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coach_settings_user_id ON "coach_settings"(user_id);

-- Add unique constraint to ensure one settings per user
ALTER TABLE "coach_settings" 
    ADD CONSTRAINT unique_user_settings 
    UNIQUE (user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_coach_settings_updated_at
    BEFORE UPDATE ON "coach_settings"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 