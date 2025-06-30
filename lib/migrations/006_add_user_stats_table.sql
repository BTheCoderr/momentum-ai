-- Add user_stats table
CREATE TABLE IF NOT EXISTS public.user_stats (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    total_xp integer DEFAULT 0,
    current_level integer DEFAULT 1,
    streak_count integer DEFAULT 0,
    last_activity_date date,
    goals_completed integer DEFAULT 0,
    checkins_completed integer DEFAULT 0,
    achievements jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can view own stats" ON public.user_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON public.user_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON public.user_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- Create function to automatically create user_stats when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_stats()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_stats (user_id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user_stats for new users
DROP TRIGGER IF EXISTS on_auth_user_created_stats ON auth.users;
CREATE TRIGGER on_auth_user_created_stats
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_stats();

-- Create function to handle updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at trigger
DROP TRIGGER IF EXISTS handle_updated_at ON public.user_stats;
CREATE TRIGGER handle_updated_at 
  BEFORE UPDATE ON public.user_stats
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at(); 