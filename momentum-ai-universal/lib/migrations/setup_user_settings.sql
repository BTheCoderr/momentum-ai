-- Drop existing table if it exists
DROP TABLE IF EXISTS public.user_settings CASCADE;

-- Create user_settings table
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_preferences JSONB DEFAULT '{"daily_reminder": true, "challenge_updates": true, "pod_activity": true, "reminder_time": "09:00"}'::jsonb,
  privacy_settings JSONB DEFAULT '{"share_progress": true, "public_profile": true, "show_in_leaderboard": true}'::jsonb,
  theme_preference TEXT DEFAULT 'system',
  language_preference TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT user_settings_user_id_unique UNIQUE (user_id)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users
GRANT ALL ON public.user_settings TO authenticated;

-- Create RLS policies
CREATE POLICY "Users can view own settings" 
  ON public.user_settings 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" 
  ON public.user_settings 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" 
  ON public.user_settings 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_settings; 