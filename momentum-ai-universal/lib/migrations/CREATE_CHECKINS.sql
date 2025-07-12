-- Create checkins table
DROP TABLE IF EXISTS public.checkins CASCADE;

CREATE TABLE public.checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    mood INTEGER CHECK (mood >= 1 AND mood <= 5),
    energy INTEGER CHECK (energy >= 1 AND energy <= 5),
    stress INTEGER CHECK (stress >= 1 AND stress <= 5),
    wins TEXT,
    challenges TEXT,
    priorities TEXT,
    reflection TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;

-- Create permissive policy
CREATE POLICY "allow_all_checkins" ON public.checkins FOR ALL USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON public.checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_date ON public.checkins(date);

-- Grant permissions
GRANT ALL ON public.checkins TO authenticated; 