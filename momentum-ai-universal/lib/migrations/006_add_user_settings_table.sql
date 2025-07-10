-- Migration 006: Add user_settings table for storing coach personality and memory settings

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  coach_personality JSONB DEFAULT '{}',
  memory_settings JSONB DEFAULT '{}',
  privacy_settings JSONB DEFAULT '{}',
  notification_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_updated_at ON user_settings(updated_at);

-- Add RLS policies for security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own settings
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (user_id = auth.uid());

-- Policy: Users can only insert their own settings
CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Policy: Users can only update their own settings
CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Policy: Users can only delete their own settings
CREATE POLICY "Users can delete own settings" ON user_settings
  FOR DELETE USING (user_id = auth.uid());

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_updated_at();

-- Add some sample default settings (optional)
-- This could be useful for demo purposes or initial setup
COMMENT ON TABLE user_settings IS 'Stores user preferences including coach personality, memory settings, and privacy options';
COMMENT ON COLUMN user_settings.coach_personality IS 'JSON object storing AI coach personality preferences and communication style';
COMMENT ON COLUMN user_settings.memory_settings IS 'JSON object storing AI memory retention and context preferences';
COMMENT ON COLUMN user_settings.privacy_settings IS 'JSON object storing user privacy and data sharing preferences';
COMMENT ON COLUMN user_settings.notification_settings IS 'JSON object storing user notification preferences'; 