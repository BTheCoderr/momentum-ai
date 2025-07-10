-- Add streak tracking to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS checkin_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_checkin date,
ADD COLUMN IF NOT EXISTS xp integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS badge text DEFAULT 'Starter',
ADD COLUMN IF NOT EXISTS push_token text;

-- Add weekly challenge to pods
ALTER TABLE pods
ADD COLUMN IF NOT EXISTS weekly_challenge text,
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS theme text,
ADD COLUMN IF NOT EXISTS description text;

-- Create custom challenges table
CREATE TABLE IF NOT EXISTS custom_challenges (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    for_pod boolean DEFAULT false,
    pod_id uuid REFERENCES pods(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies
ALTER TABLE custom_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own challenges"
    ON custom_challenges FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own challenges"
    ON custom_challenges FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR 
           (for_pod = true AND pod_id IN (
               SELECT pod_id FROM pod_members WHERE user_id = auth.uid()
           )));

-- Enable realtime for pod_checkins
ALTER PUBLICATION supabase_realtime ADD TABLE pod_checkins; 